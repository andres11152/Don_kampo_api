import express from 'express';
import morgan from 'morgan';
import fs from 'fs';
import https from 'https'; // Requiere el módulo https de Node.js
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/user.routes.js';
import productsRoutes from './routes/products.routes.js';
import shippingRoutes from './routes/shipping.routes.js';
import orderRoutes from './routes/order.routes.js';
import customerTypesRoutes from './routes/customerTypes.routes.js';
import multer from 'multer';
import { optimizeImage } from './middlewares/imageMiddleware.js';
import cors from 'cors';
import dotenv from 'dotenv';

// Cargar variables de entorno desde el archivo .env
dotenv.config();
const app = express();

// Middleware de logging con morgan
app.use(morgan('combined')); // 'combined' para un registro más detallado en producción

// Middleware de parseo de JSON
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

// Configuración de multer para subir imágenes
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage
}).single('photo');

// Configuración de CORS para producción
const allowedOrigins = ['https://donkampo.com',
// Dominio de producción
'http://localhost:3000',
// Desarrollo local
'http://localhost:3001' // Desarrollo local
];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// Configuración del motor de plantillas
app.set('view engine', 'ejs');

// Timeout de las solicitudes
app.use((req, res, next) => {
  res.setTimeout(5000, () => {
    console.log('La solicitud ha superado el tiempo de espera.');
    res.status(408).send('Request timed out');
  });
  next();
});

// Rutas de la aplicación
app.use(authRoutes);
app.use(usersRoutes);
app.use(productsRoutes);
app.use(shippingRoutes);
app.use(orderRoutes);
app.use(customerTypesRoutes);

// Ruta para crear productos (con imagen)
app.post('/api/createproduct', upload, optimizeImage, (req, res) => {
  console.log('Imagen subida:', req.file);
  res.status(201).json({
    message: 'Producto creado exitosamente'
  });
});

// Redirigir tráfico HTTP a HTTPS
app.use((req, res, next) => {
  if (req.protocol === 'http') {
    res.redirect(301, 'https://' + req.headers.host + req.url);
  } else {
    next();
  }
});

// Crear servidor HTTP (IIS manejará el HTTPS)
app.listen(80, () => {
  console.log('Servidor HTTP corriendo en el puerto 80');
});

// Manejo de señales de interrupción
process.on("SIGINT", () => {
  console.log("Servidor cerrado correctamente");
  process.exit(0);
});