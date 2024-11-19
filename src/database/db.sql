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

CREATE TABLE   products (
   product_id   integer   NOT NULL   PRIMARY KEY,
   name   character varying(100)   NOT NULL,
   description   text,
   category   character varying(50),
   stock   integer,
   created_at   timestamp without time zone,
   updated_at   timestamp without time zone,
   photo   bytea,
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
    variation_id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
    quality VARCHAR(50),  
    quantity VARCHAR(50),  
    price_home NUMERIC(10,2),
    price_supermarket NUMERIC(10,2),
    price_restaurant NUMERIC(10,2),
    price_fruver NUMERIC(10,2),
    UNIQUE(product_id, quality, quantity)  
);

CREATE TABLE   products (
   product_id   integer   NOT NULL   PRIMARY KEY,
   name   character varying(100)   NOT NULL,
   description   text,
   category   character varying(50),
   stock   integer,
   created_at   timestamp without time zone,
   updated_at   timestamp without time zone,
   photo  bytea,
)
*/

