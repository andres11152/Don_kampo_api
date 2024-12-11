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

const allowedOrigins = [
  'https://donkampo.com',  // dominio sin www
  'https://www.donkampo.com' ,'http://localhost:3000',  // dominio con www
];

const corsOptions = {
  origin: (origin, callback) => {
    // Asegúrate de que el origen de tu frontend esté permitido
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);  // Permite solicitudes desde los orígenes permitidos
    } else {
      callback(new Error('CORS Error: Origin not allowed'), false);  // Bloquea otros orígenes
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,  // Habilita el uso de cookies
};
app.use(cors(corsOptions));
  // Aplica esta configuración a todas las rutas

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('photo');

app.set('view engine', 'ejs');

app.use(express.json());

// Rutas del backend
app.use(authRoutes);
app.use(usersRoutes);
app.use(productsRoutes);
app.use(shippingRoutes);
app.use(orderRoutes);
app.use(customerTypesRoutes);

// Ruta para crear productos (ejemplo de ruta POST)
app.post('/api/createproduct', upload, optimizeImage, (req, res) => {
  console.log('Imagen subida:', req.file);
  res.status(201).json({ message: 'Producto creado exitosamente!' });
});

app.listen(PORT, () => {
  const host = `http://localhost:${PORT}`;
  console.log(`Servidor corriendo en: ${host}`);
});

process.on("SIGINT", () => {
  console.log("Servidor cerrado correctamente");
  process.exit(0);
});
