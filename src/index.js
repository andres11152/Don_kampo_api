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

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('photo');

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://donkampo.com'
];

const corsOptions = {
  origin: ['https://donkampo.com'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions)); 

app.set('view engine', 'ejs');

app.use((req, res, next) => {
  res.setTimeout(5000, () => {
    console.log('La solicitud ha superado el tiempo de espera.');
    res.status(408).send('Request timed out');
  });
  next();
});

app.use(authRoutes);
app.use(usersRoutes);
app.use(productsRoutes);
app.use(shippingRoutes);
app.use(orderRoutes);
app.use(customerTypesRoutes);

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
