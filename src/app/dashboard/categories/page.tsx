import { createClient } from '@/lib/supabase/server';
import { CategoryCreateForm } from '@/components/dashboard/category-create-form';

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id')
    .limit(1)
    .single();

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name_ar, name, slug, sort_order, parent_id')
    .eq('tenant_id', membership!.tenant_id)
    .is('deleted_at', null)
    .order('sort_order');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">التصنيفات</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          نظّم منتجاتك في تصنيفات لسهولة التصفح
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
            {categories && categories.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs">
                  <tr>
                    <th className="px-4 py-3 text-right font-medium">الاسم</th>
                    <th className="px-4 py-3 text-right font-medium">الرابط</th>
                    <th className="px-4 py-3 text-right font-medium">الترتيب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {categories.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {c.name_ar || c.name}
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{c.slug}</td>
                      <td className="px-4 py-3 text-gray-600">{c.sort_order}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-16 text-center text-sm text-gray-400">
                لا توجد تصنيفات
              </div>
            )}
          </div>
        </div>

        <CategoryCreateForm />
      </div>
    </div>
  );
}
