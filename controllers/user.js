import { connectToDB } from '../config/db.js';
import 'dotenv/config'
import { UserModel } from '../models/user.js';

export class UserController {

  static async createUser (req, res) {
      const { userData } = req.body;
    
      
      try {
        const data = await UserModel.createUser({userData});
        const {accessToken, refreshToken, user} = data;
        res
        .cookie('accessToken', accessToken, {
          httpOnly : true,
          secure : false, 
          sameSite : 'lax',
          maxAge: 60 * 60 * 1000, //1 hora
        })
        .cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge:  24 * 60 * 60 * 1000, //24 horas
        })
        .send({
          success: true,
          message: 'Inicio de sesión exitoso',
          user: {
            id: user.id,
            email: user.email,
            name: user.name
          },
          tokens : {
            accessToken,
            refreshToken
          }
        
        });
        
      } catch (error) {
        console.error('❌ Error en /api/user:', error);
        res.status(500).json({
          success: false,
          error: 'Error en el servidor',
          details: error.message
        });
      }
  }


  static async authenticateAndLogin (req, res) {
    try {
        const {email, password} = req.body;

        const user = await UserModel.authenticate({email, password});

        if (!user) {
          return res.status(401).json({
            success: false,
            error: 'Credenciales inválidas'
          });
        }
        const token = await generateJWT({id: user.id, email: user.email})
        try {
          const decoded = await verifyJWT(token);

          if (typeof decoded === 'object' && decoded.id && decoded.email) {
            const user = await UserModel.getUser({userId: decoded.id});
            return res.json({
              success: true,
              token,
              user
            });
          }
          return res.status(401).json({
            success: false,
            error: 'Token inválido'
          });
        } catch (error) {
          console.error('❌ Error en /api/user/login:', error);
          res.status(500).json({
            success: false,
            error: 'Error en el servidor',
            details: error.message
          });
        }

    } catch (error) {
      console.error('❌ Error en /api/user/login:', error);
      res.status(500).json({
        success: false,
        error: 'Error en el servidor',
        details: error.message
      });
    }
  }

  static async getUser (req, res) {
    try{
        const userId = req.user.id;
        const user = await UserModel.getUser({userId})
        return res.json({
          success: true,
          user : {name : user.name, email : user.email}
        })
      }
      catch(error){
        console.error(error)
        return res.status(500).json({error : 'Error al obtener informacion del usuario'})
      }
      
  }
}



