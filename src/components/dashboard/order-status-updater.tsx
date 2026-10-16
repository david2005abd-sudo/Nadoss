'use client';

import { useActionState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { updateOrderStatusAction, type OrderActionState } from '@/app/dashboard/orders/actions';
import { Button } from '@/components/ui/button';

const LABELS: Record<string, string> = {
  draft: 'مسودة',
  pending: 'بانتظار التأكيد',
  confirmed: 'مؤكد',
  preparing: 'قيد التحضير',
  ready: 'جاهز للشحن',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'إلغاء',
  returned: 'مرتجع',
};

const VARIANT: Record<string, 'default' | 'outline' | 'danger' | 'secondary'> = {
  confirmed: 'default',
  preparing: 'default',
  ready: 'default',
  shipped: 'default',
  delivered: 'secondary',
  cancelled: 'danger',
  returned: 'outline',
};

const initialState: OrderActionState = {};

export function OrderStatusUpdater({
  orderId,
  currentStatus,
  allowed,
}: {
  orderId: string;
  currentStatus: string;
  allowed: string[];
}) {
  const [state, formAction, isPending] = useActionState(
    updateOrderStatusAction,
    initialState
  );

  if (allowed.length === 0) {
    return (
      <section className="rounded-xl border border-gray-100 bg-white p-5">
        <h2 className="font-semibold text-gray-900 mb-3">تحديث الحالة</h2>
        <p className="text-sm text-gray-500">لا توجد انتقالات متاحة من هذه الحالة</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5">
      <h2 className="font-semibold text-gray-900 mb-3">تحديث الحالة</h2>

      {state.error && (
        <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="mb-3 flex items-center gap-1.5 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-800">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {state.success}
        </div>
      )}

      <div className="space-y-2">
        {allowed.map((s) => (
          <form key={s} action={formAction}>
            <input type="hidden" name="orderId" value={orderId} />
            <input type="hidden" name="newStatus" value={s} />
            <Button
              type="submit"
              variant={VARIANT[s] ?? 'outline'}
              className="w-full justify-start"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {LABELS[s] ?? s}
            </Button>
          </form>
        ))}
      </div>
    </section>
  );
}
