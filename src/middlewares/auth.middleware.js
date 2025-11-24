import jwt from "jsonwebtoken";
import { authConfig } from "../config/config.js";

/**
 * Middleware para verificar el token JWT.
 * Si el token es válido, añade la información del usuario (id, role) a `req.user`.
 */
export const verifyToken = (req, res, next) => {
  // Obtener el token de la cookie 'accessToken' o del header 'Authorization'
  let token =
    req.cookies?.accessToken ||
    req.headers["x-access-token"] ||
    req.headers["authorization"];

  console.log("🔒 VerifyToken Middleware:");
  console.log("   - Cookies:", req.cookies);
  console.log("   - Headers[Authorization]:", req.headers["authorization"]);
  console.log("   - Token found:", !!token);

  if (!token) {
    return res
      .status(403)
      .json({ message: "No se proporcionó un token. Acceso denegado." });
  }

  // Si el token viene en el header 'Authorization' como "Bearer <token>", lo extraemos.
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }

  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({
          message: "No autorizado. El token no es válido o ha expirado.",
        });
    }
    // El payload decodificado (que incluye id y role) se adjunta al objeto request.
    req.user = decoded;
    next();
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
    res
      .status(403)
      .send({
        message: "Acceso denegado. No eres el propietario ni un administrador.",
      });
  }
};
