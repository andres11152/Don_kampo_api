import { getConnection } from '../database/connection.js';
import { queries } from '../database/queries.interface.js';

/**
 * Obtiene todos los pedidos de la base de datos.
 */
export const getOrders = async (req, res) => {
  try {
    const client = await getConnection();
    const result = await client.query(queries.orders.getOrders);
    client.release(); // Cambiado de client.end() a client.release()
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener los pedidos:', error);
    return res.status(500).json({ msg: 'Error al obtener los pedidos' });
  }
};  

/**
 * Obtiene un pedido por ID de la base de datos.
 */
export const getOrdersById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ msg: 'Por favor proporciona un ID válido.' });
  }

  try {
    const client = await getConnection();
    const result = await client.query(queries.orders.getOrdersById, [id]);
    client.release(); // Cambiado de client.end() a client.release()

    if (result.rows.length > 0) {
      return res.status(200).json(result.rows[0]);
    } else {
      return res.status(404).json({ msg: 'Pedido no encontrado.' });
    }
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.' });
  }
};

/**
 * Crea un nuevo pedido en la base de datos.
 */
export const createOrders = async (req, res) => {
  const { customer_id, order_date, status_id, total } = req.body;

  // Validación de campos
  if (!customer_id || !order_date || !status_id || !total) {
    return res.status(400).json({
      msg: 'No se permiten campos vacíos. Asegúrate de que todos los campos obligatorios estén completos.'
    });
  }

  try {
    const client = await getConnection();

    // Hashear la contraseña y crear el pedido
    const hashedPassword = await bcrypt.hash(user_password, 10);
    await client.query(queries.orders.createOrders, [customer_id, order_date, status_id, total]);

    client.release();
    return res.status(201).json({ msg: 'Pedido creado exitosamente.' });
  } catch (error) {
    console.error('Error al crear el pedido:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.' });  
  }
};

export const updateOrders = async (req, res) => {
  const { id, order_date, status_id, total } = req.body;

  // Validación de campos
  if (!id || !order_date || !status_id || !total) {
    return res.status(400).json({
      msg: 'No se permiten campos vacíos. Asegúrate de que todos los campos obligatorios estén completos.'
    });
  }

  try {
    const client = await getConnection();

    // Hashear la contraseña y crear el pedido
    const hashedPassword = await bcrypt.hash(user_password, 10);
    await client.query(queries.orders.updateOrders, [id, order_date, status_id, total]);

    client.release();
    return res.status(201).json({ msg: 'Pedido actualizado exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar el pedido:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.' });  
  }
};

export const deleteOrders = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ msg: 'Por favor proporciona un ID válido.' });
  }

  try {
    const client = await getConnection();

    // Hashear la contraseña y crear el pedido
    const hashedPassword = await bcrypt.hash(user_password, 10);
    await client.query(queries.orders.deleteOrders, [id]);

    client.release();
    return res.status(201).json({ msg: 'Pedido eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar el pedido:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.' });  
  }
};  

export const getOrdersPending = async (req, res) => {
  try {
    const client = await getConnection();
    const result = await client.query(queries.orders.getOrdersPending);
    client.release(); // Cambiado de client.end() a client.release()
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener los pedidos pendientes:', error);
    return res.status(500).json({ msg: 'Error al obtener los pedidos pendientes' });
  }
};

export const getOrdersPendingById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ msg: 'Por favor proporciona un ID válido.' });
  }

  try {
    const client = await getConnection();
    const result = await client.query(queries.orders.getOrdersPendingById, [id]);
    client.release(); // Cambiado de client.end() a client.release()

    if (result.rows.length > 0) {
      return res.status(200).json(result.rows[0]);
    } else {
      return res.status(404).json({ msg: 'Pedido no encontrado.' });
    }
  } catch (error) {
    console.error('Error al obtener pedido pendiente:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.' });
  }
};

export const createOrdersPending = async (req, res) => {
  const { customer_id, order_date, status_id, total } = req.body;

  // Validación de campos
  if (!customer_id || !order_date || !status_id || !total) {
    return res.status(400).json({
      msg: 'No se permiten campos vacíos. Asegúrate de que todos los campos obligatorios estén completos.'
    });
  }

  try {
    const client = await getConnection();

    // Hashear la contraseña y crear el pedido
    const hashedPassword = await bcrypt.hash(user_password, 10);
    await client.query(queries.orders.createOrdersPending, [customer_id, order_date, status_id, total]);

    client.release();
    return res.status(201).json({ msg: 'Pedido creado exitosamente.' });
  } catch (error) {
    console.error('Error al crear el pedido pendiente:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.' });  
  }
};

export const updateOrdersPending = async (req, res) => {
  const { id, order_date, status_id, total } = req.body;

  // Validación de campos
  if (!id || !order_date || !status_id || !total) {
    return res.status(400).json({
      msg: 'No se permiten campos vacíos. Asegúrate de que todos los campos obligatorios estén completos.'
    });
  }

  try {
    const client = await getConnection();

    // Hashear la contraseña y crear el pedido
    const hashedPassword = await bcrypt.hash(user_password, 10);
    await client.query(queries.orders.updateOrdersPending, [id, order_date, status_id, total]);

    client.release();
    return res.status(201).json({ msg: 'Pedido actualizado exitosamente.' });
  }   catch (error) {
    console.error('Error al actualizar el pedido pendiente:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.' });  
  }
};

export const deleteOrdersPending = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ msg: 'Por favor proporciona un ID válido.' });
  }

  try {
    const client = await getConnection();

    // Hashear la contraseña y crear el pedido
    const hashedPassword = await bcrypt.hash(user_password, 10);
    await client.query(queries.orders.deleteOrdersPending, [id]);

    client.release();
    return res.status(201).json({ msg: 'Pedido eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar el pedido pendiente:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.' });  
  }
};    

export const getOrdersDelivered = async (req, res) => {
  try {
    const client = await getConnection();
    const result = await client.query(queries.orders.getOrdersDelivered);
    client.release(); // Cambiado de client.end() a client.release()
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener los pedidos entregados:', error);
    return res.status(500).json({ msg: 'Error al obtener los pedidos entregados' });
  }
};

export const getOrdersDeliveredById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ msg: 'Por favor proporciona un ID válido.' });
  }

  try {
    const client = await getConnection();
    const result = await client.query(queries.orders.getOrdersDeliveredById, [id]);
    client.release(); // Cambiado de client.end() a client.release()

    if (result.rows.length > 0) {
      return res.status(200).json(result.rows[0]);
    } else {
      return res.status(404).json({ msg: 'Pedido no encontrado.' });
    }
  } catch (error) {
    console.error('Error al obtener pedido entregado:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.' });
  }
};

export const createOrdersDelivered = async (req, res) => {
  const { customer_id, order_date, status_id, total } = req.body;

  // Validación de campos
  if (!customer_id || !order_date || !status_id || !total) {
    return res.status(400).json({
      msg: 'No se permiten campos vacíos. Asegúrate de que todos los campos obligatorios estén completos.'
    });
  }

  try {
    const client = await getConnection();

    // Hashear la contraseña y crear el pedido
    const hashedPassword = await bcrypt.hash(user_password, 10);
    await client.query(queries.orders.createOrdersDelivered, [customer_id, order_date, status_id, total]);

    client.release();
    return res.status(201).json({ msg: 'Pedido creado exitosamente.' });
  } catch (error) {
    console.error('Error al crear el pedido entregado:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.' });  
  }
};

export const updateOrdersDelivered = async (req, res) => {
  const { id, order_date, status_id, total } = req.body;

  // Validación de campos
  if (!id || !order_date || !status_id || !total) {
    return res.status(400).json({
      msg: 'No se permiten campos vacíos. Asegúrate de que todos los campos obligatorios estén completos.'
    });
  }

  try {
    const client = await getConnection();

    // Hashear la contraseña y crear el pedido
    const hashedPassword = await bcrypt.hash(user_password, 10);
    await client.query(queries.orders.updateOrdersDelivered, [id, order_date, status_id, total]);

    client.release();
    return res.status(201).json({ msg: 'Pedido actualizado exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar el pedido entregado:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.' });  
  }
};

export const deleteOrdersDelivered = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ msg: 'Por favor proporciona un ID válido.' });
  }

  try {
    const client = await getConnection();

    // Hashear la contraseña y crear el pedido
    const hashedPassword = await bcrypt.hash(user_password, 10);
    await client.query(queries.orders.deleteOrdersDelivered, [id]);

    client.release();
    return res.status(201).json({ msg: 'Pedido eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar el pedido entregado:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.' });  
  }     
};    

export const getOrdersShipped = async (req, res) => {
  try {
    const client = await getConnection();
    const result = await client.query(queries.orders.getOrdersShipped);
    client.release(); // Cambiado de client.end() a client.release()
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener los pedidos enviados:', error);
    return res.status(500).json({ msg: 'Error al obtener los pedidos enviados' });
  }
};

export const getOrdersShippedById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ msg: 'Por favor proporciona un ID válido.' });
  }

  try {
    const client = await getConnection();
    const result = await client.query(queries.orders.getOrdersShippedById, [id]);
    client.release(); // Cambiado de client.end() a client.release()

    if (result.rows.length > 0) {
      return res.status(200).json(result.rows[0]);
    } else {
      return res.status(404).json({ msg: 'Pedido no encontrado.' });
    }
  } catch (error) {
    console.error('Error al obtener pedido enviado:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.' });
  }
};

export const createOrdersShipped = async (req, res) => {
  const { customer_id, order_date, status_id, total } = req.body;

  // Validación de campos
  if (!customer_id || !order_date || !status_id || !total) {
    return res.status(400).json({
      msg: 'No se permiten campos vacíos. Asegúrate de que todos los campos obligatorios estén completos.'
    });
  }

  try {
    const client = await getConnection();

    // Hashear la contraseña y crear el pedido
    const hashedPassword = await bcrypt.hash(user_password, 10);
    await client.query(queries.orders.createOrdersShipped, [customer_id, order_date, status_id, total]);

    client.release();
    return res.status(201).json({ msg: 'Pedido creado exitosamente.' });
  } catch (error) {
    console.error('Error al crear el pedido enviado:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.' });  
  }
};

export const updateOrdersShipped = async (req, res) => {
  const { id, order_date, status_id, total } = req.body;

  // Validación de campos
  if (!id || !order_date || !status_id || !total) {
    return res.status(400).json({
      msg: 'No se permiten campos vacíos. Asegúrate de que todos los campos obligatorios estén completos.'
    });
  }

  try {
    const client = await getConnection();

    // Hashear la contraseña y crear el pedido
    const hashedPassword = await bcrypt.hash(user_password, 10);
    await client.query(queries.orders.updateOrdersShipped, [id, order_date, status_id, total]);

    client.release();
    return res.status(201).json({ msg: 'Pedido actualizado exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar el pedido enviado:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.' });  
  }
};

export const deleteOrdersShipped = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ msg: 'Por favor proporciona un ID válido.' });
  }

  try {
    const client = await getConnection();

    // Hashear la contraseña y crear el pedido
    const hashedPassword = await bcrypt.hash(user_password, 10);
    await client.query(queries.orders.deleteOrdersShipped, [id]);

    client.release();
    return res.status(201).json({ msg: 'Pedido eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar el pedido enviado:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.' });  
  }     
};      