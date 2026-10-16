'use client';

import { useActionState, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MapPin, Phone, User, StickyNote, CreditCard, Banknote } from 'lucide-react';
import { useCart } from '@/lib/cart/context';
import { placeOrderAction, type CheckoutState } from '@/app/store/[slug]/checkout/actions';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { formatIQD } from '@/lib/utils';
import type { PaymentGateway } from '@/lib/payments/iraqpay';

interface Governorate {
  id: number;
  name_ar: string;
  delivery_fee_iqd: number;
}

const initialState: CheckoutState = {};

const PAYMENT_OPTIONS: { value: PaymentGateway; label: string; desc: string; icon: 'cod' | 'card' }[] = [
  { value: 'cod', label: 'الدفع عند الاستلام', desc: 'ادفع نقدًا عند التسليم', icon: 'cod' },
  { value: 'zaincash', label: 'زين كاش', desc: 'محفظة زين', icon: 'card' },
  { value: 'fib', label: 'المصرف العراقي الأول', desc: 'QR code أو تطبيق FIB', icon: 'card' },
  { value: 'qicard', label: 'كي كارد', desc: 'بطاقة كي كارد', icon: 'card' },
  { value: 'nasspay', label: 'ناس باي', desc: 'محفظة ناس باي', icon: 'card' },
];

export function CheckoutForm({
  slug,
  tenantName,
  governorates,
}: {
  slug: string;
  tenantName: string;
  governorates: Governorate[];
}) {
  const router = useRouter();
  const { state: cart, clear } = useCart();
  const [isPending, startTransition] = useTransition();
  const [govId, setGovId] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentGateway>('cod');

  // useActionState with custom args — wrap with closure
  const [actionState, formAction] = useActionState(
    async (_prev: CheckoutState, formData: FormData) => {
      const items = cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity }));
      const result = await placeOrderAction(_prev, { slug, formData, cartItems: items });
      if (!result?.error && !result?.fieldErrors) {
        clear();
      }
      return result;
    },
    initialState
  );

  const selectedGov = governorates.find((g) => g.id === govId);
  const deliveryFee = selectedGov?.delivery_fee_iqd ?? 0;
  const subtotal = cart.items.reduce((s, i) => s + i.priceIqd * i.quantity, 0);
  const total = subtotal + deliveryFee;

  if (cart.items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center">
        <p className="text-gray-500 mb-4">سلتك فارغة — أضف منتجات أولًا</p>
        <Button onClick={() => router.push(`/store/${slug}/products`)}>
          تصفح المنتجات
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">إتمام الطلب</h1>

      {actionState.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {actionState.error}
        </div>
      )}

      <form action={formAction} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: form fields */}
        <div className="lg:col-span-2 space-y-5">
          <section className="rounded-xl border border-gray-100 bg-white p-5 space-y-4">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900">
              <User className="h-4 w-4" /> معلومات المستلم
            </h2>

            <FormField
              label="الاسم الكامل"
              name="customerName"
              placeholder="علي محمد"
              required
              errors={actionState.fieldErrors?.customerName}
            />
            <FormField
              label="رقم الهاتف"
              name="customerPhone"
              type="tel"
              inputMode="tel"
              placeholder="07XXXXXXXXX"
              required
              errors={actionState.fieldErrors?.customerPhone}
              hint="سيتم التواصل معك عبر هذا الرقم لتأكيد الطلب"
            />
          </section>

          <section className="rounded-xl border border-gray-100 bg-white p-5 space-y-4">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900">
              <MapPin className="h-4 w-4" /> عنوان التوصيل
            </h2>

            <div className="space-y-1.5">
              <label htmlFor="governorateId" className="text-sm font-medium text-gray-700">
                المحافظة
              </label>
              <select
                id="governorateId"
                name="governorateId"
                required
                value={govId}
                onChange={(e) => setGovId(e.target.value ? Number(e.target.value) : '')}
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
              >
                <option value="">اختر المحافظة</option>
                {governorates.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name_ar} — {g.delivery_fee_iqd.toLocaleString('ar-IQ')} د.ع
                  </option>
                ))}
              </select>
              {actionState.fieldErrors?.governorateId && (
                <p className="text-xs text-nados-danger">
                  {actionState.fieldErrors.governorateId[0]}
                </p>
              )}
            </div>

            <FormField
              label="المدينة / القضاء"
              name="city"
              placeholder="مثال: الكرادة، المنصور..."
              required
              errors={actionState.fieldErrors?.city}
            />

            <div className="space-y-1.5">
              <label htmlFor="address" className="text-sm font-medium text-gray-700">
                العنوان التفصيلي
              </label>
              <textarea
                id="address"
                name="address"
                required
                rows={3}
                placeholder="أقرب نقطة دالة، اسم الشارع، رقم البناية..."
                className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
              />
              {actionState.fieldErrors?.address && (
                <p className="text-xs text-nados-danger">
                  {actionState.fieldErrors.address[0]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="notes" className="text-sm font-medium text-gray-700">
                ملاحظات (اختياري)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                placeholder="أي تفاصيل إضافية..."
                className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
              />
            </div>
          </section>

          <section className="rounded-xl border border-gray-100 bg-white p-5 space-y-3">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900">              <CreditCard className="h-4 w-4" /> طريقة الدفع
            </h2>
            <input type="hidden" name="paymentMethod" value={paymentMethod} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PAYMENT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPaymentMethod(opt.value)}
                  className={`flex items-start gap-3 rounded-lg border p-3 text-right transition-colors ${
                    paymentMethod === opt.value
                      ? 'border-nados-primary bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      paymentMethod === opt.value
                        ? 'border-nados-primary'
                        : 'border-gray-300'
                    }`}
                  >
                    {paymentMethod === opt.value && (
                      <div className="h-2.5 w-2.5 rounded-full bg-nados-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                      {opt.icon === 'cod' ? (
                        <Banknote className="h-3.5 w-3.5" />
                      ) : (
                        <CreditCard className="h-3.5 w-3.5" />
                      )}
                      {opt.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Right: summary */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20 rounded-xl border border-gray-100 bg-white p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">ملخص الطلب</h2>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex justify-between gap-2 text-sm">
                  <span className="text-gray-600 truncate">
                    {item.name} <span className="text-gray-400">×{item.quantity}</span>
                  </span>
                  <span className="text-gray-900 font-medium whitespace-nowrap">
                    {formatIQD(item.priceIqd * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>المجموع الفرعي</span>
                <span>{formatIQD(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>رسوم التوصيل</span>
                <span>
                  {selectedGov ? formatIQD(deliveryFee) : '—'}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold text-gray-900">
                <span>الإجمالي</span>
                <span className="text-nados-primary">{formatIQD(total)}</span>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جارٍ المعالجة...
                </>
              ) : paymentMethod === 'cod' ? (
                'تأكيد الطلب'
              ) : (
                `ادفع ${formatIQD(total)}`
              )}
            </Button>

            <p className="text-xs text-gray-400 text-center">
              بتأكيد الطلب، أنت توافق على شروط {tenantName}
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
