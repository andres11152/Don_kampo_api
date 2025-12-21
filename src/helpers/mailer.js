import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * ====================================
 * Email Configuration (Nodemailer)
 * ====================================
 * Configuración cargada desde variables de entorno
 * IMPORTANTE: Usar App Password de Gmail, no la contraseña regular
 * Generar en: https://myaccount.google.com/apppasswords
 */

const emailConfig = {
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587", 10),
  secure: process.env.EMAIL_SECURE === "true", // true para 465, false para otros
  user: process.env.EMAIL_USER || "donkampo76@gmail.com",
  pass: process.env.EMAIL_PASSWORD || "rvoe qmdk eblb tvly",
  from: process.env.EMAIL_FROM || "Don Kampo <donkampo76@gmail.com>",
};

// Validar configuración al iniciar
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.warn(
    "⚠️ WARNING: EMAIL_USER o EMAIL_PASSWORD no configurados en .env"
  );
  console.warn(
    "   Usando credenciales por defecto (NO RECOMENDADO para producción)"
  );
}

const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass,
  },
  // Opciones adicionales para mayor confiabilidad
  pool: true, // Usar pool de conexiones
  maxConnections: 5,
  maxMessages: 100,
});

// Verificar conexión al iniciar (solo en desarrollo)
if (process.env.NODE_ENV !== "production") {
  transporter.verify((error, success) => {
    if (error) {
      console.error(
        "❌ Error al conectar con el servidor de email:",
        error.message
      );
    } else {
      console.log("✅ Servidor de email listo para enviar mensajes");
      console.log(`   Host: ${emailConfig.host}:${emailConfig.port}`);
      console.log(`   User: ${emailConfig.user}`);
    }
  });
}

/**
 * Envía un email
 * @param {string} to - Destinatario
 * @param {string} subject - Asunto
 * @param {string} text - Contenido en texto plano
 * @param {string} html - (Opcional) Contenido en HTML
 * @returns {Promise} - Promesa que resuelve con info del email enviado
 */
export const sendEmail = (to, subject, text, html = null) => {
  const mailOptions = {
    from: emailConfig.from,
    to: to,
    subject: subject,
    text: text,
    ...(html && { html }), // Agregar HTML solo si se proporciona
  };

  return transporter
    .sendMail(mailOptions)
    .then((info) => {
      console.log("✅ Correo enviado exitosamente:", {
        to,
        subject,
        messageId: info.messageId,
      });
      return info;
    })
    .catch((error) => {
      console.error("❌ Error al enviar correo:", {
        to,
        subject,
        error: error.message,
      });
      throw error; // Re-lanzar para que el controlador pueda manejarlo
    });
};

/**
 * Exportar configuración para testing o uso externo
 */
export const getEmailConfig = () => ({
  host: emailConfig.host,
  port: emailConfig.port,
  user: emailConfig.user,
  from: emailConfig.from,
});
