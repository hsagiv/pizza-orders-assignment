-- Pizza Order Management System Database Schema
-- This file creates the necessary tables for the application

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    "orderTime" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'Received',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sub_items table
CREATE TABLE IF NOT EXISTS sub_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    amount INTEGER NOT NULL,
    type VARCHAR(50) DEFAULT 'other',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("orderId") REFERENCES orders(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_time ON orders("orderTime");
CREATE INDEX IF NOT EXISTS idx_orders_location ON orders(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_sub_items_order_id ON sub_items("orderId");
CREATE INDEX IF NOT EXISTS idx_sub_items_type ON sub_items(type);

-- Insert some sample data
INSERT INTO orders (id, title, latitude, longitude, status) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Margherita Pizza Order', 40.7128, -74.0060, 'Received'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Pepperoni Pizza Order', 40.7589, -73.9851, 'Preparing'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Vegetarian Pizza Order', 40.7505, -73.9934, 'Ready')
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_items (id, "orderId", title, amount, type) VALUES 
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Margherita Pizza', 2, 'pizza'),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Coca Cola', 1, 'drink'),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Pepperoni Pizza', 1, 'pizza'),
    ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'Vegetarian Pizza', 1, 'pizza'),
    ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 'Caesar Salad', 1, 'salad')
ON CONFLICT (id) DO NOTHING;
