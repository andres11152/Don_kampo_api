import { getConnection } from "../database/connection.js";
import { queries } from "../database/queries.interface.js";

// Crear nueva información de envío
export const createShippingInfo = async (req, res) => {
  const {
    shipping_method,
    tracking_number,
    estimated_delivery,
    actual_delivery,
    shipping_status_id,
    order_id, // Este campo parece necesario pero no estaba validado
  } = req.body;

  // Validación de campos obligatorios
  if (!shipping_method || !shipping_status_id || !order_id) {
    return res.status(400).json({
      msg: "Faltan campos obligatorios: shipping_method, shipping_status_id o order_id.",
    });
  }

  let client;
  try {
    client = await getConnection();

    await client.query(queries.shipping_info.createShippingInfo, [
      shipping_method,
      tracking_number || null,
      estimated_delivery || null,
      actual_delivery || null,
      shipping_status_id,
      order_id,
    ]);

    res.status(201).json({
      msg: "Información de envío creada con éxito",
    });
  } catch (error) {
    console.error("Error al crear la información de envío:", error.message);
    res.status(500).json({
      msg: "Error al crear la información de envío",
      error: error.message,
    });
  } finally {
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error("Error al liberar la conexión:", releaseError.message);
      }
    }
  }
};

// Obtener toda la información de envíos
export const getShippingInfo = async (req, res) => {
  let client;
  try {
    client = await getConnection();

    const result = await client.query(queries.shipping_info.getShippingInfo);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener la información de envíos:", error.message);
    res.status(500).json({
      msg: "Error al obtener la información de envíos",
      error: error.message,
    });
  } finally {
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error("Error al liberar la conexión:", releaseError.message);
      }
    }
  }
};

// Obtener información de envío por ID
export const getShippingInfoById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ msg: "ID de envío es obligatorio." });
  }

  let client;
  try {
    client = await getConnection();

    const result = await client.query(queries.shipping_info.getShippingInfoById, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: "Información de envío no encontrada" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener la información de envío:", error.message);
    res.status(500).json({
      msg: "Error al obtener la información de envío",
      error: error.message,
    });
  } finally {
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error("Error al liberar la conexión:", releaseError.message);
      }
    }
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

  if (!id) {
    return res.status(400).json({ msg: "ID de envío es obligatorio." });
  }

  if (!shipping_method || !shipping_status_id) {
    return res.status(400).json({
      msg: "Faltan campos obligatorios: shipping_method o shipping_status_id.",
    });
  }

  let client;
  try {
    client = await getConnection();

    const result = await client.query(queries.shipping_info.updateShippingInfo, [
      shipping_method,
      tracking_number || null,
      estimated_delivery || null,
      actual_delivery || null,
      shipping_status_id,
      id,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ msg: "Información de envío no encontrada" });
    }

    res.status(200).json({
      msg: "Información de envío actualizada con éxito",
    });
  } catch (error) {
    console.error("Error al actualizar la información de envío:", error.message);
    res.status(500).json({
      msg: "Error al actualizar la información de envío",
      error: error.message,
    });
  } finally {
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error("Error al liberar la conexión:", releaseError.message);
      }
    }
  }
};

// Eliminar información de envío
export const deleteShippingInfo = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ msg: "ID de envío es obligatorio." });
  }

  let client;
  try {
    client = await getConnection();

    const result = await client.query(queries.shipping_info.deleteShippingInfo, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ msg: "Información de envío no encontrada" });
    }

    res.status(200).json({
      msg: "Información de envío eliminada con éxito",
    });
  } catch (error) {
    console.error("Error al eliminar la información de envío:", error.message);
    res.status(500).json({
      msg: "Error al eliminar la información de envío",
      error: error.message,
    });
  } finally {
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error("Error al liberar la conexión:", releaseError.message);
      }
    }
  }
};
