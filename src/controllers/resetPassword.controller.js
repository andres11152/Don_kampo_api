import { getConnection } from '../database/connection.js';
import { queries } from '../database/queries.interface.js';
import { sendEmail } from '../utils/mailer.js';  // Importar la función para enviar el correo
import bcrypt from 'bcrypt';

// Paso 1: Ruta para solicitar el código de restablecimiento de contraseña
export const requestPasswordReset = async (req, res) => {
  const { email, provider = 'gmail' } = req.body; // El proveedor de correo por defecto es 'gmail'

  try {
    const client = await getConnection();
    
    // Verifica si el correo existe en la base de datos
    const result = await client.query(queries.users.getUserByEmail, [email]);
    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json({ msg: 'Email not found' });
    }

    const userId = result.rows[0].id;

    // Genera un código de verificación de 6 dígitos
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Calcula la fecha de expiración (10 minutos en el futuro)
    const expirationDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // Convertir la fecha de expiración de milisegundos a segundos (PostgreSQL lo espera en segundos)
    const expirationDateInSeconds = Math.floor(expirationDate.getTime() / 1000); // Convertir a segundos

    // Guarda el código y la fecha de expiración en la base de datos
    await client.query(
      queries.users.updateUserResetToken,
      [verificationCode, expirationDateInSeconds, userId] // Usamos la fecha en segundos
    );

    // Enviar el código por correo usando la función sendEmail
    await sendEmail(
      email,  // Correo del destinatario
      'Password Reset Code',  // Asunto
      `Your password reset code is: ${verificationCode}`,  // Cuerpo del correo
      provider  // Proveedor de correo (puedes cambiar entre gmail, outlook, yahoo, etc.)
    );

    client.release();
    res.status(200).json({ msg: 'Verification code sent to email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const verifyCodeAndResetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const client = await getConnection();

    // Convertir Date.now() de milisegundos a segundos
    const currentTimeInSeconds = Math.floor(Date.now() / 1000); // Fecha actual en segundos

    // Verifica si el código de verificación es válido y no ha expirado
    const result = await client.query(
      queries.users.verifyUserResetCode, 
      [email, code, currentTimeInSeconds] // Pasamos la fecha en segundos
    );

    if (result.rows.length === 0) {
      client.release();
      return res.status(400).json({ msg: 'Invalid or expired code' });
    }

    const userId = result.rows[0].id;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualiza la contraseña y elimina el código de verificación de restablecimiento
    await client.query(
      queries.users.updateUserPassword,
      [hashedPassword, userId]
    );

    client.release();
    res.status(200).json({ msg: 'Password successfully reset' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};