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
      INSERT INTO users (user_name, lastname, email, phone, city, address, neighborhood, user_password , user_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
    `,
    updateUsers: `
      UPDATE users
      SET 
        user_name = $1, 
        lastname = $2, 
        email = $3, 
        phone = $4, 
        city = $5, 
        address = $6, 
        neighborhood = $7, 
        user_password = $8, 
        user_type = $9
      WHERE id = $10
    `,
    updateUserStatus: `
      UPDATE users
      SET status_id = $2
      WHERE id = $1;
    `,
    deleteUsers: "DELETE FROM users WHERE id = $1",
    getUserByEmail: 'SELECT id FROM users WHERE email = $1',
    updateUserResetToken: `
      UPDATE users 
      SET reset_password_token = $1, reset_password_expires = to_timestamp($2) 
      WHERE id = $3
    `,
    verifyUserResetCode: `
      SELECT id 
      FROM users 
      WHERE email = $1 
      AND reset_password_token = $2 
      AND reset_password_expires > to_timestamp($3)
    `,
    updateUserPassword: `
      UPDATE users 
      SET user_password = $1, reset_password_token = NULL, reset_password_expires = NULL 
      WHERE id = $2
    `,
  },
  customerTypes: {
    getAllCustomerTypes: 'SELECT * FROM customer_types;',
    getCustomerTypeById: 'SELECT * FROM customer_types WHERE id = $1;',
    updateShippingCost: 'UPDATE customer_types SET shipping_cost = $1 WHERE id = $2;',
    updateAllShippingCosts: `
      UPDATE customer_types 
      SET shipping_cost = CASE 
        WHEN type_name = 'hogar' THEN CAST($1 AS numeric)
        WHEN type_name = 'fruver' THEN CAST($2 AS numeric)
        WHEN type_name = 'supermercado' THEN CAST($3 AS numeric)
        WHEN type_name = 'restaurante' THEN CAST($4 AS numeric)
      END
    `  
  }, 
  orders: {
    getOrders: `
      SELECT 
        o.id, 
        o.customer_id, 
        o.order_date, 
        o.status_id, 
        o.total, 
        o.requires_electronic_billing, 
        o.company_name, 
        o.nit 
      FROM orders o
    `,
    getOrdersById: `
      SELECT 
        o.id, 
        o.customer_id, 
        o.order_date, 
        o.status_id, 
        o.total, 
        o.requires_electronic_billing, 
        o.company_name, 
        o.nit,
        u.user_name AS customer_name, 
        u.email AS customer_email
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      WHERE o.id = $1
    `,
    getOrderItemsByOrderId: `
      SELECT 
        oi.order_id, 
        oi.product_id, 
        oi.quantity, 
        oi.price,
        p.name AS product_name, 
        p.description AS product_description
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.product_id
      WHERE oi.order_id = $1
    `,
    getShippingInfoByOrderId: `
      SELECT 
        si.shipping_method, 
        si.tracking_number, 
        si.estimated_delivery,
        si.actual_delivery, 
        si.shipping_status_id
      FROM shipping_info si
      WHERE si.order_id = $1
    `,
    createOrder: `
      INSERT INTO orders (
        customer_id, 
        order_date, 
        status_id, 
        total, 
        requires_electronic_billing, 
        company_name, 
        nit
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING id
    `,
    updateOrders: `
      UPDATE orders
      SET 
        customer_id = $1, 
        order_date = $2, 
        status_id = $3, 
        total = $4, 
        needs_electronic_invoice = $5, 
        company_name = $6, 
        nit = $7
      WHERE id = $8
    `,
    updateOrderStatus: `
      UPDATE orders
      SET status_id = $1
      WHERE id = $2
    `,
    deleteOrders: `
      DELETE FROM orders 
      WHERE id = $1
    `,
    createOrderItem: `
      INSERT INTO order_items (
        order_id, 
        product_id, 
        quantity, 
        price
      ) 
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
    deleteOrderStatuses: "DELETE FROM order_statuses WHERE id = $1",
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
    deleteShippingStatuses: "DELETE FROM shipping_statuses WHERE id = $1",
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
      SET 
        shipping_method = $1, 
        tracking_number = $2, 
        estimated_delivery = $3, 
        actual_delivery = $4, 
        shipping_status_id = $5
      WHERE id = $6
    `,
    deleteShippingInfo: "DELETE FROM shipping_info WHERE id = $1",
  },
  products: {
    getProducts: `
    SELECT 
      p.product_id, 
      p.name, 
      p.description, 
      p.category, 
      p.stock, 
      p.photo_url,
      v.variation_id,
      v.quality,
      v.quantity,
      v.price_home,
      v.price_supermarket,
      v.price_restaurant,
      v.price_fruver
    FROM products p
    LEFT JOIN product_variations v ON p.product_id = v.product_id
    ORDER BY p.created_at DESC
    LIMIT $2 OFFSET $1;
  `,
  getProductById: `
    SELECT 
      p.product_id, 
      p.name, 
      p.description, 
      p.category, 
      p.stock, 
      p.photo_url
    FROM products p
    WHERE p.product_id = $1;
  `,

  createProduct: `
    INSERT INTO products (name, description, category, stock, photo_url)
    VALUES ($1, $2, $3, $4, $5) RETURNING product_id;
  `,

  createProductVariation: `
    INSERT INTO product_variations (product_id, quality, quantity, price_home, price_supermarket, price_restaurant, price_fruver)
    VALUES ($1, $2, $3, $4, $5, $6, $7);
  `,

  updateProduct: `
    UPDATE products
    SET 
      name = $1, 
      description = $2, 
      category = $3, 
      stock = $4, 
      photo_url = COALESCE($5, photo_url), 
      updated_at = CURRENT_TIMESTAMP
    WHERE product_id = $6
    RETURNING product_id;
  `,

  getProductVariations: `
    SELECT 
      v.variation_id, 
      v.quality, 
      v.quantity, 
      v.price_home, 
      v.price_supermarket, 
      v.price_restaurant, 
      v.price_fruver
    FROM product_variations v
    WHERE v.product_id = $1;
  `,
  deleteProduct: `
    DELETE FROM products WHERE product_id = $1;
  `,
  deleteProductVariation: `
    DELETE FROM product_variations WHERE product_id = $1;
  `
}
};

