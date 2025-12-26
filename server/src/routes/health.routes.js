import { Router } from "express";
import { healthchecklive, healthcheckready} from "../controllers/healthcheck.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/live").get(upload.none(), healthchecklive);
router.route("/ready").get(upload.none(), healthcheckready);

export default router;
