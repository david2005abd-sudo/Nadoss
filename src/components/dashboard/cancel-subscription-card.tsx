'use client';

import { useActionState } from 'react';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import {
  cancelSubscriptionAction,
  reactivateSubscriptionAction,
  type BillingActionState,
} from '@/app/dashboard/billing/actions';
import { Button } from '@/components/ui/button';

const initialState: BillingActionState = {};

export function CancelSubscriptionCard({
  isCanceled,
  periodEnd,
}: {
  isCanceled: boolean;
  periodEnd: string | null;
}) {
  const [cancelState, cancelForm, cancelPending] = useActionState(
    cancelSubscriptionAction,
    initialState
  );

  if (isCanceled) {
    return (
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900">الاشتراك في طريقه للإلغاء</h3>
            <p className="text-sm text-amber-800 mt-1">
              {periodEnd
                ? `سينتهي اشتراكك في ${new Date(periodEnd).toLocaleDateString('ar-IQ')} وسيتم تحويلك للخطة المجانية.`
                : 'سينتهي اشتراكك في نهاية الفترة الحالية.'}
            </p>
            <form action={async () => { await reactivateSubscriptionAction(); }} className="mt-3">
              <Button type="submit" variant="secondary" size="sm">
                <RefreshCw className="h-3.5 w-3.5" />
                إعادة تفعيل الاشتراك
              </Button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-red-100 bg-red-50/50 p-5">
      <h3 className="font-semibold text-red-900">إلغاء الاشتراك</h3>
      <p className="text-sm text-red-800/80 mt-1">
        يمكنك الإلغاء في نهاية الفترة الحالية (تحتفظ بالميزات حتى ذلك الحين) أو التحويل فورًا للخطة المجانية.
      </p>

      {cancelState.error && (
        <div className="mt-3 rounded-lg bg-white border border-red-200 px-3 py-2 text-xs text-red-700">
          {cancelState.error}
        </div>
      )}
      {cancelState.success && (
        <div className="mt-3 rounded-lg bg-white border border-green-200 px-3 py-2 text-xs text-green-800">
          {cancelState.success}
        </div>
      )}

      <form action={cancelForm} className="mt-3 space-y-2">
        <label className="flex items-center gap-2 text-sm text-red-800">
          <input
            type="checkbox"
            name="immediate"
            className="h-4 w-4 rounded border-red-300 text-nados-danger focus:ring-nados-danger"
          />
          <span>إلغاء فوري والتحويل للخطة المجانية الآن</span>
        </label>
        <Button
          type="submit"
          variant="danger"
          size="sm"
          disabled={cancelPending}
        >
          {cancelPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          تأكيد الإلغاء
        </Button>
      </form>
    </section>
  );
}
