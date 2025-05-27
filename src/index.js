import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import multer from 'multer';

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


const allowedOrigins = [
  'https://donkampo.com',
  'https://www.donkampo.com',
  'http://localhost:3000',
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

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.set('view engine', 'ejs');

// app.use(express.json());

// app.use(express.json({ limit: '50mb' })); // Ajusta el límite según lo necesites
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));


// Rutas del backend
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('photo');

app.set('view engine', 'ejs');

app.use(authRoutes);
app.use(usersRoutes);
app.use(productsRoutes);
app.use(shippingRoutes);
app.use(orderRoutes);
app.use(customerTypesRoutes);
app.use(advertsimentsRoutes);
//app.use(minimumOrderRoutes);

app.options('*', cors(corsOptions));

const port = process.env.PORT || 8080;

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

process.on('SIGINT', () => {
  console.log('Cerrando servidor...');
  process.exit(0);
});
