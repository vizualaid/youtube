import { Router } from "express";
import {publishAVideo, getAllVideos, getVideoById, updateVideo, deleteVideo, togglePublishStatus} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();
router.use(verifyJWT);

router.route("/")
.get(getAllVideos)
.post(upload.fields([
    { name: 'video', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 }
    ]), publishAVideo);

router.route("/id/:videoId")
.get(getVideoById)
.patch(upload.fields([
            { name: 'thumbnail', maxCount: 1 }
        ]), updateVideo)
.delete(deleteVideo);

router.route("/toggle-publish/:videoId").patch(togglePublishStatus);
export default router;