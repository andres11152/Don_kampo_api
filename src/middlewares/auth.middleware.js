import jwt from 'jsonwebtoken';

const JWT_SECRET = 'Xpto-secret0-key'; // Reemplaza esto con una clave secreta más segura

export const verifyToken = (req, res, next) => {
  try {
    // Obtener el token desde el encabezado de autorización
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(403).json({ message: 'Token de autenticación no proporcionado o formato incorrecto.' });
    }

    // Extraer el token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(403).json({ message: 'Token de autenticación no encontrado.' });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar si el token contiene un id de usuario
    if (!decoded.id) {
      console.warn('Token decodificado pero sin ID de usuario:', decoded);
      return res.status(401).json({ message: 'Token no contiene información válida de usuario.' });
    }

    // Agregar la información del token decodificado al objeto `req`
    req.user = decoded;
    console.log('Usuario autenticado:', req.user);

    // Pasar al siguiente middleware o controlador
    next();
  } catch (error) {
    console.error('Error al verificar el token:', error);

    // Manejo de errores específicos de JWT
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'El token ha expirado.' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token no válido.' });
    } else {
      return res.status(500).json({ message: 'Error al procesar la autenticación.' });
    }
  }
};
