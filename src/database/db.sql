-- Crear extensión uuid-ossp si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table

CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_name VARCHAR(20) NOT NULL,
    first_name VARCHAR(100) NOT NULL,  
    last_name VARCHAR(100) NOT NULL,   
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),           
    city VARCHAR(100),                 
    address VARCHAR(50),                   
    neighborhood VARCHAR(100),        
    locality VARCHAR(100),            
    user_status INTEGER,
    user_password VARCHAR(255)
);
-- Create table for order statuses
CREATE TABLE order_statuses (
    id SERIAL PRIMARY KEY,              
    status_name VARCHAR(50) NOT NULL   
);
-- Create table for orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,  -- Foreign key to users table
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_id INTEGER REFERENCES order_statuses(id) ON DELETE SET NULL,  -- Foreign key to order_statuses table
    total DECIMAL(10, 2) NOT NULL
);

------ EMPRESA --------
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
    shipping_info_id INTEGER REFERENCES shipping_info(id) ON DELETE SET NULL,  -- Foreign key to shipping_info
    company_status INTEGER,
    company_password VARCHAR(255)
);

-- Create table for shipping information
CREATE TABLE shipping_info (
    id SERIAL PRIMARY KEY,
    shipping_method VARCHAR(100) NOT NULL,
    tracking_number VARCHAR(100),
    estimated_delivery TIMESTAMP,
    actual_delivery TIMESTAMP,
    shipping_status_id INTEGER REFERENCES shipping_statuses(id) ON DELETE SET NULL  -- Foreign key to shipping_statuses
);

-- Create table for shipping statuses
CREATE TABLE shipping_statuses (
    id SERIAL PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL
);




