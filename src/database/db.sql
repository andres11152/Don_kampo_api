/*-- Crear extensión uuid-ossp si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create table for shipping statuses
CREATE TABLE shipping_statuses (
    id SERIAL PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL
);

-- Create table for shipping information
CREATE TABLE shipping_info (
    id SERIAL PRIMARY KEY,
    shipping_method VARCHAR(100) NOT NULL,
    tracking_number VARCHAR(100),
    estimated_delivery TIMESTAMP,
    actual_delivery TIMESTAMP,
    shipping_status_id INTEGER REFERENCES shipping_statuses(id) ON DELETE SET NULL
);

-- Create table for order statuses
CREATE TABLE order_statuses (
    id SERIAL PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL
);


-- Create table for orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_id INTEGER REFERENCES order_statuses(id) ON DELETE SET NULL,
    total DECIMAL(10, 2) NOT NULL
);

-- Create table for companies
CREATE TABLE companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    neighborhood VARCHAR(100),
    locality VARCHAR(100),
    shipping_info_id INTEGER REFERENCES shipping_info(id) ON DELETE SET NULL,
    company_status INTEGER,
    company_password VARCHAR(255)
);

-- Create table for orders_pending
CREATE TABLE orders_pending (
    id SERIAL PRIMARY KEY,
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_id INTEGER REFERENCES order_statuses(id) ON DELETE SET NULL,
    total DECIMAL(10, 2) NOT NULL
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  stock INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prices (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL,
  customer_type VARCHAR(50) NOT NULL, 
  price NUMERIC(10, 2) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create table for users
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,  
    lastname VARCHAR(100) NOT NULL,  
    email VARCHAR(100) UNIQUE NOT NULL,  
    phone VARCHAR(20),  
    city VARCHAR(100),  -- Nuevo campo para la ciudad
    address VARCHAR(255),  -- Nuevo campo para la dirección
    neighborhood VARCHAR(100),  -- Nuevo campo para el vecindario
    user_password VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL  
);
*/
DELETE FROM users WHERE id = 'a759e58a-2a31-41a1-90c5-b85f7a0fcc22';


