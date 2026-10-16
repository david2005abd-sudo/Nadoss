-- ============================================
-- NADOS — Seed Data
-- ============================================

-- 18 Iraqi Governorates
INSERT INTO public.iraq_governorates (name_ar, name_en, code, delivery_fee_iqd) VALUES
('بغداد', 'Baghdad', 'BGW', 5000),
('البصرة', 'Basra', 'BSR', 7500),
('النجف', 'Najaf', 'NJF', 6500),
('كربلاء', 'Karbala', 'KBL', 6500),
('أربيل', 'Erbil', 'ERB', 8000),
('السليمانية', 'Sulaymaniyah', 'SLM', 8000),
('دهوك', 'Duhok', 'DHK', 8500),
('كركوك', 'Kirkuk', 'KRK', 7500),
('ديالى', 'Diyala', 'DYL', 7000),
('الأنبار', 'Anbar', 'ANB', 8000),
('بابل', 'Babil', 'BBL', 6500),
('القادسية', 'Qadisiyyah', 'QAD', 6500),
('ميسان', 'Maysan', 'MYN', 8000),
('المثنى', 'Muthanna', 'MTH', 8500),
('واسط', 'Wasit', 'WST', 7000),
('ذي قار', 'Dhi Qar', 'DQR', 7500),
('صلاح الدين', 'Saladin', 'SLD', 7500),
('نينوى', 'Nineveh', 'NNV', 7500);

-- Delivery Companies
INSERT INTO public.delivery_companies (name_ar, name_en, slug, api_type, supports_cod, coverage_governorates, sort_order) VALUES
('هاي إكسبريس', 'Hi Express', 'hi-express', 'direct', TRUE, '{1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18}', 1),
('جالينا إكسبريس', 'Galina Express', 'galina', 'direct', TRUE, '{1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18}', 2),
('بوكسي', 'Boxy', 'boxy', 'aggregator', TRUE, '{1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18}', 3),
('المصطفى', 'Al-Mustafa', 'al-mustafa', 'manual', TRUE, '{1,2,3,4,11,12}', 4),
('الفارس', 'Al-Faris', 'al-faris', 'manual', TRUE, '{1,3,4,11,12}', 5),
('أريج', 'Areej', 'areej', 'manual', FALSE, '{1,5,6,7}', 6),
('روكيت', 'Rocket', 'rocket', 'direct', FALSE, '{1,5,6,7,8}', 7);

-- Subscription Plans
INSERT INTO public.subscription_plans (name, name_ar, slug, price_usd, max_products, max_orders_per_month, max_ai_messages, features, sort_order) VALUES
('Free', 'مجاني', 'free', 0, 10, 50, 100,
 '["متجر إلكتروني", "10 منتجات", "50 طلب/شهر", "100 رسالة AI", "دعم فني أساسي"]'::jsonb, 1),
('Starter', 'المبتدئ', 'starter', 19, 100, 500, 1000,
 '["كل ميزات المجاني", "100 منتج", "500 طلب/شهر", "1000 رسالة AI", "ربط شركة توصيل واحدة", "تقارير أساسية"]'::jsonb, 2),
('Pro', 'الاحترافي', 'pro', 49, 1000, 5000, 10000,
 '["كل ميزات المبتدئ", "1000 منتج", "5000 طلب/شهر", "10000 رسالة AI", "ربط 3 شركات توصيل", "ربط بوابات دفع", "تقارير متقدمة", "بوت واتساب"]'::jsonb, 3),
('Enterprise', 'المؤسسات', 'enterprise', 149, 999999, 999999, 999999,
 '["كل ميزات الاحترافي", "منتجات غير محدودة", "طلبات غير محدودة", "رسائل AI غير محدودة", "ربط غير محدود", "API مخصص", "مدير حساب", "SLA 99.9%"]'::jsonb, 4);
