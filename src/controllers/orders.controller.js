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
  Obtiene un pedido por ID de la base de datos.
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
