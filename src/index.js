import express from 'express';
import morgan from 'morgan';
import { PORT } from './config/config.js';
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/user.routes.js';
import productsRoutes from './routes/products.routes.js';
import shippingRoutes from './routes/shipping.routes.js';
import orderRoutes from './routes/order.routes.js';
import customerTypesRoutes from './routes/customerTypes.routes.js';
import multer from 'multer';
import { optimizeImage } from './middlewares/imageMiddleware.js';
import cors from 'cors';

const app = express();

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuración de Multer para manejar imágenes
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('photo');

// Orígenes permitidos para CORS
const allowedOrigins = [
  'http://localhost:3000',        // Desarrollo local
  'http://localhost:3001',        // Otro puerto en desarrollo
  'https://donkampo.com',         // Frontend en producción
  'https://api.donkampo.com',     // API en subdominio
];

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir que no se pase un origin (en caso de peticiones sin origen, como desde el backend)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,  // Permitir el envío de cookies y credenciales
};

// Configuración de CORS
app.use(cors(corsOptions));

// Configuración de EJS (si es necesario para tu aplicación)
app.set('view engine', 'ejs');

// Timeout para las peticiones
app.use((req, res, next) => {
  res.setTimeout(5000, () => {
    console.log('La solicitud ha superado el tiempo de espera.');
    res.status(408).send('Request timed out');
  });
  next();
});

// Rutas de la API
app.use(authRoutes);
app.use(usersRoutes);
app.use(productsRoutes);
app.use(shippingRoutes);
app.use(orderRoutes);
app.use(customerTypesRoutes);

// Ruta para crear un producto (con optimización de imágenes)
app.post('/api/createproduct', upload, optimizeImage, (req, res) => {
  console.log('Imagen subida:', req.file);
  res.status(201).json({ message: 'Producto creado exitosamente!' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  const host = `http://localhost:${PORT}`;
  console.log(`Servidor corriendo en: ${host}`);
});

// Manejo de cierre del servidor
process.on("SIGINT", () => {
  console.log("Servidor cerrado correctamente");
  process.exit(0);
});
