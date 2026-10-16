'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { categorySchema } from '@/lib/validations/product';

export interface CategoryActionState {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
}

async function getCtx() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('UNAUTHENTICATED');
  const { data: m } = await supabase
    .from('memberships')
    .select('tenant_id')
    .eq('user_id', user.id)
    .limit(1)
    .single();
  if (!m) throw new Error('NO_TENANT');
  return { supabase, tenantId: m.tenant_id };
}

export async function createCategoryAction(
  _prev: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const raw = {
    name: formData.get('name'),
    nameAr: formData.get('nameAr'),
    slug: formData.get('slug'),
    parentId: formData.get('parentId') ?? '',
    sortOrder: formData.get('sortOrder') ?? 0,
  };

  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    const out: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(parsed.error.flatten().fieldErrors)) {
      if (v && v.length) out[k] = v;
    }
    return { fieldErrors: out };
  }

  const { supabase, tenantId } = await getCtx();
  const { error } = await supabase.from('categories').insert({
    tenant_id: tenantId,
    name: parsed.data.name,
    name_ar: parsed.data.nameAr,
    slug: parsed.data.slug,
    parent_id: parsed.data.parentId || null,
    sort_order: parsed.data.sortOrder,
  });

  if (error) {
    if (error.code === '23505') return { error: 'يوجد تصنيف بنفس الرابط' };
    return { error: 'تعذر إنشاء التصنيف' };
  }

  revalidatePath('/dashboard/categories');
  return { success: 'تم إنشاء التصنيف' };
}

export async function deleteCategoryAction(id: string): Promise<{ error?: string }> {
  const { supabase, tenantId } = await getCtx();
  const { error } = await supabase
    .from('categories')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('tenant_id', tenantId);
  if (error) return { error: 'تعذر حذف التصنيف' };
  revalidatePath('/dashboard/categories');
  return {};
}
