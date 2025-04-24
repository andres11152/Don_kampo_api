import { getConnection } from '../database/connection.js';
import { uploadImage } from '../helpers/uploadImage.js';
import { queries } from '../database/queries.interface.js';

export const getProducts = async (req, res) => {
  const { page = 1, limit = 9 } = req.query;
  const offset = (page - 1) * limit;

  let client;
  try {
    client = await getConnection();
    const productsResult = await client.query(queries.products.getProducts, [offset, limit]);

    if (productsResult.rows.length === 0) {
      return res.status(404).json({ message: 'No hay productos disponibles' });
    }

    const productsWithVariations = [];

    // Iterar sobre los productos para agregar las variaciones
    for (const row of productsResult.rows) {
      const existingProduct = productsWithVariations.find(
        (product) => product.product_id === row.product_id
      );
      // Traer las variaciones de cada producto
      const variationsResult = await client.query(queries.products.getProductVariations, [row.product_id]);

      // Filtrar y agrupar las variaciones para evitar duplicaciones
      const variationData = variationsResult.rows.map((variation) => ({
        variation_id: variation.variation_id,
        quality: variation.quality,
        active: variation.active,
        presentations: variation.presentations,  // Las presentaciones ya estarán completas
      }));

      // Si el producto ya existe, agregamos las variaciones sin duplicar
      if (existingProduct) {
        variationData.forEach(variation => {
          // Si la variación no está ya agregada, la agregamos
          const existingVariation = existingProduct.variations.find(v => v.variation_id === variation.variation_id);
          if (!existingVariation) {
            existingProduct.variations.push(variation);
          }
        });
      } else {
        // Si el producto no existe, lo agregamos con las variaciones
        productsWithVariations.push({
          product_id: row.product_id,
          name: row.name,
          description: row.description,
          category: row.category,
          photo_url: row.photo_url,
          active: row.active,
          promocionar: row.promocionar,
          variations: variationData,
        });
      }
    }

    res.status(200).json(productsWithVariations);
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
  } finally {
    if (client) client.release();
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  let client;
  try {
    client = await getConnection();
    const productResult = await client.query(queries.products.getProductById, [id]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const variationsResult = await client.query(queries.products.getProductVariations, [id]);

    const productWithVariations = {
      ...productResult.rows[0],
      variations: variationsResult.rows.map((variation) => ({
        ...variation,
        presentations: variation.presentations,  // Array de IDs de presentaciones
      }))
    };
    res.status(200).json(productWithVariations);

  } catch (error) {
    console.error('Error al obtener el producto por ID:', error);
    res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
  } finally {
    if (client) client.release();
  }
};

export const createProduct = async (req, res) => {
  let client;
  try {
    const { name, description, category, variations, active, promocionar } = req.body;

    // Si no se envía el estado, lo dejamos activo por defecto
    const productActive = typeof active !== 'undefined' ? active : true;
    // Definir un valor por defecto para promocionar (por ejemplo, false)
    const productPromocionar = (typeof promocionar === 'boolean') ? promocionar : false;

    const defaultPhotoUrl = 'https://example.com/default-image.jpg';
    let photoUrl = defaultPhotoUrl;
    if (req.file && req.file.buffer) {
      try {
        photoUrl = await uploadImage(req.file.buffer, req.file.originalname);
      } catch (error) {
        console.error('Error al subir la imagen:', error.message);
        return res.status(500).json({ message: 'Error al subir la imagen a S3' });
      }
    }
    client = await getConnection();

    const result = await client.query(queries.products.createProduct, [
      name,
      description,
      category,
      photoUrl,
      productActive,
      productPromocionar
    ]);
    const productId = result.rows[0].product_id;

    const parsedVariations = JSON.parse(variations);

    if (Array.isArray(parsedVariations) && parsedVariations.length > 0) {
      for (const variation of parsedVariations) {
        const { quality, presentations, active: variationActive } = variation;
        if (!quality || !Array.isArray(presentations) || presentations.length === 0) continue;

        const variationStatus = typeof variationActive !== 'undefined' ? variationActive : true;

        // Asegurar que cada presentación tiene los precios correctos
        const formattedPresentations = presentations.map(presentation => ({
          ...presentation,
          price_home: parseFloat(presentation.price_home || 0),
          price_supermarket: parseFloat(presentation.price_supermarket || 0),
          price_restaurant: parseFloat(presentation.price_restaurant || 0),
          price_fruver: parseFloat(presentation.price_fruver || 0)
        }));

        // Crear la variación del producto
        const variationResult = await client.query(queries.products.createProductVariation, [
          productId,
          quality,
          JSON.stringify(formattedPresentations),
          variationStatus
        ]);
        const variationId = variationResult.rows[0].variation_id;

        // Insertar las presentaciones asociadas con esta variación
        for (const presentation of formattedPresentations) {
          await client.query(queries.products.createProductPresentation, [
            variationId,
            presentation.presentation,
            presentation.price_home,
            presentation.price_supermarket,
            presentation.price_restaurant,
            presentation.price_fruver,
            presentation.stock
          ]);
        }
      }
    }

    res.status(201).json({
      message: 'Producto creado exitosamente',
      product_id: productId
    });
  } catch (error) {
    console.error('Error en createProduct:', error.message);
    res.status(500).json({ message: 'Error al crear el producto', error: error.message });
  } finally {
    if (client) client.release();
  }
};

export const updateProduct = async (req, res) => {
  let client;
  const { id } = req.params;
  const { name, description, category, photo_url, variations, active, promocionar } = req.body;

  let parsedVariations;
  try {
    parsedVariations = typeof variations === 'string' ? JSON.parse(variations) : variations;
  } catch (e) {
    return res.status(400).json({ message: 'Error al parsear las variaciones' });
  }

  const productActive = typeof active !== 'undefined' ? active : true;
  const productPromocionar = typeof promocionar !== 'undefined' ? promocionar : false;
  const parsedProductId = parseInt(id, 10);

  if (isNaN(parsedProductId)) {
    return res.status(400).json({ message: 'ID del producto inválido' });
  }

  try {
    client = await getConnection();

    let updatedPhotoUrl = photo_url || null;

    // Si se sube una nueva imagen, la procesamos y subimos a S3
    if (req.file && req.file.buffer) {
      try {
        updatedPhotoUrl = await uploadImage(req.file.buffer, req.file.originalname);
      } catch (error) {
        console.error('Error al subir la imagen:', error.message);
        return res.status(500).json({ message: 'Error al subir la imagen a S3' });
      }
    }

    // Se actualiza el producto incluyendo la nueva URL de la imagen si se subió una nueva
    const result = await client.query(queries.products.updateProduct, [
      name,
      description,
      category,
      updatedPhotoUrl,
      productActive,
      productPromocionar,
      parsedProductId
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    if (!Array.isArray(parsedVariations) && !parsedVariations.length) {
      return res.status(404).json({ message: "No hay variaciones" })
    }

    const variationsResult = await client.query(queries.products.getProductVariations, [id]);

    await Promise.all(
      variationsResult.rows.map(async variation => {
        const indexVariation = parsedVariations.findIndex(v => v.variation_id === variation.variation_id)
        if (indexVariation === -1) {
          // Eliminar todas las variaciones actuales del producto
          await client.query(queries.products.deleteProductVariation, [variation.variation_id]);
        } else {
          variation.presentations.map(async presentation => {
            const indexPresentation = parsedVariations[indexVariation].presentations
              .findIndex(p => p.presentation_id === presentation.presentation_id)

            if (indexPresentation === -1) {
              // Eliminar todas las variaciones actuales del producto
              await client.query(queries.products.deletePresentation, [presentation.presentation_id]);
            }
          })
        }
      })
    )

    for (const variation of parsedVariations) {
      const {
        variation_id,  // ID de la variación (para actualizar)
        quality,
        presentations,  // Esto ahora es un array de presentaciones
        active: variationActive
      } = variation;

      if (!quality || !Array.isArray(presentations) || presentations.length === 0) continue;

      const variationStatus = typeof variationActive !== 'undefined' ? variationActive : true;

      // Si no existe la variacion la crea, de lo contrario la actualiza
      if (!variation_id) {
        // Crear la variación del producto
        const variationResult = await client.query(queries.products.createProductVariation, [
          parsedProductId,
          quality,
          JSON.stringify(presentations),
          variationStatus
        ]);
        const variationId = variationResult.rows[0].variation_id;

        // Insertar las presentaciones asociadas con esta variación
        for (const presentation of presentations) {
          await client.query(queries.products.createProductPresentation, [
            variationId,
            presentation.presentation,
            parseInt(presentation.stock),
            presentation.price_home,
            presentation.price_supermarket,
            presentation.price_restaurant,
            presentation.price_fruver,
          ]);
        }
      } else {
        // Se actualiza la variación
        await client.query(queries.products.updateProductVariation, [
          quality,
          variationStatus,
          variation_id  // ID de la variación para actualizar
        ]);

        // Actualizar las presentaciones para esta variación
        for (const presentation of presentations) {
          // Verificar si la presentación ya existe
          const existingPresentation = await client.query(
            `SELECT presentation_id FROM product_presentations 
            WHERE variation_id = $1 AND presentation_id = $2`,
            [variation_id, presentation.presentation_id]
          );

          if (existingPresentation.rows.length > 0) {
            // Si la presentación ya existe, actualízala
            await client.query(queries.products.updateProductPresentation, [
              variation_id,
              presentation.presentation,
              parseInt(presentation.stock),
              presentation.price_home,
              presentation.price_supermarket,
              presentation.price_restaurant,
              presentation.price_fruver,
              presentation.presentation_id
            ]);
          } else {
            await client.query(queries.products.createProductPresentation, [
              variation_id,
              presentation.presentation,
              parseInt(presentation.stock),
              presentation.price_home,
              presentation.price_supermarket,
              presentation.price_restaurant,
              presentation.price_fruver,
            ]);
          }
        }
      }
    }

    res.status(200).json({ message: 'Producto actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
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

  try {
    client = await getConnection();
    const result = await client.query(queries.products.deleteProduct, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Producto no encontrado o ya eliminado' });
    }
    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
  } finally {
    if (client) client.release();
  }
};

export const updateMultipleProducts = async (req, res) => {
  let client;
  const products = req.body;

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: 'Debe proporcionar un array de productos para actualizar.' });
  }

  try {
    client = await getConnection();
    await client.query('BEGIN');

    for (const product of products) {
      // Se extrae también el campo "promocionar"
      const { product_id, name, description, category, variations, photo_url, active, promocionar } = product;
      const parsedProductId = parseInt(product_id, 10);
      if (isNaN(parsedProductId)) throw new Error(`ID del producto inválido: ${product_id}`)

      const updatedActive = typeof active !== 'undefined' ? active : true;
      const productPromocionar = typeof promocionar !== 'undefined' ? promocionar : false;
      const result = await client.query(queries.products.updateProduct, [
        name,
        description,
        category,
        photo_url || null,
        updatedActive,
        productPromocionar,
        parsedProductId
      ]);

      if (result.rowCount === 0) throw new Error(`Producto con ID: ${product_id} no encontrado.`)

      // Función para limpiar y convertir números
      const cleanNumber = (value) =>
        parseFloat(String(value).replace('.', '').replace(',', '.')) || 0;

      if (Array.isArray(variations) && variations.length > 0) {
        for (const variation of variations) {
          const { variation_id, quality, presentations, active } = variation;
          const variationStatus = typeof active !== 'undefined' ? active : true;

          if (variation_id) {
            // Actualizar variación existente
            await client.query(queries.products.updateProductVariation, [
              quality,
              variationStatus,
              variation_id
            ]);

            // Limpiar y actualizar las presentaciones asociadas a la variación
            if (Array.isArray(presentations) && presentations.length > 0) {
              // Primero eliminar las presentaciones anteriores de la variación
              await client.query(queries.products.deletePresentationsByVariation, [variation_id]);

              // Ahora insertar las nuevas presentaciones
              for (const presentation of presentations) {
                await client.query(queries.products.createProductPresentation, [
                  variation_id,  // ID de la variación
                  presentation.presentation,  // Nombre de la presentación
                  cleanNumber(presentation.price_home),  // Precio hogar
                  cleanNumber(presentation.price_supermarket),  // Precio supermercado
                  cleanNumber(presentation.price_restaurant),  // Precio restaurante
                  cleanNumber(presentation.price_fruver),  // Precio fruver
                  cleanNumber(presentation.stock)  // Stock
                ]);
              }
            }
          } else {
            // Crear nueva variación
            const { presentations = [] } = variation;  // Suponiendo que las presentaciones también vienen como un array de IDs
            const newVariationResult = await client.query(queries.products.createProductVariation, [
              parsedProductId, quality, presentations, variationStatus ]);

            const newVariationId = newVariationResult.rows[0].variation_id;

            // Insertar presentaciones
            for (const presentation of presentation_ids) {
              await client.query(queries.products.createProductPresentation, [
                newVariationId,  // ID de la variación
                presentation.presentation,  // Nombre de la presentación
                cleanNumber(presentation.price_home),  // Precio hogar
                cleanNumber(presentation.price_supermarket),  // Precio supermercado
                cleanNumber(presentation.price_restaurant),  // Precio restaurante
                cleanNumber(presentation.price_fruver),  // Precio fruver
                cleanNumber(presentation.stock)  // Stock
              ]);
            }
          }
        }
      }
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Productos actualizados exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar los productos:', error);
    if (client) await client.query('ROLLBACK');
    res.status(500).json({ message: 'Error al actualizar los productos.', error: error.message });
  } finally {
    if (client) client.release();
  }
};