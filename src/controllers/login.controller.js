// login.controller.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getConnection } from "../database/connection.js";
import { authConfig } from "../config/config.js";

export const loginController = async (req, res) => {
  let client;
  try {
    // Validar datos de entrada
    const { email, user_password } = req.body;

    if (!email || !user_password) {
      return res
        .status(400)
        .json({ message: "Email y contraseña son requeridos" });
    }

    // Obtener conexión y buscar usuario
    client = await getConnection();
    const result = await client.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ message: "Email o contraseña incorrectos" });
    }

    const user = result.rows[0];

    // Verificar la contraseña
    const isMatch = await bcrypt.compare(user_password, user.user_password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email o contraseña incorrectos" });
    }

    // Generar token JWT con role para el middleware de autorización
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        user_type: user.user_type,
        role: user.user_type, // Agregamos role para compatibilidad con isAdmin middleware
      },
      authConfig.secret, // Usar el secreto centralizado del config
      { expiresIn: "1h" }
    );

    // Guardar el token en una cookie segura con el nombre correcto
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: true, // Forzamos secure para Render
      sameSite: "none", // Forzamos none para cross-site
      maxAge: 3600000, // 1 hora en milisegundos
      path: "/",
    });

    console.log("🍪 Cookie establecida con opciones:", {
      httpOnly: true,
      secure: true, // Forzamos secure para Render
      sameSite: "none", // Forzamos none para cross-site
      maxAge: 3600000, // 1 hora en milisegundos.env.NODE_ENV,
    });

    // Responder con éxito
    return res.status(200).json({
      message: "Inicio de sesión exitoso",
      user: {
        id: user.id,
        user_name: user.user_name,
        lastname: user.lastname,
        email: user.email,
        user_type: user.user_type,
      },
    });
  } catch (error) {
    console.error("Error durante el inicio de sesión:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  } finally {
    if (client) client.release(); // Liberar la conexión
  }
};
