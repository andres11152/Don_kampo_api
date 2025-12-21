import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import multer from "multer";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";
import fs from "fs";

import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/user.routes.js";
import productsRoutes from "./routes/products.routes.js";
import shippingRoutes from "./routes/shipping.routes.js";
import orderRoutes from "./routes/order.routes.js";
import customerTypesRoutes from "./routes/customerTypes.routes.js";
import advertsimentsRoutes from "./routes/advertisements.routes.js";
// import minimumOrderRoutes from './routes/minimumOrder.routes.js';

dotenv.config();

const app = express();
app.set("trust proxy", 1); // Confiar en el proxy de Render para cookies seguras

// Cargar archivo Swagger manualmente
const swaggerDocument = JSON.parse(
  fs.readFileSync(new URL("../swagger.json", import.meta.url))
);

import { corsOptions, validateCorsConfig } from "./config/cors.config.js";

// Configuración de la política de Cross-Origin Resource Sharing (CORS).
// La configuración ahora se maneja en un módulo dedicado (config/cors.config.js)
// con validación estricta, logging detallado y soporte para variables de entorno.
//
// Características:
// - Whitelist configurable vía CORS_ORIGINS en .env
// - Logging de todos los intentos de acceso (permitidos y bloqueados)
// - Modo desarrollo con warnings en lugar de bloqueos (opcional)
// - Validación automática de configuración al iniciar
//
// `credentials: true` permite que el frontend envíe headers de `Authorization` (JWT)
// y cookies en peticiones cross-origin.

// Middlewares globales
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(morgan("dev"));
// Aumentar límite de tamaño para JSON y urlencoded (necesario para cargas masivas)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Motor de vistas EJS
app.set("view engine", "ejs");

// Configuración de multer
const storage = multer.memoryStorage();
const upload = multer({ storage }).single("photo");

// Rutas de Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rutas de la API
// Se agrupan todas las rutas bajo el prefijo /api para mantener la consistencia.
const apiRouter = express.Router();
apiRouter.use("/auth", authRoutes);
apiRouter.use(usersRoutes);
apiRouter.use(productsRoutes);
apiRouter.use(shippingRoutes);
apiRouter.use(orderRoutes);
apiRouter.use(customerTypesRoutes);
apiRouter.use(advertsimentsRoutes);
app.use("/api", apiRouter);

// Soporte para solicitudes preflight (OPTIONS)
app.options("*", cors(corsOptions));

// Validar configuración antes de iniciar el servidor
validateCorsConfig();

// Inicializar servidor
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`🚀 Servidor Don Kampo API iniciado exitosamente`);
  console.log(`${"=".repeat(50)}`);
  console.log(`📍 URL: http://localhost:${port}`);
  console.log(`📘 Swagger: http://localhost:${port}/api-docs`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔧 Trust Proxy: ${app.get("trust proxy")}`);
  console.log(`${"=".repeat(50)}\n`);
});

// Manejo de señal para cerrar el servidor
process.on("SIGINT", () => {
  console.log("Cerrando servidor...");
  process.exit(0);
});
