import Link from 'next/link';
import { Truck, ExternalLink } from 'lucide-react';

interface Shipment {
  id: string;
  tracking_number: string | null;
  status: string;
  created_at: string;
  delivery_companies: { name_ar: string } | null;
  orders: {
    order_number: string;
    customers: { name: string | null; phone: string } | null;
  } | null;
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  created: { label: 'منشأة', cls: 'bg-gray-100 text-gray-700' },
  picked_up: { label: 'استُلمت', cls: 'bg-blue-50 text-blue-700' },
  in_transit: { label: 'في الطريق', cls: 'bg-indigo-50 text-indigo-700' },
  out_for_delivery: { label: 'قيد التوصيل', cls: 'bg-cyan-50 text-cyan-700' },
  delivered: { label: 'مُسلَّمة', cls: 'bg-green-50 text-green-700' },
  failed: { label: 'فشلت', cls: 'bg-red-50 text-red-700' },
  returned: { label: 'مرتجعة', cls: 'bg-orange-50 text-orange-700' },
};

export function RecentShipments({ shipments }: { shipments: Shipment[] }) {
  return (
    <section className="rounded-xl border border-gray-100 bg-white">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="flex items-center gap-2 font-semibold text-gray-900">
          <Truck className="h-4 w-4" />
          آخر الشحنات
        </h2>
      </div>

      {shipments.length > 0 ? (
        <div className="divide-y divide-gray-50">
          {shipments.map((s) => {
            const status = STATUS_LABELS[s.status] ?? { label: s.status, cls: 'bg-gray-100 text-gray-700' };
            const customer = s.orders?.customers;
            return (
              <div key={s.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-gray-900">
                      {s.tracking_number ?? '—'}
                    </span>                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.cls}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {s.delivery_companies?.name_ar} — {customer?.name ?? customer?.phone ?? '—'}
                  </p>
                </div>
                {s.orders && (
                  <Link
                    href={`/dashboard/orders/${(s.orders as { order_number: string }).order_number ? '' : ''}`}
                    className="text-xs text-nados-primary hover:underline inline-flex items-center gap-1"
                  >
                    عرض
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-5 py-12 text-center text-sm text-gray-400">
          لا توجد شحنات بعد
        </div>
      )}
    </section>
  );
}
