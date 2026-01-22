import jwt from 'jsonwebtoken';

export async function generateJWT(payload) {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });
    return token;
}

export async function verifyJWT(token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
}