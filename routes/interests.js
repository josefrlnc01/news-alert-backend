import { Router } from "express";
import {  InterestsController } from "../controllers/interests.js";
import { verifyRefreshToken, verifyToken } from "../middlewares/verifyToken.js";


export const interestsRouter = Router();

interestsRouter.get('/',
    verifyToken,
    InterestsController.getInterests
)


interestsRouter.post('/',
    verifyToken,
    InterestsController.addInterest
)


interestsRouter.delete('/',
    verifyToken,
    InterestsController.deleteInterest
)

