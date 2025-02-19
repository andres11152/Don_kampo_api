import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import { getConnection } from '../database/connection.js';
import { queries } from '../database/queries.interface.js';
import crypto from 'crypto';

/*  Crea un nuevo pedido compleo */
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
      const userResult = yield client.query(`SELECT id, user_type FROM users WHERE id = $1`, [userId]);
      if (userResult.rows.length === 0) {
        client.release();
        return res.status(404).json({
          msg: 'Usuario no encontrado.'
        });
      }
      const userType = userResult.rows[0].user_type;
      const isRestaurant = userType === 'restaurante'; // Ajusta el valor según cómo esté almacenado

      // Si el usuario es un restaurante, se necesita factura electrónica
      const needsElectronicInvoice = isRestaurant || false;

      // Verificamos si los productos existen
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
      const orderResult = yield client.query(queries.orders.createOrder, [userId, new Date(), 1, total, needsElectronicInvoice, companyName || null, companyNit || null]);
      const orderId = orderResult.rows[0].id;

      // Luego guardas el user_data en una tabla separada
      yield client.query('INSERT INTO user_data (order_id, user_data) VALUES ($1, $2)', [orderId, userData]);

      // Creamos los items de la orden
      for (const item of cartDetails) {
        yield client.query(queries.orders.createOrderItem, [orderId, item.productId, item.quantity, item.price]);
      }

      // Si hay información de envío, la guardamos también
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

      // Obtener información de los pedidos
      const ordersResult = yield client.query(queries.orders.getOrders);
      const orders = ordersResult.rows;

      // Obtener productos de todos los pedidos
      const orderIds = orders.map(order => order.id);
      const itemsResult = yield client.query(queries.orders.getOrderItemsByOrderIds, [orderIds]);
      const orderItems = itemsResult.rows;

      // Obtener información de envío de todos los pedidos
      const shippingResult = yield client.query(queries.orders.getShippingInfoByOrderIds, [orderIds]);
      const shippingInfo = shippingResult.rows;

      // Obtener información de user_data para todos los pedidos
      const userDataResult = yield client.query(`
        SELECT order_id, user_data
        FROM user_data
        WHERE order_id = ANY($1);
      `, [orderIds]);
      const userDataMap = userDataResult.rows.reduce((acc, {
        order_id,
        user_data
      }) => {
        acc[order_id] = user_data;
        return acc;
      }, {});

      // Obtener variaciones de los productos (usando variation_id)
      const variationIds = orderItems.map(item => item.product_variation_id);
      const variationsResult = yield client.query(`
        SELECT variation_id, product_id, quality, quantity, price_home, price_supermarket, price_restaurant, price_fruver
        FROM product_variations
        WHERE variation_id = ANY($1);
      `, [variationIds]);

      // Mapeo de las variaciones por variation_id
      const variationsMap = variationsResult.rows.reduce((acc, {
        variation_id,
        ...variation
      }) => {
        acc[variation_id] = {
          ...variation,
          price_home: parseFloat(variation.price_home),
          // Convertir a número
          price_supermarket: parseFloat(variation.price_supermarket),
          price_restaurant: parseFloat(variation.price_restaurant),
          price_fruver: parseFloat(variation.price_fruver)
        };
        return acc;
      }, {});
      client.release();

      // Estructurar la respuesta consolidando la información
      const ordersWithDetails = orders.map(order => {
        const items = orderItems.filter(item => item.order_id === order.id).map(item => ({
          ...item,
          price: parseFloat(item.price),
          // Asegurar que el precio es un número
          variation: {
            ...variationsMap[item.product_variation_id]
          }
        }));

        // Calcular el total del pedido sin formatearlo
        const total = parseFloat(order.total); // Convertir a número

        return {
          order: {
            ...order,
            total // Enviar como número
          },
          userData: userDataMap[order.id] || null,
          items,
          shippingInfo: shippingInfo.find(info => info.order_id === order.id) || null
        };
      });
      res.status(200).json(ordersWithDetails);
    } catch (error) {
      console.error("Error al obtener los pedidos:", error);
      res.status(500).json({
        msg: "Error al obtener los pedidos."
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

      // Obtener información del pedido
      const orderResult = yield client.query(queries.orders.getOrdersById, [orderId]);
      if (orderResult.rows.length === 0) {
        client.release();
        return res.status(404).json({
          msg: 'Pedido no encontrado.'
        });
      }
      const order = orderResult.rows[0];

      // Obtener productos del pedido
      const itemsResult = yield client.query(queries.orders.getOrderItemsByOrderId, [orderId]);
      const orderItems = itemsResult.rows;

      // Obtener información de envío del pedido
      const shippingResult = yield client.query(queries.orders.getShippingInfoByOrderId, [orderId]);
      const shippingInfo = shippingResult.rows.length > 0 ? shippingResult.rows[0] : null;

      // Obtener información de user_data del pedido
      const userDataResult = yield client.query(`SELECT user_data FROM user_data WHERE order_id = $1;`, [orderId]);
      const userData = userDataResult.rows.length > 0 ? userDataResult.rows[0].user_data : null;

      // Obtener variaciones de los productos (usando product_variation_id)
      const variationIds = orderItems.map(item => item.product_variation_id);
      const variationsResult = yield client.query(`SELECT variation_id, product_id, quality, quantity, price_home, price_supermarket, price_restaurant, price_fruver
              FROM product_variations
              WHERE variation_id = ANY($1);`, [variationIds]);

      // Mapeo de las variaciones por variation_id
      const variationsMap = variationsResult.rows.reduce((acc, {
        variation_id,
        ...variation
      }) => {
        acc[variation_id] = {
          ...variation,
          // Ahora los precios son enteros, los manejamos directamente
          price_home: variation.price_home || 0,
          price_supermarket: variation.price_supermarket || 0,
          price_restaurant: variation.price_restaurant || 0,
          price_fruver: variation.price_fruver || 0
        };
        return acc;
      }, {});
      client.release();

      // Estructurar la respuesta consolidando la información
      const orderWithDetails = {
        order: {
          ...order,
          total: order.total // Total es un entero
        },
        userData,
        items: orderItems.map(item => ({
          ...item,
          price: item.price,
          // Precio del producto como entero
          variation: {
            ...variationsMap[item.product_variation_id]
          }
        })),
        shippingInfo
      };
      res.status(200).json(orderWithDetails);
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
      total,
      requires_electronic_billing,
      company_name,
      nit
    } = req.body;
    if (!customer_id || !order_date || !status_id || !total) {
      return res.status(400).json({
        msg: 'Campos obligatorios incompletos.'
      });
    }
    try {
      const client = yield getConnection();
      yield client.query(queries.orders.createOrder, [customer_id, order_date, status_id, total, requires_electronic_billing, company_name, nit]);
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
    try {
      const {
        orderId
      } = req.params; // Asegúrate de usar "orderId" aquí
      console.log('ID recibido:', orderId); // Log para depuración

      const client = yield getConnection();

      // Validar que el ID sea un número válido
      const numericId = parseInt(orderId, 10);
      if (isNaN(numericId)) {
        return res.status(400).json({
          msg: 'El ID proporcionado no es válido.'
        });
      }

      // Verificar si el pedido existe
      const checkOrder = yield client.query('SELECT * FROM orders WHERE id = $1', [numericId]);
      if (checkOrder.rows.length === 0) {
        client.release();
        return res.status(404).json({
          msg: 'Pedido no encontrado en la base de datos.'
        });
      }

      // Eliminar dependencias en user_data
      yield client.query('DELETE FROM user_data WHERE order_id = $1', [numericId]);

      // Eliminar el pedido
      const result = yield client.query('DELETE FROM orders WHERE id = $1', [numericId]);
      client.release();
      if (result.rowCount === 0) {
        return res.status(404).json({
          msg: 'Pedido no encontrado.'
        });
      }
      res.status(200).json({
        msg: 'Pedido eliminado exitosamente.'
      });
    } catch (error) {
      console.error('Error al eliminar el pedido:', error);
      res.status(500).json({
        msg: 'Error al eliminar el pedido.'
      });
    }
  });
  return function deleteOrders(_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}();

/**
 * Actualiza los precios de los productos en las órdenes en base a los precios actuales de los productos y variaciones.
 */
export const updateOrderPrices = /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator(function* (req, res) {
    const client = yield getConnection();
    try {
      yield client.query("BEGIN");

      // 1. Obtener todas las órdenes con estado pendiente (status_id = 1)
      const ordersResult = yield client.query(`
      SELECT id
      FROM orders
      WHERE status_id = 1;
    `);
      const orderIds = ordersResult.rows.map(order => order.id);
      if (orderIds.length === 0) {
        yield client.query("COMMIT");
        return res.status(200).json({
          msg: "No hay órdenes pendientes para actualizar."
        });
      }

      // 2. Obtener los ítems de las órdenes pendientes
      const itemsResult = yield client.query(queries.orders.getOrderItemsByOrderIds, [orderIds]);
      const orderItems = itemsResult.rows;
      if (orderItems.length === 0) {
        yield client.query("COMMIT");
        return res.status(200).json({
          msg: "No hay ítems en las órdenes pendientes para actualizar."
        });
      }

      // 3. Obtener las variaciones asociadas a los productos
      const productIds = orderItems.map(item => item.product_id); // Usar product_id
      const variationsResult = yield client.query(`
      SELECT product_id, price_home
      FROM product_variations
      WHERE product_id = ANY($1);
    `, [productIds]);

      // Crear un mapa de variaciones
      const variationsMap = variationsResult.rows.reduce((acc, {
        product_id,
        price_home
      }) => {
        acc[product_id] = parseFloat(price_home); // Convertir directamente a número
        return acc;
      }, {});

      // 4. Actualizar los precios de los ítems
      for (const item of orderItems) {
        const newPrice = variationsMap[item.product_id]; // Usar product_id en lugar de product_variation_id
        if (newPrice) {
          yield client.query(`
          UPDATE order_items
          SET price = $1
          WHERE order_id = $2 AND product_id = $3;
        `, [newPrice, item.order_id, item.product_id]);
        }
      }

      // 5. Recalcular y actualizar el total de cada orden
      for (const orderId of orderIds) {
        const updatedItemsResult = yield client.query(`
        SELECT quantity, price
        FROM order_items
        WHERE order_id = $1;
      `, [orderId]);
        const updatedItems = updatedItemsResult.rows;

        // Calcular el total asegurando precios válidos
        const newTotal = updatedItems.reduce((sum, item) => {
          const itemTotal = parseFloat(item.quantity) * parseFloat(item.price);
          return sum + (isNaN(itemTotal) ? 0 : itemTotal); // Validar números válidos
        }, 0);
        yield client.query(`
        UPDATE orders
        SET total = $1
        WHERE id = $2;
      `, [newTotal, orderId]);
      }
      yield client.query("COMMIT");
      res.status(200).json({
        msg: "Precios y totales de las órdenes actualizados exitosamente."
      });
    } catch (error) {
      yield client.query("ROLLBACK");
      console.error("Error al actualizar los precios de las órdenes:", error);
      res.status(500).json({
        msg: "Error interno del servidor."
      });
    } finally {
      client.release();
    }
  });
  return function updateOrderPrices(_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
}();