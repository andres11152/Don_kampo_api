import nodemailer from 'nodemailer';
const emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  user: 'donkampo76@gmail.com',
  pass: 'rvoe qmdk eblb tvly'
};
const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass
  }
});
export const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: emailConfig.user,
    to: to,
    subject: subject,
    text: text
  };
  return transporter.sendMail(mailOptions).then(info => console.log('Correo enviado:', info.response)).catch(error => console.error('Error al enviar el correo:', error));
};