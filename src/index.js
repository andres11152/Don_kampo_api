import express from 'express';
import morgan from 'morgan'; // Agregamos la importación de morgan
import { PORT } from './config/config.js';
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/user.routes.js';
import productsRoutes from './routes/products.routes.js';
import shippingRoutes from './routes/shipping.routes.js';
import orderRoutes from './routes/order.routes.js';
import multer from 'multer'; // Para manejar las cargas de archivos
import { optimizeImage } from './middlewares/imageMiddleware.js'; // Importamos el middleware para optimizar imágenes
import cors from 'cors'; // No olvides importar cors si aún no lo has hecho

// Configuración del servidor
const app = express();

// Middleware de morgan para logging
app.use(morgan("dev")); // Usamos morgan para registrar las solicitudes HTTP

// Middleware para procesar JSON y URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuración de Multer para la carga de imágenes
const storage = multer.memoryStorage(); // Almacenamos las imágenes en memoria
const upload = multer({ storage: storage }).single('photo'); // `photo` es el campo que contiene la imagen

// Middleware de CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://don-kampo-akm4.vercel.app'
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
  credentials: true,
};

app.use(cors(corsOptions));

// Configuración de EJS como motor de plantillas (si usas vistas)
app.set('view engine', 'ejs');

// Configuración de Timeout para las solicitudes
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

// Rutas de productos con Multer y optimización de imágenes
// Aseguramos que la imagen se cargue antes de crear el producto
app.post('/api/createproduct', upload, optimizeImage, (req, res) => {
  console.log('Imagen subida:', req.file);
  // El resto de la lógica para crear el producto aquí
  res.status(201).json({ message: 'Producto creado exitosamente' });
});

// Inicialización del servidor y manejo de conexiones
app.listen(PORT, () => {
  const host = `http://localhost:${PORT}`;
  console.log(`Servidor corriendo en: ${host}`);
});

// Manejo de señales de terminación (SIGINT) para cerrar correctamente el servidor
process.on("SIGINT", () => {
  console.log("Servidor cerrado correctamente");
  process.exit(0);
});
