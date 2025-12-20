import { Router } from "express";
import { registerUser, loginUser, logoutUser} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.fields(
    [
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 }
    ]
),registerUser);
router.post("/login", upload.none(), loginUser)
router.route("/logout").post(upload.none(),verifyJWT, logoutUser);

export default router;
 
// Example route using the user controller controller