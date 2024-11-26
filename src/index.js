import express from 'express';
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


dotenv.config();

const app = express();



// Middleware para analizar JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuración de Multer para subir archivos (imagen)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('photo');

// Configuración de CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [
  'https://donkampo.com', // Origen permitido
  'http://localhost:3000', // Origen local
  'http://localhost:3001', // Origen local
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
  credentials: true,
};

// Aplicar CORS
app.use(cors(corsOptions));

// Rutas de la aplicación
app.use(authRoutes);
app.use(usersRoutes);
app.use(productsRoutes);
app.use(shippingRoutes);
app.use(orderRoutes);
app.use(customerTypesRoutes);

// Ruta para crear un producto y optimizar la imagen
app.post('/api/createproduct', upload, optimizeImage, (req, res) => {
  console.log('Imagen subida:', req.file);
  res.status(201).json({ message: 'Producto creado exitosamente' });
});

app.options('*', cors(corsOptions)); 

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
