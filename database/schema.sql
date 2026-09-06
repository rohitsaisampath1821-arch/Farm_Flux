CREATE DATABASE IF NOT EXISTS kisanmitra;
USE kisanmitra;


-- =========================================================
-- 1. ADMINS
-- People who operate KisanMitra on behalf of farmers
-- =========================================================

CREATE TABLE admins (
    sid INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(15),

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


-- =========================================================
-- 2. FARMERS
-- Farmers managed by KisanMitra admins
-- =========================================================

CREATE TABLE farmers (
    sid INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),

    farm_name VARCHAR(150),

    location VARCHAR(255),
    village VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),

    farm_size DECIMAL(10,2),
    farm_size_unit VARCHAR(20) DEFAULT 'acres',

    status ENUM(
        'active',
        'inactive'
    ) DEFAULT 'active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


-- =========================================================
-- 3. BUYERS
-- Bulk buyers / retailers / restaurants / businesses
-- =========================================================

CREATE TABLE buyers (
    sid INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(15),

    business_name VARCHAR(150),

    business_type ENUM(
        'retailer',
        'wholesaler',
        'restaurant',
        'processor',
        'distributor',
        'other'
    ) DEFAULT 'other',

    location VARCHAR(255),
    district VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),

    status ENUM(
        'active',
        'inactive'
    ) DEFAULT 'active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


-- =========================================================
-- 4. PRODUCTS
-- Produce listed by farmers through admins
-- =========================================================

CREATE TABLE products (
    sid INT AUTO_INCREMENT PRIMARY KEY,

    farmer_sid INT NOT NULL,

    product_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,

    description TEXT,

    quantity DECIMAL(12,2) NOT NULL,
    unit VARCHAR(30) DEFAULT 'kg',

    price_per_unit DECIMAL(10,2) NOT NULL,

    harvest_date DATE,
    expiry_date DATE,

    quality_grade VARCHAR(30),

    image_url VARCHAR(500),

    status ENUM(
        'available',
        'reserved',
        'sold',
        'inactive'
    ) DEFAULT 'available',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_farmer
        FOREIGN KEY (farmer_sid)
        REFERENCES farmers(sid)
        ON DELETE CASCADE
);


-- =========================================================
-- 5. ORDERS
-- Orders placed by buyers
-- =========================================================

CREATE TABLE orders (
    sid INT AUTO_INCREMENT PRIMARY KEY,

    buyer_sid INT NOT NULL,

    total_amount DECIMAL(12,2) DEFAULT 0,

    status ENUM(
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled'
    ) DEFAULT 'pending',

    delivery_address VARCHAR(500),

    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_buyer
        FOREIGN KEY (buyer_sid)
        REFERENCES buyers(sid)
        ON DELETE CASCADE
);


-- =========================================================
-- 6. ORDER ITEMS
-- Individual products inside an order
-- =========================================================

CREATE TABLE order_items (
    sid INT AUTO_INCREMENT PRIMARY KEY,

    order_sid INT NOT NULL,
    product_sid INT NOT NULL,

    quantity DECIMAL(12,2) NOT NULL,

    price_per_unit DECIMAL(10,2) NOT NULL,

    subtotal DECIMAL(12,2) NOT NULL,

    CONSTRAINT fk_order_item_order
        FOREIGN KEY (order_sid)
        REFERENCES orders(sid)
        ON DELETE CASCADE,

    CONSTRAINT fk_order_item_product
        FOREIGN KEY (product_sid)
        REFERENCES products(sid)
        ON DELETE CASCADE
);


-- =========================================================
-- 7. MANDI PRICES
-- Market prices collected from mandi / government data
-- =========================================================

CREATE TABLE mandi_prices (
    sid INT AUTO_INCREMENT PRIMARY KEY,

    commodity VARCHAR(150) NOT NULL,
    variety VARCHAR(100),

    market_name VARCHAR(150) NOT NULL,

    district VARCHAR(100),
    state VARCHAR(100),

    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    modal_price DECIMAL(10,2),

    price_unit VARCHAR(30) DEFAULT 'quintal',

    price_date DATE NOT NULL,

    source VARCHAR(150),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- 8. DEMAND FORECASTS
-- AI/ML predicted demand
-- =========================================================

CREATE TABLE demand_forecasts (
    sid INT AUTO_INCREMENT PRIMARY KEY,

    commodity VARCHAR(150) NOT NULL,

    region VARCHAR(150) NOT NULL,

    forecast_date DATE NOT NULL,

    predicted_demand DECIMAL(12,2) NOT NULL,

    demand_unit VARCHAR(30) DEFAULT 'kg',

    confidence_score DECIMAL(5,2),

    model_name VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- 9. ROUTES
-- Logistics / delivery route information
-- =========================================================

CREATE TABLE routes (
    sid INT AUTO_INCREMENT PRIMARY KEY,

    order_sid INT,

    start_location VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,

    distance_km DECIMAL(10,2),

    estimated_time_minutes INT,

    estimated_cost DECIMAL(10,2),

    route_status ENUM(
        'planned',
        'optimized',
        'in_transit',
        'completed'
    ) DEFAULT 'planned',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_route_order
        FOREIGN KEY (order_sid)
        REFERENCES orders(sid)
        ON DELETE SET NULL
);

CREATE TABLE orders (
    sid INT AUTO_INCREMENT PRIMARY KEY,
    buyer_sid INT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    status ENUM('placed','confirmed','completed','cancelled')
        DEFAULT 'placed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_sid) REFERENCES buyers(sid)
);

REATE TABLE order_items (
    sid INT AUTO_INCREMENT PRIMARY KEY,
    order_sid INT NOT NULL,
    product_sid INT NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    farmer_sid INT NOT NULL,
    quantity DECIMAL(12,2) NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    item_total DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (order_sid) REFERENCES orders(sid) ON DELETE CASCADE
);
CREATE TABLE user_activity (
    sid INT AUTO_INCREMENT PRIMARY KEY,
    user_type ENUM('buyer', 'farmer', 'admin') NOT NULL,
    user_sid INT NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    reference_sid INT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);