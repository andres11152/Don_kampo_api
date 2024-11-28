"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.queries = void 0;
var queries = exports.queries = {
  users: {
    getUsers: "SELECT * FROM users",
    getUsersById: "SELECT * FROM users WHERE id = $1",
    getUserOrdersById: "\n      SELECT o.id AS order_id, o.order_date, o.status_id, o.total\n      FROM orders o\n      WHERE o.customer_id = $1\n    ",
    createUsers: "\n      INSERT INTO users (user_name, lastname, email, phone, city, address, neighborhood, user_password , user_type)\n      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id\n    ",
    updateUsers: "\n      UPDATE users\n      SET \n        user_name = $1, \n        lastname = $2, \n        email = $3, \n        phone = $4, \n        city = $5, \n        address = $6, \n        neighborhood = $7, \n        user_password = $8, \n        user_type = $9\n      WHERE id = $10\n    ",
    updateUserStatus: "\n      UPDATE users\n      SET status_id = $2\n      WHERE id = $1;\n    ",
    deleteUsers: "DELETE FROM users WHERE id = $1",
    getUserByEmail: 'SELECT id FROM users WHERE email = $1',
    updateUserResetToken: "\n      UPDATE users \n      SET reset_password_token = $1, reset_password_expires = to_timestamp($2) \n      WHERE id = $3\n    ",
    verifyUserResetCode: "\n      SELECT id \n      FROM users \n      WHERE email = $1 \n      AND reset_password_token = $2 \n      AND reset_password_expires > to_timestamp($3)\n    ",
    updateUserPassword: "\n      UPDATE users \n      SET user_password = $1, reset_password_token = NULL, reset_password_expires = NULL \n      WHERE id = $2\n    "
  },
  customerTypes: {
    getAllCustomerTypes: "\n    SELECT * FROM customer_types;\n  ",
    updateAllShippingCosts: "\n   UPDATE customer_types\n    SET shipping_cost = CASE \n      WHEN type_name = 'Hogar' THEN $1::numeric\n      WHEN type_name = 'Fruver' THEN $2::numeric\n      WHEN type_name = 'Supermercado' THEN $3::numeric\n      WHEN type_name = 'Restaurante' THEN $4::numeric\n  END;\n  "
  },
  orders: {
    getOrders: "\n      SELECT \n        o.id, \n        o.customer_id, \n        o.order_date, \n        o.status_id, \n        o.total, \n        o.requires_electronic_billing, \n        o.company_name, \n        o.nit \n      FROM orders o\n    ",
    getOrdersById: "\n      SELECT \n        o.id, \n        o.customer_id, \n        o.order_date, \n        o.status_id, \n        o.total, \n        o.requires_electronic_billing, \n        o.company_name, \n        o.nit,\n        u.user_name AS customer_name, \n        u.email AS customer_email\n      FROM orders o\n      LEFT JOIN users u ON o.customer_id = u.id\n      WHERE o.id = $1\n    ",
    getOrderItemsByOrderId: "\n      SELECT \n        oi.order_id, \n        oi.product_id, \n        oi.quantity, \n        oi.price,\n        p.name AS product_name, \n        p.description AS product_description\n      FROM order_items oi\n      LEFT JOIN products p ON oi.product_id = p.product_id\n      WHERE oi.order_id = $1\n    ",
    getShippingInfoByOrderId: "\n      SELECT \n        si.shipping_method, \n        si.tracking_number, \n        si.estimated_delivery,\n        si.actual_delivery, \n        si.shipping_status_id\n      FROM shipping_info si\n      WHERE si.order_id = $1\n    ",
    createOrder: "\n      INSERT INTO orders (\n        customer_id, \n        order_date, \n        status_id, \n        total, \n        requires_electronic_billing, \n        company_name, \n        nit\n      ) \n      VALUES ($1, $2, $3, $4, $5, $6, $7) \n      RETURNING id\n    ",
    updateOrders: "\n      UPDATE orders\n      SET \n        customer_id = $1, \n        order_date = $2, \n        status_id = $3, \n        total = $4, \n        needs_electronic_invoice = $5, \n        company_name = $6, \n        nit = $7\n      WHERE id = $8\n    ",
    updateOrderStatus: "\n      UPDATE orders\n      SET status_id = $1\n      WHERE id = $2\n    ",
    deleteOrders: "\n      DELETE FROM orders \n      WHERE id = $1\n    ",
    createOrderItem: "\n      INSERT INTO order_items (\n        order_id, \n        product_id, \n        quantity, \n        price\n      ) \n      VALUES ($1, $2, $3, $4)\n    "
  },
  order_statuses: {
    getOrderStatuses: "SELECT * FROM order_statuses",
    getOrderStatusesById: "SELECT * FROM order_statuses WHERE id = $1",
    createOrderStatuses: "\n      INSERT INTO order_statuses (status_name)\n      VALUES ($1) RETURNING id\n    ",
    updateOrderStatuses: "\n      UPDATE order_statuses\n      SET status_name = $1\n      WHERE id = $2\n    ",
    deleteOrderStatuses: "DELETE FROM order_statuses WHERE id = $1"
  },
  shipping_statuses: {
    getShippingStatuses: "SELECT * FROM shipping_statuses",
    getShippingStatusesById: "SELECT * FROM shipping_statuses WHERE id = $1",
    createShippingStatuses: "\n      INSERT INTO shipping_statuses (status_name)\n      VALUES ($1) RETURNING id\n    ",
    updateShippingStatuses: "\n      UPDATE shipping_statuses\n      SET status_name = $1\n      WHERE id = $2\n    ",
    deleteShippingStatuses: "DELETE FROM shipping_statuses WHERE id = $1"
  },
  shipping_info: {
    getShippingInfo: "SELECT * FROM shipping_info",
    getShippingInfoById: "SELECT * FROM shipping_info WHERE id = $1",
    createShippingInfo: "\n      INSERT INTO shipping_info (shipping_method, tracking_number, estimated_delivery, actual_delivery, shipping_status_id, order_id)\n      VALUES ($1, $2, $3, $4, $5, $6) RETURNING shipping_info.id\n    ",
    updateShippingInfo: "\n      UPDATE shipping_info\n      SET \n        shipping_method = $1, \n        tracking_number = $2, \n        estimated_delivery = $3, \n        actual_delivery = $4, \n        shipping_status_id = $5\n      WHERE id = $6\n    ",
    deleteShippingInfo: "DELETE FROM shipping_info WHERE id = $1"
  },
  products: {
    getProducts: "\n    SELECT \n      p.product_id, \n      p.name, \n      p.description, \n      p.category, \n      p.stock, \n      p.photo_url,\n      v.variation_id,\n      v.quality,\n      v.quantity,\n      v.price_home,\n      v.price_supermarket,\n      v.price_restaurant,\n      v.price_fruver\n    FROM products p\n    LEFT JOIN product_variations v ON p.product_id = v.product_id\n    ORDER BY p.created_at DESC\n    LIMIT $2 OFFSET $1;\n  ",
    getProductById: "\n    SELECT \n      p.product_id, \n      p.name, \n      p.description, \n      p.category, \n      p.stock, \n      p.photo_url\n    FROM products p\n    WHERE p.product_id = $1;\n  ",
    createProduct: "\n    INSERT INTO products (name, description, category, stock, photo_url)\n    VALUES ($1, $2, $3, $4, $5) RETURNING product_id;\n  ",
    createProductVariation: "\n    INSERT INTO product_variations (product_id, quality, quantity, price_home, price_supermarket, price_restaurant, price_fruver)\n    VALUES ($1, $2, $3, $4, $5, $6, $7);\n  ",
    updateProduct: "\n    UPDATE products\n    SET \n      name = $1, \n      description = $2, \n      category = $3, \n      stock = $4, \n      photo_url = COALESCE($5, photo_url), \n      updated_at = CURRENT_TIMESTAMP\n    WHERE product_id = $6\n    RETURNING product_id;\n  ",
    getProductVariations: "\n    SELECT \n      v.variation_id, \n      v.quality, \n      v.quantity, \n      v.price_home, \n      v.price_supermarket, \n      v.price_restaurant, \n      v.price_fruver\n    FROM product_variations v\n    WHERE v.product_id = $1;\n  ",
    deleteProduct: "\n    DELETE FROM products WHERE product_id = $1;\n  ",
    deleteProductVariation: "\n    DELETE FROM product_variations WHERE product_id = $1;\n  "
  }
};