// like.model.js
// Define the schema and model for likes

import mongoose, {Schema} from 'mongoose';

const likeSchema = new mongoose.Schema({
    videoId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Video',
    },
    commentId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Comment',
    },
    tweetId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Tweet',
    },
    likedBy: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },

}, { timestamps: true });

export const Like = mongoose.model('Like', likeSchema);

