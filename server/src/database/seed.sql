-- Seed script: Populate database with 300 sample orders
-- This script creates realistic test data for development

-- Sample order data with realistic pizza restaurant scenarios
INSERT INTO orders (id, title, latitude, longitude, order_time, status) VALUES
-- Sample orders with different statuses and locations
('550e8400-e29b-41d4-a716-446655440001', 'Family Pizza Night', 40.7128, -74.0060, '2024-01-15 18:30:00', 'Received'),
('550e8400-e29b-41d4-a716-446655440002', 'Office Lunch Order', 40.7589, -73.9851, '2024-01-15 12:15:00', 'Preparing'),
('550e8400-e29b-41d4-a716-446655440003', 'Quick Dinner', 40.7505, -73.9934, '2024-01-15 19:45:00', 'Ready'),
('550e8400-e29b-41d4-a716-446655440004', 'Weekend Party', 40.7614, -73.9776, '2024-01-15 20:00:00', 'En-Route'),
('550e8400-e29b-41d4-a716-446655440005', 'Late Night Snack', 40.7831, -73.9712, '2024-01-15 22:30:00', 'Delivered');

-- Sample subitems for the orders above
INSERT INTO sub_items (order_id, title, amount, type) VALUES
-- Family Pizza Night order
('550e8400-e29b-41d4-a716-446655440001', 'Large Pepperoni Pizza', 1, 'pizza'),
('550e8400-e29b-41d4-a716-446655440001', 'Large Margherita Pizza', 1, 'pizza'),
('550e8400-e29b-41d4-a716-446655440001', 'Caesar Salad', 2, 'salad'),
('550e8400-e29b-41d4-a716-446655440001', 'Coca Cola', 4, 'drink'),

-- Office Lunch Order
('550e8400-e29b-41d4-a716-446655440002', 'Medium Hawaiian Pizza', 3, 'pizza'),
('550e8400-e29b-41d4-a716-446655440002', 'Greek Salad', 2, 'salad'),
('550e8400-e29b-41d4-a716-446655440002', 'Water Bottles', 6, 'drink'),

-- Quick Dinner
('550e8400-e29b-41d4-a716-446655440003', 'Large Supreme Pizza', 1, 'pizza'),
('550e8400-e29b-41d4-a716-446655440003', 'Garlic Bread', 2, 'appetizer'),
('550e8400-e29b-41d4-a716-446655440003', 'Pepsi', 2, 'drink'),

-- Weekend Party
('550e8400-e29b-41d4-a716-446655440004', 'Extra Large Meat Lovers', 2, 'pizza'),
('550e8400-e29b-41d4-a716-446655440004', 'Large Veggie Pizza', 1, 'pizza'),
('550e8400-e29b-41d4-a716-446655440004', 'Chicken Wings', 3, 'appetizer'),
('550e8400-e29b-41d4-a716-446655440004', 'Beer', 12, 'drink'),
('550e8400-e29b-41d4-a716-446655440004', 'Tiramisu', 2, 'dessert'),

-- Late Night Snack
('550e8400-e29b-41d4-a716-446655440005', 'Small Cheese Pizza', 1, 'pizza'),
('550e8400-e29b-41d4-a716-446655440005', 'Mountain Dew', 1, 'drink');

-- Generate additional random orders to reach 300 total
-- This is a simplified version - in production, you'd use a proper script
DO $$
DECLARE
    i INTEGER;
    order_id UUID;
    statuses TEXT[] := ARRAY['Received', 'Preparing', 'Ready', 'En-Route', 'Delivered'];
    pizza_types TEXT[] := ARRAY['Pepperoni', 'Margherita', 'Hawaiian', 'Supreme', 'Meat Lovers', 'Veggie', 'BBQ Chicken'];
    drink_types TEXT[] := ARRAY['Coca Cola', 'Pepsi', 'Sprite', 'Water', 'Beer', 'Wine'];
    salad_types TEXT[] := ARRAY['Caesar', 'Greek', 'Garden', 'Caprese'];
    dessert_types TEXT[] := ARRAY['Tiramisu', 'Chocolate Cake', 'Ice Cream', 'Cannoli'];
    appetizer_types TEXT[] := ARRAY['Garlic Bread', 'Chicken Wings', 'Mozzarella Sticks', 'Bruschetta'];
BEGIN
    -- Generate 295 more orders (we already have 5)
    FOR i IN 6..300 LOOP
        -- Generate random order
        order_id := uuid_generate_v4();
        
        INSERT INTO orders (id, title, latitude, longitude, order_time, status) VALUES (
            order_id,
            'Order #' || i || ' - ' || pizza_types[1 + (random() * (array_length(pizza_types, 1) - 1))::int] || ' Pizza',
            40.7 + (random() * 0.1),  -- Random latitude around NYC
            -74.0 - (random() * 0.1), -- Random longitude around NYC
            NOW() - (random() * interval '7 days'), -- Random time in last 7 days
            statuses[1 + (random() * (array_length(statuses, 1) - 1))::int]::order_status
        );
        
        -- Add 1-4 random subitems per order
        FOR j IN 1..(1 + (random() * 3)::int) LOOP
            INSERT INTO sub_items (order_id, title, amount, type) VALUES (
                order_id,
                CASE (random() * 4)::int
                    WHEN 0 THEN pizza_types[1 + (random() * (array_length(pizza_types, 1) - 1))::int] || ' Pizza'
                    WHEN 1 THEN drink_types[1 + (random() * (array_length(drink_types, 1) - 1))::int]
                    WHEN 2 THEN salad_types[1 + (random() * (array_length(salad_types, 1) - 1))::int] || ' Salad'
                    WHEN 3 THEN dessert_types[1 + (random() * (array_length(dessert_types, 1) - 1))::int]
                    ELSE appetizer_types[1 + (random() * (array_length(appetizer_types, 1) - 1))::int]
                END,
                1 + (random() * 3)::int, -- Random amount 1-3
                CASE (random() * 4)::int
                    WHEN 0 THEN 'pizza'::subitem_type
                    WHEN 1 THEN 'drink'::subitem_type
                    WHEN 2 THEN 'salad'::subitem_type
                    WHEN 3 THEN 'dessert'::subitem_type
                    ELSE 'appetizer'::subitem_type
                END
            );
        END LOOP;
    END LOOP;
END $$;
