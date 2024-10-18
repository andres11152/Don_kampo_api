import express from "express";
import cors from "cors";
import morgan from "morgan";
import { PORT } from "./config/config.js";

// Configuración del servidor
const app = express();

//importación de las rutas
import usersRoutes from "./routes/user.routes.js";

//Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cors());
app.set('view engine', 'ejs');

//routes
app.use(usersRoutes);

//configuración del servidor  - Ruta principal
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