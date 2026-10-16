import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ProductForm } from '@/components/dashboard/product-form';
import { createProductAction } from '../actions';

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id')
    .limit(1)
    .single();

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name_ar, name')
    .eq('tenant_id', membership!.tenant_id)
    .is('deleted_at', null)
    .order('sort_order');

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
        <h1 className="mt-2 text-2xl font-bold text-gray-900">منتج جديد</h1>
      </div>

      <ProductForm
        action={createProductAction}
        categories={categories ?? []}
        submitLabel="إنشاء المنتج"
      />
    </div>
  );
}
