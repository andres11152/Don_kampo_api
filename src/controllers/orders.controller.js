import { getConnection } from '../database/connection.js';
import { queries } from '../database/queries.interface.js';
import crypto from 'crypto';

/**
 * Coloca un nuevo pedido y sus detalles en la base de datos.
 */
export const placeOrder = async (req, res) => {
  const { userId, cartDetails, shippingMethod, estimatedDelivery, actual_delivery, total, shippingCost, userData } = req.body;
  const trackingNumber = crypto.randomBytes(5).toString('hex');
  const shippingStatusId = 1;

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
    if (shippingMethod && estimatedDelivery && actual_delivery) {
      console.log("Consulta createShippingInfo:", queries.shipping_info.createShippingInfo);
      await client.query(queries.shipping_info.createShippingInfo, [
        shippingMethod,
        trackingNumber, 
        estimatedDelivery,
        actual_delivery,
        shippingStatusId, // Estado de envío (por ejemplo, 1 = pendiente, 2 = enviado, etc.)
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
 *  Obtiene un pedido por ID de la base de datos.
 * **/
export const getOrdersById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const client = await getConnection();

    // Obtener la información básica del pedido
    const orderResult = await client.query(queries.orders.getOrdersById, [orderId]);
    if (orderResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    const orderData = orderResult.rows[0];

    // Obtener los elementos del pedido
    const itemsResult = await client.query(queries.orders.getOrderItemsByOrderId, [orderId]);
    const orderItems = itemsResult.rows;

    // Obtener la información de envío
    const shippingResult = await client.query(queries.orders.getShippingInfoByOrderId, [orderId]);
    const shippingInfo = shippingResult.rows.length > 0 ? shippingResult.rows[0] : null;

    client.release();

    // Estructura la respuesta con todos los datos del pedido
    const response = {
      order: {
        id: orderData.id,
        customer_id: orderData.customer_id,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        order_date: orderData.order_date,
        status_id: orderData.status_id,
        total: orderData.total,
      },
      items: orderItems.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        product_description: item.product_description,
        quantity: item.quantity,
        price: item.price,
      })),
      shippingInfo: shippingInfo ? {
        shipping_method: shippingInfo.shipping_method,
        tracking_number: shippingInfo.tracking_number,
        estimated_delivery: shippingInfo.estimated_delivery,
        actual_delivery: shippingInfo.actual_delivery,
        shipping_status_id: shippingInfo.shipping_status_id
      } : null
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error al obtener el pedido:', error);
    res.status(500).json({ message: 'Error al obtener el pedido' });
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
  const { id, customer_id, order_date, status_id, total } = req.body;

  // Validación de los datos de entrada
  if (!id || !customer_id || !order_date || !status_id || !total) {
    return res.status(400).json({
      msg: 'No se permiten campos vacíos. Asegúrate de que todos los campos obligatorios estén completos.'
    });
  }

  try {
    const client = await getConnection();
    // Asegúrate de enviar todos los parámetros en el orden correcto
    await client.query(queries.orders.updateOrders, [customer_id, order_date, status_id, total, id]);
    client.release();
    return res.status(200).json({ msg: 'Pedido actualizado exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar el pedido:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.' });
  }
};

/**
 * Actualiza el estado del pedido en la base de datos.
 **/

export const updateOrderStatus = async (req, res) => {
  const { id, status_id } = req.params;

  // Validación de los datos de entrada
  if (!id || !status_id) {
    return res.status(400).json({
      msg: 'Por favor proporciona un ID de pedido y un nuevo estado válido.'
    });
  }

  try {
    const client = await getConnection();
    // Ejecuta la consulta para actualizar solo el estado
    await client.query(queries.orders.updateOrderStatus, [status_id, id]);
    client.release();
    return res.status(200).json({ msg: 'Estado del pedido actualizado exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar el estado del pedido:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.' });
  }
};



/**
 * Elimina un pedido de la base de datos.
 */
export const deleteOrders = async (req, res) => {
  const { orderId } = req.params;

  console.log('ID recibido:', orderId); // Agrega este log para verificar el ID recibido

  if (!orderId) {
    return res.status(400).json({ msg: 'Por favor proporciona un ID válido.' });
  }

  try {
    const client = await getConnection();
    
    // Verificar si el pedido existe
    const orderCheck = await client.query('SELECT id FROM orders WHERE id = $1', [orderId]);
    if (orderCheck.rowCount === 0) {
      client.release();
      return res.status(404).json({ msg: 'Pedido no encontrado.' });
    }
    
    // Eliminar el pedido
    await client.query(queries.orders.deleteOrders, [orderId]);
    client.release();
    return res.status(200).json({ msg: 'Pedido eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar el pedido:', error.stack);
    return res.status(500).json({ msg: 'Error interno del servidor.' });
  }
};
