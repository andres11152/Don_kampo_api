import jwt from "jsonwebtoken";
import { authConfig } from "../config/config.js";

/**
 * Middleware para verificar el token JWT.
 * Si el token es válido, añade la información del usuario (id, role) a `req.user`.
 */
export const verifyToken = (req, res, next) => {
  // Obtener el token: Prioridad Header Authorization > Cookie > Header x-access-token
  let token =
    req.headers["authorization"] ||
    req.cookies?.accessToken ||
    req.headers["x-access-token"];

  console.log("🔒 VerifyToken Middleware:");
  // console.log("   - Cookies:", req.cookies); // Comentado para reducir ruido si no es necesario
  // console.log("   - Headers[Authorization]:", req.headers["authorization"]);

  if (!token) {
    // CORRECCIÓN: Se cambia el estado de 403 a 401 para seguir el estándar.
    // 401 Unauthorized es para problemas de autenticación (falta de token).
    return res.status(401).json({ message: "No se proporcionó un token." });
  }

  // Si el token viene en el header 'Authorization' como "Bearer <token>", lo extraemos.
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }

  // console.log("   - Secret used for verification:", authConfig.secret);

  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err) {
      console.error("❌ JWT Verification Error:", err.message);
      // console.error("   - Error Name:", err.name);
      // console.error("   - Token Expired At:", err.expiredAt);
      return res.status(401).json({
        message: "No autorizado. El token no es válido o ha expirado.",
        error: err.message, // Enviar detalle del error para debugging (remover en prod)
      });
    }
    // El payload decodificado (que incluye id y role) se adjunta al objeto request.
    req.user = decoded;
    next();
  });
};

/**
 * Middleware para verificar opcionalmente el token JWT.
 * Si el token existe y es válido, añade `req.user`.
 * Si no hay token, simplemente continúa al siguiente middleware sin error.
 * Ideal para rutas que pueden ser accedidas por usuarios logueados e invitados.
 */
export const optionalVerifyToken = (req, res, next) => {
  let token =
    req.headers["authorization"] ||
    req.cookies?.accessToken ||
    req.headers["x-access-token"];

  // Si no hay token, simplemente continuamos. El controlador se encargará de la lógica.
  if (!token) {
    return next();
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }

  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err) {
      // Si el token existe pero es inválido (ej. expirado), sí es un error.
      console.error("❌ JWT Verification Error (Optional):", err.message);
      return res.status(401).json({
        message: "No autorizado. El token proporcionado no es válido o ha expirado.",
        error: err.message,
      });
    }
    req.user = decoded; // Adjuntamos los datos del usuario si el token es válido
    next();
  });
};

/**
 * Middleware para verificar si el token es de un usuario logueado o de un invitado temporal.
 * Si es un usuario logueado, adjunta `req.user`.
 * Si es un invitado con un token válido para una orden específica, adjunta `req.guestOrder`.
 */
export const verifyGuestOrUserToken = (req, res, next) => {
  let token =
    req.headers["authorization"] ||
    req.cookies?.accessToken ||
    req.headers["x-access-token"];

  if (!token) {
    return res.status(401).json({ message: "No se proporcionó un token." });
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }

  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        message: "No autorizado. El token no es válido o ha expirado.",
        error: err.message,
      });
    }

    // Si el token decodificado tiene la propiedad 'guest', es un token de invitado.
    if (decoded.guest && decoded.orderId) {
      // Verificamos que el ID de la orden en el token coincida con el de la URL.
      if (String(decoded.orderId) !== req.params.orderId) {
        return res.status(403).json({ message: "Acceso prohibido. El token no corresponde a esta orden." });
      }
      req.guestOrder = { orderId: decoded.orderId };
      next();
    } else { // Si no, es un token de usuario normal.
      req.user = decoded;
      next();
    }
  });
};

/**
 * Middleware para verificar si el usuario tiene el rol de 'admin'.
 * Debe usarse SIEMPRE DESPUÉS de verifyToken.
 */
export const isAdmin = (req, res, next) => {
  // req.user es establecido por el middleware verifyToken
  if (req.user && req.user.role === "admin") {
    next(); // El usuario es admin, puede continuar.
  } else {
    return res
      .status(403)
      .json({ message: "Acceso denegado. Se requiere rol de administrador." });
  }
};

/**
 * Middleware para verificar si el usuario es admin o el propietario del recurso.
 * Debe usarse SIEMPRE DESPUÉS de verifyToken.
 */
export const isAdminOrOwner = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "admin" || req.user.id === req.params.id)
  ) {
    next();
  } else {
    res.status(403).send({
      message: "Acceso denegado. No eres el propietario ni un administrador.",
    });
  }
};
