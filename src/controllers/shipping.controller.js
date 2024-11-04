// Importar el pool y las queries
import { getConnection } from "../database/connection";
import { queries } from "../database/queries.interface";

// Crear nueva información de envío
export const createShippingInfo = async (req, res) => {
  const {
    shipping_method,
    tracking_number,
    estimated_delivery,
    actual_delivery,
    shipping_status_id,
  } = req.body;

  // Validar que todos los campos necesarios estén presentes
  if (!shipping_method || !shipping_status_id) {
    return res.status(400).json({
      msg: "Faltan campos obligatorios: shipping_method o shipping_status_id.",
    });
  }

  try {
    await pool.query(queries.shipping_info.createShippingInfo, [
      shipping_method,
      tracking_number,
      estimated_delivery,
      actual_delivery,
      shipping_status_id,
    ]);

    return res.status(201).json({
      msg: "Información de envío creada con éxito",
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Error al crear la información de envío",
      error: error.message,
    });
  }
};

// Obtener toda la información de envíos
export const getShippingInfo = async (req, res) => {
  try {
    const result = await pool.query(queries.shipping_info.getShippingInfo);
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({
      msg: "Error al obtener la información de envíos",
      error: error.message,
    });
  }
};

// Obtener información de envío por ID
export const getShippingInfoById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(queries.shipping_info.getShippingInfoById, [
      id,
    ]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ msg: "Información de envío no encontrada" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({
      msg: "Error al obtener la información de envío",
      error: error.message,
    });
  }
};

// Actualizar información de envío
export const updateShippingInfo = async (req, res) => {
  const { id } = req.params;
  const {
    shipping_method,
    tracking_number,
    estimated_delivery,
    actual_delivery,
    shipping_status_id,
  } = req.body;

  // Validar que todos los campos necesarios estén presentes
  if (!shipping_method || !shipping_status_id) {
    return res.status(400).json({
      msg: "Faltan campos obligatorios: shipping_method o shipping_status_id.",
    });
  }

  try {
    const result = await pool.query(queries.shipping_info.updateShippingInfo, [
      shipping_method,
      tracking_number,
      estimated_delivery,
      actual_delivery,
      shipping_status_id,
      id,
    ]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ msg: "Información de envío no encontrada" });
    }

    return res.status(200).json({
      msg: "Información de envío actualizada con éxito",
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Error al actualizar la información de envío",
      error: error.message,
    });
  }
};

// Eliminar información de envío
export const deleteShippingInfo = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(queries.shipping_info.deleteShippingInfo, [
      id,
    ]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ msg: "Información de envío no encontrada" });
    }

    return res
      .status(200)
      .json({ msg: "Información de envío eliminada con éxito" });
  } catch (error) {
    return res.status(500).json({
      msg: "Error al eliminar la información de envío",
      error: error.message,
    });
  }
};
