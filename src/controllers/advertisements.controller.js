import { queries } from '../database/queries.interface.js';
import { getConnection } from '../database/connection.js';

export const getAdvertisements = async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.query(queries.advertisements.getAll);

    const categories = result.rows.reduce((acc, row) => {
      acc[row.category] = {
        photos: row.photos || [],
        title: row.title || '',
        description: row.description || '',
      };
      return acc;
    }, {});

    res.json(categories);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error al obtener las categorías.');
  }
};

// Crear una nueva categoría
export const createAdvertisement = async (req, res) => {
  const [ category, title, description ] = req.body;
  const photos = req.files;

  // Validar datos obligatorios
  if (!category || !photos || photos.length === 0) {
    return res.status(400).json({ message: 'La categoría y las fotos son obligatorias.' });
  }

  try {
    const connection = await getConnection();
    const result = await connection.query(queries.advertisements.create, [
      category,
      photos,
      title || '',
      description || '',
    ]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error al crear la categoría.');
  }
};

// Actualizar título y descripción
export const updateAdvertisement = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  try {
    const connection = await getConnection();
    const result = await connection.query(queries.advertisements.updateTitleAndDescription, [
      title || '',
      description || '',
      id,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error al actualizar la categoría.');
  }
};

// Actualizar solo las fotos
export const updatePhotos = async (req, res) => {
  const { id } = req.params;
  const { photos } = req.body;

  // Validar que photos sea un arreglo
  if (!photos || !Array.isArray(photos)) {
    return res.status(400).json({ message: 'Debe proporcionar un arreglo de fotos.' });
  }

  try {
    const connection = await getConnection();
    const result = await connection.query(queries.advertisements.updatePhotos, [photos, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error al actualizar las fotos.');
  }
};