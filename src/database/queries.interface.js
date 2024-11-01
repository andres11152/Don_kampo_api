export const queries ={

    users:{

        getUsers: 'SELECT * FROM users',
        getUsersById: 'SELECT * FROM users WHERE id = $1',
        createUsers: `INSERT INTO users (user_name, lastname, email, phone, user_password, user_type)
              VALUES ($1, $2, $3, $4, $5, $6)`,
        updateUsers: `UPDATE users
                     SET first_name = $1, last_name = $2, email = $3, phone = $4, department = $5, city = $6, address = $7, neighborhood = $8, locality = $9, user_status = $10, user_password = $11
                     WHERE id = $12`,
        deleteUsers: 'DELETE FROM users WHERE id = $1'
    }
    ,companies:{         
        getCompanies: 'SELECT * FROM companies',
        getCompaniesById: 'SELECT * FROM companies WHERE id = $1',
        createCompanies: `INSERT INTO companies (company_name, contact_person, email, phone, department, city, address, neighborhood, locality, shipping_status_id, shipping_info_id, company_status, company_password),
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        updateCompanies: `UPDATE companies
                     SET company_name = $1, contact_person = $2, email = $3, phone = $4, department = $5, city = $6, address = $7, neighborhood = $8, locality = $9, shipping_status_id = $10, shipping_info_id = $11, company_status = $12, company_password = $13
                     WHERE id = $14`,
        deleteCompanies: 'DELETE FROM companies WHERE id = $1'
    }
    ,shipping_statuses:{
        getShippingStatuses: 'SELECT * FROM shipping_statuses',
        getShippingStatusesById: 'SELECT * FROM shipping_statuses WHERE id = $1',
        createShippingStatuses: `INSERT INTO shipping_statuses (status_name)
                    VALUES ($1)`,
        updateShippingStatuses: `UPDATE shipping_statuses
                     SET status_name = $1
                     WHERE id = $2`,
        deleteShippingStatuses: 'DELETE FROM shipping_statuses WHERE id = $1'
    }
    ,shipping_info:{
        getShippingInfo: 'SELECT * FROM shipping_info',
        getShippingInfoById: 'SELECT * FROM shipping_info WHERE id = $1',
        createShippingInfo: `INSERT INTO shipping_info (shipping_method, tracking_number, estimated_delivery, actual_delivery, shipping_status_id)
                    VALUES ($1, $2, $3, $4, $5)`,
        updateShippingInfo: `UPDATE shipping_info
                     SET shipping_method = $1, tracking_number = $2, estimated_delivery = $3, actual_delivery = $4, shipping_status_id = $5
                     WHERE id = $6`,
        deleteShippingInfo: 'DELETE FROM shipping_info WHERE id = $1'
    }
    ,order_statuses:{
        getOrderStatuses: 'SELECT * FROM order_statuses',
        getOrderStatusesById: 'SELECT * FROM order_statuses WHERE id = $1',
        createOrderStatuses: `INSERT INTO order_statuses (status_name)
                    VALUES ($1)`,
        updateOrderStatuses: `UPDATE order_statuses
                     SET status_name = $1
                     WHERE id = $2`,
        deleteOrderStatuses: 'DELETE FROM order_statuses WHERE id = $1'
    }


}   