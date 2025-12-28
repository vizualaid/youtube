import { Router } from "express";
import {publishAVideo, getAllVideos, getVideoById, updateVideo, deleteVideo, togglePublishStatus} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

// Public routes
router.route("/").get(getAllVideos);
router.route("/id/:videoId").get(getVideoById);

// Protected routes
router.route("/").post(verifyJWT, upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]), publishAVideo);

router.route("/id/:videoId")
.patch(verifyJWT, upload.fields([
    { name: 'thumbnail', maxCount: 1 }
]), updateVideo)
.delete(verifyJWT, deleteVideo);

router.route("/toggle-publish/:videoId").patch(verifyJWT, togglePublishStatus);
export default router;