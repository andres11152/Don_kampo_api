import { getConnection } from '../database/connection.js';
import { queries } from '../database/queries.interface.js';
export const getCustomerTypes = async (req, res) => {
  try {
    const client = await getConnection(); // Establecemos la conexión
    if (!client) {
      throw new Error('No se pudo establecer la conexión con la base de datos.');
    }

    // Ejecutamos la consulta para obtener todos los tipos de cliente
    const result = await client.query(queries.customerTypes.getAllCustomerTypes);
    client.release(); // Liberamos el cliente una vez que la consulta esté completada

    if (result.rows.length === 0) {
      return res.status(404).json({
        msg: 'No se encontraron tipos de cliente.'
      });
    }

    // Devolvemos los tipos de cliente obtenidos
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener los tipos de cliente:', error);
    return res.status(500).json({
      msg: 'Error al obtener los tipos de cliente',
      error: error.message
    });
  }
};
export const updateAllShippingCosts = async (req, res) => {
  let {
    hogar,
    fruver,
    supermercado,
    restaurante
  } = req.body;
  hogar = parseFloat(hogar);
  fruver = parseFloat(fruver);
  supermercado = parseFloat(supermercado);
  restaurante = parseFloat(restaurante);
  if (isNaN(hogar) || isNaN(fruver) || isNaN(supermercado) || isNaN(restaurante)) {
    return res.status(400).json({
      msg: 'Por favor proporciona todos los costos de envío como valores numéricos.'
    });
  }
  console.log('Hogar:', hogar, 'Fruver:', fruver, 'Supermercado:', supermercado, 'Restaurante:', restaurante);
  try {
    const client = await getConnection();
    await client.query(queries.customerTypes.updateAllShippingCosts, [hogar, fruver, supermercado, restaurante]);
    client.release();
    return res.status(200).json({
      msg: 'Costos de envío actualizados exitosamente.'
    });
  } catch (error) {
    console.error('Error al actualizar los costos de envío:', error);
    return res.status(500).json({
      msg: 'Error interno del servidor.',
      error: error.message
    });
  }
};