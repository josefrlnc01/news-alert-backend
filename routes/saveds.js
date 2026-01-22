import { Router } from "express";
import { verifyRefreshToken, verifyToken } from "../middlewares/verifyToken.js";
import { SavedsController } from "../controllers/saveds.js";

export const savedsRouter = Router()

savedsRouter.get('/',
    verifyToken,
    SavedsController.getSaveds
)

savedsRouter.post('/',
    verifyToken,
    SavedsController.saveArticle
)


savedsRouter.delete('/',
    verifyToken,
    SavedsController.deleteSaved
)