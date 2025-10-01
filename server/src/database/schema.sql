-- Pizza Order Management System Database Schema
-- This file defines the complete database structure

-- Enable UUID extension for generating unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom ENUM type for order status
CREATE TYPE order_status AS ENUM (
    'Received',
    'Preparing', 
    'Ready',
    'En-Route',
    'Delivered'
);

-- Create custom ENUM type for subitem types
CREATE TYPE subitem_type AS ENUM (
    'pizza',
    'drink',
    'salad',
    'dessert',
    'appetizer',
    'other'
);

-- Orders table - stores main order information
CREATE TABLE orders (
    -- Primary key - unique identifier for each order
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Order details
    title VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    order_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    status order_status NOT NULL DEFAULT 'Received',
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- SubItems table - stores individual items within each order
CREATE TABLE sub_items (
    -- Primary key - unique identifier for each subitem
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign key - links to the parent order
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Item details
    title VARCHAR(255) NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    type subitem_type NOT NULL DEFAULT 'other',
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_time ON orders(order_time);
CREATE INDEX idx_orders_location ON orders(latitude, longitude);
CREATE INDEX idx_sub_items_order_id ON sub_items(order_id);
CREATE INDEX idx_sub_items_type ON sub_items(type);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at on record changes
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sub_items_updated_at 
    BEFORE UPDATE ON sub_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE orders IS 'Main orders table storing order information and location';
COMMENT ON TABLE sub_items IS 'Individual items within each order';
COMMENT ON COLUMN orders.latitude IS 'GPS latitude coordinate (decimal degrees)';
COMMENT ON COLUMN orders.longitude IS 'GPS longitude coordinate (decimal degrees)';
COMMENT ON COLUMN orders.status IS 'Current status of the order';
COMMENT ON COLUMN sub_items.amount IS 'Quantity of the item in the order';
COMMENT ON COLUMN sub_items.type IS 'Category of the subitem (pizza, drink, etc.)';
