import { InterestsService } from '../services/interests.service.js';

export class InterestsController {
  static async addInterest (req, res) {
    try {
      const { theme } = req.body;
      const user = req.user;
      const interest = await InterestsService.addInterest({user, theme})
      if (interest === false) {
        res.status(404).json({error : 'Tema ya añadido'})
      }
      res.status(201).json({
        success: true,
        message: `Se ha añadido correctamente el tema:${theme}`
        
      });
    } catch (error) {
        console.error('Error in /api/interests:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
  }


  static async deleteInterest (req, res) {
    try{
      const {interestId} = req.query;
    const deleted = await InterestsService.deleteInterest({interestId})

    if(deleted === false) {
      const error = new Error ('Interés no eliminado')
      return res.status(409).json({error : error.message})
    }
    return res.json({ success: true, message: 'Interes eliminado correctamente' })
    } catch(error){
        return res.json({success : false, error : 'Hubo un error al borrar el tema'})
      }
    
  }


  static async getInterests (req, res) {
     try{
      
        const user = req.user;

        console.log('User Id', user.id)
        const temas = await InterestsService.getInterests({user})
        return res.json({
          success : true,
          themes : [...temas]
        })
      }
      catch(error){
        return res.json({success : false, error : 'Hubo un error al obtener intereses'})
      }
  }


  static async generateInterestByAi (req, res)  {
    try {

    const {prompt} = req.body;
    if(!prompt){
      return res.status(400).json({error : 'No hay prompt'})
    }
    const data = await InterestsService.generateInterestByAI({prompt})
    return res.json({ interestsAI: data });

    } catch (error) {
      console.error('Error in generateInterest:', error)
      return res.json({ success: false, error:'Hubo un error al generar los temas'})
    }
  }
}









