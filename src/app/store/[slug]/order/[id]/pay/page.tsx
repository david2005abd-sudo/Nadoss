import { notFound } from 'next/navigation';
import Link from 'next/link';
import { QrCode, Smartphone, Copy } from 'lucide-react';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { getIraqPay } from '@/lib/payments/iraqpay';
import { formatIQD } from '@/lib/utils';

export default async function FibPayPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { slug, id } = await params;
  const { token } = await searchParams;
  if (!token) notFound();

  const supabase = await createClient();
  const { data: tenant } = await supabase
    .from('public_storefronts')
    .select('id, slug')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!tenant) notFound();

  const admin = createAdminClient();
  const { data: order } = await admin
    .from('orders')
    .select('id, tenant_id, order_number, total_iqd, payment_method, payment_status, payment_reference')
    .eq('id', id)
    .eq('tenant_id', tenant.id)
    .eq('public_access_token', token)
    .maybeSingle();

  if (!order || order.payment_method !== 'fib' || !order.payment_reference) notFound();

  if (order.payment_status === 'paid') {
    return (
      <div className="max-w-lg mx-auto rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <h1 className="text-xl font-bold text-green-900">تم الدفع بنجاح ✓</h1>
        <Link
          href={`/store/${slug}/order/${id}?token=${encodeURIComponent(token)}`}
          className="mt-4 inline-block text-sm text-green-700 hover:underline"
        >
          عرض تفاصيل الطلب
        </Link>
      </div>
    );
  }

  // Re-query payment status from gateway
  let qrCode: string | undefined;
  let readableCode: string | undefined;
  let deepLinks: { personal?: string; business?: string; corporate?: string } | undefined;

  if (order.payment_reference) {
    try {
      const pay = getIraqPay();
      const status = await pay.getStatus(order.payment_reference, 'fib');
      // Gateway may return QR in status payload for pending
      qrCode = (status as unknown as { qrCode?: string }).qrCode;
      readableCode = (status as unknown as { readableCode?: string }).readableCode;
      deepLinks = (status as unknown as { deepLinks?: typeof deepLinks }).deepLinks;
    } catch {
      // fall through — show generic instructions
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
          <QrCode className="h-6 w-6 text-nados-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">أكمل الدفع عبر FIB</h1>
          <p className="mt-1 text-sm text-gray-500">
            الطلب {order.order_number} — {formatIQD(order.total_iqd)}
          </p>
        </div>

        {qrCode ? (
          <img src={qrCode} alt="FIB QR Code" className="mx-auto h-52 w-52" />
        ) : (
          <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-xs text-gray-400">
            جارٍ تحميل رمز QR...
          </div>
        )}

        {readableCode && (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm">
            <span className="font-mono font-bold text-gray-900">{readableCode}</span>
            <Copy className="h-3.5 w-3.5 text-gray-400" />
          </div>
        )}

        {deepLinks?.personal && (
          <a
            href={deepLinks.personal}
            className="inline-flex items-center gap-2 rounded-lg bg-nados-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Smartphone className="h-4 w-4" />
            افتح تطبيق FIB
          </a>
        )}

        <p className="text-xs text-gray-400">
          بعد إتمام الدفع، ستُحدَّث حالة الطلب تلقائيًا خلال لحظات
        </p>
      </div>
    </div>
  );
}
