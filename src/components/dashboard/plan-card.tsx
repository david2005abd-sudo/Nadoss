'use client';

import { useActionState, useState } from 'react';
import { CheckCircle2, Loader2, Sparkles, Zap, Crown, Building2, X } from 'lucide-react';
import { changePlanAction, type BillingActionState } from '@/app/dashboard/billing/actions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  free: Sparkles,
  starter: Zap,
  pro: Crown,
  enterprise: Building2,
};

interface Plan {
  id: string;
  name_ar: string;
  name: string;
  slug: string;
  price_usd: number;
  interval: string;
  max_products: number;
  max_orders_per_month: number;
  max_ai_messages: number;
  features: unknown;
}

const initialState: BillingActionState = {};

export function PlanCard({
  plan,
  currentPlanId,
  canChange,
}: {
  plan: Plan;
  currentPlanId: string | null;
  canChange: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [interval, setInterval_] = useState<'month' | 'year'>('month');
  const [state, formAction, isPending] = useActionState(changePlanAction, initialState);

  const isCurrent = currentPlanId === plan.id;
  const Icon = ICONS[plan.slug] ?? Sparkles;
  const features = Array.isArray(plan.features) ? (plan.features as string[]) : [];
  const annualPrice = Math.round(plan.price_usd * 12 * 0.8);

  return (
    <>
      <div
        className={`relative flex flex-col rounded-xl border p-5 ${
          isCurrent
            ? 'border-nados-primary bg-blue-50/30'
            : plan.slug === 'pro'
              ? 'border-nados-primary shadow-sm'
              : 'border-gray-100 bg-white'
        }`}
      >
        {plan.slug === 'pro' && !isCurrent && (
          <span className="absolute -top-2.5 right-4 rounded-full bg-nados-primary px-3 py-0.5 text-xs font-medium text-white">
            الأكثر شيوعًا
          </span>
        )}

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-nados-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{plan.name_ar}</h3>
            <p className="text-xs text-gray-500">{plan.name}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">
              {plan.price_usd === 0 ? 'مجانًا' : `$${plan.price_usd}`}
            </span>
            {plan.price_usd > 0 && (
              <span className="text-sm text-gray-500">/شهر</span>
            )}
          </div>
          {plan.price_usd > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              ${annualPrice}/سنة (توفير 20%)
            </p>
          )}
        </div>

        <ul className="mt-4 space-y-1.5 text-sm flex-1">
          {features.slice(0, 6).map((f, i) => (
            <li key={i} className="flex items-start gap-1.5 text-gray-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-nados-secondary mt-0.5 shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5">
          {isCurrent ? (
            <Button variant="outline" className="w-full" disabled>
              خطتك الحالية
            </Button>
          ) : plan.price_usd === 0 ? (
            <form action={formAction}>
              <input type="hidden" name="planId" value={plan.id} />
              <input type="hidden" name="interval" value="month" />
              <Button
                type="submit"
                variant="outline"
                className="w-full"
                disabled={!canChange || isPending}
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                التبديل إلى المجانية
              </Button>
            </form>
          ) : (
            <Button
              onClick={() => setOpen(true)}
              variant={plan.slug === 'pro' ? 'default' : 'outline'}
              className="w-full"
              disabled={!canChange}
            >
              ترقية
            </Button>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="font-semibold text-gray-900">ترقية إلى {plan.name_ar}</h3>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </header>

            <form action={formAction} className="p-5 space-y-4">
              <input type="hidden" name="planId" value={plan.id} />

              {state.error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                  {state.error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label>الدورة</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInterval_('month')}
                    className={`rounded-lg border px-3 py-2.5 text-sm text-right transition-colors ${
                      interval === 'month' ? 'border-nados-primary bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">شهري</span>
                      <span className="text-xs text-gray-500">${plan.price_usd}</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterval_('year')}
                    className={`rounded-lg border px-3 py-2.5 text-sm text-right transition-colors ${
                      interval === 'year' ? 'border-nados-primary bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">سنوي</span>
                      <span className="text-xs text-nados-secondary">-20%</span>
                    </div>
                  </button>
                </div>
                <input type="hidden" name="interval" value={interval} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paymentMethod">طريقة الدفع</Label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  required
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
                >
                  <option value="zaincash">زين كاش</option>
                  <option value="fib">المصرف العراقي الأول (FIB)</option>
                  <option value="qicard">كي كارد</option>
                  <option value="nasspay">ناس باي</option>
                </select>
              </div>

              <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm flex justify-between">
                <span className="text-gray-600">الإجمالي</span>
                <span className="font-bold text-gray-900">
                  ${interval === 'year' ? annualPrice : plan.price_usd}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isPending} className="flex-1">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  متابعة الدفع
                </Button>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
