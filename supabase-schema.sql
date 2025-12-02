-- =====================================================
-- VASTOR - Kurýrní služba Praha
-- SQL schéma pro Supabase
-- =====================================================

-- Tabulka kurýrů
CREATE TABLE couriers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    vehicle_type VARCHAR(20) NOT NULL CHECK (vehicle_type IN ('bike', 'scooter', 'car')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'inactive')),
    documents_verified BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 5.00,
    total_deliveries INTEGER DEFAULT 0,
    earnings_total DECIMAL(10,2) DEFAULT 0.00,
    
    -- Indexy
    CONSTRAINT couriers_rating_check CHECK (rating >= 0 AND rating <= 5)
);

-- Tabulka objednávek
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    customer_name VARCHAR(200) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    pickup_address TEXT NOT NULL,
    pickup_notes TEXT,
    delivery_address TEXT NOT NULL,
    delivery_notes TEXT,
    package_type VARCHAR(20) NOT NULL CHECK (package_type IN ('document', 'small_package', 'medium_package', 'large_package')),
    service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('standard', 'express', 'premium')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled')),
    price DECIMAL(10,2) NOT NULL,
    courier_id UUID REFERENCES couriers(id),
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    
    -- Indexy
    CONSTRAINT orders_price_check CHECK (price >= 0)
);

-- Indexy pro rychlejší dotazy
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_courier_id ON orders(courier_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_couriers_status ON couriers(status);
CREATE INDEX idx_couriers_email ON couriers(email);

-- Row Level Security (RLS)
ALTER TABLE couriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Politiky pro veřejný přístup (pro demo)
-- V produkci by se měly nastavit přísnější pravidla
CREATE POLICY "Allow public read access to couriers" ON couriers FOR SELECT USING (true);
CREATE POLICY "Allow public insert to couriers" ON couriers FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert to orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to orders" ON orders FOR UPDATE USING (true);

-- Funkce pro aktualizaci statistik kurýra po doručení
CREATE OR REPLACE FUNCTION update_courier_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        UPDATE couriers
        SET 
            total_deliveries = total_deliveries + 1,
            earnings_total = earnings_total + NEW.price
        WHERE id = NEW.courier_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pro automatickou aktualizaci statistik
CREATE TRIGGER trigger_update_courier_stats
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_courier_stats();

-- Ukázkové data pro testování
INSERT INTO couriers (first_name, last_name, email, phone, vehicle_type, status, documents_verified, rating, total_deliveries, earnings_total)
VALUES 
    ('Jan', 'Novák', 'jan.novak@email.cz', '+420123456789', 'bike', 'active', true, 4.9, 234, 58500),
    ('Petr', 'Svoboda', 'petr.svoboda@email.cz', '+420987654321', 'scooter', 'active', true, 4.8, 189, 47250),
    ('Marie', 'Černá', 'marie.cerna@email.cz', '+420111222333', 'car', 'pending', false, 5.0, 0, 0);
