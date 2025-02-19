import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import { getConnection } from '../database/connection.js';
import { queries } from '../database/queries.interface.js';

// Obtener todos los tipos de cliente
export const getCustomerTypes = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (req, res) {
    let client;
    try {
      // Establecemos la conexión
      client = yield getConnection();
      if (!client) {
        throw new Error('No se pudo establecer la conexión con la base de datos.');
      }

      // Ejecutamos la consulta para obtener todos los tipos de cliente
      const result = yield client.query(queries.customerTypes.getAllCustomerTypes);
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
    } finally {
      if (client) client.release(); // Liberamos el cliente siempre en el bloque `finally`
    }
  });
  return function getCustomerTypes(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

// Actualizar todos los costos de envío
export const updateAllShippingCosts = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* (req, res) {
    let client;
    try {
      // Validamos los datos de entrada
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

      // Conexión y ejecución de la consulta
      client = yield getConnection();
      yield client.query(queries.customerTypes.updateAllShippingCosts, [hogar, fruver, supermercado, restaurante]);
      return res.status(200).json({
        msg: 'Costos de envío actualizados exitosamente.'
      });
    } catch (error) {
      console.error('Error al actualizar los costos de envío:', error);
      return res.status(500).json({
        msg: 'Error interno del servidor.',
        error: error.message
      });
    } finally {
      if (client) client.release(); // Liberamos el cliente siempre en el bloque `finally`
    }
  });
  return function updateAllShippingCosts(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();