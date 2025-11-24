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
