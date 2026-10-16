import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Package, MapPin, Phone } from 'lucide-react';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { formatIQD } from '@/lib/utils';

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const { slug, id } = await params;
  const { new: isNew } = await searchParams;

  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from('public_storefronts')
    .select('id, name, phone')
    .eq('slug', slug)
    .maybeSingle();

  if (!tenant) notFound();

  const admin = createAdminClient();
  const { data: order } = await admin
    .from('orders')
    .select(
      `id, order_number, status, payment_method, payment_status, subtotal_iqd,
       delivery_fee_iqd, total_iqd, city, address, notes, created_at,
       customers(name, phone),
       iraq_governorates(name_ar),
       order_items(product_name, quantity, unit_price_iqd, total_price_iqd)`
    )
    .eq('id', id)
    .eq('tenant_id', tenant.id)
    .maybeSingle();

  if (!order) notFound();

  const customer = order.customers as unknown as { name: string | null; phone: string } | null;
  const gov = order.iraq_governorates as unknown as { name_ar: string } | null;
  const items = (order.order_items as unknown as {
    product_name: string;
    quantity: number;
    unit_price_iqd: number;
    total_price_iqd: number;
  }[]) ?? [];

  const statusLabels: Record<string, string> = {
    draft: 'مسودة',
    pending: 'بانتظار التأكيد',
    confirmed: 'مؤكد',
    preparing: 'قيد التحضير',
    ready: 'جاهز للشحن',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
    returned: 'مرتجع',
  };

  const paymentLabels: Record<string, string> = {
    cod: 'الدفع عند الاستلام',
    zaincash: 'زين كاش',
    fib: 'FIB',
    qicard: 'كي كارد',
    nasspay: 'ناس باي',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {isNew && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
          <h1 className="mt-3 text-xl font-bold text-green-900">تم استلام طلبك بنجاح!</h1>
          <p className="mt-1 text-sm text-green-700">
            سيتواصل معك فريق {tenant.name} لتأكيد الطلب
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">رقم الطلب</p>
            <p className="font-bold text-gray-900">{order.order_number}</p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            {statusLabels[order.status] ?? order.status}
          </span>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Package className="h-4 w-4" /> المنتجات
          </h2>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between gap-3 text-sm">
                <span className="text-gray-700">
                  {item.product_name} <span className="text-gray-400">×{item.quantity}</span>
                </span>
                <span className="font-medium text-gray-900 whitespace-nowrap">
                  {formatIQD(item.total_price_iqd)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>المجموع الفرعي</span>
            <span>{formatIQD(order.subtotal_iqd)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>التوصيل</span>
            <span>{formatIQD(order.delivery_fee_iqd)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-2 font-bold text-gray-900">
            <span>الإجمالي</span>
            <span className="text-nados-primary">{formatIQD(order.total_iqd)}</span>
          </div>
          <div className="flex justify-between text-gray-600 text-xs pt-1">
            <span>طريقة الدفع</span>
            <span>{paymentLabels[order.payment_method] ?? order.payment_method}</span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <MapPin className="h-4 w-4" /> التوصيل
          </h2>
          <div className="text-sm text-gray-700 space-y-1">
            <p>{customer?.name} — {customer?.phone}</p>
            <p>{gov?.name_ar} — {order.city}</p>
            <p>{order.address}</p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link
          href={`/store/${slug}/products`}
          className="text-sm text-nados-primary hover:underline"
        >
          مواصلة التسوق
        </Link>
      </div>
    </div>
  );
}
