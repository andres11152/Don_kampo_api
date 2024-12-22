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

    if (!email) {
      return res.status(400).json({ msg: 'Email is required' });
    }

    // Establecer conexión con la base de datos
    client = await getConnection();

    const result = await client.query(queries.users.getUserByEmail, [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Email not found' });
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
      'Password Reset Code',
      `Your password reset code is: ${verificationCode}`,
      provider
    );

    res.status(200).json({ msg: 'Verification code sent to email' });
  } catch (error) {
    console.error('Error en requestPasswordReset:', error.message);
    res.status(500).json({ msg: 'Server error', error: error.message });
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

/**
 * Verificar código y restablecer contraseña.
 */
export const verifyCodeAndResetPassword = async (req, res) => {
  let client;
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ msg: 'Email, code, and new password are required' });
    }

    // Establecer conexión con la base de datos
    client = await getConnection();

    const currentTimeInSeconds = Math.floor(Date.now() / 1000);

    // Verificar el código y la fecha de expiración
    const result = await client.query(queries.users.verifyUserResetCode, [
      email,
      code,
      currentTimeInSeconds,
    ]);

    if (result.rows.length === 0) {
      return res.status(400).json({ msg: 'Invalid or expired code' });
    }

    const userId = result.rows[0].id;

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña del usuario
    await client.query(queries.users.updateUserPassword, [hashedPassword, userId]);

    res.status(200).json({ msg: 'Password successfully reset' });
  } catch (error) {
    console.error('Error en verifyCodeAndResetPassword:', error.message);
    res.status(500).json({ msg: 'Server error', error: error.message });
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
