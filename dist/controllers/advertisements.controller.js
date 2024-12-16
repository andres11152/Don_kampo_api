import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import { queries } from '../database/queries.interface.js';
import { getConnection } from '../database/connection.js';
import { uploadImage } from '../helpers/uploadImage.js';

// Obtener todas las publicidades
export const getAdvertisements = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (req, res) {
    try {
      const connection = yield getConnection();
      const result = yield connection.query(queries.advertisements.getAll);
      const advertisements = result.rows.map(row => ({
        advertisement_id: row.advertisement_id,
        title: row.title || '',
        description: row.description || '',
        category: row.category || '',
        photo_url: row.photo_url || 'https://www.donkampo.com/images/1.png' // Imagen por defecto si no existe
      }));
      res.json(advertisements);
    } catch (error) {
      console.error('Error en getAdvertisements:', error.message);
      res.status(500).json({
        message: 'Error al obtener las publicidades',
        error: error.message
      });
    }
  });
  return function getAdvertisements(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

// Crear una publicidad
export const createAdvertisement = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* (req, res) {
    let connection;
    try {
      const {
        title,
        description,
        category
      } = req.body;
      // Manejo de imágenes: validación explícita
      const defaultPhotoUrl = 'https://www.donkampo.com/images/1.png'; // Imagen predeterminada
      let photoUrl = defaultPhotoUrl;
      if (req.file && req.file.buffer) {
        try {
          photoUrl = yield uploadImage(req.file.buffer, req.file.originalname);
        } catch (error) {
          console.error('Error al subir la imagen:', error.message);
          return res.status(500).json({
            message: 'Error al subir la imagen a S3'
          });
        }
      }

      // Conexión a la base de datos
      connection = yield getConnection();
      const result = yield connection.query(queries.advertisements.createAdvertisement, [title, description, category, photoUrl]);
      const advertisementId = result.rows[0].advertisement_id;
      res.status(201).json({
        message: 'Publicidad creada exitosamente',
        advertisement_id: advertisementId
      });
    } catch (error) {
      console.error('Error al crear la publicidad:', error.message);
      res.status(500).json({
        message: 'Error al crear la publicidad',
        error: error.message
      });
    } finally {
      if (connection) connection.release();
    }
  });
  return function createAdvertisement(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

// Actualizar una publicidad
export const updateAdvertisement = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(function* (req, res) {
    let connection;
    const {
      id
    } = req.params;
    const {
      title,
      description,
      category,
      photo_url
    } = req.body;
    console.log(req.body); // Ver los datos recibidos para depuración

    const parsedAdvertisementId = parseInt(id, 10);
    if (isNaN(parsedAdvertisementId)) {
      return res.status(400).json({
        message: 'ID de la publicidad inválido'
      });
    }

    // Validación de campos obligatorios
    if (!title || !description || !category) {
      return res.status(400).json({
        message: 'Faltan campos obligatorios'
      });
    }
    try {
      connection = yield getConnection();

      // No se actualiza la imagen, solo se conserva la foto actual o se usa la proporcionada en photo_url
      let updatedPhotoUrl = photo_url || null;

      // Si no se envía una nueva imagen, no se hace nada con photo_url
      if (req.file && req.file.buffer) {
        try {
          updatedPhotoUrl = yield uploadImage(req.file.buffer, req.file.originalname); // Solo si se sube una nueva imagen
        } catch (error) {
          console.error('Error al subir la imagen:', error.message);
          return res.status(500).json({
            message: 'Error al subir la imagen a S3'
          });
        }
      }

      // Actualización en la base de datos
      const result = yield connection.query(queries.advertisements.updateAdvertisement, [title, description, category, updatedPhotoUrl,
      // Solo se actualiza la foto si se ha proporcionado una nueva
      parsedAdvertisementId]);
      if (result.rowCount === 0) {
        return res.status(404).json({
          message: 'Publicidad no encontrada'
        });
      }
      res.status(200).json({
        message: 'Publicidad actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error al actualizar la publicidad:', error.message);
      res.status(500).json({
        message: 'Error al actualizar la publicidad',
        error: error.message
      });
    } finally {
      if (connection) connection.release();
    }
  });
  return function updateAdvertisement(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

// Eliminar una publicidad
export const deleteAdvertisement = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(function* (req, res) {
    const {
      id
    } = req.params;
    let connection;
    if (!id) {
      return res.status(400).json({
        message: 'El ID de la publicidad es requerido'
      });
    }
    try {
      connection = yield getConnection();
      const result = yield connection.query(queries.advertisements.deleteAdvertisement, [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({
          message: 'Publicidad no encontrada o ya eliminada'
        });
      }
      res.status(200).json({
        message: 'Publicidad eliminada correctamente'
      });
    } catch (error) {
      console.error('Error al eliminar la publicidad:', error.message);
      res.status(500).json({
        message: 'Error al eliminar la publicidad',
        error: error.message
      });
    } finally {
      if (connection) connection.release();
    }
  });
  return function deleteAdvertisement(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();