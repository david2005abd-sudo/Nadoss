'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { productSchema } from '@/lib/validations/product';

export interface ProductActionState {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
}

function toFieldErrors(errors: Record<string, string[] | undefined>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(errors)) if (v && v.length) out[k] = v;
  return out;
}

async function getTenantContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!membership) redirect('/login');
  return { supabase, tenantId: membership.tenant_id, role: membership.role, userId: user.id };
}

async function checkProductLimit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tenantId: string
): Promise<{ ok: boolean; limit: number; current: number }> {
  const { data: tenant } = await supabase
    .from('tenants')
    .select('subscription_plans(max_products)')
    .eq('id', tenantId)
    .single();

  const plan = tenant?.subscription_plans as unknown as { max_products: number } | null;
  const limit = plan?.max_products ?? 10;

  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .is('deleted_at', null);

  return { ok: (count ?? 0) < limit, limit, current: count ?? 0 };
}

export async function createProductAction(
  _prev: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const { supabase, tenantId, userId } = await getTenantContext();

  const limit = await checkProductLimit(supabase, tenantId);
  if (!limit.ok) {
    return {
      error: `وصلت للحد الأقصى (${limit.limit} منتج). قم بترقية خطتك لإضافة المزيد.`,
    };
  }

  const raw = {
    name: formData.get('name'),
    nameAr: formData.get('nameAr'),
    description: formData.get('description') ?? '',
    descriptionAr: formData.get('descriptionAr') ?? '',
    categoryId: formData.get('categoryId') ?? '',
    priceIqd: formData.get('priceIqd'),
    comparePriceIqd: formData.get('comparePriceIqd') ?? '',
    costPriceIqd: formData.get('costPriceIqd') ?? '',
    stock: formData.get('stock'),
    lowStockThreshold: formData.get('lowStockThreshold') ?? 5,
    sku: formData.get('sku') ?? '',
    barcode: formData.get('barcode') ?? '',
    weightGrams: formData.get('weightGrams') ?? '',
    isActive: formData.get('isActive') === 'on' || formData.get('isActive') === 'true',
    isFeatured: formData.get('isFeatured') === 'on' || formData.get('isFeatured') === 'true',
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error.flatten().fieldErrors) };
  }
  const data = parsed.data;

  // Upload images (if provided)
  const images: string[] = [];
  const imageFiles = formData.getAll('images').filter((f) => f instanceof File && f.size > 0) as File[];
  for (const file of imageFiles.slice(0, 5)) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `${tenantId}/products/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('tenant-assets')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (upErr) continue;
    const { data: pub } = supabase.storage.from('tenant-assets').getPublicUrl(path);
    images.push(pub.publicUrl);
  }

  const { data: inserted, error } = await supabase
    .from('products')
    .insert({
      tenant_id: tenantId,
      category_id: data.categoryId || null,
      name: data.name,
      name_ar: data.nameAr,
      description: data.description || null,
      description_ar: data.descriptionAr || null,
      price_iqd: data.priceIqd,
      compare_price_iqd: data.comparePriceIqd || null,
      cost_price_iqd: data.costPriceIqd || null,
      stock: data.stock,
      low_stock_threshold: data.lowStockThreshold,
      sku: data.sku || null,
      barcode: data.barcode || null,
      weight_grams: data.weightGrams || null,
      images,
      is_active: data.isActive,
      is_featured: data.isFeatured,
    })
    .select('id')
    .single();

  if (error || !inserted) {
    return { error: 'تعذر إنشاء المنتج: ' + error?.message };
  }

  await supabase.from('audit_log').insert({
    tenant_id: tenantId,
    user_id: userId,
    action: 'product.created',
    entity_type: 'product',
    entity_id: inserted.id,
    new_values: { name: data.nameAr, price: data.priceIqd, stock: data.stock },
  });

  revalidatePath('/dashboard/products');
  redirect('/dashboard/products?created=1');
}

export async function updateProductAction(
  id: string,
  _prev: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const { supabase, tenantId, userId } = await getTenantContext();

  const raw = {
    name: formData.get('name'),
    nameAr: formData.get('nameAr'),
    description: formData.get('description') ?? '',
    descriptionAr: formData.get('descriptionAr') ?? '',
    categoryId: formData.get('categoryId') ?? '',
    priceIqd: formData.get('priceIqd'),
    comparePriceIqd: formData.get('comparePriceIqd') ?? '',
    costPriceIqd: formData.get('costPriceIqd') ?? '',
    stock: formData.get('stock'),
    lowStockThreshold: formData.get('lowStockThreshold') ?? 5,
    sku: formData.get('sku') ?? '',
    barcode: formData.get('barcode') ?? '',
    weightGrams: formData.get('weightGrams') ?? '',
    isActive: formData.get('isActive') === 'on' || formData.get('isActive') === 'true',
    isFeatured: formData.get('isFeatured') === 'on' || formData.get('isFeatured') === 'true',
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error.flatten().fieldErrors) };
  }
  const data = parsed.data;

  // Fetch existing to merge images
  const { data: existing } = await supabase
    .from('products')
    .select('images')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .maybeSingle();

  if (!existing) return { error: 'المنتج غير موجود' };

  let images = Array.isArray(existing.images) ? (existing.images as string[]) : [];

  // Handle image removal
  const removeImages = formData.getAll('removeImages').map(String);
  images = images.filter((url) => !removeImages.includes(url));

  // Upload new images
  const newFiles = formData.getAll('images').filter((f) => f instanceof File && f.size > 0) as File[];
  for (const file of newFiles.slice(0, 5 - images.length)) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `${tenantId}/products/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('tenant-assets')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (upErr) continue;
    const { data: pub } = supabase.storage.from('tenant-assets').getPublicUrl(path);
    images.push(pub.publicUrl);
  }

  const { error } = await supabase
    .from('products')
    .update({
      category_id: data.categoryId || null,
      name: data.name,
      name_ar: data.nameAr,
      description: data.description || null,
      description_ar: data.descriptionAr || null,
      price_iqd: data.priceIqd,
      compare_price_iqd: data.comparePriceIqd || null,
      cost_price_iqd: data.costPriceIqd || null,
      stock: data.stock,
      low_stock_threshold: data.lowStockThreshold,
      sku: data.sku || null,
      barcode: data.barcode || null,
      weight_grams: data.weightGrams || null,
      images,
      is_active: data.isActive,
      is_featured: data.isFeatured,
    })
    .eq('id', id)
    .eq('tenant_id', tenantId);

  if (error) return { error: 'تعذر تحديث المنتج' };

  await supabase.from('audit_log').insert({
    tenant_id: tenantId,
    user_id: userId,
    action: 'product.updated',
    entity_type: 'product',
    entity_id: id,
    new_values: { name: data.nameAr, price: data.priceIqd, stock: data.stock },  });

  revalidatePath('/dashboard/products');
  revalidatePath(`/dashboard/products/${id}`);
  redirect('/dashboard/products?updated=1');
}

export async function deleteProductAction(id: string): Promise<{ error?: string }> {
  const { supabase, tenantId, userId } = await getTenantContext();

  const { error } = await supabase
    .from('products')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('tenant_id', tenantId);

  if (error) return { error: 'تعذر حذف المنتج' };

  await supabase.from('audit_log').insert({
    tenant_id: tenantId,
    user_id: userId,
    action: 'product.deleted',
    entity_type: 'product',
    entity_id: id,
  });

  revalidatePath('/dashboard/products');
  return {};
}

export async function toggleProductActiveAction(
  id: string,
  isActive: boolean
): Promise<{ error?: string }> {
  const { supabase, tenantId } = await getTenantContext();

  const { error } = await supabase
    .from('products')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('tenant_id', tenantId);

  if (error) return { error: 'تعذر التحديث' };

  revalidatePath('/dashboard/products');
  return {};
}
