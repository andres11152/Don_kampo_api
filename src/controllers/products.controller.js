import { getConnection } from '../database/connection.js';
import { uploadImage } from '../helpers/uploadImage.js'; 
import { queries } from '../database/queries.interface.js';

export const getProducts = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;  

  let client;
  try {
    client = await getConnection();  

    const productsResult = await client.query(queries.products.getProducts, [offset, limit]);

    if (productsResult.rows.length === 0) {
      return res.status(404).json({ message: 'No hay productos disponibles' });
    }

    const productIds = productsResult.rows.map(product => product.product_id);
    const variationsResult = await client.query(queries.products.getProductVariationsByProductIds, [productIds]);
    const productsWithVariations = productsResult.rows.map(product => {
      const variations = variationsResult.rows.filter(variation => variation.product_id === product.product_id);
      return {
        ...product,
        variations: variations
      };
    });

    res.status(200).json(productsWithVariations);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  } finally {
    if (client) client.release();  
  }
};


export const getProductById = async (req, res) => {
  const { id } = req.params;  

  let client;
  try {
    client = await getConnection();  // Obtener conexión a la base de datos

    // Obtener el producto por su ID
    const productResult = await client.query(queries.products.getProductById, [id]);

    // Si el producto no existe, retornar un error 404
    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Obtener las variaciones del producto
    const variationsResult = await client.query(queries.products.getProductVariations, [id]);

    // Combinar el producto y sus variaciones
    const productWithVariations = {
      ...productResult.rows[0],  // Producto encontrado
      variations: variationsResult.rows  // Variaciones asociadas al producto
    };

    // Retornar el producto con sus variaciones
    res.status(200).json(productWithVariations);
  } catch (error) {
    console.error('Error al obtener el producto por ID:', error);
    res.status(500).json({ message: 'Error al obtener el producto' });
  } finally {
    if (client) client.release();  // Liberar la conexión después de la consulta
  }
};

export const createProduct = async (req, res) => {
  let client;
  const { name, description, category, stock, variations } = req.body;
  const photoBuffer = req.file?.buffer || null;

  const defaultPhotoUrl = 'https://example.com/default-image.jpg';

  let photoUrl = null;

  if (photoBuffer) {
    try {
      photoUrl = await uploadImage(photoBuffer, req.file.originalname);
    } catch (error) {
      console.error('Error al subir la imagen a S3:', error);
      return res.status(500).json({ message: 'Error al subir la imagen a S3' });
    }
  } else {
    photoUrl = defaultPhotoUrl;
  }

  const validatedStock = stock ? parseInt(stock, 10) : 0;

  try {
    client = await getConnection();
    const result = await client.query(queries.products.createProduct, [
      name,
      description,
      category,
      validatedStock,
      photoUrl,
    ]);

    const productId = result.rows[0].product_id;

    if (Array.isArray(variations) && variations.length > 0) {
      for (const variation of variations) {
        const { quality, quantity, price_home, price_supermarket, price_restaurant, price_fruver } = variation;

        if (!quality || !quantity) {
          console.error(`Variación inválida: ${JSON.stringify(variation)}`);
          continue;
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

    res.status(201).json({
      message: 'Producto creado exitosamente',
      product_id: productId,
    });
  } catch (error) {
    console.error('Error al crear el producto:', error);
    res.status(500).json({
      message: 'Error al crear el producto',
      error: error.message,
    });
  } finally {
    if (client) client.release();
  }
};

export const updateProduct = async (req, res) => {
  let client;
  const { id } = req.params;  
  const { name, description, category, stock, photo_url, variations } = req.body;

  const parsedProductId = parseInt(id, 10);

  if (isNaN(parsedProductId)) {
    return res.status(400).json({ message: 'ID del producto inválido' });
  }

  try {
    client = await getConnection();
    const updatedPhotoUrl = photo_url || null;

    console.log('Consulta SQL:', queries.products.updateProduct);
    console.log('Parámetros:', [name, description, category, stock, updatedPhotoUrl, parsedProductId]);

    if (!queries.products.updateProduct) {
      console.error('La consulta updateProduct no está definida');
      return res.status(500).json({ message: 'Error en la consulta SQL' });
    }

    const result = await client.query(queries.products.updateProduct, [
      name,
      description,
      category,
      stock,
      updatedPhotoUrl,  
      parsedProductId,  
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    if (Array.isArray(variations) && variations.length > 0) {
      await client.query(queries.products.deleteProductVariation, [parsedProductId]);

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
  const { id } = req.params;  
  let client;

  if (!id) {
    return res.status(400).json({ message: 'El ID del producto es requerido' });
  }

  console.log('ID del producto a eliminar:', id);  

  try {
    client = await getConnection();
    const result = await client.query(queries.products.deleteProduct, [id]);

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
