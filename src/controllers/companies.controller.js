import bcrypt from 'bcryptjs';
import { getConnection } from '../database/connection'; 
import { queries } from '../database/queries.interface';

/**
 * Obtener todas las empresas
 */

export const getCompanies = async (req, res) => {
     try{   
        const client = await getConnection();
        const result = await connection.query(queries.getCompanies);
        res.status(200).json(result.rows);  
        await client.end();
     }catch(error){
        console.error('Error al obtener las empresas', error);
        res.status(500).json({ error: 'Error al obtener las empresas' });
    }
};
/**
 * Obtener una empresa por ID de la base de datos.
 */
export const getCompaniesById = async (req, res) => {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        msg: 'Por favor proporciona un ID válido.',
      });
    }   
    try {
        const client = await getConnection();
        const result = await client.query(queries.getCompaniesById, [id]);
        await client.end();
        if (result.rows.length > 0) {
            return res.status(200).json(result.rows[0]);
        } else {
            return res.status(404).json({
                msg: 'Empresa no encontrada.',
            });
        }
    } catch (error) {
        console.error('Error al obtener empresa:', error);
        return res.status(500).json({
            msg: 'Error interno del servidor.',
        });
    }
};

/**
 * Crear una nueva empresa en la base de datos.
 */
export const createCompanies = async (req, res) => {
    const { company_name, contact_person, email, phone, department, city, address, neighborhood, locality, user_status, user_password } = req.body;

    // Validar que todos los campos necesarios estén presentes
    if (!company_name || !contact_person || !email || !phone || !department || !city || !address || !neighborhood || !locality || !user_status || !user_password) {
        return res.status(400).json({
            msg: 'No se permiten campos vacíos. Asegúrate de que todos los campos estén completos.'
        });
    }
}