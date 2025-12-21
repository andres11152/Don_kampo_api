import { getConnection } from "../database/connection.js";
import { queries } from "../database/queries.interface.js";
import { sendEmail } from "../helpers/mailer.js";
import bcrypt from "bcrypt";

/**
 * Solicitar restablecimiento de contraseña.
 */
export const requestPasswordReset = async (req, res) => {
  let client;
  try {
    const { email, provider = "gmail" } = req.body;

    // Validar que el correo esté presente
    if (!email) {
      return res
        .status(400)
        .json({ msg: "Por favor, ingresa un correo electrónico." });
    }

    const normalizedEmail = email.toLowerCase(); // Normalizar a minúsculas para evitar problemas con mayúsculas/minúsculas

    // Establecer conexión con la base de datos
    client = await getConnection();

    // Buscar el usuario por correo
    const result = await client.query(queries.users.getUserByEmail, [
      normalizedEmail,
    ]);
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ msg: "El correo electrónico no está registrado." });
    }

    const userId = result.rows[0].id;

    // Generar código de verificación y fecha de expiración
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const expirationDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
    const expirationDateInSeconds = Math.floor(expirationDate.getTime() / 1000);

    // 🔍 DEBUG: Ver código generado
    console.log("🔑 Código de verificación generado:", verificationCode);
    console.log("⏰ Expira en:", expirationDate.toLocaleString());
    console.log("⏰ Expira en (seconds):", expirationDateInSeconds);

    // Actualizar el token de restablecimiento en la base de datos
    await client.query(queries.users.updateUserResetToken, [
      verificationCode,
      expirationDateInSeconds,
      userId,
    ]);

    // Enviar correo electrónico con el código de verificación
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; background-color: #e0ffed;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #e0ffed; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                
                <!-- Header con colores corporativos Don Kampo -->
                <tr>
                  <td style="background: linear-gradient(135deg, #FF914D 0%, #EE7723 100%); padding: 40px 30px; text-align: center;">
                    <!-- Logo Don Kampo -->
                    <div style="margin-bottom: 15px;">
                      <img src="https://www.donkampo.com/images/don-kampo-logo-principal.png" alt="Don Kampo" style="max-width: 250px; height: auto; display: block; margin: 0 auto;" />
                    </div>
                    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.95; font-weight: 500;">Del Campo a tu Mesa</p>
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.3);">
                      <p style="color: #ffffff; margin: 0; font-size: 14px; font-weight: 500;">Recuperación de Contraseña</p>
                    </div>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #1c1c1e; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Código de Verificación</h2>
                    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      Has solicitado restablecer tu contraseña. Usa el siguiente código de verificación:
                    </p>
                    
                    <!-- Code Box con diseño Don Kampo -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                      <tr>
                        <td align="center" style="background: linear-gradient(135deg, #fff5ef 0%, #ffe8d9 100%); border: 3px solid #FF914D; border-radius: 12px; padding: 30px 20px; position: relative;">
                          <div style="font-size: 42px; font-weight: 700; color: #FF914D; letter-spacing: 10px; font-family: 'Courier New', monospace; text-shadow: 0 2px 4px rgba(255,145,77,0.2);">
                            ${verificationCode}
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Info Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 20px 0; background-color: #e0ffed; border-left: 4px solid #4CAF50; border-radius: 8px;">
                      <tr>
                        <td style="padding: 15px 20px;">
                          <p style="color: #1c1c1e; font-size: 14px; line-height: 1.5; margin: 0;">
                            <strong style="color: #4CAF50;">⏰ Este código expirará en 10 minutos.</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">
                      Si no solicitaste este cambio, por favor ignora este correo. Tu contraseña permanecerá sin cambios.
                    </p>
                    
                    <p style="color: #999999; font-size: 13px; line-height: 1.5; margin: 0; font-style: italic;">
                      💡 <strong>Tip de seguridad:</strong> Nunca compartas este código con nadie. Don Kampo nunca te pedirá este código por teléfono o correo.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer con color verde corporativo -->
                <tr>
                  <td style="background-color: #4CAF50; padding: 25px; text-align: center;">
                    <p style="color: #ffffff; font-size: 13px; margin: 0 0 8px 0; font-weight: 500;">
                      © ${new Date().getFullYear()} Don Kampo - Del Campo a tu Mesa
                    </p>
                    <p style="color: rgba(255,255,255,0.9); font-size: 12px; margin: 0;">
                      Este es un correo automático, por favor no respondas.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Email signature -->
              <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                <tr>
                  <td align="center">
                    <p style="color: #999999; font-size: 11px; margin: 0; line-height: 1.5;">
                      🌾 Productos frescos del campo directo a tu mesa 🥬
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const emailText = `
Don Kampo - Recuperación de Contraseña

Tu código de verificación es: ${verificationCode}

Este código expirará en 10 minutos.

Si no solicitaste este cambio, por favor ignora este correo.

© ${new Date().getFullYear()} Don Kampo - Del Campo a tu Mesa
    `.trim();

    await sendEmail(
      email,
      "🔐 Don Kampo - Código de Verificación",
      emailText,
      emailHTML
    );

    res.status(200).json({
      msg: "Se ha enviado un código de verificación a tu correo electrónico.",
    });
  } catch (error) {
    console.error("Error en requestPasswordReset:", error.message);
    console.error("Error code:", error.code);
    console.error("Error stack:", error.stack);

    // Liberar el cliente en caso de error antes de responder
    if (client) {
      try {
        client.release();
        client = null; // Evitar doble release en finally
      } catch (releaseError) {
        console.error(
          "Error al liberar la conexión en catch:",
          releaseError.message
        );
      }
    }

    // Mensajes específicos según el tipo de error
    if (error.message.includes("timeout") || error.code === "ETIMEDOUT") {
      return res.status(503).json({
        msg: "La base de datos tardó demasiado en responder. Por favor, intenta nuevamente en unos momentos.",
      });
    }

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        msg: "No se pudo conectar a la base de datos. Por favor, intenta más tarde.",
      });
    }

    if (error.code === "23505") {
      // Duplicate key
      return res.status(400).json({
        msg: "Ya existe una solicitud pendiente para este correo.",
      });
    }

    if (error.message.includes("Correo")) {
      return res
        .status(400)
        .json({ msg: "El correo electrónico es obligatorio." });
    }

    // Error genérico
    res.status(500).json({
      msg: "Ocurrió un error al procesar tu solicitud. Intenta nuevamente.",
    });
  } finally {
    // Liberar la conexión a la base de datos
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error("Error al liberar la conexión:", releaseError.message);
      }
    }
  }
};

/**
 * Verificar código y restablecer contraseña.
 */
export const verifyCodeAndResetPassword = async (req, res) => {
  let client;
  try {
    const { email, code, newPassword } = req.body;

    // Validar que todos los campos estén presentes
    if (!email || !code || !newPassword) {
      return res
        .status(400)
        .json({ msg: "Correo, código y nueva contraseña son requeridos." });
    }

    // Establecer conexión con la base de datos
    client = await getConnection();

    const currentTimeInSeconds = Math.floor(Date.now() / 1000);

    // 🔍 DEBUG: Ver datos de verificación
    console.log("🔍 Verificando código...");
    console.log("   Email:", email.toLowerCase());
    console.log("   Código recibido:", code);
    console.log("   Timestamp actual:", currentTimeInSeconds);
    console.log("   Fecha actual:", new Date().toLocaleString());

    // Verificar el código y la fecha de expiración
    const result = await client.query(queries.users.verifyUserResetCode, [
      email.toLowerCase(), // Normalizar el correo a minúsculas
      code,
      currentTimeInSeconds,
    ]);

    console.log("   Resultado de query:", result.rowCount, "filas encontradas");

    if (result.rows.length === 0) {
      return res
        .status(400)
        .json({ msg: "El código es inválido o ha expirado." });
    }

    const userId = result.rows[0].id;

    // Generar el hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña del usuario
    await client.query(queries.users.updateUserPassword, [
      hashedPassword,
      userId,
    ]);

    res
      .status(200)
      .json({ msg: "La contraseña se ha restablecido correctamente." });
  } catch (error) {
    console.error("Error en verifyCodeAndResetPassword:", error.message);
    res.status(500).json({
      msg: "Ocurrió un error en el servidor. Por favor, intenta nuevamente.",
      error: error.message, // Solo para debug en desarrollo
    });
  } finally {
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error("Error al liberar la conexión:", releaseError.message);
      }
    }
  }
};
