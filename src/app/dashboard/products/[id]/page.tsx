import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ProductForm } from '@/components/dashboard/product-form';
import { updateProductAction } from '../actions';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id')
    .limit(1)
    .single();

  const tenantId = membership!.tenant_id;

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .maybeSingle(),
    supabase
      .from('categories')
      .select('id, name_ar, name')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('sort_order'),
  ]);

  if (!product) notFound();

  const boundAction = updateProductAction.bind(null, id);

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-nados-primary"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للمنتجات
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          تعديل: {product.name_ar || product.name}
        </h1>
      </div>

      <ProductForm
        action={boundAction as never}
        categories={categories ?? []}
        initial={{
          name: product.name,
          nameAr: product.name_ar,
          description: product.description ?? '',
          descriptionAr: product.description_ar ?? '',
          categoryId: product.category_id ?? '',
          priceIqd: product.price_iqd,
          comparePriceIqd: product.compare_price_iqd,
          costPriceIqd: product.cost_price_iqd,
          stock: product.stock,
          lowStockThreshold: product.low_stock_threshold ?? 5,
          sku: product.sku ?? '',
          barcode: product.barcode ?? '',
          weightGrams: product.weight_grams,
          images: Array.isArray(product.images) ? (product.images as string[]) : [],
          isActive: product.is_active,
          isFeatured: product.is_featured,
        }}
        submitLabel="حفظ التغييرات"
      />
    </div>
  );
}
