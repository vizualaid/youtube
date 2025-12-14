import { asyncHandler } from "../utils/asyncHandler.js"; 

export const registerUser = asyncHandler(async (req, res, next) => {
    // Your registration logic here
    res.status(200).json({
    success: true,
    message: "User registered successfully"
  });
});