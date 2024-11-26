"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateShippingInfo = exports.getShippingInfoById = exports.getShippingInfo = exports.deleteShippingInfo = exports.createShippingInfo = void 0;
var _connection = require("../database/connection.js");
var _queriesInterface = require("../database/queries.interface.js");
// Importar el pool y las queries

// Crear nueva información de envío
const createShippingInfo = async (req, res) => {
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
    const client = await (0, _connection.getConnection)();
    await client.query(_queriesInterface.queries.shipping_info.createShippingInfo, [shipping_method, tracking_number, estimated_delivery, actual_delivery, shipping_status_id, order_id]);
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
};

// Obtener toda la información de envíos
exports.createShippingInfo = createShippingInfo;
const getShippingInfo = async (req, res) => {
  try {
    const client = await (0, _connection.getConnection)();
    const result = await client.query(_queriesInterface.queries.shipping_info.getShippingInfo);
    client.release();
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener la información de envíos:", error);
    return res.status(500).json({
      msg: "Error al obtener la información de envíos"
    });
  }
};

// Obtener información de envío por ID
exports.getShippingInfo = getShippingInfo;
const getShippingInfoById = async (req, res) => {
  const {
    id
  } = req.params;
  try {
    const client = await (0, _connection.getConnection)();
    const result = await client.query(_queriesInterface.queries.shipping_info.getShippingInfoById, [id]);
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
};

// Actualizar información de envío
exports.getShippingInfoById = getShippingInfoById;
const updateShippingInfo = async (req, res) => {
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
    const client = await (0, _connection.getConnection)();
    const result = await client.query(_queriesInterface.queries.shipping_info.updateShippingInfo, [shipping_method, tracking_number, estimated_delivery, actual_delivery, shipping_status_id, id]);
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
};

// Eliminar información de envío
exports.updateShippingInfo = updateShippingInfo;
const deleteShippingInfo = async (req, res) => {
  const {
    id
  } = req.params;
  try {
    const client = await (0, _connection.getConnection)();
    const result = await client.query(_queriesInterface.queries.shipping_info.deleteShippingInfo, [id]);
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
};
exports.deleteShippingInfo = deleteShippingInfo;
//# sourceMappingURL=shipping.controller.js.map