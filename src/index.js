import express from 'express';
import morgan from 'morgan';
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
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();

app.use(helmet());

app.use((req, res, next) => {
  if (req.protocol !== 'https' && req.get('X-Forwarded-Proto') !== 'https') {
    return res.redirect(301, 'https://' + req.headers.host + req.url);
  }
  next();
});

if (process.env.NODE_ENV === 'production') {
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
  app.use(morgan('combined', { stream: logStream }));
} else {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('photo');

const allowedOrigins = [
  'https://donkampo.com',
  'http://localhost:3000',
  'http://localhost:3001',
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
  res.status(201).json({ message: 'Producto creado exitosamente' });
});

const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 8080;

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

process.on("SIGINT", () => {
  console.log("Servidor cerrado correctamente");
  process.exit(0);
});
