//cloudinary
//goal -> files ispe aayenge file system ke through (means server pe already upload ho gayi h ) 
// yeh koi bhi service ka use karega toh akk local file ka path dega
//server pe aa gayi h server se aklocal path doge mai use cloudinary pe upload kar dunga
import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'; //file system module in node by default 

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localfilePath) => {
    try {
        if(!localfilePath){
            throw new Error('File path not found');
            // return null
        }
        // Upload file to Cloudinary
        const result = await cloudinary.uploader.upload(localfilePath, {
            resource_type: 'auto', // Automatically detect the file type
        });
        // After successful upload, delete the local file
        console.log('File uploaded to Cloudinary:', result.secure_url);
        // Delete the local file
        if (localfilePath) {
            fs.unlinkSync(localfilePath);
        }
        return result;


        
    } catch (error) {
        console.error('Error uploading file to Cloudinary:', error);
        // Delete the local file
        if (localfilePath) {
            fs.unlinkSync(localfilePath);
        }
        return null;

    }
}

// // Optimize delivery by resizing and applying auto-format and auto-quality
//     const optimizeUrl = cloudinary.url('shoes', {
//         fetch_format: 'auto',
//         quality: 'auto'
//     });
    
//     console.log(optimizeUrl);
    
//     // Transform the image: auto-crop to square aspect_ratio
//     const autoCropUrl = cloudinary.url('shoes', {
//         crop: 'auto',
//         gravity: 'auto',
//         width: 500,
//         height: 500,
//     });
    
//     console.log(autoCropUrl);    
export default uploadOnCloudinary;