import { Router } from "express";
import { ArticlesController} from "../controllers/articles.js";

export const searchRouter = Router();

searchRouter.get('/',
    ArticlesController.searchArticles
)