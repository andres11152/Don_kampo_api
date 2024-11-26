"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateOrders = exports.updateOrderStatus = exports.placeOrder = exports.getOrdersById = exports.getOrders = exports.deleteOrders = exports.createOrders = void 0;
var _connection = require("../database/connection.js");
var _queriesInterface = require("../database/queries.interface.js");
var _crypto = _interopRequireDefault(require("crypto"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const placeOrder = async (req, res) => {
  const {
    userId,
    cartDetails,
    shippingMethod,
    estimatedDelivery,
    actualDelivery,
    total,
    userData,
    needsElectronicInvoice,
    companyName,
    companyNit
  } = req.body;
  const trackingNumber = _crypto.default.randomBytes(5).toString('hex');
  const shippingStatusId = 1;
  if (!userId || !cartDetails || !total) {
    return res.status(400).json({
      msg: 'Información incompleta para procesar el pedido.'
    });
  }
  try {
    const client = await (0, _connection.getConnection)();
    const userResult = await client.query(`SELECT id FROM users WHERE id = $1`, [userId]);
    if (userResult.rows.length === 0) {
      client.release();
      return res.status(404).json({
        msg: 'Usuario no encontrado.'
      });
    }
    const productIds = cartDetails.map(item => item.productId);
    const productCheckResult = await client.query(`SELECT product_id FROM products WHERE product_id = ANY($1)`, [productIds]);
    const existingProductIds = productCheckResult.rows.map(row => row.product_id);
    const invalidProducts = productIds.filter(id => !existingProductIds.includes(id));
    if (invalidProducts.length > 0) {
      client.release();
      return res.status(400).json({
        msg: 'Algunos productos no existen en el catálogo.',
        invalidProducts
      });
    }
    const orderResult = await client.query(_queriesInterface.queries.orders.createOrder, [userId, new Date(), 1, total, needsElectronicInvoice || false, companyName || null, companyNit || null]);
    const orderId = orderResult.rows[0].id;
    for (const item of cartDetails) {
      await client.query(_queriesInterface.queries.orders.createOrderItem, [orderId, item.productId, item.quantity, item.price]);
    }
    if (shippingMethod && estimatedDelivery && actualDelivery) {
      await client.query(_queriesInterface.queries.shipping_info.createShippingInfo, [shippingMethod, trackingNumber, estimatedDelivery, actualDelivery, shippingStatusId, orderId]);
    }
    client.release();
    res.status(201).json({
      msg: 'Pedido realizado exitosamente.',
      orderId
    });
  } catch (error) {
    console.error('Error al realizar el pedido:', error);
    res.status(500).json({
      msg: 'Error interno del servidor.'
    });
  }
};
exports.placeOrder = placeOrder;
const getOrders = async (req, res) => {
  try {
    const client = await (0, _connection.getConnection)();
    const result = await client.query(_queriesInterface.queries.orders.getOrders);
    client.release();
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener los pedidos:', error);
    res.status(500).json({
      msg: 'Error al obtener los pedidos.'
    });
  }
};
exports.getOrders = getOrders;
const getOrdersById = async (req, res) => {
  try {
    const {
      orderId
    } = req.params;
    const client = await (0, _connection.getConnection)();
    const orderResult = await client.query(_queriesInterface.queries.orders.getOrdersById, [orderId]);
    if (orderResult.rows.length === 0) {
      client.release();
      return res.status(404).json({
        msg: 'Pedido no encontrado.'
      });
    }
    const orderData = orderResult.rows[0];
    const itemsResult = await client.query(_queriesInterface.queries.orders.getOrderItemsByOrderId, [orderId]);
    const orderItems = itemsResult.rows;
    const shippingResult = await client.query(_queriesInterface.queries.orders.getShippingInfoByOrderId, [orderId]);
    const shippingInfo = shippingResult.rows.length > 0 ? shippingResult.rows[0] : null;
    client.release();
    res.status(200).json({
      order: orderData,
      items: orderItems,
      shippingInfo
    });
  } catch (error) {
    console.error('Error al obtener el pedido:', error);
    res.status(500).json({
      msg: 'Error al obtener el pedido.'
    });
  }
};

/**
 * Crea un nuevo pedido.
 */
exports.getOrdersById = getOrdersById;
const createOrders = async (req, res) => {
  const {
    customer_id,
    order_date,
    status_id,
    total
  } = req.body;
  if (!customer_id || !order_date || !status_id || !total) {
    return res.status(400).json({
      msg: 'Campos obligatorios incompletos.'
    });
  }
  try {
    const client = await (0, _connection.getConnection)();
    await client.query(_queriesInterface.queries.orders.createOrder, [customer_id, order_date, status_id, total]);
    client.release();
    res.status(201).json({
      msg: 'Pedido creado exitosamente.'
    });
  } catch (error) {
    console.error('Error al crear el pedido:', error);
    res.status(500).json({
      msg: 'Error interno del servidor.'
    });
  }
};

/**
 * Actualiza un pedido existente.
 */
exports.createOrders = createOrders;
const updateOrders = async (req, res) => {
  const {
    id,
    customer_id,
    order_date,
    status_id,
    total
  } = req.body;
  if (!id || !customer_id || !order_date || !status_id || !total) {
    return res.status(400).json({
      msg: 'Campos obligatorios incompletos.'
    });
  }
  try {
    const client = await (0, _connection.getConnection)();
    await client.query(_queriesInterface.queries.orders.updateOrders, [customer_id, order_date, status_id, total, id]);
    client.release();
    res.status(200).json({
      msg: 'Pedido actualizado exitosamente.'
    });
  } catch (error) {
    console.error('Error al actualizar el pedido:', error);
    res.status(500).json({
      msg: 'Error interno del servidor.'
    });
  }
};

/**
 * Actualiza el estado de un pedido.
 */
exports.updateOrders = updateOrders;
const updateOrderStatus = async (req, res) => {
  const {
    id,
    status_id
  } = req.params;
  if (!id || !status_id) {
    return res.status(400).json({
      msg: 'ID de pedido o estado no proporcionado.'
    });
  }
  try {
    const client = await (0, _connection.getConnection)();
    await client.query(_queriesInterface.queries.orders.updateOrderStatus, [status_id, id]);
    client.release();
    res.status(200).json({
      msg: 'Estado del pedido actualizado exitosamente.'
    });
  } catch (error) {
    console.error('Error al actualizar el estado del pedido:', error);
    res.status(500).json({
      msg: 'Error interno del servidor.'
    });
  }
};

/**
 * Elimina un pedido.
 */
exports.updateOrderStatus = updateOrderStatus;
const deleteOrders = async (req, res) => {
  const {
    orderId
  } = req.params;
  if (!orderId) {
    return res.status(400).json({
      msg: 'ID del pedido no proporcionado.'
    });
  }
  try {
    const client = await (0, _connection.getConnection)();
    const orderCheck = await client.query('SELECT id FROM orders WHERE id = $1', [orderId]);
    if (orderCheck.rowCount === 0) {
      client.release();
      return res.status(404).json({
        msg: 'Pedido no encontrado.'
      });
    }
    await client.query(_queriesInterface.queries.orders.deleteOrders, [orderId]);
    client.release();
    res.status(200).json({
      msg: 'Pedido eliminado exitosamente.'
    });
  } catch (error) {
    console.error('Error al eliminar el pedido:', error);
    res.status(500).json({
      msg: 'Error interno del servidor.'
    });
  }
};
exports.deleteOrders = deleteOrders;