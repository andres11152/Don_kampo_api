import jwt from 'jsonwebtoken';
const JWT_SECRET = 'Xpto-secret0-key';
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(403).json({
        message: 'Token de autenticación no proporcionado o formato incorrecto.'
      });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(403).json({
        message: 'Token de autenticación no encontrado.'
      });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.id) {
      console.warn('Token decodificado pero sin ID de usuario:', decoded);
      return res.status(401).json({
        message: 'Token no contiene información válida de usuario.'
      });
    }
    req.user = decoded;
    console.log('Usuario autenticado:', req.user);
    next();
  } catch (error) {
    console.error('Error al verificar el token:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'El token ha expirado.'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Token no válido.'
      });
    } else {
      return res.status(500).json({
        message: 'Error al procesar la autenticación.'
      });
    }
  }
};