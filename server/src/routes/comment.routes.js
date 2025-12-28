import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, updateComment, deleteComment, getVideoComments } from "../controllers/comment.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// All comment routes require authentication
// router.use(verifyJWT);

// Define your comment routes here
router.get('/video/:videoId', getVideoComments);
router.post('/video/:videoId', verifyJWT, upload.none(), addComment);
router.route('/:commentId')
.patch(verifyJWT, upload.none(), updateComment)
.delete(verifyJWT, deleteComment);

export default router;
