import { SavedsModel } from "../models/saveds.js";

export class SavedsController {
  static async getSaveds (req, res) {
    try{
        const user = req.user;
        const articlesSaveds = await SavedsModel.getSaveds({user})
      console.log(articlesSaveds.rows)
        res.json({
          success : true,
          articlesSaveds : articlesSaveds.rows
        })
      }
      catch(error){
        console.error(error);
        res.status(500).json({error : 'Error en el fetching de artículos'})
      }
  }

  static async saveArticle (req, res) {
    try {
     
        const { article } = req.body;
        const user = req.user;
      
        const newArticle = await SavedsModel.saveArticle({article, user})
       
        console.log('Nuevo artículo guardado', newArticle)
        res.json({
          success: true,
          article: newArticle
        });
      } catch (error) {
        console.error('Error saving article:', error);
        if (error.code === '23505') {
          // Unique constraint violation
          res.json({
            success: true,
            message: 'Article already saved'
          });
        } else {
          res.status(500).json({ 
            success: false, 
            error: error.message 
          });
        }
      }
  }

  static async deleteSaved (req, res) {
     try{
      
        const {articleId} = req.query;
        
        const isSaved = await SavedsModel.deleteSaved({articleId});

        if (!isSaved) {
          res.status(404).json({error : 'Ocurrió un error al eliminar de la BD'})
        } 

        res.status(200).json({message : 'Eliminado correctamente'})
      }
      catch(error){
        console.error(error)
        res.status(500).json({error : 'Error al eliminar el artículo'})
      }
  }
}







