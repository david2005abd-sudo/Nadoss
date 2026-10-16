-- ============================================
-- Storage bucket for product images + tenant logos
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tenant-assets',
  'tenant-assets',
  TRUE,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: Public read (storefront needs images without auth)
CREATE POLICY "tenant_assets_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'tenant-assets');

-- RLS: Authenticated users can upload to their tenant folder
-- Path convention: {tenant_id}/products/{uuid}.{ext}
CREATE POLICY "tenant_assets_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'tenant-assets'
    AND (storage.foldername(name))[1] = (SELECT public.get_tenant_id())::TEXT
  );

CREATE POLICY "tenant_assets_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'tenant-assets'
    AND (storage.foldername(name))[1] = (SELECT public.get_tenant_id())::TEXT
  );

CREATE POLICY "tenant_assets_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'tenant-assets'
    AND (storage.foldername(name))[1] = (SELECT public.get_tenant_id())::TEXT
  );
