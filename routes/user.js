import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { UserController } from "../controllers/user.js";


export const userRouter = Router()


userRouter.get('/', 
    verifyToken,
    UserController.getUser
)


userRouter.post('/',
    UserController.createUser
)

userRouter.post('/login',
    UserController.authenticateAndLogin
)
