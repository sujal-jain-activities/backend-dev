import { Router} from "express";
import { userLogin, userLogout, userRegister, RefreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount:1,
        },
        {
            name: "coverImg",
            maxCount:1,
        }
    ]),
    userRegister
)

router.route("/login").post(userLogin)

router.route("/logout").post(verifyJWT,userLogout)

router.route("/refresh-token").post(RefreshAccessToken)

export default router