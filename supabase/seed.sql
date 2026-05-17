-- ReVibe Seed Data
-- NOTE: Creating auth.users requires Supabase admin API.
-- Use the Supabase Dashboard > Authentication > Users to create test users,
-- then run this SQL to insert their profile data.
--
-- Test users to create in Supabase Auth Dashboard:
--   admin@revibe.co  / password: revibe2025  -> role: admin
--   vendedor@revibe.co / password: revibe2025 -> role: seller
--   comprador@revibe.co / password: revibe2025 -> role: buyer
--
-- After creating auth users, replace the UUIDs below with the actual user IDs.

-- ============================================================
-- CATEGORIES (already inserted by schema, but here for reference)
-- ============================================================
INSERT INTO categories (gender, name, slug) VALUES
  ('mujer', 'Prendas Superiores', 'mujer-superiores'),
  ('mujer', 'Prendas Inferiores', 'mujer-inferiores'),
  ('mujer', 'Vestidos y Conjuntos', 'mujer-vestidos'),
  ('hombre', 'Prendas Superiores', 'hombre-superiores'),
  ('hombre', 'Prendas Inferiores', 'hombre-inferiores'),
  ('unisex', 'Accesorios', 'accesorios')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SAMPLE GARMENTS
-- Replace seller_id values with actual UUIDs from your auth.users
-- ============================================================

-- Using placeholder UUIDs - replace with real ones after creating auth users
DO $$
DECLARE
  seller1_id UUID := '00000000-0000-0000-0000-000000000001';
  seller2_id UUID := '00000000-0000-0000-0000-000000000002';
BEGIN

-- Insert sample garments
INSERT INTO garments (seller_id, title, description, category_id, brand, size, condition, price, status, images, images_processed, vibe) VALUES
(
  seller1_id,
  'Blusa de seda vintage',
  'Hermosa blusa de seda con estampado floral. Perfecta para ocasiones especiales.',
  1, 'Zara', 'S', 'como_nuevo', 85000, 'disponible',
  ARRAY['https://images.unsplash.com/photo-1594938298603-c8148c4b4e3b?w=600&h=800&fit=crop'],
  true, 'Vintage'
),
(
  seller2_id,
  'Blazer negro estructurado',
  'Blazer clásico negro con botones dorados. Ideal para looks profesionales.',
  1, 'Mango', 'M', 'como_nuevo', 175000, 'disponible',
  ARRAY['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop'],
  true, 'Old Money'
),
(
  seller1_id,
  'Jeans de tiro alto mom fit',
  'Jeans de tiro alto en azul medio. Cintura elástica cómoda.',
  2, 'Levi''s', '38', 'buen_estado', 120000, 'disponible',
  ARRAY['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=800&fit=crop'],
  true, 'Casual'
),
(
  seller2_id,
  'Vestido midi floral bohemio',
  'Vestido midi con estampado floral en tonos tierra. Tela liviana perfecta.',
  3, 'Stradivarius', 'S', 'nuevo_con_etiqueta', 95000, 'disponible',
  ARRAY['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop'],
  true, 'Vintage'
),
(
  seller1_id,
  'Camisa Oxford de rayas',
  'Camisa Oxford clásica de rayas azul y blanco. Corte regular, 100% algodón.',
  4, 'Tommy Hilfiger', 'M', 'buen_estado', 90000, 'disponible',
  ARRAY['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=800&fit=crop'],
  true, 'Old Money'
),
(
  seller2_id,
  'Chaqueta denim vintage',
  'Chaqueta de jean azul oscuro con detalles desgastados. Un clásico atemporal.',
  4, 'Pull&Bear', 'L', 'buen_estado', 110000, 'disponible',
  ARRAY['https://images.unsplash.com/photo-1601333144130-8cbb312386b6?w=600&h=800&fit=crop'],
  true, 'Streetwear'
),
(
  seller1_id,
  'Pantalón chino beige',
  'Pantalón chino de tela liviana en color beige. Corte slim, cintura media.',
  5, 'Arturo Calle', '40', 'como_nuevo', 75000, 'disponible',
  ARRAY['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=800&fit=crop'],
  true, 'Minimalista'
),
(
  seller2_id,
  'Bolso de cuero café',
  'Bolso tote de cuero genuino en color café. Amplio, con bolsillos organizadores.',
  6, 'Vélez', 'Único', 'buen_estado', 280000, 'disponible',
  ARRAY['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop'],
  true, 'Old Money'
),
(
  seller1_id,
  'Sudadera oversize gris',
  'Sudadera oversize en gris con diseño minimalista. Tela gruesa tipo felpa.',
  4, 'Nike', 'L', 'buen_estado', 135000, 'disponible',
  ARRAY['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&h=800&fit=crop'],
  true, 'Streetwear'
),
(
  seller2_id,
  'Falda plisada midi vino',
  'Falda plisada de tela satinada en color vino. Tiro alto, cintura elástica.',
  2, 'Bershka', 'M', 'nuevo_con_etiqueta', 65000, 'disponible',
  ARRAY['https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&h=800&fit=crop'],
  true, 'Minimalista'
),
(
  seller1_id,
  'Zapatos Oxford negros',
  'Zapatos Oxford de cuero negro con suela de goma. Clásicos y cómodos.',
  6, 'Koaj', '40', 'buen_estado', 160000, 'disponible',
  ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=800&fit=crop'],
  true, 'Old Money'
),
(
  seller2_id,
  'Abrigo de lana camel',
  'Abrigo largo de lana en tono camel. Corte recto, cierre de botones.',
  1, 'Zara', 'S', 'como_nuevo', 350000, 'disponible',
  ARRAY['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&h=800&fit=crop'],
  true, 'Old Money'
);

END $$;
