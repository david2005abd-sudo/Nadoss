'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import type { ProductActionState } from '@/app/dashboard/products/actions';

interface Category {
  id: string;
  name_ar: string;
  name: string;
}

interface ProductInitial {
  id?: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  categoryId: string;
  priceIqd: number;
  comparePriceIqd: number | null;
  costPriceIqd: number | null;
  stock: number;
  lowStockThreshold: number;
  sku: string;
  barcode: string;
  weightGrams: number | null;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
}

const empty: ProductInitial = {
  name: '',
  nameAr: '',
  description: '',
  descriptionAr: '',
  categoryId: '',
  priceIqd: 0,
  comparePriceIqd: null,
  costPriceIqd: null,
  stock: 0,
  lowStockThreshold: 5,
  sku: '',
  barcode: '',
  weightGrams: null,
  images: [],
  isActive: true,
  isFeatured: false,
};

export function ProductForm({
  action,
  categories,
  initial,
  submitLabel,
}: {
  action: (state: ProductActionState, formData: FormData) => Promise<ProductActionState>;
  categories: Category[];
  initial?: Partial<ProductInitial>;
  submitLabel: string;
}) {
  const data = { ...empty, ...initial };
  const [state, formAction, isPending] = useActionState(action, {});
  const [keptImages, setKeptImages] = useState<string[]>(data.images);
  const [newPreviews, setNewPreviews] = useState<{ file: File; url: string }[]>([]);

  function onFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 5 - keptImages.length - newPreviews.length);
    const next = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setNewPreviews((prev) => [...prev, ...next]);
    e.target.value = '';
  }

  function removeKept(url: string) {
    setKeptImages((prev) => prev.filter((u) => u !== url));
  }

  function removeNew(idx: number) {
    setNewPreviews((prev) => {
      URL.revokeObjectURL(prev[idx].url);
      return prev.filter((_, i) => i !== idx);
    });
  }

  return (
    <form action={formAction} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Hidden inputs to communicate image state to server */}
      {keptImages.map((url) => (
        <input key={url} type="hidden" name="keepImages" value={url} />
      ))}
      {data.images
        .filter((u) => !keptImages.includes(u))
        .map((url) => (
          <input key={url} type="hidden" name="removeImages" value={url} />
        ))}

      <div className="lg:col-span-2 space-y-5">
        {state.error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <section className="rounded-xl border border-gray-100 bg-white p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">المعلومات الأساسية</h2>

          <FormField
            label="الاسم (عربي)"
            name="nameAr"
            defaultValue={data.nameAr}
            required
            errors={state.fieldErrors?.nameAr}
            placeholder="مثال: قميص قطني رجالي"
          />
          <FormField
            label="الاسم (إنجليزي)"
            name="name"
            defaultValue={data.name}
            required
            errors={state.fieldErrors?.name}
            placeholder="e.g. Men's Cotton Shirt"
          />

          <div className="space-y-1.5">
            <label htmlFor="descriptionAr" className="text-sm font-medium text-gray-700">
              الوصف (عربي)
            </label>
            <textarea
              id="descriptionAr"
              name="descriptionAr"
              defaultValue={data.descriptionAr}
              rows={5}
              placeholder="وصف المنتج..."
              className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="categoryId" className="text-sm font-medium text-gray-700">
                التصنيف
              </label>
              <select
                id="categoryId"
                name="categoryId"
                defaultValue={data.categoryId}
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
              >
                <option value="">بدون تصنيف</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_ar || c.name}
                  </option>
                ))}
              </select>
            </div>
            <FormField
              label="SKU (اختياري)"
              name="sku"
              defaultValue={data.sku}
              placeholder="SKU-001"
              errors={state.fieldErrors?.sku}
            />
          </div>
        </section>

        <section className="rounded-xl border border-gray-100 bg-white p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">التسعير والمخزون</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="السعر (د.ع)"
              name="priceIqd"
              type="number"
              inputMode="numeric"
              defaultValue={data.priceIqd}
              required
              errors={state.fieldErrors?.priceIqd}
            />
            <FormField
              label="السعر قبل الخصم (اختياري)"
              name="comparePriceIqd"
              type="number"
              inputMode="numeric"
              defaultValue={data.comparePriceIqd ?? ''}
              errors={state.fieldErrors?.comparePriceIqd}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="سعر التكلفة (اختياري)"
              name="costPriceIqd"
              type="number"
              inputMode="numeric"
              defaultValue={data.costPriceIqd ?? ''}
              errors={state.fieldErrors?.costPriceIqd}
              hint="لأغراض التقارير الداخلية فقط"
            />
            <FormField
              label="الوزن بالغرام (اختياري)"
              name="weightGrams"
              type="number"
              inputMode="numeric"
              defaultValue={data.weightGrams ?? ''}
              errors={state.fieldErrors?.weightGrams}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="المخزون"
              name="stock"
              type="number"
              inputMode="numeric"
              defaultValue={data.stock}
              required
              errors={state.fieldErrors?.stock}
            />
            <FormField
              label="تنبيه المخزون المنخفض"
              name="lowStockThreshold"
              type="number"
              inputMode="numeric"
              defaultValue={data.lowStockThreshold}
              errors={state.fieldErrors?.lowStockThreshold}
            />
          </div>
        </section>

        <section className="rounded-xl border border-gray-100 bg-white p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">الصور</h2>
          <p className="text-xs text-gray-500">حتى 5 صور — الصورة الأولى هي الرئيسية</p>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {keptImages.map((url) => (
              <div key={url} className="relative aspect-square overflow-hidden rounded-lg border border-gray-200">
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeKept(url)}
                  className="absolute top-1 left-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-gray-700 hover:bg-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {newPreviews.map(({ url }, i) => (
              <div key={url} className="relative aspect-square overflow-hidden rounded-lg border-2 border-blue-200">
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNew(i)}
                  className="absolute top-1 left-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-gray-700 hover:bg-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {keptImages.length + newPreviews.length < 5 && (              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-nados-primary hover:text-nados-primary">
                <Upload className="h-5 w-5" />
                <span className="mt-1 text-xs">إضافة</span>
                <input
                  type="file"
                  name="images"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={onFilesSelected}
                />
              </label>
            )}
          </div>

          {/* Hidden file inputs from previews — new files are submitted via these */}
          {newPreviews.map(({ file }, i) => (
            <NewFileInput key={i} file={file} />
          ))}
        </section>
      </div>

      <aside className="lg:col-span-1">
        <div className="sticky top-20 rounded-xl border border-gray-100 bg-white p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">النشر</h2>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={data.isActive}
              className="h-4 w-4 rounded border-gray-300 text-nados-primary focus:ring-nados-primary"
            />
            <span>نشط ومتاح للبيع</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={data.isFeatured}
              className="h-4 w-4 rounded border-gray-300 text-nados-primary focus:ring-nados-primary"
            />
            <span>منتج مميز (يظهر في الرئيسية)</span>
          </label>

          <div className="border-t border-gray-100 pt-4 flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جارٍ الحفظ...
                </>
              ) : (
                submitLabel
              )}
            </Button>
            <Link href="/dashboard/products">
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

function NewFileInput({ file }: { file: File }) {
  // Use a ref to assign FileList via DataTransfer for exact submission
  return (
    <FileInputHidden file={file} />
  );
}

function FileInputHidden({ file }: { file: File }) {
  // Trick: render a hidden input assigned via useEffect
  return (
    <input
      type="file"
      name="images"
      className="hidden"
      ref={(el) => {
        if (!el) return;
        const dt = new DataTransfer();
        dt.items.add(file);
        el.files = dt.files;
      }}
    />
  );
}
