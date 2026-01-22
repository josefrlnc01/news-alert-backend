import { Router } from "express";
import { ArticlesController} from "../controllers/articles.js";
import { verifyToken } from "../middlewares/verifyToken.js";

export const searchRouter = Router();

searchRouter.get('/',
    verifyToken,
    ArticlesController.searchArticles
)