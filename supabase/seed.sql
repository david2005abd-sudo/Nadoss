-- ============================================
-- NADOS — Demo/Test Seed
-- Run AFTER migrations. Safe for staging/demo tenants.
-- ============================================

-- Demo tenant (marker: is_demo via settings)
INSERT INTO public.tenants (name, slug, plan_id, is_active, settings)
SELECT
  'متجر تجريبي',
  'demo-store',
  id,
  TRUE,
  '{"is_demo": true}'::jsonb
FROM public.subscription_plans WHERE slug = 'starter'
ON CONFLICT (slug) DO NOTHING;

-- Demo categories
INSERT INTO public.categories (tenant_id, name, name_ar, slug, sort_order)
SELECT
  t.id, 'Clothing', 'ملابس', 'clothing', 1
FROM public.tenants t WHERE t.slug = 'demo-store'
ON CONFLICT (tenant_id, slug) DO NOTHING;

INSERT INTO public.categories (tenant_id, name, name_ar, slug, sort_order)
SELECT
  t.id, 'Electronics', 'إلكترونيات', 'electronics', 2
FROM public.tenants t WHERE t.slug = 'demo-store'
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- Demo products
INSERT INTO public.products (tenant_id, category_id, name, name_ar, description_ar, price_iqd, compare_price_iqd, stock, is_active, is_featured)
SELECT
  t.id,
  c.id,
  'Cotton T-Shirt',
  'تي شيرت قطني',
  'تي شيرت قطني 100% — متوفر بعدة ألوان',
  25000,
  35000,
  50,
  TRUE,
  TRUE
FROM public.tenants t
JOIN public.categories c ON c.tenant_id = t.id AND c.slug = 'clothing'
WHERE t.slug = 'demo-store'
LIMIT 1;

INSERT INTO public.products (tenant_id, category_id, name, name_ar, description_ar, price_iqd, stock, is_active)
SELECT
  t.id,
  c.id,
  'Wireless Earbuds',
  'سماعات لاسلكية',
  'سماعات بلوتوث بجودة صوت عالية',
  45000,
  30,
  TRUE
FROM public.tenants t
JOIN public.categories c ON c.tenant_id = t.id AND c.slug = 'electronics'
WHERE t.slug = 'demo-store'
LIMIT 1;

-- Platform knowledge base articles
INSERT INTO public.knowledge_articles (tenant_id, slug, title, summary, content, category, is_published, is_platform)
VALUES
(
  NULL,
  'getting-started-with-nados',
  'البداية مع نادوس',
  'دليل سريع لإعداد متجرك وبدء البيع',
  E'## مرحبًا بك في نادوس\n\nلبدء البيع:\n1. أضف منتجاتك من لوحة التحكم\n2. شارك رابط متجرك\n3. ابدأ باستقبال الطلبات\n\nسيظهر هنا دليل تفصيلي.',
  'getting_started',
  TRUE,
  TRUE
),
(
  NULL,
  'how-to-add-product',
  'كيف أضيف منتجًا جديدًا؟',
  'خطوات إضافة منتج مع الصور والأسعار',
  E'## إضافة منتج\n\n1. من لوحة التحكم → المنتجات → "منتج جديد"\n2. أدخل الاسم والسعر والمخزون\n3. ارفع الصور (حتى 5)\n4. اضغط "إنشاء المنتج"\n\n**نصيحة:** اكتب وصفًا تفصيليًا لزيادة المبيعات.',
  'products',
  TRUE,
  TRUE
)
ON CONFLICT DO NOTHING;
