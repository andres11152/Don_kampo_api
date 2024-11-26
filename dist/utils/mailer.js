"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendEmail = void 0;
var _nodemailer = _interopRequireDefault(require("nodemailer"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  user: 'donkampo76@gmail.com',
  pass: 'rvoe qmdk eblb tvly'
};
const transporter = _nodemailer.default.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass
  }
});
const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: emailConfig.user,
    to: to,
    subject: subject,
    text: text
  };
  return transporter.sendMail(mailOptions).then(info => console.log('Correo enviado:', info.response)).catch(error => console.error('Error al enviar el correo:', error));
};
exports.sendEmail = sendEmail;