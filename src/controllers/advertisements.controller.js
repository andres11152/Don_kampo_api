import { queries } from '../database/queries.interface.js';
import { getConnection } from '../database/connection.js';
import { uploadImage } from '../helpers/uploadImage.js';

// Obtener todas las publicidades
export const getAdvertisements = async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.query(queries.advertisements.getAll);

    const advertisements = result.rows.map(row => ({
      advertisement_id: row.advertisement_id,
      title: row.title || '',
      description: row.description || '',
      category: row.category || '',
      photo_url: row.photo_url || 'https://www.donkampo.com/images/1.png'  // Imagen por defecto si no existe
    }));

    res.json(advertisements);
  } catch (error) {
    console.error('Error en getAdvertisements:', error.message);
    res.status(500).json({ message: 'Error al obtener las publicidades', error: error.message });
  }
};

// Crear una publicidad
export const createAdvertisement = async (req, res) => {
  let connection;

  try {
    const { title, description, category } = req.body;
    console.log(req.body);
    // Manejo de imágenes: validación explícita
    const defaultPhotoUrl = 'https://www.donkampo.com/images/1.png';  // Imagen predeterminada
    let photoUrl = defaultPhotoUrl;

    if (req.file && req.file.buffer) {
      try {
        photoUrl = await uploadImage(req.file.buffer, req.file.originalname);
      } catch (error) {
        console.error('Error al subir la imagen:', error.message);
        return res.status(500).json({ message: 'Error al subir la imagen a S3' });
      }
    }

    // Conexión a la base de datos
    connection = await getConnection();
    const result = await connection.query(queries.advertisements.createAdvertisement, [
      title,
      description,
      category,
      photoUrl
    ]);

    const advertisementId = result.rows[0].advertisement_id;

    res.status(201).json({
      message: 'Publicidad creada exitosamente',
      advertisement_id: advertisementId
    });
  } catch (error) {
    console.error('Error al crear la publicidad:', error.message);
    res.status(500).json({ message: 'Error al crear la publicidad', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

// Actualizar una publicidad
export const updateAdvertisement = async (req, res) => {
  let connection;
  const { id } = req.params;
  const { title, description, category, photo_url } = req.body;

  const parsedAdvertisementId = parseInt(id, 10);

  if (isNaN(parsedAdvertisementId)) {
    return res.status(400).json({ message: 'ID de la publicidad inválido' });
  }

  try {
    connection = await getConnection();

    const updatedPhotoUrl = photo_url || null;  // Si no se proporciona photo_url, se establece como null

    const result = await connection.query(queries.advertisements.updateAdvertisement, [
      title,
      description,
      category,
      updatedPhotoUrl,
      parsedAdvertisementId
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Publicidad no encontrada' });
    }

    res.status(200).json({ message: 'Publicidad actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar la publicidad:', error.message);
    res.status(500).json({ message: 'Error al actualizar la publicidad', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

// Eliminar una publicidad
export const deleteAdvertisement = async (req, res) => {
  const { id } = req.params;
  let connection;

  if (!id) {
    return res.status(400).json({ message: 'El ID de la publicidad es requerido' });
  }

  try {
    connection = await getConnection();
    const result = await connection.query(queries.advertisements.deleteAdvertisement, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Publicidad no encontrada o ya eliminada' });
    }

    res.status(200).json({ message: 'Publicidad eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar la publicidad:', error.message);
    res.status(500).json({ message: 'Error al eliminar la publicidad', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};
