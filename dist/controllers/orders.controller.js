import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import { getConnection } from '../database/connection.js';
import { queries } from '../database/queries.interface.js';
import crypto from 'crypto';
export const placeOrder = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (req, res) {
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
    const trackingNumber = crypto.randomBytes(5).toString('hex');
    const shippingStatusId = 1;
    if (!userId || !cartDetails || !total) {
      return res.status(400).json({
        msg: 'Información incompleta para procesar el pedido.'
      });
    }
    try {
      const client = yield getConnection();
      const userResult = yield client.query(`SELECT id FROM users WHERE id = $1`, [userId]);
      if (userResult.rows.length === 0) {
        client.release();
        return res.status(404).json({
          msg: 'Usuario no encontrado.'
        });
      }
      const productIds = cartDetails.map(item => item.productId);
      const productCheckResult = yield client.query(`SELECT product_id FROM products WHERE product_id = ANY($1)`, [productIds]);
      const existingProductIds = productCheckResult.rows.map(row => row.product_id);
      const invalidProducts = productIds.filter(id => !existingProductIds.includes(id));
      if (invalidProducts.length > 0) {
        client.release();
        return res.status(400).json({
          msg: 'Algunos productos no existen en el catálogo.',
          invalidProducts
        });
      }
      const orderResult = yield client.query(queries.orders.createOrder, [userId, new Date(), 1, total, needsElectronicInvoice || false, companyName || null, companyNit || null]);
      const orderId = orderResult.rows[0].id;
      for (const item of cartDetails) {
        yield client.query(queries.orders.createOrderItem, [orderId, item.productId, item.quantity, item.price]);
      }
      if (shippingMethod && estimatedDelivery && actualDelivery) {
        yield client.query(queries.shipping_info.createShippingInfo, [shippingMethod, trackingNumber, estimatedDelivery, actualDelivery, shippingStatusId, orderId]);
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
  });
  return function placeOrder(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
export const getOrders = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* (req, res) {
    try {
      const client = yield getConnection();
      const result = yield client.query(queries.orders.getOrders);
      client.release();
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error al obtener los pedidos:', error);
      res.status(500).json({
        msg: 'Error al obtener los pedidos.'
      });
    }
  });
  return function getOrders(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();
export const getOrdersById = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(function* (req, res) {
    try {
      const {
        orderId
      } = req.params;
      const client = yield getConnection();
      const orderResult = yield client.query(queries.orders.getOrdersById, [orderId]);
      if (orderResult.rows.length === 0) {
        client.release();
        return res.status(404).json({
          msg: 'Pedido no encontrado.'
        });
      }
      const orderData = orderResult.rows[0];
      const itemsResult = yield client.query(queries.orders.getOrderItemsByOrderId, [orderId]);
      const orderItems = itemsResult.rows;
      const shippingResult = yield client.query(queries.orders.getShippingInfoByOrderId, [orderId]);
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
  });
  return function getOrdersById(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

/**
 * Crea un nuevo pedido.
 */
export const createOrders = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(function* (req, res) {
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
      const client = yield getConnection();
      yield client.query(queries.orders.createOrder, [customer_id, order_date, status_id, total]);
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
  });
  return function createOrders(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();

/**
 * Actualiza un pedido existente.
 */
export const updateOrders = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator(function* (req, res) {
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
      const client = yield getConnection();
      yield client.query(queries.orders.updateOrders, [customer_id, order_date, status_id, total, id]);
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
  });
  return function updateOrders(_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}();

/**
 * Actualiza el estado de un pedido.
 */
export const updateOrderStatus = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator(function* (req, res) {
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
      const client = yield getConnection();
      yield client.query(queries.orders.updateOrderStatus, [status_id, id]);
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
  });
  return function updateOrderStatus(_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}();

/**
 * Elimina un pedido.
 */
export const deleteOrders = /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator(function* (req, res) {
    const {
      orderId
    } = req.params;
    if (!orderId) {
      return res.status(400).json({
        msg: 'ID del pedido no proporcionado.'
      });
    }
    try {
      const client = yield getConnection();
      const orderCheck = yield client.query('SELECT id FROM orders WHERE id = $1', [orderId]);
      if (orderCheck.rowCount === 0) {
        client.release();
        return res.status(404).json({
          msg: 'Pedido no encontrado.'
        });
      }
      yield client.query(queries.orders.deleteOrders, [orderId]);
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
  });
  return function deleteOrders(_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}();