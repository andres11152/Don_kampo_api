import jwt from 'jsonwebtoken';

const JWT_SECRET = 'Xpto-secret0-key';

export const verifyToken = (req, res, next) => {
  try {
    let token;

    // 1. Buscar el token en la cookie (nuevo método seguro)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // 2. Si no está en la cookie, buscar en el header (método anterior para retrocompatibilidad)
    const authHeader = req.headers['authorization'];
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 3. Si no se encontró ningún token, rechazar la petición
    if (!token) {
      return res.status(401).json({ message: 'Acceso denegado. No se proporcionó un token.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!decoded.id) {
      console.warn('Token decodificado pero sin ID de usuario:', decoded);
      return res.status(401).json({ message: 'Token no contiene información válida de usuario.' });
    }

    req.user = decoded;
    console.log('Usuario autenticado:', req.user);

    next();
  } catch (error) {
    console.error('Error al verificar el token:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'El token ha expirado.' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token no válido.' });
    } else {
      return res.status(500).json({ message: 'Error al procesar la autenticación.' });
    }
  }
};

/**
 * Middleware para verificar si el usuario tiene el rol de 'admin'.
 * Debe usarse SIEMPRE DESPUÉS de verifyToken.
 */
export const isAdmin = (req, res, next) => {
  // req.user es establecido por el middleware verifyToken
  if (req.user && req.user.role === 'admin') {
    next(); // El usuario es admin, puede continuar.
  } else {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
  }
};

/**
 * Middleware para verificar si el usuario es admin o el propietario del recurso.
 * Debe usarse SIEMPRE DESPUÉS de verifyToken.
 */
export const isAdminOrOwner = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.id === req.params.id)) {
    next();
  } else {
    res.status(403).send({ message: "Acceso denegado. No eres el propietario ni un administrador." });
  }
};
