import { asyncHandler } from "../utils/asyncHandler.js"; 
import {ApiError} from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

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
    return res.status(201).json(
        new ApiResponse('User registered successfully', 200, createdUser)
    );
// For demonstration, we'll just return a success message
//     res.status(200).json({
//     success: true,
//     message: "User registered successfully"
//   });
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