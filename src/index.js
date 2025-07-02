import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import multer from 'multer';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../swagger.json' assert { type: 'json' };

import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/user.routes.js';
import productsRoutes from './routes/products.routes.js';
import shippingRoutes from './routes/shipping.routes.js';
import orderRoutes from './routes/order.routes.js';
import customerTypesRoutes from './routes/customerTypes.routes.js';
import advertsimentsRoutes from './routes/advertisements.routes.js';
// import minimumOrderRoutes from './routes/minimumOrder.routes.js';

dotenv.config();

const app = express();

// Configuración de CORS
const allowedOrigins = [
  'https://donkampo.com',
  'https://www.donkampo.com',
  'http://localhost:3000',
  'https://don-kampo-api-5vf3.onrender.com'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS Error: Origin not allowed'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Middlewares globales
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Motor de vistas EJS
app.set('view engine', 'ejs');

// Configuración de multer (para archivos como imágenes)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('photo');

// Rutas de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rutas de la API
app.use(authRoutes);
app.use(usersRoutes);
app.use(productsRoutes);
app.use(shippingRoutes);
app.use(orderRoutes);
app.use(customerTypesRoutes);
app.use(advertsimentsRoutes);
// app.use(minimumOrderRoutes);

// Soporte para solicitudes preflight
app.options('*', cors(corsOptions));

// Inicializar servidor
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log(`📘 Swagger docs en http://localhost:${port}/api-docs`);
});

// Manejo de cierre del servidor
process.on('SIGINT', () => {
  console.log('Cerrando servidor...');
  process.exit(0);
});
