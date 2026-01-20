import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
    // 1. Obtener el token del encabezado

    let token = req.cookies?.accessToken;
    
    if (!token) {
        const authHeaders = req.headers.authorization;
        if(authHeaders && authHeaders.startsWith('Bearer ')){
            token = authHeaders.substring(7)
        }
    }
    
    try {
        // 2. Verificar el token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
        
        // 3. Verificar que el token tenga los campos necesarios
        if (!decoded.id) {
            console.error('❌ Token inválido: falta el ID del usuario');
            console.log('Contenido del token decodificado:', decoded); // Para depuración
            return res.status(401).json({ 
                success: false,
                error: 'Token inválido' 
            });
        }
        
        console.log('✅ Token verificado para el usuario:', {
            id: decoded.id,
            email: decoded.email || 'No email'
        });
        
        // 4. Adjuntar la información del usuario a la solicitud
        req.user = {
            id: decoded.id,
            email: decoded.email
        };
        
        return next();
    } catch (error) {
        console.error('❌ Error al verificar el token:', error.message);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                error: 'Token expirado' 
            });
        }
        
        return res.status(403).json({ 
            success: false,
            error: 'Token inválido o expirado' 
        });
    }
}