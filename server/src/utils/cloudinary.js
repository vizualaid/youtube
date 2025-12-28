//cloudinary
//goal -> files ispe aayenge file system ke through (means server pe already upload ho gayi h ) 
// yeh koi bhi service ka use karega toh akk local file ka path dega
//server pe aa gayi h server se aklocal path doge mai use cloudinary pe upload kar dunga
import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'; //file system module in node by default 
import dotenv from 'dotenv';
dotenv.config();

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});
console.log('Cloudinary configured with cloud name:', process.env.CLOUDINARY_CLOUD_NAME, 'and API key:', process.env.CLOUDINARY_API_KEY, 'and API secret:', process.env.CLOUDINARY_API_SECRET ? 'set' : 'not set');
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

const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: 'image', // does not automatically detect the file type
        });

        if (result && result.result === 'ok') {
            console.log('File deleted from Cloudinary:', result);
        } else {
            console.error('Unexpected result while deleting file from Cloudinary:', result);
        }
        return result;
    } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
    }
};
 
export {uploadOnCloudinary, deleteFromCloudinary};