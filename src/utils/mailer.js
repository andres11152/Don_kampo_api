import nodemailer from 'nodemailer';

// Configuración de correo de Gmail
const emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Usamos false para el puerto 587
  user: 'donkampo76@gmail.com',  // Tu correo de Gmail
  pass: 'rvoe qmdk eblb tvly',  // Usa la contraseña de aplicación generada
};

// Crea el transporter usando la configuración
const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass,
  },
});

// Función para enviar el correo
export const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: emailConfig.user,
    to: to,
    subject: subject,
    text: text,
  };

  return transporter.sendMail(mailOptions)
    .then(info => console.log('Correo enviado:', info.response))
    .catch(error => console.error('Error al enviar el correo:', error));
};
