import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { getConnection } from '../database/connection.js';
import { queries } from '../database/queries.interface.js';
import { createTransporter } from '../utils/mailer.js';

// Configuración general para proveedores de correo
const emailConfig = {
  gmail: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: 'tu_email@gmail.com',
    pass: 'tu_contraseña'
  },
  outlook: {
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    user: 'tu_email@outlook.com',
    pass: 'tu_contraseña'
  },
  yahoo: {
    host: 'smtp.mail.yahoo.com',
    port: 587,
    secure: false,
    user: 'tu_email@yahoo.com',
    pass: 'tu_contraseña'
  },
  custom: (user, pass) => ({
    host: 'smtp.ejemplo.com',
    port: 587,
    secure: false,
    user,
    pass
  })
};
export const requestPasswordReset = async (req, res) => {
  const {
    email,
    provider = 'gmail'
  } = req.body;
  try {
    const client = await getConnection();

    // Verifica si el correo existe en la base de datos
    const result = await client.query(queries.users.getUserByEmail, [email]);
    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json({
        msg: 'Email not found'
      });
    }
    const userId = result.rows[0].id;

    // Genera un código de verificación de 6 dígitos
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Calcula la fecha de expiración (10 minutos en el futuro)
    const expirationDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // Guarda el código y la fecha de expiración en la base de datos
    await client.query(queries.users.updateUserResetToken, [verificationCode, expirationDate, userId]);

    // Configura el transportador basado en el proveedor de correo
    const transporter = createTransporter(emailConfig[provider]);

    // Enviar el correo con el código de verificación
    const mailOptions = {
      from: emailConfig[provider].user,
      to: email,
      subject: 'Password Reset Code',
      text: `Your password reset code is: ${verificationCode}`
    };
    await transporter.sendMail(mailOptions);
    client.release();
    res.status(200).json({
      msg: 'Verification code sent to email'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: 'Server error'
    });
  }
};
export const verifyCodeAndResetPassword = async (req, res) => {
  const {
    email,
    code,
    newPassword
  } = req.body;
  try {
    const client = await getConnection();

    // Verifica si el código de verificación es válido y no ha expirado
    const result = await client.query(queries.users.verifyUserResetCode, [email, code, Date.now()]);
    if (result.rows.length === 0) {
      client.release();
      return res.status(400).json({
        msg: 'Invalid or expired code'
      });
    }
    const userId = result.rows[0].id;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualiza la contraseña y elimina el código de verificación de restablecimiento
    await client.query(queries.users.updateUserPassword, [hashedPassword, userId]);
    client.release();
    res.status(200).json({
      msg: 'Password successfully reset'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: 'Server error'
    });
  }
};