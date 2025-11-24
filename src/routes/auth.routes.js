import { Router } from "express";
import { loginController } from "../controllers/login.controller.js";
import { getUserProfile } from "../controllers/profile.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", loginController);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Autenticación
 *     summary: Obtener los datos del usuario autenticado
 *     description: Verifica el token de sesión desde la cookie y devuelve la información del usuario.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario.
 *       401:
 *         description: No autorizado.
 */
router.get("/me", verifyToken, getUserProfile);

/**
 * @swagger
 * /api/auth/test:
 *   get:
 *     tags:
 *       - Autenticación
 *     summary: Endpoint de prueba para verificar autenticación
 *     description: Retorna información del token decodificado para debugging
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *       401:
 *         description: No autorizado
 */
router.get("/test", verifyToken, (req, res) => {
  res.json({
    message: "Autenticación exitosa",
    user: req.user,
    isAdmin: req.user?.role === "admin",
  });
});

export default router;
