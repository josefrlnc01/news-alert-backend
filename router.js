import { Router } from "express";
import { ArticlesController} from "./controllers/articles.js";
import { InterestsController } from "./controllers/interests.js";



const router = Router();


router.post('/api/aiservice',
    InterestsController.generateInterestByAi
)








router.get('/api/updates',
    ArticlesController.getArticlesByRadar
)







export default router