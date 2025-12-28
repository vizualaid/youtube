import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken,  changePassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.fields(
    [
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 }
    ]
),registerUser);
router.route("/login").post(upload.none(), loginUser)
router.route("/logout").post(upload.none(),verifyJWT, logoutUser);
router.route("/refresh-token").post(upload.none(), refreshAccessToken);
// router.route("/getUsers").get(upload.none(), getUser);
router.route("/getCurrentUser").get(upload.none(), verifyJWT, getCurrentUser);
router.route("/changePassword").post(upload.none(), verifyJWT, changePassword);
router.route("/updateAccountDetails").post(upload.none(), verifyJWT, updateAccountDetails);
router.route("/updateAvatar").post(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/updateCoverImage").post(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
router.route("/ch/:username").get(upload.none(), verifyJWT, getUserChannelProfile);
router.route("/history").get(upload.none(), verifyJWT, getWatchHistory);

export default router;
 
// Example route using the user controller controller