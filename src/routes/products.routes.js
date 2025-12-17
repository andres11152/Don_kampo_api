// routes/products.routes.js
import express from "express";
import multer from "multer";

import {
  getProducts,
  getProductById,
  createProduct,
  deleteProduct,
  updateProducts,
  createProductsBulk,
  validateProductsBulk,
  updatePricesByPresentation,
  bulkUpdateFromExcel,
  searchUniqueProducts,
} from "../controllers/products.controller.js";

import { handleMulterError } from "../middlewares/validateData.middleware.js";
import { optimizeImage } from "../middlewares/image.middleware.js";
import { verifyToken, isAdmin } from "../middlewares/auth.middleware.js";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

const router = express.Router();

// Parse JSON bodies for all routes in this router that expect JSON.
// A higher limit is required for bulk product operations (large payloads).
// This needs to be at the top to apply to all subsequent route definitions.
router.use(express.json({ limit: "10mb" }));
router.use(express.urlencoded({ extended: true, limit: "10mb" }));
// --- RUTAS CRUD PARA PRODUCTOS INDIVIDUALES ---
// Se sigue una convención RESTful. La subida de imágenes se maneja con una cadena
// de middlewares (multer -> error handler -> image optimizer) para mantener los
// controladores limpios y enfocados en la lógica de negocio.

// POST /api/products - Crear un nuevo producto.
// Acepta `multipart/form-data` para poder incluir una imagen.
// Accept either `photo_url` or legacy `photo` field names for file upload
// Accept either `photo_url` or legacy `photo` field names for file upload (stricter than upload.any)
router.post(
  "/products",
  upload.fields([
    { name: "photo_url", maxCount: 1 },
    { name: "photo", maxCount: 1 },
  ]),
  handleMulterError,
  optimizeImage,
  createProduct
);

// GET /api/products - Obtener todos los productos.
router.get("/products", getProducts);

// GET /api/products/search-unique - Buscar productos únicos por nombre (para autocomplete)
// DEBE IR ANTES DE /products/:id
router.get("/products/search-unique", searchUniqueProducts);

// GET /api/products/:id - Obtener un producto por su ID.
router.get("/products/:id", getProductById);

// Endpoint para la actualización de precios por presentación desde el Excel.
// Se define ANTES de /products/:id para evitar conflictos de enrutamiento.
router.put(
  "/products/update-prices-by-presentation",
  updatePricesByPresentation
);

// PUT /api/products/:id - Actualizar un producto existente.
// También acepta `multipart/form-data` para permitir la actualización de la imagen.
router.put(
  "/products/:id",
  upload.fields([
    { name: "photo_url", maxCount: 1 },
    { name: "photo", maxCount: 1 },
  ]),
  handleMulterError,
  optimizeImage,
  updateProducts
);

// DELETE /api/products/:id - Eliminar un producto por su ID.
router.delete("/products/:id", deleteProduct);

// --- RUTAS DE CARGA Y VALIDACIÓN MASIVA ---
// Estos endpoints están diseñados para la gestión de productos en lote desde el panel de administración.
// Se optó por rutas de acción específicas (/bulk/validate y /bulk) porque la lógica
// es compleja (parseo de archivos, validación de datos, etc.) y no se ajusta a un CRUD simple.
//
// Ambas rutas aceptan dos formatos para máxima flexibilidad:
// 1. `multipart/form-data` con un campo 'file': Para subir un archivo Excel (.xlsx).
//    Multer procesa el archivo y lo deja en `req.file` para que el controlador lo lea.
// 2. `application/json` con un body `{ "products": [...] }`: Para enviar los datos directamente.

// POST /api/products/bulk/validate - Valida un lote de productos sin guardarlos.
// Su propósito es dar feedback al usuario sobre la calidad de los datos antes de la importación final.
router.post(
  "/products/bulk/validate",
  upload.single("file"),
  handleMulterError,
  validateProductsBulk
);

// POST /api/products/bulk - Crea o actualiza productos en lote de las ordenes.
// Este es el endpoint que persiste los cambios en la base de datos.
router.post(
  "/products/bulk",
  upload.single("file"),
  handleMulterError,
  createProductsBulk
);

router.post(
  "/products",
  [verifyToken, isAdmin, upload.single("photo")],
  createProduct
);

router.post(
  "/products/bulk-update-from-excel",
  upload.single("file"),
  bulkUpdateFromExcel
);

export default router;
