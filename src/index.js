import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import multer from 'multer';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import fs from 'fs';

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

// Cargar archivo Swagger manualmente
const swaggerDocument = JSON.parse(
  fs.readFileSync(new URL('../swagger.json', import.meta.url))
);

// Configuración de la política de Cross-Origin Resource Sharing (CORS).
// Se define una lista blanca de orígenes para restringir las peticiones a dominios conocidos
// (producción, desarrollo local y el propio dominio de la API para Swagger UI).
//
// Se permiten solicitudes sin `origin` (p. ej., Postman, scripts de servidor) para facilitar las pruebas.
// `credentials: true` es fundamental para que el frontend pueda enviar cabeceras de `Authorization` (JWT)
// y mantener la sesión del usuario en las peticiones cross-origin.
const allowedOrigins = [
  'https://donkampo.com',
  'https://www.donkampo.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:8080/api-docs'
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
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Motor de vistas EJS
app.set('view engine', 'ejs');

// Configuración de multer
const storage = multer.memoryStorage();
const upload = multer({ storage }).single('photo');

// Rutas de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rutas de la API
// Se agrupan todas las rutas bajo el prefijo /api para mantener la consistencia.
const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use(usersRoutes);
apiRouter.use(productsRoutes);
apiRouter.use(shippingRoutes);
apiRouter.use(orderRoutes);
apiRouter.use(customerTypesRoutes);
apiRouter.use(advertsimentsRoutes);
app.use('/api', apiRouter);

// Soporte para solicitudes preflight
app.options('*', cors(corsOptions));

// Inicializar servidor
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log(`📘 Swagger docs en http://localhost:${port}/api-docs`);
});

// Manejo de señal para cerrar el servidor
process.on('SIGINT', () => {
  console.log('Cerrando servidor...');
  process.exit(0);
});
