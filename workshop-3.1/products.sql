-- Create table
CREATE TABLE products (
    product_id VARCHAR(10) PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50) NOT NULL,
    average_rating DECIMAL(2, 1)
);

-- Insert product
INSERT INTO products (product_id, product_name, category, subcategory, average_rating) VALUES
('PROD001', 'Premium Bluetooth Speaker', 'Electronics', 'Audio', 4.7),
('PROD002', 'Smart Fitness Watch Gen 5', 'Electronics', 'Wearables', 4.5),
('PROD003', 'Organic Arabica Coffee Beans (250g)', 'Groceries', 'Beverages', 4.9),
('PROD004', 'Non-Stick Ceramic Cookware Set (5 pcs)', 'Home & Kitchen', 'Cookware', 4.3),
('PROD005', 'Ultra HD 4K Action Camera', 'Electronics', 'Cameras', 4.6),
('PROD006', 'Hydrating Face Serum with Hyaluronic Acid', 'Beauty', 'Skincare', 4.8),
('PROD007', 'Men''s Classic Cotton Polo Shirt', 'Fashion', 'Shirts', 4.2),
('PROD008', 'Yoga Mat Extra Thick Non-Slip', 'Sports & Outdoors', 'Exercise & Fitness', 4.4);