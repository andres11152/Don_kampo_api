import { getConnection } from '../database/connection.js';
import { queries } from '../database/queries.interface.js';

/**
 * Obtiene todos los tipos de cliente.
 */
export const getCustomerTypes = async (req, res) => {
  try {
    const client = await getConnection();
    const result = await client.query(queries.customerTypes.getAllCustomerTypes);
    client.release();
    return res.status(200).json(result.rows); // Responder con los tipos de cliente obtenidos
  } catch (error) {
    console.error('Error al obtener los tipos de cliente:', error);
    return res.status(500).json({ msg: 'Error al obtener los tipos de cliente', error: error.message });
  }
};

/**
 * Obtiene un tipo de cliente por ID.
 */
export const getCustomerTypeById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ msg: 'Por favor proporciona un ID válido.' });
  }

  try {
    const client = await getConnection();
    const result = await client.query(queries.customerTypes.getCustomerTypeById, [id]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Tipo de cliente no encontrado.' });
    }

    return res.status(200).json(result.rows[0]); // Retornar el tipo de cliente encontrado
  } catch (error) {
    console.error('Error al obtener tipo de cliente:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.', error: error.message });
  }
};

/**
 * Actualiza el costo de envío de un tipo de cliente.
 */
export const updateShippingCost = async (req, res) => {
  const { id } = req.params;
  const { shipping_cost } = req.body;

  if (!id || !shipping_cost) {
    return res.status(400).json({ msg: 'Por favor proporciona un ID válido y un costo de envío.' });
  }

  try {
    const client = await getConnection();
    const result = await client.query(queries.customerTypes.updateShippingCost, [shipping_cost, id]);
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json({ msg: 'Tipo de cliente no encontrado.' });
    }

    return res.status(200).json({ msg: 'Costo de envío actualizado exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar el costo de envío:', error);
    return res.status(500).json({ msg: 'Error interno del servidor.', error: error.message });
  }
};

/**
 * Actualiza todos los costos de envío de los tipos de cliente.
 */
export const updateAllShippingCosts = async (req, res) => {
    let { hogar, fruver, supermercado, restaurante } = req.body;
  
    // Convertir los valores a tipo numérico
    hogar = parseFloat(hogar);
    fruver = parseFloat(fruver);
    supermercado = parseFloat(supermercado);
    restaurante = parseFloat(restaurante);
  
    // Validación para asegurarse de que los valores sean numéricos
    if (isNaN(hogar) || isNaN(fruver) || isNaN(supermercado) || isNaN(restaurante)) {
      return res.status(400).json({ msg: 'Por favor proporciona todos los costos de envío como valores numéricos.' });
    }
  
    try {
      const client = await getConnection();
      await client.query(queries.customerTypes.updateAllShippingCosts, [hogar, fruver, supermercado, restaurante]);
      client.release();
  
      return res.status(200).json({ msg: 'Costos de envío actualizados exitosamente.' });
    } catch (error) {
      console.error('Error al actualizar los costos de envío:', error);
      return res.status(500).json({ msg: 'Error interno del servidor.', error: error.message });
    }
  };
  
  
