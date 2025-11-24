import { getConnection } from '../database/connection.js';
import { queries } from '../database/queries.interface.js';
import crypto from 'crypto';

export const placeOrder = async (req, res) => {
  const { userId, cartDetails, shippingMethod, estimatedDelivery, actualDelivery, total, userData, companyName, companyNit } = req.body;

  // --- INICIO DE VALIDACIÓN EN BACKEND (PROMPT 4) ---
  if (!userId || !Array.isArray(cartDetails) || cartDetails.length === 0 || !total || !userData) {
    return res.status(400).json({ msg: 'Información incompleta para procesar el pedido. Faltan datos esenciales.' });
  }

  // Validar userData
  const requiredUserDataFields = ['user_name', 'email', 'phone', 'city', 'address', 'neighborhood'];
  for (const field of requiredUserDataFields) {
    if (!userData[field] || String(userData[field]).trim() === '') {
      return res.status(400).json({ msg: `El campo '${field}' en los datos de usuario es obligatorio.` });
    }
  }

  // Validar cada item del carrito
  for (const item of cartDetails) {
    if (!item.productId || !item.variationId || item.quantity <= 0 || item.price < 0) {
      return res.status(400).json({ msg: `El producto '${item.product_name || 'desconocido'}' tiene datos inválidos en el carrito.` });
    }
  }
  // --- FIN DE VALIDACIÓN EN BACKEND ---

  const trackingNumber = crypto.randomBytes(5).toString('hex');
  const shippingStatusId = 1;
  let client;
  try {
    client = await getConnection();

    // Verificar existencia del usuario
    const userResult = await client.query(
      `SELECT id, user_type FROM users WHERE id = $1`,
      [userId]
    );

    // Si el usuario no se encuentra y es distinto a los usuarios por default
    if (!userResult.rows.length && userId !== '0f8fc459-571f-4e15-b653-4eb4558c6450') {
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
    
    res.status(201).json({ msg: 'Pedido realizado exitosamente.', orderId });
  } catch (error) {
    console.error('Error al realizar el pedido:', error);
    res.status(500).json({ msg: 'Error interno del servidor.' });
  } finally {
    if (client) client.release();
  }
}

export const getOrders = async (req, res) => {
  let client;
  try {
    client = await getConnection();

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
        presentations: presentations?.map(p => ({
          ...p,
          price_home: Math.round(Number(p.price_home) || 0),
          price_supermarket: Math.round(Number(p.price_supermarket) || 0),
          price_restaurant: Math.round(Number(p.price_restaurant) || 0),
          price_fruver: Math.round(Number(p.price_fruver) || 0),
        }))
      };

      return acc;
    }, {});

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
          total: Math.round(Number(order.total) || 0),
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
  } finally {
    if (client) client.release();
  }
};

export const getOrdersById = async (req, res) => {
  let client;
  try {
    const { orderId } = req.params;
    const authenticatedUserId = req.user.id; // ID del usuario autenticado desde el token
    const userRole = req.user.role; // Rol del usuario desde el token

    client = await getConnection();

      // Obtener información del pedido
      const orderResult = await client.query(queries.orders.getOrdersById, [orderId]);
      if (orderResult.rows.length === 0) {
          return res.status(404).json({ msg: 'Pedido no encontrado.' });
      }
      const order = orderResult.rows[0];

      // --- VERIFICACIÓN DE PROPIEDAD (IDOR PREVENTION) ---
      // Si el usuario no es admin, verificar que la orden le pertenezca.
      if (userRole !== 'admin' && order.customer_id !== authenticatedUserId) {
        return res.status(403).json({ msg: 'Acceso prohibido. No tienes permiso para ver esta orden.' });
      }

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
  } finally {
    if (client) client.release();
  }
};

export const createOrders = async (req, res) => {
  const { customer_id, order_date, status_id, total , requires_electronic_billing, company_name, nit } = req.body;

  if (!customer_id || !order_date || !status_id || !total ) {
    return res.status(400).json({ msg: 'Campos obligatorios incompletos.' });
  }

  let client;
  try {
    client = await getConnection();
    await client.query(queries.orders.createOrder, [customer_id, order_date, status_id, total , requires_electronic_billing, company_name, nit]);
    res.status(201).json({ msg: 'Pedido creado exitosamente.' });
  } catch (error) {
    console.error('Error al crear el pedido:', error);
    res.status(500).json({ msg: 'Error interno del servidor.' });
  } finally {
    if (client) client.release();
  }
};

export const updateOrders = async (req, res) => {
  const { id, customer_id, order_date, status_id, total } = req.body;

  if (!id || !customer_id || !order_date || !status_id || !total) {
    return res.status(400).json({ msg: 'Campos obligatorios incompletos.' });
  }

  let client;
  try {
    client = await getConnection();
    await client.query(queries.orders.updateOrders, [customer_id, order_date, status_id, total, id]);
    res.status(200).json({ msg: 'Pedido actualizado exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar el pedido:', error);
    res.status(500).json({ msg: 'Error interno del servidor.' });
  } finally {
    if (client) client.release();
  }
};

export const updateOrderStatus = async (req, res) => {
  const { id, status_id } = req.params;

  if (!id || !status_id) {
    return res.status(400).json({ msg: 'ID de pedido o estado no proporcionado.' });
  }

  let client;
  try {
    client = await getConnection();
    await client.query(queries.orders.updateOrderStatus, [status_id, id]);
    res.status(200).json({ msg: 'Estado del pedido actualizado exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar el estado del pedido:', error);
    res.status(500).json({ msg: 'Error interno del servidor.' });
  } finally {
    if (client) client.release();
  }
};

export const deleteOrders = async (req, res) => {
  let client;
  try {
    const { orderId } = req.params; // Asegúrate de usar "orderId" aquí

    client = await getConnection();

    // Validar que el ID sea un número válido
    const numericId = parseInt(orderId, 10);
    if (isNaN(numericId)) {
      return res.status(400).json({ msg: 'El ID proporcionado no es válido.' });
    }

    // Verificar si el pedido existe
    const checkOrder = await client.query('SELECT * FROM orders WHERE id = $1', [numericId]);
    if (checkOrder.rows.length === 0) {
      return res.status(404).json({ msg: 'Pedido no encontrado en la base de datos.' });
    }

    // Eliminar dependencias en order_items (ESTE ES EL AJUSTE CLAVE)
    await client.query('DELETE FROM order_items WHERE order_id = $1', [numericId]);

    // Eliminar dependencias en user_data
    await client.query('DELETE FROM user_data WHERE order_id = $1', [numericId]);

    // Eliminar dependencias en shipping_info (ESTA LÍNEA ESTABA FALTANDO)
    await client.query('DELETE FROM shipping_info WHERE order_id = $1', [numericId]);

    // Eliminar el pedido
    const result = await client.query('DELETE FROM orders WHERE id = $1', [numericId]);

    res.status(200).json({ msg: 'Pedido eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar el pedido:', error);
    res.status(500).json({ msg: 'Error al eliminar el pedido.' });
  } finally {
    if (client) client.release();
  }
};
  
export const updateOrderPrices = async (req, res) => {
  let client;
  try {
    client = await getConnection();
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
          price_home:        Math.round(Number(p.price_home) || 0),
          price_supermarket: Math.round(Number(p.price_supermarket) || 0),
          price_restaurant:  Math.round(Number(p.price_restaurant) || 0),
          price_fruver:      Math.round(Number(p.price_fruver) || 0),
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
    if(client) await client.query("ROLLBACK");
    console.error("Error al actualizar los precios de las órdenes:", error);
    res.status(500).json({ msg: "Error interno del servidor." });
  } finally {
    if (client) client.release();
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

  let client;
  try {
    client = await getConnection();
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
    if(client) await client.query("ROLLBACK");
    console.error('Error en actualización masiva:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al actualizar órdenes' 
    });
  } finally {
    if (client) client.release();
  }
};

export const updateOrderById = async (req, res) => {
  const { orderId } = req.params;
  // Body esperado (opcionales): status_id, requires_electronic_billing, company_name, nit, user_type,
  // shipping (obj), userData (obj), items (array), itemsToRemove (array), shipping_cost, shipping_percentage
  let {
    status_id,
    requires_electronic_billing,
    company_name,
    nit,
    user_type,
    shipping,        // { shippingMethod, trackingNumber, estimatedDelivery, actualDelivery, shippingStatusId, shipping_cost }
    userData,
    items,
    itemsToRemove,
    shipping_cost,
    shipping_percentage
  } = req.body;

  if (!orderId) {
    return res.status(400).json({ msg: 'orderId es requerido en params.' });
  }

  let client;
  try {
    client = await getConnection();
    await client.query('BEGIN');

    // Bloquear la orden para evitar race conditions
    // --- INICIO DE VALIDACIÓN DE PROPIEDAD (PROMPT 3) ---
    const orderLock = await client.query(
      `SELECT id, customer_id FROM orders WHERE id = $1 FOR UPDATE`,
      [orderId]
    );

    if (orderLock.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ msg: 'Orden no encontrada.' });
    }

    const orderToUpdate = orderLock.rows[0];
    const authenticatedUserId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'admin' && orderToUpdate.customer_id !== authenticatedUserId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ msg: 'Acceso prohibido. No tienes permiso para modificar esta orden.' });
    }
    // --- FIN DE VALIDACIÓN DE PROPIEDAD ---

    // 1) Actualizar metadatos de la orden si se enviaron
    const fieldsToUpdate = [];
    const values = [];
    let idx = 1;

    if (status_id !== undefined) {
      fieldsToUpdate.push(`status_id = $${idx++}`); values.push(status_id);
    }
    if (requires_electronic_billing !== undefined) {
      fieldsToUpdate.push(`requires_electronic_billing = $${idx++}`); values.push(requires_electronic_billing);
    }
    if (company_name !== undefined) {
      fieldsToUpdate.push(`company_name = $${idx++}`); values.push(company_name);
    }
    if (nit !== undefined) {
      fieldsToUpdate.push(`nit = $${idx++}`); values.push(nit);
    }
    if (user_type !== undefined) {
      fieldsToUpdate.push(`user_type = $${idx++}`); values.push(user_type);
    }

    if (fieldsToUpdate.length > 0) {
      values.push(orderId);
      const updateQuery = `UPDATE orders SET ${fieldsToUpdate.join(', ')} WHERE id = $${idx}`;
      await client.query(updateQuery, values);
    }

    // 2) Upsert (update o insert) de items si vienen
    if (Array.isArray(items) && items.length > 0) {
      // Validación y normalización previa
      const normalizedItems = items.map((it, i) => {
        // permitir productId o product_id, variationId o variation_id, presentationId o presentation_id
        const productId = it.productId ?? it.product_id ?? null;
        const variationId = it.variationId ?? it.variation_id ?? null;
        const presentationId = it.presentationId ?? it.presentation_id ?? null;
        const price = Math.round(Number(it.price ?? 0) || 0);
        const quantity = Math.round(Number(it.quantity ?? 0) || 0);
        const quality = it.quality ?? null;
        const presentation = it.presentation ?? null;

        return { productId, variationId, presentationId, price, quantity, quality, presentation, originalIndex: i };
      });

      // Validación mínima por item antes de hacer queries
      for (const it of normalizedItems) {
        if (!it.productId || !it.variationId || (it.price === undefined || it.quantity === undefined)) {
          await client.query('ROLLBACK');
          return res.status(400).json({ msg: 'Cada item requiere productId, variationId, price y quantity (valores válidos).' });
        }
        if (it.price < 0 || it.quantity < 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({ msg: 'price y quantity deben ser >= 0.' });
        }
      }

      // Ejecutar upsert por cada item
      for (const it of normalizedItems) {
        const existing = await client.query(
          `SELECT id FROM order_items
           WHERE order_id = $1
             AND product_id = $2
             AND variation_id = $3
             AND (presentation_id = $4 OR (presentation_id IS NULL AND $4 IS NULL))
           LIMIT 1`,
          [orderId, it.productId, it.variationId, it.presentationId || null]
        );

        if (existing.rowCount > 0) {
          await client.query(
            `UPDATE order_items
             SET price = $1,
                 quantity = $2,
                 quality = $3,
                 presentation = $4
             WHERE id = $5`,
            [it.price, it.quantity, it.quality, it.presentation, existing.rows[0].id]
          );
        } else {
          await client.query(
            `INSERT INTO order_items
              (order_id, product_id, variation_id, presentation_id, presentation, price, quantity, quality)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [orderId, it.productId, it.variationId, it.presentationId || null, it.presentation || null, it.price, it.quantity, it.quality || null]
          );
        }
      }
    }

    // 3) Eliminar items si vienen itemsToRemove
    if (Array.isArray(itemsToRemove) && itemsToRemove.length > 0) {
      for (const r of itemsToRemove) {
        const productId = r.productId ?? r.product_id ?? null;
        const variationId = r.variationId ?? r.variation_id ?? null;
        const presentationId = r.presentationId ?? r.presentation_id ?? null;
        if (!productId || !variationId) continue;
        await client.query(
          `DELETE FROM order_items
           WHERE order_id = $1
             AND product_id = $2
             AND variation_id = $3
             AND (presentation_id = $4 OR (presentation_id IS NULL AND $4 IS NULL))`,
          [orderId, productId, variationId, presentationId || null]
        );
      }
    }

    // 4) Actualizar user_data (upsert simple)
    if (userData !== undefined) {
      // Si hay fila para la orden, actualizar; si no, insertar.
      const ud = await client.query(`SELECT order_id FROM user_data WHERE order_id = $1`, [orderId]);
      if (ud.rowCount > 0) {
        await client.query(`UPDATE user_data SET user_data = $1 WHERE order_id = $2`, [userData, orderId]);
      } else {
        await client.query(`INSERT INTO user_data (order_id, user_data) VALUES ($1,$2)`, [orderId, userData]);
      }
    }

    // 5) Actualizar o insertar shipping info si se envió shipping
    if (shipping) {
      const {
        shippingMethod,
        trackingNumber,
        estimatedDelivery,
        actualDelivery,
        shippingStatusId,
        shipping_cost: shippingCostFromShipping
      } = shipping;

      const sh = await client.query(`SELECT id FROM shipping_info WHERE order_id = $1`, [orderId]);
      if (sh.rowCount > 0) {
        await client.query(
          `UPDATE shipping_info
           SET shipping_method = $1,
               tracking_number = $2,
               estimated_delivery = $3,
               actual_delivery = $4,
               shipping_status_id = $5
           WHERE order_id = $6`,
          [shippingMethod || null, trackingNumber || null, estimatedDelivery || null, actualDelivery || null, shippingStatusId || null, orderId]
        );
      } else {
        await client.query(
          `INSERT INTO shipping_info
           (shipping_method, tracking_number, estimated_delivery, actual_delivery, shipping_status_id, order_id)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [shippingMethod || null, trackingNumber || null, estimatedDelivery || null, actualDelivery || null, shippingStatusId || null, orderId]
        );
      }

      // Si shipping incluye shipping_cost y no se pasó shipping_cost en root, usamos el de shipping
      if ((shippingCostFromShipping !== undefined) && (shipping_cost === undefined || shipping_cost === null)) {
        shipping_cost = Number(shippingCostFromShipping);
      }
    }

    // 6) Validar shipping_percentage si viene
    if (shipping_percentage !== undefined && shipping_percentage !== null) {
      shipping_percentage = Math.round(Number(shipping_percentage) || 0);
      if (shipping_percentage < 0 || shipping_percentage > 100) {
        await client.query('ROLLBACK');
        return res.status(400).json({ msg: 'shipping_percentage debe estar entre 0 y 100.' });
      }
    }

    // 7) Recalcular total de la orden (sum(price * quantity) de order_items) + shipping_cost (si hay)
    const totalCalcRes = await client.query(
      `SELECT COALESCE(SUM(price * quantity), 0) as subtotal
       FROM order_items
       WHERE order_id = $1`,
      [orderId]
    );
    const subtotal = Number(totalCalcRes.rows[0].subtotal) || 0;

    // Si no se pasó shipping_cost pero sí shipping_percentage, calcularlo
    let shippingCostNumber = 0;
    if (shipping_cost !== undefined && shipping_cost !== null) {
      shippingCostNumber = Math.round(Number(shipping_cost) || 0);
    } else if (shipping_percentage !== undefined && shipping_percentage !== null) {
      shippingCostNumber = Math.round((subtotal * Number(shipping_percentage)) / 100);
    } else {
      shippingCostNumber = 0;
    }

    const newTotal = Math.round(subtotal + shippingCostNumber);

    // -----------------------------
    // 8) ACTUALIZACIÓN SEGURA EN orders
    //    — solo actualizamos columnas que realmente existan en la tabla orders
    // -----------------------------

    // Consultar columnas existentes en orders (para evitar el error 42703)
    const colRes = await client.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_name = 'orders'
         AND column_name IN ('total', 'shipping_cost', 'shipping_percentage')`
    );
    const existingCols = new Set(colRes.rows.map(r => r.column_name));

    // Construimos dinámicamente SET ... y valores
    const ordersSetParts = [];
    const ordersValues = [];
    let placeholderIdx = 1;

    if (existingCols.has('total')) {
      ordersSetParts.push(`total = $${placeholderIdx++}`);
      ordersValues.push(newTotal);
    }
    if (existingCols.has('shipping_cost')) {
      ordersSetParts.push(`shipping_cost = $${placeholderIdx++}`);
      ordersValues.push(shippingCostNumber);
    }
    if (existingCols.has('shipping_percentage')) {
      // si shipping_percentage no vino, guardamos null para no sobrescribir con undefined
      ordersSetParts.push(`shipping_percentage = $${placeholderIdx++}`);
      ordersValues.push((shipping_percentage !== undefined && shipping_percentage !== null) ? shipping_percentage : null);
    }

    if (ordersSetParts.length > 0) {
      // append orderId as last param
      ordersValues.push(orderId);
      const ordersUpdateQuery = `UPDATE orders SET ${ordersSetParts.join(', ')} WHERE id = $${ordersValues.length}`;
      await client.query(ordersUpdateQuery, ordersValues);
    } else {
      // No hay columnas a actualizar en orders (raro, pero posible)
      // No hacemos nada
    }

    await client.query('COMMIT');

    // Obtener la orden actualizada
    const orderFinal = await client.query(`SELECT * FROM orders WHERE id = $1`, [orderId]);
    const itemsFinal = await client.query(`SELECT * FROM order_items WHERE order_id = $1`, [orderId]);
    const userDataFinal = await client.query(`SELECT user_data FROM user_data WHERE order_id = $1`, [orderId]);
    const shippingFinal = await client.query(`SELECT * FROM shipping_info WHERE order_id = $1`, [orderId]);

    return res.status(200).json({
      msg: 'Orden actualizada correctamente.',
      order: orderFinal.rows[0],
      items: itemsFinal.rows,
      userData: userDataFinal.rows.length ? userDataFinal.rows[0].user_data : null,
      shippingInfo: shippingFinal.rows.length ? shippingFinal.rows[0] : null
    });
  } catch (error) {
    if(client) {
      try { await client.query('ROLLBACK'); } catch (e) { /* ignore rollback error */ }
    }
    console.error('Error actualizando la orden:', error);
    // Si quieres enviar más detalle en env de dev, incluye error.message; en prod, mantener mensaje genérico
    return res.status(500).json({ msg: 'Error interno al actualizar la orden.' });
  } finally {
    if (client) client.release();
  }
};
