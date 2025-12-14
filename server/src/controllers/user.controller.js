import { asyncHandler } from "../utils/asyncHandler.js"; 
import {ApiError} from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/apiResponse.js";
export const registerUser = asyncHandler(async (req, res, next) => {
    // Your registration logic here\
    // actual steps to register a user 
    // take the input from req.body (client se aaya hua data - postmen ya frontend)
    const { fullName, email, username, password } = req.body
    console.log(fullName, email, username, password);
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
    console.log(req.files)
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