import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params    
    //TODO: toggle like on video
    // validate if videoId is valid ObjectId
    if (!isValidObjectId(videoId)) {
        throw new ApiError("Invalid video ID", 400);
    }
    // validate if like already exists
    const isLiked = await Like.findOne({ videoId, likedBy: req.user.id });
    if (isLiked) {
        // If like exists, remove it (unlike)
        await Like.deleteOne({ _id: isLiked._id });
        return res.status(200).json(new ApiResponse("Video unliked successfully", 200, null));
    }
    else {
        const like = await Like.create({ videoId, likedBy: req.user.id });
        res.status(200).json(new ApiResponse("Video liked successfully", 200, like))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if (!isValidObjectId(commentId)) {
        throw new ApiError("Invalid comment ID", 400);
    }
    const isLiked = await Like.findOne({ commentId, likedBy: req.user.id });
    if (isLiked) {
        // If like exists, remove it (unlike)
        await Like.deleteOne({ _id: isLiked._id });
        return res.status(200).json(new ApiResponse("Comment unliked successfully", 200, null));
    }
    else {
        const like = await Like.create({ commentId, likedBy: req.user.id });
        res.status(200).json(new ApiResponse("Comment liked successfully", 200, like))
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if (!isValidObjectId(tweetId)) {
        throw new ApiError("Invalid tweet ID", 400);
    }
    const isLiked = await Like.findOne({ tweetId, likedBy: req.user.id });
    if (isLiked) {
        // If like exists, remove it (unlike)
        await Like.deleteOne({ _id: isLiked._id });
        return res.status(200).json(new ApiResponse("Tweet unliked successfully", 200, null));
    }
    else {
        const like = await Like.create({ tweetId, likedBy: req.user.id });
        res.status(200).json(new ApiResponse("Tweet liked successfully", 200, like))
    }
})
const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likes = await Like.find({
        likedBy: req.user.id, // Filter: Likes by the current user
        videoId: { $ne: null } // Filter: Only likes associated with videos
    }).populate('videoId'); // Join: Get full video details
    const likedVideos = likes.map(like => like.videoId); // show only video details
    res.status(200).json(new ApiResponse("Liked videos fetched successfully", 200, likedVideos))
})

const getLikedComments = asyncHandler(async (req, res) => {
    //TODO: get all liked comments
    const likes = await Like.find({
        likedBy: req.user.id, // Filter: Likes by the current user
        commentId: { $ne: null } // Filter: Only likes associated with comments
    }).populate('commentId'); // Join: Get full comment details
    const likedComments = likes.map(like => like.commentId); // show only comment details
    res.status(200).json(new ApiResponse("Liked comments fetched successfully", 200, likedComments))
})
const getLikedTweets = asyncHandler(async (req, res) => {
    //TODO: get all liked tweets
    const likes = await Like.find({
        likedBy: req.user.id, // Filter: Likes by the current user
        tweetId: { $ne: null } // Filter: Only likes associated with tweets
    }).populate('tweetId'); // Join: Get full tweet details
    const likedTweets = likes.map(like => like.tweetId); // show only tweet details
    res.status(200).json(new ApiResponse("Liked tweets fetched successfully", 200, likedTweets))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    getLikedComments,
    getLikedTweets
}