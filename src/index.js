import express from "express";
import cors from "cors";
import morgan from "morgan";
import { PORT } from "./config/config.js";
import usersRoutes from "./routes/user.routes.js";
import authRoutes  from "./routes/auth.routes.js"; 

// Configuración del servidor
const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuración de CORS
const corsOptions = {
  origin: 'http://localhost:4200', // Cambia a la URL de tu aplicación Angular
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions)); // Aplica las opciones de CORS

app.set('view engine', 'ejs');

// Rutas
app.use(usersRoutes);
app.use('/api', authRoutes); // Asegúrate de que la ruta esté definida en '/api'


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
