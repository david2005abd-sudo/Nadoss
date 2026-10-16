import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Package, MapPin, CreditCard, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatIQD } from '@/lib/utils';
import { OrderStatusBadge } from '@/components/dashboard/order-status-badge';
import { OrderStatusUpdater } from '@/components/dashboard/order-status-updater';
import { ORDER_STATUS_TRANSITIONS } from '@/lib/validations/order';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id')
    .limit(1)
    .single();

  const { data: order } = await supabase
    .from('orders')
    .select(
      `id, order_number, status, payment_method, payment_status,
       subtotal_iqd, delivery_fee_iqd, discount_iqd, total_iqd, source,
       city, address, notes, created_at, updated_at,
       customers(id, name, phone, email),
       iraq_governorates(name_ar),
       order_items(id, product_name, quantity, unit_price_iqd, total_price_iqd, product_id)`
    )
    .eq('id', id)
    .eq('tenant_id', membership!.tenant_id)
    .is('deleted_at', null)
    .maybeSingle();

  if (!order) notFound();

  const customer = order.customers as unknown as { id: string; name: string | null; phone: string; email: string | null } | null;
  const gov = order.iraq_governorates as unknown as { name_ar: string } | null;
  const items = (order.order_items as unknown as {
    id: string;
    product_name: string;
    quantity: number;
    unit_price_iqd: number;
    total_price_iqd: number;
    product_id: string | null;
  }[]) ?? [];

  // Fetch audit log for this order
  const { data: auditLog } = await supabase
    .from('audit_log')
    .select('action, old_values, new_values, created_at')
    .eq('entity_type', 'order')
    .eq('entity_id', id)
    .order('created_at', { ascending: false })
    .limit(20);

  const allowed = ORDER_STATUS_TRANSITIONS[order.status] ?? [];

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-nados-primary"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للطلبات
        </Link>
        <div className="mt-2 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{order.order_number}</h1>
            <p className="mt-1 text-sm text-gray-500 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              {new Date(order.created_at).toLocaleString('ar-IQ')}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <section className="rounded-xl border border-gray-100 bg-white p-5">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
              <Package className="h-4 w-4" /> عناصر الطلب
            </h2>
            <div className="divide-y divide-gray-50">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    {item.product_id ? (
                      <Link
                        href={`/dashboard/products/${item.product_id}`}
                        className="text-sm font-medium text-gray-900 hover:text-nados-primary"
                      >
                        {item.product_name}
                      </Link>
                    ) : (
                      <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatIQD(item.unit_price_iqd)} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold text-gray-900 whitespace-nowrap">
                    {formatIQD(item.total_price_iqd)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>المجموع الفرعي</span>
                <span>{formatIQD(order.subtotal_iqd)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>التوصيل</span>
                <span>{formatIQD(order.delivery_fee_iqd)}</span>
              </div>
              {order.discount_iqd > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>خصم</span>
                  <span>-{formatIQD(order.discount_iqd)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold text-gray-900">
                <span>الإجمالي</span>
                <span className="text-nados-primary">{formatIQD(order.total_iqd)}</span>
              </div>
            </div>
          </section>

          {/* Timeline */}
          <section className="rounded-xl border border-gray-100 bg-white p-5">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
              <Clock className="h-4 w-4" /> سجل النشاط
            </h2>
            <ol className="space-y-3">
              {(auditLog ?? []).map((log, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-nados-primary" />
                  <div className="flex-1">
                    <p className="text-gray-900">{auditActionLabel(log.action)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(log.created_at).toLocaleString('ar-IQ')}
                    </p>
                  </div>
                </li>
              ))}
              {(!auditLog || auditLog.length === 0) && (
                <li className="text-sm text-gray-400">لا يوجد نشاط بعد</li>
              )}
            </ol>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-xl border border-gray-100 bg-white p-5">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
              <MapPin className="h-4 w-4" /> العميل والتوصيل
            </h2>
            <div className="space-y-1.5 text-sm">
              <p className="font-medium text-gray-900">{customer?.name ?? '—'}</p>
              <p className="text-gray-600">{customer?.phone}</p>
              {customer?.email && <p className="text-gray-600">{customer.email}</p>}
              <div className="border-t border-gray-100 pt-3 mt-3 space-y-1">
                <p className="text-gray-600">{gov?.name_ar}</p>
                <p className="text-gray-600">{order.city}</p>
                <p className="text-gray-600">{order.address}</p>
              </div>
              {order.notes && (
                <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-800 mt-2">
                  {order.notes}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-gray-100 bg-white p-5">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
              <CreditCard className="h-4 w-4" /> الدفع
            </h2>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">الطريقة</span>
                <span className="font-medium text-gray-900">
                  {({
                    cod: 'عند الاستلام',
                    zaincash: 'زين كاش',
                    fib: 'FIB',
                    qicard: 'كي كارد',
                    nasspay: 'ناس باي',
                  } as Record<string, string>)[order.payment_method] ?? order.payment_method}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">الحالة</span>
                <span
                  className={`font-medium ${
                    order.payment_status === 'paid'
                      ? 'text-green-700'
                      : order.payment_status === 'failed'
                        ? 'text-red-700'
                        : 'text-gray-900'
                  }`}
                >
                  {({
                    pending: 'معلّق',
                    paid: 'مدفوع',
                    failed: 'فشل',
                    refunded: 'مُرجَع',
                  } as Record<string, string>)[order.payment_status] ?? order.payment_status}
                </span>
              </div>
            </div>
          </section>

          <OrderStatusUpdater
            orderId={order.id}
            currentStatus={order.status}
            allowed={allowed}
          />
        </aside>
      </div>
    </div>
  );
}

function auditActionLabel(action: string): string {
  if (action.startsWith('order.status.')) {
    const status = action.replace('order.status.', '');
    return `تم تغيير الحالة إلى ${
      {
        draft: 'مسودة',
        pending: 'بانتظار',
        confirmed: 'مؤكد',
        preparing: 'قيد التحضير',
        ready: 'جاهز',
        shipped: 'مشحون',
        delivered: 'مُسلَّم',
        cancelled: 'ملغي',
        returned: 'مرتجع',
      }[status] ?? status
    }`;
  }
  if (action === 'order.created.manual') return 'تم إنشاء الطلب يدويًا';
  if (action === 'payment.initiated') return 'بدأت عملية الدفع';
  if (action === 'payment.callback') return 'تم استلام تأكيد الدفع';
  return action;
}
