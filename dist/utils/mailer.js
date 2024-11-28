"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendEmail = void 0;
var _nodemailer = _interopRequireDefault(require("nodemailer"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  user: 'donkampo76@gmail.com',
  pass: 'rvoe qmdk eblb tvly'
};
var transporter = _nodemailer["default"].createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass
  }
});
var sendEmail = exports.sendEmail = function sendEmail(to, subject, text) {
  var mailOptions = {
    from: emailConfig.user,
    to: to,
    subject: subject,
    text: text
  };
  return transporter.sendMail(mailOptions).then(function (info) {
    return console.log('Correo enviado:', info.response);
  })["catch"](function (error) {
    return console.error('Error al enviar el correo:', error);
  });
};