import {asyncHandler} from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import {ApiError} from '../utils/apiError.js';
import { User } from '../models/user.model.js';

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies.accessToken || req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            throw new ApiError('Not authorized, no token', 401);
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded || !decoded._id) {
            throw new ApiError('Not authorized, token invalid', 401);
        }

        const user = await User.findById(decoded?._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError('Not authorized, user not found', 401);
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError('Not authorized, token failed', 401);        
    }
});