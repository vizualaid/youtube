import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos, getLikedComments, getLikedTweets } from "../controllers/like.controller.js";

const router = Router();

// All like routes require authentication
router.use(verifyJWT);

// Define your like routes here
router.post('/video/:videoId', toggleVideoLike);
router.post('/comment/:commentId', toggleCommentLike);
router.post('/tweet/:tweetId', toggleTweetLike);
router.get('/videos', getLikedVideos);
router.get('/comments', getLikedComments);
router.get('/tweets', getLikedTweets);

export default router;
