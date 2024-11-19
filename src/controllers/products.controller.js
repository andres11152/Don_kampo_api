
import { getConnection } from '../database/connection.js';
import { uploadImage } from '../helpers/uploadImage.js'; // Importamos el helper para subir a S3
import { queries } from '../database/queries.interface.js';


export const getProducts = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;  // Parámetros de paginación por defecto
  const offset = (page - 1) * limit;  // Calcular el desplazamiento

  let client;
  try {
    client = await getConnection();

    // Ejecutar la consulta con los parámetros correctamente tipados
    const result = await client.query(queries.products.getProducts, [
      offset,  // Asegúrate de que 'offset' sea un número
      limit,   // 'limit' también debe ser un número
    ]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  } finally {
    if (client) client.release();
  }
};


// Obtener un producto por su ID
export const getProductById = async (req, res) => {
  const { id } = req.params;
  let client;

  console.log(`ID recibido: ${id}`);  // Verificar si el ID recibido es el correcto

  try {
    client = await getConnection();

    // Ejecutar la consulta para obtener el producto por ID
    const result = await client.query(queries.products.getProductById, [id]);

    console.log('Resultado de la consulta:', result.rows);  // Verificar el resultado de la consulta

    // Si no se encuentra el producto
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener el producto por ID:', error);
    res.status(500).json({ message: 'Error al obtener el producto' });
  } finally {
    if (client) client.release();
  }
};


// Crear un nuevo producto
export const createProduct = async (req, res) => {
  let client;
  const { name, description, category, stock, variations } = req.body;
  const photoBuffer = req.file?.buffer || null;

  // URL predeterminada si no se proporciona una imagen
  const defaultPhotoUrl = 'https://example.com/default-image.jpg';

  let photoUrl = null;

  // Subir imagen a AWS S3 si existe un buffer de imagen
  if (photoBuffer) {
    try {
      photoUrl = await uploadImage(photoBuffer, req.file.originalname);
    } catch (error) {
      console.error('Error al subir la imagen a S3:', error);
      return res.status(500).json({ message: 'Error al subir la imagen a S3' });
    }
  } else {
    // Si no se proporciona una imagen, se usa la URL predeterminada
    photoUrl = defaultPhotoUrl;
  }

  const validatedStock = stock ? parseInt(stock, 10) : 0; // Validar el stock

  try {
    client = await getConnection();

    // Insertar producto en la base de datos
    const result = await client.query(queries.products.createProduct, [
      name,
      description,
      category,
      validatedStock,
      photoUrl, // Se asegura de usar la URL de la imagen obtenida
    ]);

    const productId = result.rows[0].product_id;

    // Insertar variaciones si existen
    if (Array.isArray(variations) && variations.length > 0) {
      for (const variation of variations) {
        const { quality, quantity, price_home, price_supermarket, price_restaurant, price_fruver } = variation;

        // Validar que cada variación tenga los campos necesarios
        if (!quality || !quantity) {
          console.error(`Variación inválida: ${JSON.stringify(variation)}`);
          continue; // O puedes retornar un error si prefieres no seguir
        }

        await client.query(queries.products.createProductVariation, [
          productId,
          quality,
          quantity,
          parseFloat(price_home || 0),
          parseFloat(price_supermarket || 0),
          parseFloat(price_restaurant || 0),
          parseFloat(price_fruver || 0),
        ]);
      }
    }

    // Responder al cliente con el ID del producto creado
    res.status(201).json({
      message: 'Producto creado exitosamente',
      product_id: productId,
    });
  } catch (error) {
    console.error('Error al crear el producto:', error);
    // Manejo de errores específico, con detalles más claros
    res.status(500).json({
      message: 'Error al crear el producto',
      error: error.message, // Puedes incluir más detalles del error si lo deseas
    });
  } finally {
    if (client) client.release(); // Asegúrate de liberar la conexión
  }
};

export const updateProduct = async (req, res) => {
  let client;
  const { id } = req.params;  // ID del producto a actualizar
  const { name, description, category, stock, photo_url, variations } = req.body;

  // Asegurémonos de que el ID es un número
  const parsedProductId = parseInt(id, 10);

  if (isNaN(parsedProductId)) {
    return res.status(400).json({ message: 'ID del producto inválido' });
  }

  try {
    client = await getConnection();

    // Asegurémonos de que photo_url sea null si no se proporciona
    const updatedPhotoUrl = photo_url || null;

    // Imprimir la consulta y los parámetros para depuración
    console.log('Consulta SQL:', queries.products.updateProduct);
    console.log('Parámetros:', [name, description, category, stock, updatedPhotoUrl, parsedProductId]);

    // Verificar si la consulta existe
    if (!queries.products.updateProduct) {
      console.error('La consulta updateProduct no está definida');
      return res.status(500).json({ message: 'Error en la consulta SQL' });
    }

    // Actualizar el producto en la base de datos
    const result = await client.query(queries.products.updateProduct, [
      name,
      description,
      category,
      stock,
      updatedPhotoUrl,  // Pasamos null si no se proporciona una foto
      parsedProductId,  // El ID del producto que estamos actualizando
    ]);

    // Verificar si el producto fue actualizado
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Si hay variaciones, actualizarlas
    if (Array.isArray(variations) && variations.length > 0) {
      // Primero eliminamos las variaciones anteriores
      await client.query(queries.products.deleteProductVariation, [parsedProductId]);

      // Luego insertamos las nuevas variaciones
      for (const variation of variations) {
        await client.query(queries.products.createProductVariation, [
          parsedProductId,
          variation.quality,
          variation.quantity,
          parseFloat(variation.price_home || 0),
          parseFloat(variation.price_supermarket || 0),
          parseFloat(variation.price_restaurant || 0),
          parseFloat(variation.price_fruver || 0),
        ]);
      }
    }

    res.status(200).json({ message: 'Producto actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({ message: 'Error al actualizar el producto' });
  } finally {
    if (client) client.release();
  }
};



export const deleteProduct = async (req, res) => {
  const { id } = req.params;  // Usamos 'id' en lugar de 'product_id'
  let client;

  // Verificar si el id fue recibido correctamente
  if (!id) {
    return res.status(400).json({ message: 'El ID del producto es requerido' });
  }

  console.log('ID del producto a eliminar:', id);  // Depuración para verificar el valor del ID

  try {
    client = await getConnection();

    // Realizar la consulta de eliminación
    const result = await client.query(queries.products.deleteProduct, [id]);

    // Si no se encontró el producto para eliminar
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Producto no encontrado o ya eliminado' });
    }

    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({ message: 'Error al eliminar el producto' });
  } finally {
    if (client) client.release();
  }
};
