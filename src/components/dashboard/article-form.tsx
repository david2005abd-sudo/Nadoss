'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Label } from '@/components/ui/label';
import { KNOWLEDGE_CATEGORIES, KNOWLEDGE_CATEGORY_LABELS } from '@/lib/validations/knowledge';
import type { ArticleActionState } from '@/app/dashboard/knowledge/actions';

interface Initial {
  id?: string;
  slug: string;
  title: string;
  titleEn: string;
  summary: string;
  content: string;
  category: string;
  tags: string;
  isPublished: boolean;
  isPlatform: boolean;
}

const empty: Initial = {
  slug: '',
  title: '',
  titleEn: '',
  summary: '',
  content: '',
  category: 'getting_started',
  tags: '',
  isPublished: false,
  isPlatform: false,
};

export function ArticleForm({
  action,
  initial,
  canCreatePlatform,
  submitLabel,
}: {
  action: (state: ArticleActionState, formData: FormData) => Promise<ArticleActionState>;
  initial?: Partial<Initial>;
  canCreatePlatform: boolean;
  submitLabel: string;
}) {
  const data = { ...empty, ...initial };
  const [state, formAction, isPending] = useActionState(action, {});

  return (
    <form action={formAction} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-5">
        {state.error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <section className="rounded-xl border border-gray-100 bg-white p-5 space-y-4">
          <FormField
            label="العنوان"
            name="title"
            defaultValue={data.title}
            required
            placeholder="مثال: كيف أضيف منتجًا جديدًا؟"
            errors={state.fieldErrors?.title}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="الرابط (slug)"
              name="slug"
              defaultValue={data.slug}
              required
              placeholder="how-to-add-product"
              errors={state.fieldErrors?.slug}
              hint="أحرف إنجليزية صغيرة وأرقام و- فقط"
            />
            <FormField
              label="العنوان (إنجليزي - اختياري)"
              name="titleEn"
              defaultValue={data.titleEn}
              placeholder="How to add a product"
              errors={state.fieldErrors?.titleEn}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="summary">الملخص</Label>
            <textarea
              id="summary"
              name="summary"
              defaultValue={data.summary}
              rows={2}
              placeholder="ملخص قصير يظهر في نتائج البحث"
              className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="content">المحتوى (Markdown مدعوم)</Label>
            <textarea
              id="content"
              name="content"
              defaultValue={data.content}
              required
              rows={20}
              placeholder="اكتب محتوى المقال... يدعم Markdown"
              className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-mono focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
            />
            {state.fieldErrors?.content && (
              <p className="text-xs text-nados-danger">{state.fieldErrors.content[0]}</p>
            )}
          </div>
        </section>
      </div>

      <aside>
        <div className="sticky top-20 rounded-xl border border-gray-100 bg-white p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">النشر</h2>

          <div className="space-y-1.5">
            <Label htmlFor="category">التصنيف</Label>
            <select
              id="category"
              name="category"
              defaultValue={data.category}
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
            >
              {KNOWLEDGE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {KNOWLEDGE_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          <FormField
            label="الوسوم (مفصولة بفاصلة)"
            name="tags"
            defaultValue={data.tags}
            placeholder="منتجات، إضافة، صورة"
            errors={state.fieldErrors?.tags}
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={data.isPublished}
              className="h-4 w-4 rounded border-gray-300 text-nados-primary focus:ring-nados-primary"
            />
            <span>نشر المقال للعامة</span>
          </label>

          {canCreatePlatform && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isPlatform"
                defaultChecked={data.isPlatform}
                className="h-4 w-4 rounded border-gray-300 text-nados-primary focus:ring-nados-primary"
              />
              <span>مقال منصة (لكل المتاجر)</span>
            </label>
          )}

          <div className="border-t border-gray-100 pt-4 flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {submitLabel}
            </Button>
            <Link href="/dashboard/knowledge">
              <Button type="button" variant="ghost" className="w-full">
                إلغاء
              </Button>
            </Link>
          </div>
        </div>
      </aside>
    </form>
  );
}
