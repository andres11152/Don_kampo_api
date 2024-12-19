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

        const userResult = await client.query(
            `SELECT id, user_type FROM users WHERE id = $1`,
            [userId]
        );

        if (userResult.rows.length === 0) {
            client.release();
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }

        const userType = userResult.rows[0].user_type;
        const isRestaurant = userType === 'restaurante'; // Ajusta el valor según cómo esté almacenado

        // Si el usuario es un restaurante, se necesita factura electrónica
        const needsElectronicInvoice = isRestaurant || false;

        // Verificamos si los productos existen
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

        const orderResult = await client.query(queries.orders.createOrder, [
          userId,
          new Date(),
          1,
          total,
          needsElectronicInvoice, // Incluimos la lógica de la factura electrónica aquí
          companyName || null,
          companyNit || null,
      ]);
      
      const orderId = orderResult.rows[0].id;
      
      // Luego guardas el user_data en una tabla separada
      await client.query('INSERT INTO user_data (order_id, user_data) VALUES ($1, $2)', [
          orderId,
          userData,
      ]);
      
        // Creamos los items de la orden
        for (const item of cartDetails) {
            await client.query(queries.orders.createOrderItem, [
                orderId,
                item.productId,
                item.quantity,
                item.price,
            ]);
        }

        // Si hay información de envío, la guardamos también
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

  export const getOrders = async (req, res) => {
    try {
      const client = await getConnection();
  
  
    // Obtener información de los pedidos
    const ordersResult = await client.query(queries.orders.getOrders);
    const orders = ordersResult.rows;
    
    // Obtener productos de todos los pedidos
    const orderIds = orders.map(order => order.id);
    const itemsResult = await client.query(queries.orders.getOrderItemsByOrderIds, [orderIds]);
    const orderItems = itemsResult.rows;
    
    // Obtener información de envío de todos los pedidos
    const shippingResult = await client.query(queries.orders.getShippingInfoByOrderIds, [orderIds]);
    const shippingInfo = shippingResult.rows;

    // Obtener información de user_data para todos los pedidos
    const userDataResult = await client.query(`
      SELECT order_id, user_data
      FROM user_data
      WHERE order_id = ANY($1);
    `, [orderIds]);
    const userDataMap = userDataResult.rows.reduce((acc, { order_id, user_data }) => {
      acc[order_id] = user_data;
      return acc;
    }, {});

    // Obtener variaciones de los productos (usando variation_id)
    const variationIds = orderItems.map(item => item.product_variation_id);  // Asumiendo que tienes un campo product_variation_id
    
    const variationsResult = await client.query(`
      SELECT variation_id, product_id, quality, quantity, price_home, price_supermarket, price_restaurant, price_fruver
      FROM product_variations
      WHERE variation_id = ANY($1);
    `, [variationIds]);

    // Mapeo de las variaciones por variation_id
    const variationsMap = variationsResult.rows.reduce((acc, { variation_id, ...variation }) => {
      acc[variation_id] = variation;
      return acc;
    }, {});

    client.release();

    // Estructurar la respuesta consolidando la información
    const ordersWithDetails = orders.map(order => {
      return {
        order,
        userData: userDataMap[order.id] || null,
        items: orderItems
          .filter(item => item.order_id === order.id)
          .map(item => ({
            ...item,
            variation: variationsMap[item.product_variation_id] || null, // Obtener variaciones usando product_variation_id
          })),
        shippingInfo: shippingInfo.find(info => info.order_id === order.id) || null,
      };
    });

    res.status(200).json(ordersWithDetails);
  } catch (error) {
    console.error('Error al obtener los pedidos:', error);
    res.status(500).json({ msg: 'Error al obtener los pedidos.' });
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
      const userDataResult = await client.query(`
        SELECT user_data
        FROM user_data
        WHERE order_id = $1;
      `, [orderId]);
      const userData = userDataResult.rows.length > 0 ? userDataResult.rows[0].user_data : null;
  
      // Obtener variaciones de los productos (usando product_variation_id)
      const variationIds = orderItems.map(item => item.product_variation_id);
      const variationsResult = await client.query(`
        SELECT variation_id, product_id, quality, quantity, price_home, price_supermarket, price_restaurant, price_fruver
        FROM product_variations
        WHERE variation_id = ANY($1);
      `, [variationIds]);
  
      // Mapeo de las variaciones por variation_id
      const variationsMap = variationsResult.rows.reduce((acc, { variation_id, ...variation }) => {
        acc[variation_id] = variation;
        return acc;
      }, {});
  
      client.release();
  
      // Estructurar la respuesta consolidando la información
      const orderWithDetails = {
        order,
        userData,
        items: orderItems.map(item => ({
          ...item,
          variation: variationsMap[item.product_variation_id] || null, // Obtener variaciones usando product_variation_id
        })),
        shippingInfo,
      };
  
      res.status(200).json(orderWithDetails);
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
