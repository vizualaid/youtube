import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

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
    const videoUrl = await uploadOnCloudinary(videoLocalpath, "videos")
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
        const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalpath, "thumbnails");
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
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}