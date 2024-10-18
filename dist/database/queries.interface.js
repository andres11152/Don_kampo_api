export const queries = {
  users: {
    getUsers: 'SELECT * FROM users',
    getUsersById: 'SELECT * FROM users WHERE id = $1',
    createUsers: `INSERT INTO users (user_name, first_name, last_name, email, phone, department, city, address, neighborhood, locality, user_status, user_password)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    updateUsers: `UPDATE users
                     SET first_name = $1, last_name = $2, email = $3, phone = $4, department = $5, city = $6, address = $7, neighborhood = $8, locality = $9, user_status = $10, user_password = $11
                     WHERE id = $12`,
    deleteUsers: 'DELETE FROM users WHERE id = $1'
  },
  companies: {
    getCompanies: 'SELECT * FROM companies',
    getCompaniesById: 'SELECT * FROM companies WHERE id = $1',
    createCompanies: `INSERT INTO companies (company_name, contact_person, email, phone, department, city, address, neighborhood, locality, shipping_status_id, shipping_info_id, company_status, company_password),
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    updateCompanies: `UPDATE companies
                     SET company_name = $1, contact_person = $2, email = $3, phone = $4, department = $5, city = $6, address = $7, neighborhood = $8, locality = $9, shipping_status_id = $10, shipping_info_id = $11, company_status = $12, company_password = $13
                     WHERE id = $14`,
    deleteCompanies: 'DELETE FROM companies WHERE id = $1'
  }
};