import mongoose, {get, isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import e from "express"

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId
  } = req.query;

  const filters = {};

  // text search
  if (query) {
    filters.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    //   { uploadedBy: { $regex: query, $options: "i" } }
    ];
  }

  // user filter
  if (userId && mongoose.isValidObjectId(userId)) {
    filters.uploadedBy = userId;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sortOrder = sortType === "desc" ? -1 : 1;

  const [videos, totalVideos] = await Promise.all([
    Video.find(filters)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(Number(limit)),
    Video.countDocuments(filters)
  ]);

  return res.status(200).json(
    new ApiResponse(200, "Videos fetched successfully", {
      videos,
      totalVideos,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalVideos / limit)
    })
  );
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    if(!title || title.trim() === "") {
        throw new ApiError('Title is required', 400);
    }
    if (!description || description.trim() === "") {
        throw new ApiError('Description is required', 400);
    }
    // TODO: get video, upload to cloudinary, create video
    const videoLocalpath = req.files?.video?.[0]?.path;
    if(!videoLocalpath){
        throw new ApiError('Video file is required', 400)
    }
    const videoUrl = await uploadOnCloudinary(videoLocalpath)
    if(!videoUrl?.secure_url){
        throw new ApiError('Video upload failed, please try again', 500)
    }
    // to do : extract video duration from cloudinary response
    // Generate thumbnail for video and get the thumbnail url from cloudinary
    // Option 1: Use Cloudinary's auto-thumbnail generation from video URL
    // Cloudinary automatically generates thumbnails for videos at different timestamps
    // Format: video_url.jpg or add transformations like /upload/so_2.0/ for 2 second timestamp
    let thumbnailUrl;
    if (req.files?.thumbnail?.[0]?.path) {
        // Option 2: If you need to upload a separate thumbnail file from req.files
        const thumbnailLocalpath = req.files.thumbnail[0].path;
        const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalpath);
        thumbnailUrl = uploadedThumbnail?.secure_url;
    } else {
        // Option 1: Use Cloudinary's auto-thumbnail generation from video URL
        // Cloudinary automatically generates thumbnails for videos at different timestamps
        // Format: video_url.jpg or add transformations like /upload/so_2.0/ for 2 second timestamp
        thumbnailUrl = videoUrl.secure_url.replace(/\.(mp4|mov|avi|mkv)$/, '.jpg');
    }

    if (!thumbnailUrl) {
        throw new ApiError('Thumbnail generation failed, please try again', 500);
    }

    // Create video document in DB
    const video = await Video.create({
        title, 
        description, 
        videoFile: videoUrl.secure_url,
        thumbnail: thumbnailUrl,
        duration: videoUrl.duration || 0, // Cloudinary returns duration in response
        uploadedBy: req.user.id
    })

    return res
    .status(201)
    .json(new ApiResponse(201,
        "Video published successfully",
        video))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError('Video not found', 404)
    }
    return res.status(200).json(
        new ApiResponse(200, "Video fetched successfully", video)
    );
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const thumbnailLocalpath = req.files?.thumbnail?.[0]?.path;
    const { title, description } = req.body;
    let thumbnailUrl;
    if (thumbnailLocalpath) {
        const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalpath);
        thumbnailUrl = uploadedThumbnail?.secure_url;
    }
    else {
        thumbnailUrl = undefined;
        console.log("No new thumbnail uploaded, retaining existing one");
    }
    
    // Update video document in DB
    // Build update object with only provided fields
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (thumbnailUrl !== undefined) updateFields.thumbnail = thumbnailUrl;
    // If thumbnailUrl is undefined, we skip updating the thumbnail field
    // This way, the existing thumbnail remains unchanged
    // else, new thumbnail URL will be set, replacing the old one
    // If no new thumbnail is uploaded, TODO: delete old thumbnail from cloudinary?? 
    
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: updateFields
        },
        { new: true }
    );

    if (!updatedVideo) {
        throw new ApiError('Video not found', 404);
    }

    return res.status(200).json(
        new ApiResponse(200, "Video updated successfully", updatedVideo)
    );
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const deletedVideo = await Video.findByIdAndDelete(videoId)
    if(!deletedVideo){
        throw new ApiError('Video not found', 404)
    }
    return res.status(200).json(
        new ApiResponse(200, "Video deleted successfully", deletedVideo)
    );
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError('Video not found', 404)
    }
    video.isPublished = !video.isPublished
    await video.save()
    return res.status(200).json(
        new ApiResponse(200, "Video publish status toggled successfully", video)
    );
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}