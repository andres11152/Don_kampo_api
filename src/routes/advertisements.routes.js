import express from "express";
import multer from "multer";
import {
  getAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
} from "../controllers/advertisements.controller.js";
import { handleMulterError } from "../middlewares/validateData.middleware.js";
import { optimizeImage } from "../middlewares/image.middleware.js";

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = express.Router();

router.use(express.json());

router.get("/api/publicidad", getAdvertisements);
router.post(
  "/api/publicidad",
  upload.single("photo_url"),
  handleMulterError,
  optimizeImage,
  createAdvertisement
);
router.put(
  "/api/publicidad/:id",
  upload.single("photo_url"),
  handleMulterError,
  optimizeImage,
  updateAdvertisement
);
router.delete("/api/publicidad/:id", deleteAdvertisement);

export default router;
