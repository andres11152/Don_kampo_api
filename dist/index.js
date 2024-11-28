"use strict";

var _express = _interopRequireDefault(require("express"));
var _morgan = _interopRequireDefault(require("morgan"));
var _config = require("./config/config.js");
var _authRoutes = _interopRequireDefault(require("./routes/auth.routes.js"));
var _userRoutes = _interopRequireDefault(require("./routes/user.routes.js"));
var _productsRoutes = _interopRequireDefault(require("./routes/products.routes.js"));
var _shippingRoutes = _interopRequireDefault(require("./routes/shipping.routes.js"));
var _orderRoutes = _interopRequireDefault(require("./routes/order.routes.js"));
var _customerTypesRoutes = _interopRequireDefault(require("./routes/customerTypes.routes.js"));
var _multer = _interopRequireDefault(require("multer"));
var _imageMiddleware = require("./middlewares/imageMiddleware.js");
var _cors = _interopRequireDefault(require("cors"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var app = (0, _express["default"])();
var allowedOrigins = ['https://donkampo.com',
// dominio sin www
'https://www.donkampo.com', 'http://localhost:3000' // dominio con www
];
var corsOptions = {
  origin: function origin(_origin, callback) {
    // Asegúrate de que el origen de tu frontend esté permitido
    if (!_origin || allowedOrigins.includes(_origin)) {
      callback(null, true); // Permite solicitudes desde los orígenes permitidos
    } else {
      callback(new Error('CORS Error: Origin not allowed'), false); // Bloquea otros orígenes
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Habilita el uso de cookies
};
app.use((0, _cors["default"])(corsOptions));
// Aplica esta configuración a todas las rutas

app.use((0, _morgan["default"])("dev"));
app.use(_express["default"].json());
app.use(_express["default"].urlencoded({
  extended: false
}));
var storage = _multer["default"].memoryStorage();
var upload = (0, _multer["default"])({
  storage: storage
}).single('photo');
app.set('view engine', 'ejs');

// Rutas del backend
app.use(_authRoutes["default"]);
app.use(_userRoutes["default"]);
app.use(_productsRoutes["default"]);
app.use(_shippingRoutes["default"]);
app.use(_orderRoutes["default"]);
app.use(_customerTypesRoutes["default"]);

// Ruta para crear productos (ejemplo de ruta POST)
app.post('/api/createproduct', upload, _imageMiddleware.optimizeImage, function (req, res) {
  console.log('Imagen subida:', req.file);
  res.status(201).json({
    message: 'Producto creado exitosamente!'
  });
});
app.listen(_config.PORT, function () {
  var host = "http://localhost:".concat(_config.PORT);
  console.log("Servidor corriendo en: ".concat(host));
});
process.on("SIGINT", function () {
  console.log("Servidor cerrado correctamente");
  process.exit(0);
});