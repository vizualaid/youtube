import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    const comments = await Comment.find({ videoId })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

    res
    .status(200)
    .json(new ApiResponse("Comments retrieved successfully", 200, comments));
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params //url
    const {content} = req.body
    const comment = await Comment.create({
        videoId,
        content,
        commentedBy: req.user.id
    })
    res
    .status(201)
    .json(new ApiResponse("Comment added successfully", 201, comment))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content} = req.body
    const {commentedBy} = req.user.id
    const comment = await Comment.findOneAndUpdate(
        { _id: commentId, commentedBy },
        { content },
        { new: true }
    )
    if (!comment) {
        throw new ApiError("Comment not found or unauthorized", 404);
    }
    return res
    .status(200)
    .json(new ApiResponse("Comment updated successfully", 200, comment))

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    const {commentedBy} = req.user.id
    const comment = await Comment.findOneAndDelete(
        { _id: commentId, commentedBy }
    )
    if (!comment) {
        throw new ApiError("Comment not found or unauthorized", 404);
    }
    return res
    .status(200)
    .json(new ApiResponse("Comment deleted successfully", 200, comment))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }