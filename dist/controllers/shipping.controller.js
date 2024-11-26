import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
// Importar el pool y las queries
import { getConnection } from "../database/connection.js";
import { queries } from "../database/queries.interface.js";

// Crear nueva información de envío
export const createShippingInfo = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (req, res) {
    const {
      shipping_method,
      tracking_number,
      estimated_delivery,
      actual_delivery,
      shipping_status_id
    } = req.body;

    // Validación de campos obligatorios
    if (!shipping_method || !shipping_status_id) {
      return res.status(400).json({
        msg: "Faltan campos obligatorios: shipping_method o shipping_status_id."
      });
    }
    try {
      const client = yield getConnection();
      yield client.query(queries.shipping_info.createShippingInfo, [shipping_method, tracking_number, estimated_delivery, actual_delivery, shipping_status_id, order_id]);
      client.release();
      return res.status(201).json({
        msg: "Información de envío creada con éxito"
      });
    } catch (error) {
      console.error("Error al crear la información de envío:", error); // Log del error
      return res.status(500).json({
        msg: "Error al crear la información de envío"
      });
    }
  });
  return function createShippingInfo(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

// Obtener toda la información de envíos
export const getShippingInfo = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* (req, res) {
    try {
      const client = yield getConnection();
      const result = yield client.query(queries.shipping_info.getShippingInfo);
      client.release();
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error al obtener la información de envíos:", error);
      return res.status(500).json({
        msg: "Error al obtener la información de envíos"
      });
    }
  });
  return function getShippingInfo(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

// Obtener información de envío por ID
export const getShippingInfoById = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(function* (req, res) {
    const {
      id
    } = req.params;
    try {
      const client = yield getConnection();
      const result = yield client.query(queries.shipping_info.getShippingInfoById, [id]);
      client.release();
      if (result.rows.length === 0) {
        return res.status(404).json({
          msg: "Información de envío no encontrada"
        });
      }
      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error("Error al obtener la información de envío:", error);
      return res.status(500).json({
        msg: "Error al obtener la información de envío"
      });
    }
  });
  return function getShippingInfoById(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

// Actualizar información de envío
export const updateShippingInfo = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(function* (req, res) {
    const {
      id
    } = req.params;
    const {
      shipping_method,
      tracking_number,
      estimated_delivery,
      actual_delivery,
      shipping_status_id
    } = req.body;

    // Validación de campos obligatorios
    if (!shipping_method || !shipping_status_id) {
      return res.status(400).json({
        msg: "Faltan campos obligatorios: shipping_method o shipping_status_id."
      });
    }
    try {
      const client = yield getConnection();
      const result = yield client.query(queries.shipping_info.updateShippingInfo, [shipping_method, tracking_number, estimated_delivery, actual_delivery, shipping_status_id, id]);
      client.release();
      if (result.rowCount === 0) {
        return res.status(404).json({
          msg: "Información de envío no encontrada"
        });
      }
      return res.status(200).json({
        msg: "Información de envío actualizada con éxito"
      });
    } catch (error) {
      console.error("Error al actualizar la información de envío:", error);
      return res.status(500).json({
        msg: "Error al actualizar la información de envío"
      });
    }
  });
  return function updateShippingInfo(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();

// Eliminar información de envío
export const deleteShippingInfo = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator(function* (req, res) {
    const {
      id
    } = req.params;
    try {
      const client = yield getConnection();
      const result = yield client.query(queries.shipping_info.deleteShippingInfo, [id]);
      client.release();
      if (result.rowCount === 0) {
        return res.status(404).json({
          msg: "Información de envío no encontrada"
        });
      }
      return res.status(200).json({
        msg: "Información de envío eliminada con éxito"
      });
    } catch (error) {
      console.error("Error al eliminar la información de envío:", error);
      return res.status(500).json({
        msg: "Error al eliminar la información de envío"
      });
    }
  });
  return function deleteShippingInfo(_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}();
//# sourceMappingURL=shipping.controller.js.map