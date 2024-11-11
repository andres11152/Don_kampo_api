import { getConnection } from '../database/connection.js';
import { queries } from '../database/queries.interface.js';

/**
 * Coloca un nuevo pedido y sus detalles en la base de datos.
 */
export const placeOrder = async (req, res) => {
  const { userId, cartDetails, shippingMethod, estimatedDelivery, total, shippingCost, userData } = req.body;

  // Validación de datos de entrada
  if (!userId || !cartDetails || !total || !shippingCost) {
    return res.status(400).json({ msg: 'Información incompleta para procesar el pedido.' });
  }

  try {
    const client = await getConnection();

    console.log("Consulta createOrder:", queries.orders.createOrder);
    // Crear el pedido en la tabla `orders`
    const orderResult = await client.query(queries.orders.createOrder, [
      userId,
      new Date(),
      1, // status_id (por ejemplo, 1 = pendiente, 2 = enviado, etc.)
      total
    ]);

    const orderId = orderResult.rows[0].id;

    // Insertar cada producto en `order_items`
    for (const item of cartDetails) {
      await client.query(queries.orders.createOrderItem, [
        orderId,
        item.productId,
        item.quantity,
        item.price
      ]);
    }

        // Insertar información de envío si está disponible
    if (shippingMethod && estimatedDelivery) {
      console.log("Consulta createShippingInfo:", queries.shipping_info.createShippingInfo);
      await client.query(queries.shipping_info.createShippingInfo, [
        shippingMethod,
        null, // Número de seguimiento (puede generarse en otro paso)
        estimatedDelivery,
        null, // Fecha de entrega real (se actualiza cuando el pedido se entregue)
        1, // Estado de envío inicial (ej. 1 = "preparación")
        orderId
      ]);
    }


    client.release();
    return res.status(201).json({ msg: 'Pedido realizado exitosamente.', orderId });
  } catch (error) {
    console.error('Error al realizar el pedido:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.' });
  }
};

/**
 * Obtiene todos los pedidos de la base de datos.
 */
export const getOrders = async (req, res) => {
  try {
    const client = await getConnection();
    const result = await client.query(queries.orders.getOrders);
    client.release();
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener los pedidos:', error);
    return res.status(500).json({ msg: 'Error al obtener los pedidos' });
  }
};

/**
 * Obtiene un pedido por ID de la base de datos.
 */
export const getOrdersById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ msg: 'Por favor proporciona un ID válido.' });
  }

  try {
    const client = await getConnection();
    const result = await client.query(queries.orders.getOrdersById, [id]);
    client.release();

    if (result.rows.length > 0) {
      return res.status(200).json(result.rows[0]);
    } else {
      return res.status(404).json({ msg: 'Pedido no encontrado.' });
    }
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.' });
  }
};

/**
 * Crea un nuevo pedido en la base de datos.
 */
export const createOrders = async (req, res) => {
  const { customer_id, order_date, status_id, total } = req.body;

  if (!customer_id || !order_date || !status_id || !total) {
    return res.status(400).json({
      msg: 'No se permiten campos vacíos. Asegúrate de que todos los campos obligatorios estén completos.'
    });
  }

  try {
    const client = await getConnection();
    await client.query(queries.orders.createOrder, [customer_id, order_date, status_id, total]);
    client.release();
    return res.status(201).json({ msg: 'Pedido creado exitosamente.' });
  } catch (error) {
    console.error('Error al crear el pedido:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.' });
  }
};

/**
 * Actualiza un pedido en la base de datos.
 */
export const updateOrders = async (req, res) => {
  const { id, order_date, status_id, total } = req.body;

  if (!id || !order_date || !status_id || !total) {
    return res.status(400).json({
      msg: 'No se permiten campos vacíos. Asegúrate de que todos los campos obligatorios estén completos.'
    });
  }

  try {
    const client = await getConnection();
    await client.query(queries.orders.updateOrders, [id, order_date, status_id, total]);
    client.release();
    return res.status(200).json({ msg: 'Pedido actualizado exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar el pedido:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.' });
  }
};

/**
 * Elimina un pedido de la base de datos.
 */
export const deleteOrders = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ msg: 'Por favor proporciona un ID válido.' });
  }

  try {
    const client = await getConnection();
    await client.query(queries.orders.deleteOrders, [id]);
    client.release();
    return res.status(200).json({ msg: 'Pedido eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar el pedido:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.' });
  }
};
