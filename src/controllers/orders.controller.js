import { getConnection } from '../database/connection.js';
import { queries } from '../database/queries.interface.js';
import crypto from 'crypto';

/**
 * Realiza un pedido.
 */
export const placeOrder = async (req, res) => {
  let client;
  try {
    const {
      userId,
      cartDetails,
      shippingMethod,
      estimatedDelivery,
      actualDelivery,
      total,
      userData,
      companyName,
      companyNit,
    } = req.body;

    if (!userId || !cartDetails || !total) {
      return res.status(400).json({ msg: 'Información incompleta para procesar el pedido.' });
    }

    client = await getConnection();

    const userResult = await client.query(`SELECT id, user_type FROM users WHERE id = $1`, [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado.' });
    }

    const userType = userResult.rows[0].user_type;
    const needsElectronicInvoice = userType === 'restaurante';

    const productIds = cartDetails.map((item) => item.productId);
    const productCheckResult = await client.query(
      `SELECT product_id FROM products WHERE product_id = ANY($1)`,
      [productIds]
    );

    const existingProductIds = productCheckResult.rows.map((row) => row.product_id);
    const invalidProducts = productIds.filter((id) => !existingProductIds.includes(id));
    if (invalidProducts.length > 0) {
      return res.status(400).json({
        msg: 'Algunos productos no existen en el catálogo.',
        invalidProducts,
      });
    }

    const orderResult = await client.query(queries.orders.createOrder, [
      userId,
      new Date(),
      1,
      total,
      needsElectronicInvoice,
      companyName || null,
      companyNit || null,
    ]);

    const orderId = orderResult.rows[0].id;

    await client.query('INSERT INTO user_data (order_id, user_data) VALUES ($1, $2)', [
      orderId,
      userData,
    ]);

    for (const item of cartDetails) {
      await client.query(queries.orders.createOrderItem, [
        orderId,
        item.productId,
        item.quantity,
        item.price,
      ]);
    }

    if (shippingMethod && estimatedDelivery && actualDelivery) {
      const trackingNumber = crypto.randomBytes(5).toString('hex');
      const shippingStatusId = 1;
      await client.query(queries.shipping_info.createShippingInfo, [
        shippingMethod,
        trackingNumber,
        estimatedDelivery,
        actualDelivery,
        shippingStatusId,
        orderId,
      ]);
    }

    res.status(201).json({ msg: 'Pedido realizado exitosamente.', orderId });
  } catch (error) {
    console.error('Error al realizar el pedido:', error.message);
    res.status(500).json({ msg: 'Error interno del servidor.', error: error.message });
  } finally {
    if (client) client.release();
  }
};

/**
 * Obtiene todos los pedidos.
 */
export const getOrders = async (req, res) => {
  let client;
  try {
    client = await getConnection();

    const ordersResult = await client.query(queries.orders.getOrders);
    const orders = ordersResult.rows;

    const orderIds = orders.map((order) => order.id);
    const [itemsResult, shippingResult, userDataResult] = await Promise.all([
      client.query(queries.orders.getOrderItemsByOrderIds, [orderIds]),
      client.query(queries.orders.getShippingInfoByOrderIds, [orderIds]),
      client.query(`SELECT order_id, user_data FROM user_data WHERE order_id = ANY($1)`, [orderIds]),
    ]);

    const orderItems = itemsResult.rows;
    const shippingInfo = shippingResult.rows;
    const userDataMap = userDataResult.rows.reduce((acc, { order_id, user_data }) => {
      acc[order_id] = user_data;
      return acc;
    }, {});

    const ordersWithDetails = orders.map((order) => ({
      order,
      userData: userDataMap[order.id] || null,
      items: orderItems.filter((item) => item.order_id === order.id),
      shippingInfo: shippingInfo.find((info) => info.order_id === order.id) || null,
    }));

    res.status(200).json(ordersWithDetails);
  } catch (error) {
    console.error('Error al obtener los pedidos:', error.message);
    res.status(500).json({ msg: 'Error al obtener los pedidos.', error: error.message });
  } finally {
    if (client) client.release();
  }
};

/**
 * Obtiene un pedido por ID.
 */
export const getOrdersById = async (req, res) => {
  let client;
  try {
    const { orderId } = req.params;
    client = await getConnection();

    const orderResult = await client.query(queries.orders.getOrdersById, [orderId]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Pedido no encontrado.' });
    }

    const order = orderResult.rows[0];

    const [itemsResult, shippingResult, userDataResult] = await Promise.all([
      client.query(queries.orders.getOrderItemsByOrderId, [orderId]),
      client.query(queries.orders.getShippingInfoByOrderId, [orderId]),
      client.query(`SELECT user_data FROM user_data WHERE order_id = $1`, [orderId]),
    ]);

    const orderItems = itemsResult.rows;
    const shippingInfo = shippingResult.rows[0] || null;
    const userData = userDataResult.rows[0]?.user_data || null;

    const orderWithDetails = {
      order,
      userData,
      items: orderItems,
      shippingInfo,
    };

    res.status(200).json(orderWithDetails);
  } catch (error) {
    console.error('Error al obtener el pedido:', error.message);
    res.status(500).json({ msg: 'Error al obtener el pedido.', error: error.message });
  } finally {
    if (client) client.release();
  }
};

/**
 * Crea un nuevo pedido.
 */
export const createOrders = async (req, res) => {
  let client;
  try {
    const { customer_id, order_date, status_id, total } = req.body;

    if (!customer_id || !order_date || !status_id || !total) {
      return res.status(400).json({ msg: 'Campos obligatorios incompletos.' });
    }

    client = await getConnection();
    await client.query(queries.orders.createOrder, [customer_id, order_date, status_id, total]);

    res.status(201).json({ msg: 'Pedido creado exitosamente.' });
  } catch (error) {
    console.error('Error al crear el pedido:', error.message);
    res.status(500).json({ msg: 'Error interno del servidor.', error: error.message });
  } finally {
    if (client) client.release();
  }
};

/**
 * Actualiza un pedido existente.
 */
export const updateOrders = async (req, res) => {
  let client;
  try {
    const { id, customer_id, order_date, status_id, total } = req.body;

    if (!id || !customer_id || !order_date || !status_id || !total) {
      return res.status(400).json({ msg: 'Campos obligatorios incompletos.' });
    }

    client = await getConnection();
    await client.query(queries.orders.updateOrders, [customer_id, order_date, status_id, total, id]);

    res.status(200).json({ msg: 'Pedido actualizado exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar el pedido:', error.message);
    res.status(500).json({ msg: 'Error interno del servidor.', error: error.message });
  } finally {
    if (client) client.release();
  }
};

/**
 * Actualiza el estado de un pedido.
 */
export const updateOrderStatus = async (req, res) => {
  let client;
  try {
    const { id, status_id } = req.params;

    if (!id || !status_id) {
      return res.status(400).json({ msg: 'ID de pedido o estado no proporcionado.' });
    }

    client = await getConnection();
    await client.query(queries.orders.updateOrderStatus, [status_id, id]);

    res.status(200).json({ msg: 'Estado del pedido actualizado exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar el estado del pedido:', error.message);
    res.status(500).json({ msg: 'Error interno del servidor.', error: error.message });
  } finally {
    if (client) client.release();
  }
};

/**
 * Elimina un pedido.
 */
export const deleteOrders = async (req, res) => {
  let client;
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ msg: 'ID del pedido no proporcionado.' });
    }

    client = await getConnection();
    const orderCheck = await client.query('SELECT id FROM orders WHERE id = $1', [orderId]);

    if (orderCheck.rowCount === 0) {
      return res.status(404).json({ msg: 'Pedido no encontrado.' });
    }

    await client.query(queries.orders.deleteOrders, [orderId]);

    res.status(200).json({ msg: 'Pedido eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar el pedido:', error.message);
    res.status(500).json({ msg: 'Error interno del servidor.', error: error.message });
  } finally {
    if (client) client.release();
  }
};
