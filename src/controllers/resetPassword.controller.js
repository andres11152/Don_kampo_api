import { getConnection } from '../database/connection.js';
import { queries } from '../database/queries.interface.js';
import { sendEmail } from '../helpers/mailer.js';
import bcrypt from 'bcrypt';

/**
 * Solicitar restablecimiento de contraseña.
 */
export const requestPasswordReset = async (req, res) => {
  let client;
  try {
    const { email, provider = 'gmail' } = req.body;

    // Validar que el correo esté presente
    if (!email) {
      return res.status(400).json({ msg: 'Por favor, ingresa un correo electrónico.' });
    }

    const normalizedEmail = email.toLowerCase(); // Normalizar a minúsculas para evitar problemas con mayúsculas/minúsculas

    // Establecer conexión con la base de datos
    client = await getConnection();

    // Buscar el usuario por correo
    const result = await client.query(queries.users.getUserByEmail, [normalizedEmail]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'El correo electrónico no está registrado.' });
    }

    const userId = result.rows[0].id;

    // Generar código de verificación y fecha de expiración
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expirationDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
    const expirationDateInSeconds = Math.floor(expirationDate.getTime() / 1000);

    // Actualizar el token de restablecimiento en la base de datos
    await client.query(queries.users.updateUserResetToken, [
      verificationCode,
      expirationDateInSeconds,
      userId,
    ]);

    // Enviar correo electrónico con el código de verificación
    await sendEmail(
      email,
      'Código para restablecer tu contraseña',
      `Tu código de restablecimiento de contraseña es: ${verificationCode}`,
      provider
    );

    res.status(200).json({ msg: 'Se ha enviado un código de verificación a tu correo electrónico.' });
  } catch (error) {
    console.error('Error en requestPasswordReset:', error.message);

    // Diferenciar errores del cliente y errores del servidor
    if (error.message.includes('CORS') || error.message.includes('ECONNREFUSED')) {
      res.status(503).json({
        msg: 'Servicio no disponible. Por favor, intenta más tarde.',
      });
    } else if (error.message.includes('Correo')) {
      res.status(400).json({ msg: 'El correo electrónico es obligatorio.' });
    } else {
      res.status(500).json({
        msg: 'Ocurrió un error al procesar tu solicitud. Intenta nuevamente.',
        error: error.message, // Solo para debug en desarrollo
      });
    }
  } finally {
    // Liberar la conexión a la base de datos
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error('Error al liberar la conexión:', releaseError.message);
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
        .json({ msg: 'Correo, código y nueva contraseña son requeridos.' });
    }

    // Establecer conexión con la base de datos
    client = await getConnection();

    const currentTimeInSeconds = Math.floor(Date.now() / 1000);

    // Verificar el código y la fecha de expiración
    const result = await client.query(queries.users.verifyUserResetCode, [
      email.toLowerCase(), // Normalizar el correo a minúsculas
      code,
      currentTimeInSeconds,
    ]);

    if (result.rows.length === 0) {
      return res
        .status(400)
        .json({ msg: 'El código es inválido o ha expirado.' });
    }

    const userId = result.rows[0].id;

    // Generar el hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña del usuario
    await client.query(queries.users.updateUserPassword, [hashedPassword, userId]);

    res.status(200).json({ msg: 'La contraseña se ha restablecido correctamente.' });
  } catch (error) {
    console.error('Error en verifyCodeAndResetPassword:', error.message);
    res.status(500).json({
      msg: 'Ocurrió un error en el servidor. Por favor, intenta nuevamente.',
      error: error.message, // Solo para debug en desarrollo
    });
  } finally {
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error('Error al liberar la conexión:', releaseError.message);
      }
    }
  }
};

