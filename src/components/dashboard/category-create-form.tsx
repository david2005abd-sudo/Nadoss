'use client';

import { useActionState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { createCategoryAction, type CategoryActionState } from '@/app/dashboard/categories/actions';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';

const initialState: CategoryActionState = {};

export function CategoryCreateForm() {
  const [state, formAction, isPending] = useActionState(createCategoryAction, initialState);

  return (
    <form action={formAction} className="rounded-xl border border-gray-100 bg-white p-5 space-y-4 h-fit">
      <h2 className="font-semibold text-gray-900">تصنيف جديد</h2>

      {state.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="flex items-center gap-1.5 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-800">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {state.success}
        </div>
      )}

      <FormField
        label="الاسم (عربي)"
        name="nameAr"
        placeholder="مثال: ملابس رجالية"
        required
        errors={state.fieldErrors?.nameAr}
      />
      <FormField
        label="الاسم (إنجليزي)"
        name="name"
        placeholder="Men's Clothing"
        required
        errors={state.fieldErrors?.name}
      />
      <FormField
        label="الرابط (slug)"
        name="slug"
        placeholder="mens-clothing"
        required
        errors={state.fieldErrors?.slug}
        hint="أحرف إنجليزية صغيرة وأرقام و- فقط"
      />
      <FormField
        label="الترتيب"
        name="sortOrder"
        type="number"
        defaultValue={0}
        errors={state.fieldErrors?.sortOrder}
      />

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        إضافة
      </Button>
    </form>
  );
}
