-- ReVibe Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  city TEXT,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  gender TEXT NOT NULL CHECK (gender IN ('mujer', 'hombre', 'unisex')),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

-- Insert default categories
INSERT INTO categories (gender, name, slug) VALUES
  ('mujer', 'Prendas Superiores', 'mujer-superiores'),
  ('mujer', 'Prendas Inferiores', 'mujer-inferiores'),
  ('mujer', 'Vestidos y Conjuntos', 'mujer-vestidos'),
  ('hombre', 'Prendas Superiores', 'hombre-superiores'),
  ('hombre', 'Prendas Inferiores', 'hombre-inferiores'),
  ('unisex', 'Accesorios', 'accesorios')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- GARMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS garments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES categories(id),
  brand TEXT,
  size TEXT,
  condition TEXT CHECK (condition IN ('nuevo_con_etiqueta', 'como_nuevo', 'buen_estado', 'uso_visible')),
  price NUMERIC(12, 0) NOT NULL,
  status TEXT NOT NULL DEFAULT 'en_revision' CHECK (status IN ('disponible', 'vendida', 'pausada', 'en_revision')),
  images TEXT[] DEFAULT '{}',
  images_processed BOOLEAN DEFAULT FALSE,
  ai_suggested_size TEXT,
  vibe TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  garment_id UUID REFERENCES garments(id) ON DELETE SET NULL,
  total_amount NUMERIC(12, 0) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'confirmada', 'enviada', 'entregada', 'cancelada')),
  shipping_address JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CART_ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  garment_id UUID REFERENCES garments(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (buyer_id, garment_id)
);

-- ============================================================
-- FAVORITES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  garment_id UUID REFERENCES garments(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, garment_id)
);

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_garments_updated_at
  BEFORE UPDATE ON garments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_read_all" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Garments
ALTER TABLE garments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "garments_read_available" ON garments
  FOR SELECT USING (status = 'disponible' OR seller_id = auth.uid());

CREATE POLICY "garments_insert_seller" ON garments
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "garments_update_seller" ON garments
  FOR UPDATE USING (auth.uid() = seller_id);

-- Admin overrides (using service role or custom claims)
-- For admin access, use Supabase service role key in server-side code

-- Orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_read_own" ON orders
  FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "orders_insert_buyer" ON orders
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Cart items
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cart_items_read_own" ON cart_items
  FOR SELECT USING (buyer_id = auth.uid());

CREATE POLICY "cart_items_insert_own" ON cart_items
  FOR INSERT WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "cart_items_delete_own" ON cart_items
  FOR DELETE USING (buyer_id = auth.uid());

-- Favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "favorites_read_own" ON favorites
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "favorites_insert_own" ON favorites
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "favorites_delete_own" ON favorites
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_garments_status ON garments(status);
CREATE INDEX IF NOT EXISTS idx_garments_seller ON garments(seller_id);
CREATE INDEX IF NOT EXISTS idx_garments_category ON garments(category_id);
CREATE INDEX IF NOT EXISTS idx_garments_price ON garments(price);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_cart_buyer ON cart_items(buyer_id);
