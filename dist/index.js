"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _express = _interopRequireDefault(require("express"));
var _morgan = _interopRequireDefault(require("morgan"));
var _authRoutes = _interopRequireDefault(require("./routes/auth.routes.js"));
var _userRoutes = _interopRequireDefault(require("./routes/user.routes.js"));
var _productsRoutes = _interopRequireDefault(require("./routes/products.routes.js"));
var _shippingRoutes = _interopRequireDefault(require("./routes/shipping.routes.js"));
var _orderRoutes = _interopRequireDefault(require("./routes/order.routes.js"));
var _customerTypesRoutes = _interopRequireDefault(require("./routes/customerTypes.routes.js"));
var _multer = _interopRequireDefault(require("multer"));
var _imageMiddleware = require("./middlewares/imageMiddleware.js");
var _cors = _interopRequireDefault(require("cors"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _helmet = _interopRequireDefault(require("helmet"));
var _path = _interopRequireDefault(require("path"));
var _fs = _interopRequireDefault(require("fs"));
_dotenv.default.config();
const app = (0, _express.default)();

// Seguridad con Helmet
app.use((0, _helmet.default)());

// Configuración de logging
if (process.env.NODE_ENV === 'production') {
  const __dirname = _path.default.dirname(new URL(import.meta.url).pathname);
  const logStream = _fs.default.createWriteStream(_path.default.join(__dirname, 'access.log'), {
    flags: 'a'
  });
  app.use((0, _morgan.default)('combined', {
    stream: logStream
  }));
} else {
  app.use((0, _morgan.default)('dev'));
}

// Middleware para analizar JSON y formularios
app.use(_express.default.json());
app.use(_express.default.urlencoded({
  extended: false
}));

// Configuración de Multer para subir archivos (imagen)
const storage = _multer.default.memoryStorage();
const upload = (0, _multer.default)({
  storage: storage
}).single('photo');

// Configuración de CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['https://donkampo.com',
// Origen permitido
'http://localhost:3000',
// Origen local
'http://localhost:3001' // Origen local
];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`Origen bloqueado por CORS: ${origin}`);
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Aplicar CORS
app.use((0, _cors.default)(corsOptions));

// Rutas de la aplicación
app.use(_authRoutes.default);
app.use(_userRoutes.default);
app.use(_productsRoutes.default);
app.use(_shippingRoutes.default);
app.use(_orderRoutes.default);
app.use(_customerTypesRoutes.default);

// Ruta para crear un producto y optimizar la imagen
app.post('/api/createproduct', upload, _imageMiddleware.optimizeImage, (req, res) => {
  console.log('Imagen subida:', req.file);
  res.status(201).json({
    message: 'Producto creado exitosamente'
  });
});

// Middleware para manejar solicitudes OPTIONS (Preflight)
app.options('*', (0, _cors.default)(corsOptions)); // Asegura que los preflight requests sean manejados correctamente

// Configuración de vistas
const _dirname = _path.default.dirname(new URL(import.meta.url).pathname);
app.use(_express.default.static(_path.default.join(_dirname, 'public')));

// Redirigir todas las solicitudes al archivo HTML en producción
app.get('*', (req, res) => {
  // Asegurarse de que la ruta a index.html es absoluta
  const indexPath = _path.default.resolve(_dirname, 'public', 'index.html');
  res.sendFile(indexPath, err => {
    if (err) {
      res.status(500).send('Error al cargar la página');
    }
  });
});

// Configuración del servidor
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

// Manejo de la señal SIGINT para cerrar el servidor de manera adecuada
process.on("SIGINT", () => {
  server.close(() => {
    console.log("Servidor cerrado correctamente");
    process.exit(0);
  });
});
//# sourceMappingURL=index.js.map