export const queries = {
  users: {
    getUsers: "SELECT * FROM users",
    getUsersById: "SELECT * FROM users WHERE id = $1",
    getUserOrdersById: `
      SELECT o.id AS order_id, o.order_date, o.status_id, o.total
      FROM orders o
      WHERE o.customer_id = $1
    `,
    createUsers: `
      INSERT INTO users (user_name, lastname, email, phone, city, address, neighborhood, user_password, user_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
    `,
    updateUsers: `
      UPDATE users
      SET user_name = $1, lastname = $2, email = $3, phone = $4, city = $5, address = $6, neighborhood = $7, user_password = $8, user_type = $9
      WHERE id = $10
    `,
    updateUserStatus: `
      UPDATE users
      SET status_id = $2
      WHERE id = $1;
    `,
    deleteUsers: "DELETE FROM users WHERE id = $1",
    // Consulta para obtener el ID del usuario por correo electrónico
    getUserByEmail: 'SELECT id FROM users WHERE email = $1',
    updateUserResetToken: `
    UPDATE users 
    SET reset_password_token = $1, reset_password_expires = to_timestamp($2) 
    WHERE id = $3
  `,
    // Consulta para verificar el código de restablecimiento de contraseña
    verifyUserResetCode: `
    SELECT id 
    FROM users 
    WHERE email = $1 
    AND reset_password_token = $2 
    AND reset_password_expires > to_timestamp($3)
`,
    // Consulta para actualizar la contraseña del usuario y eliminar el código de restablecimiento
    updateUserPassword: `
      UPDATE users 
      SET user_password = $1, reset_password_token = NULL, reset_password_expires = NULL 
      WHERE id = $2
    `
  },
  orders: {
    getOrders: "SELECT * FROM orders",
    getOrdersById: `
      SELECT o.id, o.customer_id, o.order_date, o.status_id, o.total,
             u.user_name AS customer_name, u.email AS customer_email
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      WHERE o.id = $1
    `,
    getOrderItemsByOrderId: `
      SELECT oi.order_id, oi.product_id, oi.quantity, oi.price,
             p.name AS product_name, p.description AS product_description
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.product_id
      WHERE oi.order_id = $1
    `,
    getShippingInfoByOrderId: `
      SELECT si.shipping_method, si.tracking_number, si.estimated_delivery,
             si.actual_delivery, si.shipping_status_id
      FROM shipping_info si
      WHERE si.order_id = $1
    `,
    createOrder: `
      INSERT INTO orders (customer_id, order_date, status_id, total) 
      VALUES ($1, $2, $3, $4) RETURNING id
    `,
    updateOrders: `
      UPDATE orders
      SET customer_id = $1, order_date = $2, status_id = $3, total = $4
      WHERE id = $5
    `,
    updateOrderStatus: `
      UPDATE orders
      SET status_id = $1
      WHERE id = $2
    `,
    deleteOrders: "DELETE FROM orders WHERE id = $1",
    createOrderItem: `
      INSERT INTO order_items (order_id, product_id, quantity, price) 
      VALUES ($1, $2, $3, $4)
    `
  },
  order_statuses: {
    getOrderStatuses: "SELECT * FROM order_statuses",
    getOrderStatusesById: "SELECT * FROM order_statuses WHERE id = $1",
    createOrderStatuses: `
      INSERT INTO order_statuses (status_name)
      VALUES ($1) RETURNING id
    `,
    updateOrderStatuses: `
      UPDATE order_statuses
      SET status_name = $1
      WHERE id = $2
    `,
    deleteOrderStatuses: "DELETE FROM order_statuses WHERE id = $1"
  },
  shipping_statuses: {
    getShippingStatuses: "SELECT * FROM shipping_statuses",
    getShippingStatusesById: "SELECT * FROM shipping_statuses WHERE id = $1",
    createShippingStatuses: `
      INSERT INTO shipping_statuses (status_name)
      VALUES ($1) RETURNING id
    `,
    updateShippingStatuses: `
      UPDATE shipping_statuses
      SET status_name = $1
      WHERE id = $2
    `,
    deleteShippingStatuses: "DELETE FROM shipping_statuses WHERE id = $1"
  },
  shipping_info: {
    getShippingInfo: "SELECT * FROM shipping_info",
    getShippingInfoById: "SELECT * FROM shipping_info WHERE id = $1",
    createShippingInfo: `
      INSERT INTO shipping_info (shipping_method, tracking_number, estimated_delivery, actual_delivery, shipping_status_id, order_id)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING shipping_info.id
    `,
    updateShippingInfo: `
      UPDATE shipping_info
      SET shipping_method = $1, tracking_number = $2, estimated_delivery = $3, actual_delivery = $4, shipping_status_id = $5
      WHERE id = $6
    `,
    deleteShippingInfo: "DELETE FROM shipping_info WHERE id = $1"
  },
  products: {
    getProducts: "SELECT * FROM products LIMIT $1 OFFSET $2",
    getProductById: "SELECT * FROM products WHERE product_id = $1",
    createProduct: `
      INSERT INTO products (name, description, category, stock, photo, price_home, price_supermarket, price_restaurant, price_fruver) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING product_id
    `,
    updateProduct: `
      UPDATE products
      SET name = $1, description = $2, category = $3, stock = $4, photo = $5, price_home = $6, price_supermarket = $7, price_restaurant = $8, price_fruver = $9, updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $10
    `,
    deleteProduct: "DELETE FROM products WHERE product_id = $1"
  }
};