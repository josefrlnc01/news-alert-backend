import { Router } from "express";
import {  InterestsController } from "../controllers/interests.js";
import { verifyToken } from "../middlewares/verifyToken.js";


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
    InterestsController.deleteInterest
)

