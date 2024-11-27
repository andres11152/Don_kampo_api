import express from "express";
import cors from "cors";
import morgan from "morgan";
import { PORT } from "./config/config.js";
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/user.routes.js";
import productsRoutes from './routes/products.routes.js';
import shippingRoutes from './routes/shipping.routes.js';
import orderRoutes from './routes/order.routes.js';

// Configuración del servidor
const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

// Configuración de CORS
const allowedOrigins = ['https://donkampo.com',  // dominio sin www
  'https://www.donkampo.com']; // Cambia al puerto del frontend (Vite normalmente usa 3000)
const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Permite el envío de cookies y encabezados de autenticación
};
app.use(cors(corsOptions)); // Aplica las opciones de CORS

// Configuración de EJS
app.set('view engine', 'ejs');

// Configuración de Timeout para las solicitudes
app.use((req, res, next) => {
  res.setTimeout(5000, () => {
    // Timeout de 5 segundos
    console.log('La solicitud ha superado el tiempo de espera.');
    res.status(408).send('Request timed out');
  });
  next();
});

// Rutas
app.use(authRoutes); // Ruta para el inicio de sesión
app.use(usersRoutes); // Ruta para los usuarios
app.use(productsRoutes); // Ruta para los productos y precios
app.use(shippingRoutes); // Ruta para los métodos de envío
app.use(orderRoutes); // Ruta para los pedidos

// Configuración del servidor - Ruta principal
app.get("/", (req, res) => {
  res.render(process.cwd() + "/web/index.ejs"); // Renderiza el archivo index.ejs al acceder a la ruta raíz.
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack); // Muestra el stack trace del error en la consola.
  res.status(500).send("Error interno del servidor"); // Responde con un mensaje de error 500.
});

// Inicialización del servidor
const server = app.listen(PORT, () => {
  const host = `http://localhost:${PORT}`;
  console.log(`Servidor corriendo en: ${host}`); // Muestra en consola que el servidor está corriendo y en qué URL.
});

// Manejo de señal de terminación (SIGINT)
process.on("SIGINT", () => {
  server.close(() => {
    console.log("Servidor cerrado correctamente"); // Muestra en consola que el servidor se ha cerrado correctamente.
    process.exit(0); // Termina el proceso de Node.js.
  });
});