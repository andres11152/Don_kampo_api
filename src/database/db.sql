/*
CREATE TABLE users (
   id   uuid   NOT NULL   PRIMARY KEY,
   user_name   character varying(100)   NOT NULL,
   lastname   character varying(100)   NOT NULL,
   email   character varying(100)   NOT NULL   UNIQUE,
   phone   character varying(20),
   city   character varying(100),
   address   character varying(255),
   neighborhood   character varying(100),
   user_password   character varying(255)   NOT NULL,
   user_type   character varying(50)   NOT NULL,
   status_id   integer   REFERENCES user_statuses(id) ON DELETE SET NULL,
   reset_password_token   character varying(255),
   reset_password_expires   timestamp with time zone
)

CREATE TABLE user_statuses (
   id   integer   NOT NULL   PRIMARY KEY,
   status_id   character varying(50)   NOT NULL
)

CREATE TABLE shipping_info (
   id   integer   NOT NULL   PRIMARY KEY,
   shipping_method   character varying(100)   NOT NULL,
   tracking_number   character varying(100),
   estimated_delivery   timestamp without time zone,
   actual_delivery   timestamp without time zone,
   shipping_status_id   integer   REFERENCES shipping_statuses(id) ON DELETE SET NULL,
   order_id   integer   REFERENCES orders(id) ON DELETE CASCADE,
   order_id   integer   REFERENCES orders(id) ON DELETE CASCADE
)

CREATE TABLE shipping_statuses (
   id   integer   NOT NULL   PRIMARY KEY,
   status_name   character varying(50)   NOT NULL
)

CREATE TABLE products (
   product_id   integer   NOT NULL   PRIMARY KEY,
   name   character varying(100)   NOT NULL,
   description   text,
   category   character varying(50),
   stock   integer,
   created_at   timestamp without time zone,
   updated_at   timestamp without time zone,
   photo_url   text,
   active   boolean
)

CREATE TABLE orders (
   id   integer   NOT NULL   PRIMARY KEY,
   customer_id   uuid,
   order_date   timestamp without time zone,
   status_id   integer   REFERENCES order_statuses(id) ON DELETE SET NULL,
   total   numeric(10,2)   NOT NULL
)

CREATE TABLE order_statuses (
   id   integer   NOT NULL   PRIMARY KEY,
   status_name   character varying(50)   NOT NULL
)

CREATE TABLE order_items (
   id   integer   NOT NULL   PRIMARY KEY,
   order_id   integer   REFERENCES orders(id) ON DELETE CASCADE,
   product_id   integer   REFERENCES products(product_id) ON DELETE CASCADE,
   quantity   integer   NOT NULL,
   price   numeric(10,2)   NOT NULL
)

CREATE TABLE product_variations (
   variation_id   integer   NOT NULL   PRIMARY KEY,
   product_id   integer   REFERENCES products(product_id) ON DELETE CASCADE,
   quality   character varying(50),
   quantity   character varying(50),
   price_home   integer,
   price_supermarket   integer,
   price_restaurant   integer,
   price_fruver   integer,
   active   boolean
)


SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';


ALTER TABLE orders ADD COLUMN user_type VARCHAR(255);
*/

-- CREATE TABLE minimum_orders (
--     id SERIAL PRIMARY KEY,
--     customer_type VARCHAR(50) NOT NULL, -- Tipo de cliente (hogar, restaurante, etc.)
--     minimum_order_amount NUMERIC(10, 2) NOT NULL, -- Pedido mínimo en valor
--     created_at TIMESTAMP DEFAULT NOW(), -- Fecha de creación
--     updated_at TIMESTAMP DEFAULT NOW() -- Fecha de última actualización
-- );
