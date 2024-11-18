import { getConnection } from '../database/connection.js';
import { queries } from '../database/queries.interface.js';
import crypto from 'crypto';

/**
 * Coloca un nuevo pedido y sus detalles en la base de datos.
 */
export const placeOrder = async (req, res) => {
  const { userId, cartDetails, shippingMethod, estimatedDelivery, actualDelivery, total, shippingCost, userData, needsElectronicInvoice, companyName, companyNit } = req.body;
  const trackingNumber = crypto.randomBytes(5).toString('hex');
  const shippingStatusId = 1;

  if (!userId || !cartDetails || !total || !shippingCost) {
    return res.status(400).json({ msg: 'Información incompleta para procesar el pedido.' });
  }

  try {
    const client = await getConnection();

    // Verifica si los productos existen
    const productIds = cartDetails.map((item) => item.productId);
    const productCheckResult = await client.query(
      `SELECT product_id FROM products WHERE product_id = ANY($1)`,
      [productIds]
    );

    const existingProductIds = productCheckResult.rows.map((row) => row.product_id);

    // Encuentra productos inexistentes
    const invalidProducts = productIds.filter((id) => !existingProductIds.includes(id));

    if (invalidProducts.length > 0) {
      client.release();
      return res.status(400).json({
        msg: 'Algunos productos no existen en el catálogo.',
        invalidProducts,
      });
    }

    // Crear el pedido
    const orderResult = await client.query(queries.orders.createOrder, [
      userId,
      new Date(),
      1, // status_id (1 = pendiente)
      total,
      needsElectronicInvoice || false, // Por defecto, false
      companyName || null, // Por defecto, null
      companyNit || null, // Por defecto, null
    ]);
    const orderId = orderResult.rows[0].id;

    // Insertar productos en `order_items`
    for (const item of cartDetails) {
      await client.query(queries.orders.createOrderItem, [
        orderId,
        item.productId,
        item.quantity,
        item.price,
      ]);
    }

    // Insertar información de envío
    if (shippingMethod && estimatedDelivery && actualDelivery) {
      await client.query(queries.shipping_info.createShippingInfo, [
        shippingMethod,
        trackingNumber,
        estimatedDelivery,
        actualDelivery,
        shippingStatusId,
        orderId,
      ]);
    }

    client.release();
    res.status(201).json({ msg: 'Pedido realizado exitosamente.', orderId });
  } catch (error) {
    console.error('Error al realizar el pedido:', error);
    res.status(500).json({ msg: 'Error interno del servidor.' });
  }
};


/**
 * Obtiene todos los pedidos.
 */
export const getOrders = async (req, res) => {
  try {
    const client = await getConnection();
    const result = await client.query(queries.orders.getOrders);
    client.release();
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener los pedidos:', error);
    res.status(500).json({ msg: 'Error al obtener los pedidos.' });
  }
};

/**
 * Obtiene un pedido por su ID.
 */
export const getOrdersById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const client = await getConnection();

    // Información básica del pedido
    const orderResult = await client.query(queries.orders.getOrdersById, [orderId]);
    if (orderResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ msg: 'Pedido no encontrado.' });
    }
    const orderData = orderResult.rows[0];

    // Productos del pedido
    const itemsResult = await client.query(queries.orders.getOrderItemsByOrderId, [orderId]);
    const orderItems = itemsResult.rows;

    // Información de envío
    const shippingResult = await client.query(queries.orders.getShippingInfoByOrderId, [orderId]);
    const shippingInfo = shippingResult.rows.length > 0 ? shippingResult.rows[0] : null;

    client.release();

    // Respuesta estructurada
    res.status(200).json({
      order: orderData,
      items: orderItems,
      shippingInfo,
    });
  } catch (error) {
    console.error('Error al obtener el pedido:', error);
    res.status(500).json({ msg: 'Error al obtener el pedido.' });
  }
};

/**
 * Crea un nuevo pedido.
 */
export const createOrders = async (req, res) => {
  const { customer_id, order_date, status_id, total } = req.body;

  if (!customer_id || !order_date || !status_id || !total) {
    return res.status(400).json({ msg: 'Campos obligatorios incompletos.' });
  }

  try {
    const client = await getConnection();
    await client.query(queries.orders.createOrder, [customer_id, order_date, status_id, total]);
    client.release();
    res.status(201).json({ msg: 'Pedido creado exitosamente.' });
  } catch (error) {
    console.error('Error al crear el pedido:', error);
    res.status(500).json({ msg: 'Error interno del servidor.' });
  }
};

/**
 * Actualiza un pedido existente.
 */
export const updateOrders = async (req, res) => {
  const { id, customer_id, order_date, status_id, total } = req.body;

  if (!id || !customer_id || !order_date || !status_id || !total) {
    return res.status(400).json({ msg: 'Campos obligatorios incompletos.' });
  }

  try {
    const client = await getConnection();
    await client.query(queries.orders.updateOrders, [customer_id, order_date, status_id, total, id]);
    client.release();
    res.status(200).json({ msg: 'Pedido actualizado exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar el pedido:', error);
    res.status(500).json({ msg: 'Error interno del servidor.' });
  }
};

/**
 * Actualiza el estado de un pedido.
 */
export const updateOrderStatus = async (req, res) => {
  const { id, status_id } = req.params;

  if (!id || !status_id) {
    return res.status(400).json({ msg: 'ID de pedido o estado no proporcionado.' });
  }

  try {
    const client = await getConnection();
    await client.query(queries.orders.updateOrderStatus, [status_id, id]);
    client.release();
    res.status(200).json({ msg: 'Estado del pedido actualizado exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar el estado del pedido:', error);
    res.status(500).json({ msg: 'Error interno del servidor.' });
  }
};

/**
 * Elimina un pedido.
 */
export const deleteOrders = async (req, res) => {
  const { orderId } = req.params;

  if (!orderId) {
    return res.status(400).json({ msg: 'ID del pedido no proporcionado.' });
  }

  try {
    const client = await getConnection();
    const orderCheck = await client.query('SELECT id FROM orders WHERE id = $1', [orderId]);
    if (orderCheck.rowCount === 0) {
      client.release();
      return res.status(404).json({ msg: 'Pedido no encontrado.' });
    }

    await client.query(queries.orders.deleteOrders, [orderId]);
    client.release();
    res.status(200).json({ msg: 'Pedido eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar el pedido:', error);
    res.status(500).json({ msg: 'Error interno del servidor.' });
  }
};
