import { getConnection } from '../database/connection.js';
import { queries } from '../database/queries.interface.js';
import crypto from 'crypto';

export const placeOrder = async (req, res) => {
  const { userId, cartDetails, shippingMethod, estimatedDelivery, actualDelivery, total, userData, companyName, companyNit } = req.body;
  const trackingNumber = crypto.randomBytes(5).toString('hex');
  const shippingStatusId = 1;

  if (!userId || !cartDetails || !total) {
    return res.status(400).json({ msg: 'Información incompleta para procesar el pedido.' });
  }

  try {
    const client = await getConnection();

    // Verificar existencia del usuario
    const userResult = await client.query(
      `SELECT id, user_type FROM users WHERE id = $1`,
      [userId]
    );

    // Si el usuario no se encuentra y es distinto a los usuarios por default
    if (!userResult.rows.length && userId !== '0f8fc459-571f-4e15-b653-4eb4558c6450') {
      client.release();
      return res.status(404).json({ msg: 'Usuario no encontrado.' });
    }
    const userType = userResult.rows.length ? userResult.rows[0].user_type : 'home';
    const user_type = userType === 'admin' ? 'fruver' : userType
    const isRestaurant = user_type === 'restaurante';
    const needsElectronicInvoice = isRestaurant || false;

    // Verificar que los productos existan
    const productIds = cartDetails.map((item) => item.productId);
    const productCheckResult = await client.query(
      `SELECT product_id FROM products WHERE product_id = ANY($1)`,
      [productIds]
    );
    const existingProductIds = productCheckResult.rows.map((row) => row.product_id);
    const invalidProducts = productIds.filter((id) => !existingProductIds.includes(id));
    if (invalidProducts.length > 0) {
      client.release();
      return res.status(400).json({
        msg: 'Algunos productos no existen en el catálogo.',
        invalidProducts,
      });
    }

    // Crear la orden
    const orderResult = await client.query(queries.orders.createOrder, [
      userId,
      new Date(),
      1,
      total,
      needsElectronicInvoice,
      companyName || null,
      companyNit || null,
      user_type
    ]);
    const orderId = orderResult.rows[0].id;

    // Guardar user_data en una tabla separada
    await client.query('INSERT INTO user_data (order_id, user_data) VALUES ($1, $2)', [
      orderId,
      userData,
    ]);

    // Agrupar los items del carrito por variationId y presentation
    const aggregatedCart = cartDetails.reduce((acc, item) => {
      const key = `${item.variationId}-${item.presentation}`;
      if (acc[key]) {
        acc[key].quantity += item.quantity;
      } else {
        // Clonar el item para no modificar el original
        acc[key] = { ...item };
      }
      return acc;
    }, {});

    const aggregatedItems = Object.values(aggregatedCart);

    // Insertar los items de la orden usando los items agrupados
    for (const item of aggregatedItems) {
      await client.query(queries.orders.createOrderItem, [
        orderId,
        item.productId,
        item.quantity,       // Cantidad total agrupada
        item.price,
        item.variationId,
        item.quality,
        item.presentation,
        item.presentation_id
      ]);
    }

    // Si hay información de envío, guardarla
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
}

export const getOrders = async (req, res) => {
  try {
    const client = await getConnection();

    // Obtener información de los pedidos
    const ordersResult = await client.query(queries.orders.getOrders);
    const orders = ordersResult.rows;

    // Obtener productos de todos los pedidos
    const orderIds = orders.map((order) => order.id);
    const itemsResult = await client.query(queries.orders.getOrderItemsByOrderIds, [orderIds]);

    const orderItems = itemsResult.rows;
    // Obtener información de envío de todos los pedidos
    const shippingResult = await client.query(queries.orders.getShippingInfoByOrderIds, [orderIds]);
    const shippingInfo = shippingResult.rows;

    // Obtener información de user_data para todos los pedidos
    const userDataResult = await client.query(
      `
      SELECT order_id, user_data
      FROM user_data
      WHERE order_id = ANY($1);
    `,
      [orderIds]
    );
    const userDataMap = userDataResult.rows.reduce((acc, { order_id, user_data }) => {
      acc[order_id] = user_data;
      return acc;
    }, {});

    // Obtener variaciones de los productos (usando variation_id)
    const variationIds = orderItems.map((item) => item.variation_id);
    const variationsResult = await client.query(
      `
      SELECT variation_id, product_id, quality, presentations
      FROM product_variations
      WHERE variation_id = ANY($1);
    `,
      [variationIds]
    );

    const variationsMap = variationsResult.rows.reduce((acc, row) => {
      const {
        variation_id,
        quality,
        presentations
      } = row;
    
      acc[variation_id] = {
        variation_id,
        quality,
        presentations: presentations.map(p => ({
          ...p,
          price_home: parseFloat(p.price_home),
          price_supermarket: parseFloat(p.price_supermarket),
          price_restaurant: parseFloat(p.price_restaurant),
          price_fruver: parseFloat(p.price_fruver),
        }))
      };
    
      return acc;
    }, {});

    client.release();

    const ordersWithDetails = orders.map((order) => {
      // Filtrar los items que pertenecen a esta orden:
      const itemsForOrder = orderItems.filter((item) => item.order_id === order.id);

      // Agrupar los items por (variation_id + presentation)
      const aggregatedItems = itemsForOrder.reduce((acc, item) => {
        const key = `${item.variation_id}-${item.presentation}`;
        if (acc[key]) {
          acc[key].quantity += item.quantity;  // Sumar la cantidad
        } else {
          // Copiar el item inicial
          acc[key] = { ...item };
        }
        return acc;
      }, {});

      // Convertir el objeto agrupado en un array:
      const aggregatedItemsArray = Object.values(aggregatedItems).map(item => {
        return {
          ...item,
        };
      });

      return {
        order: {
          ...order,
          total: parseFloat(order.total),
        },
        userData: userDataMap[order.id] || null,
        items: aggregatedItemsArray,  // Usamos los items agrupados
        shippingInfo: shippingInfo.find((info) => info.order_id === order.id) || null,
      };
    });

    res.status(200).json(ordersWithDetails);
  } catch (error) {
    console.error("Error al obtener los pedidos:", error);
    res.status(500).json({ msg: "Error al obtener los pedidos." });
  }
};

export const getOrdersById = async (req, res) => {
  try {
      const { orderId } = req.params;
      const client = await getConnection();
      // Obtener información del pedido
      const orderResult = await client.query(queries.orders.getOrdersById, [orderId]);
      if (orderResult.rows.length === 0) {
          client.release();
          return res.status(404).json({ msg: 'Pedido no encontrado.' });
      }
      const order = orderResult.rows[0];

      // Obtener productos del pedido
      const itemsResult = await client.query(queries.orders.getOrderItemsByOrderId, [orderId]);
      const orderItems = itemsResult.rows;

      // Obtener información de envío del pedido
      const shippingResult = await client.query(queries.orders.getShippingInfoByOrderId, [orderId]);
      const shippingInfo = shippingResult.rows.length > 0 ? shippingResult.rows[0] : null;

      // Obtener información de user_data del pedido
      const userDataResult = await client.query(
          `SELECT user_data FROM user_data WHERE order_id = $1;`,
          [orderId]
      );
      const userData = userDataResult.rows.length > 0 ? userDataResult.rows[0].user_data : null;

      // Obtener variaciones de los productos (usando product_variation_id)
      const variationIds = orderItems.map(item => item.variation_id);
      const variationsResult = await client.query(
          `SELECT variation_id, product_id, quality, presentations
          FROM product_variations
          WHERE variation_id = ANY($1);`,
          [variationIds]
      );

      const variationsMap = variationsResult.rows.reduce((acc, row) => {
        const { variation_id, product_id, quality, presentations } = row

        acc[variation_id] = {
          variation_id,
          product_id,
          quality,
          presentations: presentations.map(p => ({
            ...p,
            price_home: parseFloat(p.price_home),
            price_supermarket: parseFloat(p.price_supermarket),
            price_restaurant: parseFloat(p.price_restaurant),
            price_fruver: parseFloat(p.price_fruver),
          }))
        };
      
        return acc;
      }, {});

      client.release();

      // Estructurar la respuesta consolidando la información
      const orderWithDetails = {
          order: {
              ...order,
              total: order.total, // Total es un entero
          },
          userData,
          items: orderItems.map(item => {
            return {
              ...item,
            };
          }),
          shippingInfo,
      };

      res.status(200).json(orderWithDetails);
  } catch (error) {
      console.error('Error al obtener el pedido:', error);
      res.status(500).json({ msg: 'Error al obtener el pedido.' });
  }
};

export const createOrders = async (req, res) => {
  const { customer_id, order_date, status_id, total , requires_electronic_billing, company_name, nit } = req.body;

  if (!customer_id || !order_date || !status_id || !total ) {
    return res.status(400).json({ msg: 'Campos obligatorios incompletos.' });
  }

  try {
    const client = await getConnection();
    await client.query(queries.orders.createOrder, [customer_id, order_date, status_id, total , requires_electronic_billing, company_name, nit]);
    client.release();
    res.status(201).json({ msg: 'Pedido creado exitosamente.' });
  } catch (error) {
    console.error('Error al crear el pedido:', error);
    res.status(500).json({ msg: 'Error interno del servidor.' });
  }
};

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

export const deleteOrders = async (req, res) => {
  try {
    const { orderId } = req.params; // Asegúrate de usar "orderId" aquí

    const client = await getConnection();

    // Validar que el ID sea un número válido
    const numericId = parseInt(orderId, 10);
    if (isNaN(numericId)) {
      return res.status(400).json({ msg: 'El ID proporcionado no es válido.' });
    }

    // Verificar si el pedido existe
    const checkOrder = await client.query('SELECT * FROM orders WHERE id = $1', [numericId]);
    if (checkOrder.rows.length === 0) {
      client.release();
      return res.status(404).json({ msg: 'Pedido no encontrado en la base de datos.' });
    }

    // Eliminar dependencias en user_data
    await client.query('DELETE FROM user_data WHERE order_id = $1', [numericId]);

    // Eliminar el pedido
    const result = await client.query('DELETE FROM orders WHERE id = $1', [numericId]);

    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json({ msg: 'Pedido no encontrado.' });
    }

    res.status(200).json({ msg: 'Pedido eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar el pedido:', error);
    res.status(500).json({ msg: 'Error al eliminar el pedido.' });
  }
};
  
export const updateOrderPrices = async (req, res) => {
  const client = await getConnection();
  try {
    await client.query("BEGIN");

    // 1. Obtener todas las órdenes con estado pendiente (status_id = 1)
    const ordersResult = await client.query(`
      SELECT *
      FROM orders
      WHERE status_id = 1;
    `);

    const orderIds = ordersResult.rows.map(order => order.id);
    if (orderIds.length === 0) {
      await client.query("COMMIT");
      return res.status(200).json({ msg: "No hay órdenes pendientes para actualizar." });
    }

    // 2. Obtener los ítems de las órdenes pendientes
    const itemsResult = await client.query(queries.orders.getOrderItemsByOrderIds, [orderIds]);
    const orderItems = itemsResult.rows;

    if (orderItems.length === 0) {
      await client.query("COMMIT");
      return res.status(200).json({ msg: "No hay ítems en las órdenes pendientes para actualizar." });
    }

    // 3. Construir un mapa de variaciones: product_id → [variaciones]
    const variationsMap = {};
    // Extraer product_ids únicos
    const productIds = [...new Set(orderItems.map(item => item.product_id))];

    for (const pid of productIds) {
      // Usamos tu query para traer las variaciones actualizadas
      const variationsResult = await client.query(
        queries.products.getProductVariations,
        [pid]
      );
      // variationsResult.rows tiene [{ product_id, variation_id, quality, presentations, variation_active }, ...]
      const variations = variationsResult.rows.map(row => ({
        variation_id: row.variation_id,
        quality:      row.quality,
        active:       row.variation_active,
        presentations: (row.presentations || []).map(p => ({
          ...p,
          price_home:        Number(p.price_home),
          price_supermarket: Number(p.price_supermarket),
          price_restaurant:  Number(p.price_restaurant),
          price_fruver:      Number(p.price_fruver),
          stock:             Number(p.stock),
        }))
      }));
      variationsMap[pid] = variations;
    }

    for (const item of orderItems) {
      const userType = ordersResult.rows.find(({ id }) => id === item.order_id).user_type
      const variation = variationsMap[item.product_id].find(({ variation_id }) => variation_id === item.variation_id)
    
      if (variation) {
        const presentation = variation.presentations.find(({ presentation_id }) => presentation_id === item.presentation_id)
        
        if (presentation) {
          const newPrice = presentation[`price_${userType}`]; 
          if (newPrice) {
            await client.query(
              `
              UPDATE order_items
              SET price = $1
              WHERE order_id = $2
                AND product_id = $3
                AND variation_id = $4;
              `,
              [newPrice, item.order_id, item.product_id, item.variation_id]
            );
          }
        }
      }
    }

    await client.query("COMMIT");
    res.status(200).json({ msg: "Precios y totales de las órdenes actualizados exitosamente." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al actualizar los precios de las órdenes:", error);
    res.status(500).json({ msg: "Error interno del servidor." });
  } finally {
    client.release();
  }
};

export const updateBulkOrders = async (req, res) => {
  const { orderIds, newStatus } = req.body;
  
  if (!orderIds || !Array.isArray(orderIds)) {
    return res.status(400).json({ 
      success: false, 
      msg: 'Se requiere un array de orderIds' 
    });
  }

  if (!newStatus || ![1, 2, 3, 4, 5].includes(Number(newStatus))) {
    return res.status(400).json({ 
      success: false, 
      msg: 'Estado inválido. Valores permitidos: 1-5' 
    });
  }

  const client = await getConnection();
  try {
    await client.query("BEGIN");

    // Convertir a números (según tu estructura de IDs)
    const numericIds = orderIds.map(id => Number(id));

    // Verificar existencia de órdenes
    const checkResult = await client.query(
      `SELECT id FROM orders WHERE id = ANY($1)`,
      [numericIds]
    );

    if (checkResult.rowCount !== orderIds.length) {
      const existingIds = checkResult.rows.map(r => r.id);
      const missingIds = orderIds.filter(id => !existingIds.includes(Number(id)));
      
      return res.status(404).json({
        success: false,
        msg: 'Algunas órdenes no existen',
        missingIds
      });
    }

    // Actualización masiva
    const updateResult = await client.query(
      queries.orders.updateBulkOrderStatus, 
      [newStatus, numericIds]
    );

    await client.query("COMMIT");
    
    res.status(200).json({
      success: true,
      msg: `${updateResult.rowCount} órdenes actualizadas`,
      updatedCount: updateResult.rowCount
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error('Error en actualización masiva:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al actualizar órdenes' 
    });
  } finally {
    client.release();
  }
};