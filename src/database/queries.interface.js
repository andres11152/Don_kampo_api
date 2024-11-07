export const queries ={

    users:{
        getUsers: 'SELECT * FROM users',
        getUsersById: 'SELECT * FROM users WHERE id = $1',
        createUsers: `INSERT INTO users (user_name, lastname, email, phone, city, address, neighborhood, user_password, user_type)
                      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        updateUsers: `UPDATE users
                      SET user_name = $1, lastname = $2, email = $3, phone = $4, city = $5, address = $6, neighborhood = $7, user_password = $8, user_type = $9
                      WHERE id = $10`,
        deleteUsers: 'DELETE FROM users WHERE id = $1'
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