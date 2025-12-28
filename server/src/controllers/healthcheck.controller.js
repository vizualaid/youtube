import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import cloudinary from "cloudinary";

// Healthcheck for live status
const healthchecklive = asyncHandler(async (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
    const uptime = process.uptime(); // Server uptime in seconds
    const memoryUsage = process.memoryUsage(); // Memory usage details

    return res.status(200).json(
        new ApiResponse(200, "Service is live", {
            database: dbStatus,
            serverUptime: `${Math.floor(uptime)} seconds`,
            memoryUsage: {
                rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
                heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
                heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
            },
        })
    );
});

const healthcheckready = asyncHandler(async (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
    const uptime = process.uptime(); // Server uptime in seconds
    const memoryUsage = process.memoryUsage(); // Memory usage details

    // Validate Cloudinary configuration
    const cloudinaryConfig = cloudinary.v2.config();
    let cloudinaryStatus = false;
    let cloudinaryError = null;

    if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
        cloudinaryError = "Cloudinary configuration is missing or incomplete";
    } else {
        try {
            const result = await cloudinary.v2.api.ping();
            cloudinaryStatus = result.status === "ok";
        } catch (error) {
            cloudinaryError = error.message || "Unable to connect to Cloudinary";
        }
    }

    // Check if all services are ready
    if (dbStatus !== "Connected" || !cloudinaryStatus) {
        return res.status(503).json(
            new ApiResponse(503, "Service not ready", {
                database: dbStatus,
                cloudinary: cloudinaryStatus ? "Connected" : `Disconnected (${cloudinaryError})`,
            })
        );
    }

    // If all services are ready
    return res.status(200).json(
        new ApiResponse(200, "Service is ready", {
            database: dbStatus,
            cloudinary: "Connected",
            serverUptime: `${Math.floor(uptime)} seconds`,
            memoryUsage: {
                rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
                heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
                heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
            },
        })
    );
});
export { healthchecklive, healthcheckready };