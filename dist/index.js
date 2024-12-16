import express from 'express';
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/user.routes.js';
import productsRoutes from './routes/products.routes.js';
import shippingRoutes from './routes/shipping.routes.js';
import orderRoutes from './routes/order.routes.js';
import customerTypesRoutes from './routes/customerTypes.routes.js';
import advertsimentsRoutes from './routes/advertisements.routes.js';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const allowedOrigins = ['https://donkampo.com',
// dominio sin www
'https://www.donkampo.com', 'http://localhost:3000' // dominio con www
];
const corsOptions = {
  origin: (origin, callback) => {
    // Asegúrate de que el origen de tu frontend esté permitido
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Permite solicitudes desde los orígenes permitidos
    } else {
      callback(new Error('CORS Error: Origin not allowed'), false); // Bloquea otros orígenes
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Habilita el uso de cookies
};
app.use(cors(corsOptions));
// Aplica esta configuración a todas las rutas

app.use(morgan("dev"));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.json({
  limit: '50mb'
})); // Ajusta el límite según lo necesites
app.use(express.urlencoded({
  extended: true,
  limit: '50mb'
}));

// Rutas del backend
app.use(authRoutes);
app.use(usersRoutes);
app.use(productsRoutes);
app.use(shippingRoutes);
app.use(orderRoutes);
app.use(customerTypesRoutes);
app.use(advertsimentsRoutes);

// Manejar solicitudes OPTIONS para CORS
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