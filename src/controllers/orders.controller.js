  import { getConnection } from '../database/connection.js';
  import { queries } from '../database/queries.interface.js';
  import crypto from 'crypto';
  
  export const placeOrder = async (req, res) => {
    const { userId, cartDetails, shippingMethod, estimatedDelivery, actualDelivery, total, userData, needsElectronicInvoice, companyName, companyNit } = req.body;
    const trackingNumber = crypto.randomBytes(5).toString('hex');
    const shippingStatusId = 1;

    if (!userId || !cartDetails || !total) {
        return res.status(400).json({ msg: 'Información incompleta para procesar el pedido.' });
    }

    try {
        const client = await getConnection();

        // Verificar si el usuario existe
        const userResult = await client.query(
            `SELECT id FROM users WHERE id = $1`,
            [userId]
        );

        if (userResult.rows.length === 0) {
            client.release();
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }

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
            needsElectronicInvoice || false,
            companyName || null,
            companyNit || null,
        ]);
        const orderId = orderResult.rows[0].id;

        for (const item of cartDetails) {
            await client.query(queries.orders.createOrderItem, [
                orderId,
                item.productId,
                item.quantity,
                item.price,
            ]);
        }

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

    // Obtener IDs de los pedidos
    const orderIds = orders.map((order) => order.id);

    // Obtener productos de todos los pedidos
    const itemsResult = await client.query(queries.orders.getOrderItemsByOrderIds, [orderIds]);
    const orderItems = itemsResult.rows;

    // Obtener información de envío de todos los pedidos
    const shippingResult = await client.query(queries.orders.getShippingInfoByOrderIds, [orderIds]);
    const shippingInfo = shippingResult.rows;

    // Obtener IDs únicos de los productos
    const productIds = [...new Set(orderItems.map((item) => item.product_id))];

    // Obtener variaciones de productos
    const productVariationsResult = await client.query(
      `SELECT 
        v.variation_id, 
        v.product_id, 
        v.quality, 
        v.quantity, 
        v.price_home, 
        v.price_supermarket, 
        v.price_restaurant, 
        v.price_fruver
       FROM product_variations v
       WHERE v.product_id = ANY($1)`,
      [productIds]
    );
    const productVariations = productVariationsResult.rows;

    client.release();

    // Estructurar la respuesta consolidando la información
    const ordersWithDetails = orders.map((order) => {
      return {
        order,
        items: orderItems
          .filter((item) => item.order_id === order.id)
          .map((item) => {
            const variation = productVariations.find(
              (v) => v.variation_id === item.product_variation_id
            );

            return {
              ...item,
              variation: variation
                ? {
                    variationId: variation.variation_id,
                    variationQuality: variation.quality,
                    variationQuantity: variation.quantity,
                    priceHome: variation.price_home,
                    priceSupermarket: variation.price_supermarket,
                    priceRestaurant: variation.price_restaurant,
                    priceFruver: variation.price_fruver,
                  }
                : null,

              product_variation_id: undefined,
            };
          }),
        shippingInfo: shippingInfo.find((info) => info.order_id === order.id) || null,
      };
    });

    res.status(200).json(ordersWithDetails);
  } catch (error) {
    console.error('Error al obtener los pedidos:', error);
    res.status(500).json({ msg: 'Error al obtener los pedidos.' });
  }
};


export const getOrdersById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const client = await getConnection();

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
