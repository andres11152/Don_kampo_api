import bcrypt from 'bcrypt';
import {getConnection} from '../database/connection.js';
import {queries} from '../database/queries.interface.js';

/** 
 * Obtiene todos los usuarios de la base de datos.
 * **/

export const getUsers = async (req, res) => {
    try {
        const client = await getConnection();
        const users = await client.query(queries.users.getUsers);
        res.status(200).json(users.rows);
        await client.end();
    } catch (error) {
        console.error('Error al obtener usuarios:', error.message);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

export const getUsersById = async (req, res) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'Falta el id del usuario' });
        }
        try {
            const client = await getConnection();
            const users = await client.query(queries.users.getUsersById, [id]);
            res.status(200).json(users.rows);
            await client.end();
        }

};