// comment.model.js
// Define the schema and model for comments

import mongoose, {Schema} from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const commentSchema = new mongoose.Schema({
    videoId: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
    content: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model('Comment', commentSchema);