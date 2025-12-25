import { asyncHandler } from "../utils/asyncHandler.js"; 
import {ApiError} from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import { extractPublicId } from 'cloudinary-build-url'

const generateAccessAndRefreshToken = async (id) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            throw new ApiError('User not found', 404);
        }
        
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        // save refresh token in db
        try {
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        } catch (err) {
        throw new ApiError("Failed saving refreshToken", 500);
        }


        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError('Error in generating tokens', 500);        
    }
}

export const registerUser = asyncHandler(async (req, res, next) => {
    // Your registration logic here\
    // actual steps to register a user 
    // take the input from req.body (client se aaya hua data - postmen ya frontend)
    const { fullName, email, username, password } = req.body
    // validate the input
    //  - if input is non empty or in valid format
    //  - check if user already exists, by username or email
    //  - check for images, check for avatar
    //  - check password strength
    // hash the password
    // upload avatar to cloudinary or local storage
    // create a user object - crete entry in db
    // retrun res save the user to the database
    if ([fullName, email, username, password].some(field => field?.trim()===""))
    {
        throw new ApiError('All fields are required', 400)
    }
    const existingUser = await User.findOne({ $or: [ { email }, { username } ] })
    if (existingUser) {
        throw new ApiError('User with given email or username already exists', 400);
    }
    // console.log(req.files)
    const avatarLocalPath = req.files?.avatar[0]?.path; // local path of the uploaded file
    // const coverImageLocalPath = req.files?.coverImage[0]?.path; // local path of the uploaded file
    let coverImageLocalPath = null;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError('Avatar is required', 400);
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar?.secure_url) {
        throw new ApiError('Error in uploading avatar image', 500);
    }
    // create user object and save to db
    const user = await User.create({   
        fullName,
        avatar: avatar.secure_url,
        coverImage: coverImage?.url || null,
        email,  
        username: username.toLowerCase(),
        password, // hashed password
    })

    const createdUser = await User.findById(user._id).select('-password -refreshToken'); // exclude password and refreshToken from the response

    if (!createdUser) {
        throw new ApiError('Error in creating user', 500);
    }
    return res
    .status(201)
    .json(new ApiResponse('User registered successfully', 200, createdUser));
});

export const loginUser = asyncHandler(async (req, res) => {
    // Your login logic here
    //req body -> data from client
    // username or email validate password
    // access tokren , refresh token
    // return response
    const { email, username, password } = req.body;

    if (!password) throw new ApiError("Password required");

    if (!email && !username)
    throw new ApiError("Email or username required");

    // find user by email or username
    const user = await User.findOne({$or:[{email},{username:username.toLowerCase()}]});
    if(!user){
        throw new ApiError('Invalid credentials',404);
    }
    const isPasswordValid = await user.isPasswordValid(password);
    if(!isPasswordValid){
        throw new ApiError('Invalid credentials',404);
    }
    // generate tokens
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select('-password -refreshToken');

    //set cookies
    const cookieOptions = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).cookie('refreshToken', refreshToken, cookieOptions)
    .cookie('accessToken', accessToken, cookieOptions)
    .json(new ApiResponse('User logged in successfully',200,{
        user: loggedInUser,
        accessToken,
        refreshToken
    }));
});

export const logoutUser = asyncHandler(async (req, res) => {
    // Your logout logic here
    const userId = req.user._id;
    const user = await User.findByIdAndUpdate(userId, {refreshToken: null}
        , {new: true}
    );

    if (!user) {
        throw new ApiError('User not found', 404);
    }
    const cookieOptions = {
        httpOnly: true,
        secure: true
    };
    return res.status(200).clearCookie('refreshToken', cookieOptions)
    .clearCookie('accessToken', cookieOptions)
    .json(new ApiResponse('User logged out successfully', 200));

});

export const refreshAccessToken = asyncHandler(async (req,res) => {
    // refresh token logic here
    try {
        
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if (!incomingRefreshToken) {
            throw new ApiError('Refresh token Missing', 401);
        }
        // verify refresh token
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        if (!decodedToken || !decodedToken._id) {
            throw new ApiError('Invalid refresh token', 401);
        }
        const user = await User.findById(decodedToken?._id);
        if (!user || user?.refreshToken !== incomingRefreshToken) {
            throw new ApiError('Invalid refresh token', 401);
        }
        const cookieOptions = {
            httpOnly: true,
            secure: true
        };
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user?._id);
        return res.status(200)
        .cookie('refreshToken', newRefreshToken, cookieOptions)
        .cookie('accessToken', accessToken, cookieOptions)
        .json(new ApiResponse('Access token refreshed successfully', 200, {
            accessToken,
            refreshToken: newRefreshToken
        }));

    } catch (error) {
        ApiError(error?.message || 'Could not refresh access token', 500);
    }

})

export const changePassword = asyncHandler(async (req, res) => {
    //change password logic here
    const {oldPassword, newPassword} = req.body;
    const userId = req.user?._id;
    const user = await User.findById(userId);
    if(!user){
        throw new ApiError('User not found', 404);
    }
    const isPasswordValid = await user.isPasswordValid(oldPassword);
    if(!isPasswordValid){
        throw new ApiError('Old password is incorrect', 400);
    }
    user.password = newPassword;
    await user.save({validateBeforeSave: false});
    return res
    .status(200)
    .json(new ApiResponse('Password changed successfully', 200));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    // get current user logic here
    const UserId = req.user?._id;
    const user = await User.findById(UserId).select('-password -refreshToken');
    if(!user){
        throw new ApiError('User not found', 404);
    }
    return res
    .status(200)
    .json(new ApiResponse('Current user fetched successfully', 200, user));
});

export const updateAccountDetails  = asyncHandler(async (req, res) => {
    // update account details logic here
    // Helper function to capitalize the first letter of each word
    const capitalizeFullName = (name) => {
        return name
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    };
    const userId =  req.user?._id;
    const {username, fullName, email} = req.body;
    if([username, fullName, email].some(field => field?.trim()==="")){
        throw new ApiError('All fields are required', 400);
    }
    const user = await User.findByIdAndUpdate(userId,
        {$set: {username: username.toLowerCase(), fullName: capitalizeFullName(fullName), email: email.toLowerCase()}}, 
        {new: true});
    if(!user){
        throw new ApiError('User not found', 404);
    }
    return res
        .status(200)
        .json(new ApiResponse('Account details updated successfully', 200, user));
});

export const updateUserAvatar = asyncHandler(async (req, res) => {
    // update user avatar logic here
    const userId = req.user?._id;
    const avatarLocalPath = req.file?.path;
    
    if (!avatarLocalPath) {
        throw new ApiError('No image file provided for avatar', 400);
    }
     // TODO Assingment : 
     // delete previous avatar from cloudinary
    const previousAvatarUrl = req.user?.avatar;
    if (previousAvatarUrl) {
       try {
        // Extract public ID from the URL
        const publicId = extractPublicId(previousAvatarUrl);
        if (publicId) {
            console.log("Previous avatar public ID:", publicId);    
            const result = await deleteFromCloudinary(publicId);

            if (result?.result !== 'ok' && result?.result !== 'not found') {
                console.log("Failed to delete previous avatar from Cloudinary");
            } else {
                console.log("Previous avatar deleted from Cloudinary");
            }
        }
       } catch (error) {
        console.error("Error deleting previous avatar:", error.message);
       }
    } else {
        console.log("No previous avatar to delete");
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar?.secure_url) {
        throw new ApiError('Error in uploading avatar image', 500);
    }
    const user = await User.findByIdAndUpdate(
        userId,
        {$set: {avatar: avatar.secure_url}},
        {new: true}
    ).select('-password -refreshToken'); 
    if (!user) {
        throw new ApiError('User not found', 404);
    }        
    return res
        .status(200)
        .json(new ApiResponse('Avatar updated successfully', 200, user));
});

export const updateUserCoverImage = asyncHandler(async (req, res) => {
    // update user cover image logic here
    const userId = req.user?._id;
    const coverImageLocalPath = req.file?.path;
    if(!coverImageLocalPath){
        throw new ApiError('No image file provided for cover image', 400);
    }
         // TODO Assingment : 
     // delete previous avatar from cloudinary
    const previousCoverUrl = req.user?.coverImage;
    if (previousCoverUrl) {
       try {
        // Extract public ID from the URL
        const publicId = extractPublicId(previousCoverUrl);
        if (publicId) {
            console.log("Previous cover image public ID:", publicId);    
            const resultdel = await deleteFromCloudinary(publicId);
                if(resultdel?.result !== 'ok' && resultdel?.result !== 'not found') {
                    console.log("Failed to delete previous cover image from Cloudinary");
                }
                else {
                    console.log("Previous cover image deleted from Cloudinary");
                }
        }       
       } catch (error) {
        console.error("Error deleting previous cover image:", error.message);
       }
    }
    else {
        console.log("No previous cover image to delete");
    }
    // upload to cloudinary
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage?.secure_url) {
        throw new ApiError('Error in uploading cover image', 500);
    }
    const user = await User.findByIdAndUpdate(
        userId,
        {$set: {coverImage: coverImage.secure_url}},
        {new: true}
    ).select('-password -refreshToken');
    if (!user) {
        throw new ApiError('User not found', 404);
    }
    return res
        .status(200)
        .json(new ApiResponse('Cover image updated successfully', 200, user));
});