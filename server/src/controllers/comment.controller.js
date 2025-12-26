// comment.controller.js
// Controller for handling comment-related operations

import Comment from '../models/comment.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';

// Create a new comment
export const createComment = asyncHandler(async (req, res) => {
    const { videoId, content } = req.body;
    const userId = req.user.id; // Assuming user is authenticated

    const comment = await Comment.create({ userId, videoId, content });
    res.status(201).json(new ApiResponse(201, 'Comment created successfully', comment));
});

// Get comments for a video
export const getCommentsByVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const comments = await Comment.find({ videoId }).populate('userId', 'username');
    res.status(200).json(new ApiResponse(200, 'Comments fetched successfully', comments));
});

// Delete a comment
export const deleteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
        throw new ApiError(404, 'Comment not found');
    }

    if (comment.userId.toString() !== req.user.id) {
        throw new ApiError(403, 'You are not authorized to delete this comment');
    }

    await comment.remove();
    res.status(200).json(new ApiResponse(200, 'Comment deleted successfully'));
});import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }