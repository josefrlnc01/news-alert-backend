import jwt from 'jsonwebtoken'

export class UserService {
    static async createUser ({user}) {
        // Generate tokens
        const refreshToken = jwt.sign(
            { 
                id: user.id, 
                email: user.email 
            }, 
            process.env.REFRESH_TOKEN,
            { expiresIn: '90d' }
        );
        // Generate access token
        const accessToken = jwt.sign(
            { 
                id: user.id, 
                email: user.email 
            }, 
            process.env.ACCESS_TOKEN,
            { expiresIn: '1h' }
        );
    
         // 👇 PRUEBA: Verifica el token inmediatamente después de crearlo
        try {
            const testDecode = jwt.verify(accessToken, process.env.ACCESS_TOKEN);
            console.log('✅ TEST: Token verificado correctamente:', testDecode);
        } catch (testError) {
            console.error('❌ TEST: Error al verificar token recién creado:', testError.message);
        }
        return {accessToken, refreshToken}

    }
}