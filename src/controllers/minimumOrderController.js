import { getConnection } from '../database/connection.js';
import { queries } from '../database/queries.interface.js';

// Función para manejar errores de manera centralizada
const handleError = (res, error, message) => {
  console.error(message, error);
  return res.status(500).json({ message });
};

// Obtener todos los pedidos mínimos
export const getMinimumOrders = async (req, res) => {
  let client;
  try {
    client = await getConnection();
    const result = await client.query(queries.minimumOrders.getAll);
    return res.status(200).json(result.rows);
  } catch (error) {
    return handleError(res, error, 'Error al obtener pedidos mínimos');
  } finally {
    if (client) client.release();
  }
};

// Crear o actualizar un pedido mínimo
export const createOrUpdateMinimumOrder = async (req, res) => {
  let client;
  try {
    const { customer_type, minimum_order_amount } = req.body;

    // Validación de campos requeridos
    if (!customer_type || !minimum_order_amount) {
      return res.status(400).json({ message: 'customer_type y minimum_order_amount son requeridos' });
    }

    client = await getConnection();
    const result = await client.query(queries.minimumOrders.createOrUpdate, [customer_type, minimum_order_amount]);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return handleError(res, error, 'Error al crear o actualizar pedido mínimo');
  } finally {
    if (client) client.release();
  }
};

// Eliminar un pedido mínimo
export const deleteMinimumOrder = async (req, res) => {
  let client;
  try {
    const { id } = req.params;

    // Validación de ID
    if (!id) {
      return res.status(400).json({ message: 'El ID del pedido mínimo es requerido' });
    }

    client = await getConnection();
    const result = await client.query(queries.minimumOrders.delete, [id]);

    // Verificar si se eliminó algún registro
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pedido mínimo no encontrado' });
    }

    return res.status(200).json({ message: 'Pedido mínimo eliminado correctamente', data: result.rows[0] });
  } catch (error) {
    return handleError(res, error, 'Error al eliminar pedido mínimo');
  } finally {
    if (client) client.release();
  }
};