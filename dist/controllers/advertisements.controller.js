import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import { queries } from '../database/queries.interface.js';
import { getConnection } from '../database/connection.js';
export const getAdvertisements = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (req, res) {
    try {
      const connection = yield getConnection();
      const result = yield connection.query(queries.advertisements.getAll);
      res.json(result.rows);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Error al obtener las categorías.');
    }
  });
  return function getAdvertisements(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
export const createAdvertisement = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* (req, res) {
    const {
      category,
      title,
      description
    } = req.body;
    const photos = req.files;
    if (!category || !photos || photos.length === 0) {
      return res.status(400).json({
        message: 'La categoría y las fotos son obligatorias.'
      });
    }
    try {
      const connection = yield getConnection();
      const result = yield connection.query(queries.advertisements.create, [category, photos, title || '', description || '']);
      res.json(result.rows[0]);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Error al crear la categoría.');
    }
  });
  return function createAdvertisement(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();
export const updateAdvertisement = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(function* (req, res) {
    const {
      id
    } = req.params;
    const {
      title,
      description
    } = req.body;
    try {
      const connection = yield getConnection();
      const result = yield connection.query(queries.advertisements.updateTitleAndDescription, [title || '', description || '', id]);
      if (result.rowCount === 0) return res.status(404).json({
        message: 'Categoría no encontrada.'
      });
      res.json(result.rows[0]);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Error al actualizar la categoría.');
    }
  });
  return function updateAdvertisement(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();
export const updatePhotos = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(function* (req, res) {
    const {
      id
    } = req.params;
    const {
      photos
    } = req.body;
    if (!photos || !Array.isArray(photos)) {
      return res.status(400).json({
        message: 'Debe proporcionar un arreglo de fotos.'
      });
    }
    try {
      const connection = yield getConnection();
      const result = yield connection.query(queries.advertisements.updatePhotos, [photos, id]);
      if (result.rowCount === 0) return res.status(404).json({
        message: 'Categoría no encontrada.'
      });
      res.json(result.rows[0]);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Error al actualizar las fotos.');
    }
  });
  return function updatePhotos(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();