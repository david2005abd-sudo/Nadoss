'use client';

import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';
import { createTicketAction, type TicketActionState } from '@/app/dashboard/support/actions';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Label } from '@/components/ui/label';
import { TICKET_CATEGORIES, TICKET_CATEGORY_LABELS } from '@/lib/validations/support';

const initialState: TicketActionState = {};

export function NewTicketForm({
  recentOrders,
}: {
  recentOrders: { id: string; order_number: string }[];
}) {
  const [state, formAction, isPending] = useActionState(createTicketAction, initialState);

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
            label="الموضوع"
            name="subject"
            required
            placeholder="مثال: مشكلة في رفع صورة المنتج"
            errors={state.fieldErrors?.subject}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category">التصنيف</Label>
              <select
                id="category"
                name="category"
                required
                defaultValue="general"
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
              >
                {TICKET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {TICKET_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="priority">الأولوية</Label>
              <select
                id="priority"
                name="priority"
                defaultValue="medium"
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
              >
                <option value="low">منخفضة</option>
                <option value="medium">متوسطة</option>
                <option value="high">عالية</option>
                <option value="urgent">عاجلة</option>
              </select>
            </div>
          </div>

          {recentOrders.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="relatedOrderId">طلب مرتبط (اختياري)</Label>
              <select
                id="relatedOrderId"
                name="relatedOrderId"
                defaultValue=""
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
              >
                <option value="">بدون طلب محدد</option>
                {recentOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.order_number}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="description">وصف المشكلة</Label>
            <textarea
              id="description"
              name="description"
              required
              rows={8}
              placeholder="اشرح المشكلة بتفصيل: ماذا كنت تحاول أن تفعل؟ ما الذي حدث؟ هل ظهرت رسالة خطأ؟"
              className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
            />
            {state.fieldErrors?.description && (
              <p className="text-xs text-nados-danger">
                {state.fieldErrors.description[0]}
              </p>
            )}
          </div>
        </section>
      </div>

      <aside>
        <div className="sticky top-20 rounded-xl border border-gray-100 bg-white p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">معلومات مفيدة</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-nados-primary mt-0.5">•</span>
              كن دقيقًا: اذكر خطوات إعادة إنتاج المشكلة
            </li>
            <li className="flex items-start gap-2">
              <span className="text-nados-primary mt-0.5">•</span>
              أرفق لقطات شاشة إن أمكن
            </li>
            <li className="flex items-start gap-2">
              <span className="text-nados-primary mt-0.5">•</span>
              اذكر رقم الطلب إن كان ذا صلة
            </li>
          </ul>

          <div className="border-t border-gray-100 pt-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              إرسال التذكرة
            </Button>
          </div>
        </div>
      </aside>
    </form>
  );
}
