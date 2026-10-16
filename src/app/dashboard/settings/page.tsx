import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MessageCircle, Truck, CreditCard, ShieldCheck, Copy } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'الإعدادات' };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  let storeSlug: string | null = null;
  try {
    const { data: membership } = await supabase
      .from('memberships')
      .select('tenant_id, tenants(slug, name, phone)')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();
    const tenants = membership?.tenants as unknown as { slug: string } | null;
    storeSlug = tenants?.slug ?? null;
  } catch {
    // not migrated
  }

  const sections = [
    {
      icon: MessageCircle,
      title: 'بوت واتساب',
      desc: 'اربط رقم WhatsApp Business ليحول البوت رسائل عملائك إلى طلبات تلقائيًا. يتطلب خطة Pro + مفتاح OpenAI + حساب Meta Business.',
      badge: 'يتطلب إعداد',
    },
    {
      icon: Truck,
      title: 'شركات التوصيل',
      desc: 'اربط Hi Express أو Boxy أو Galina بإدخال مفاتيح API — تُشفَّر بـ AES-256 ولا تظهر لأحد.',
      badge: 'متاح',
    },
    {
      icon: CreditCard,
      title: 'بوابات الدفع',
      desc: 'الدفع عند الاستلام متاح دائمًا. بوابات الدفع الإلكتروني (زين كاش، FIB، كي كارد، ناس باي) تحتاج أوراق اعتماد تاجر.',
      badge: 'متاح',
    },
    {
      icon: ShieldCheck,
      title: 'الأمان',
      desc: 'كل بيانات التاجر محمية بـ Row Level Security على مستوى قاعدة البيانات — عزل كامل بين المتاجر.',
      badge: 'مفعّل',
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
        <p className="mt-0.5 text-sm text-gray-500">إعدادات متجرك والتكاملات</p>
      </div>

      {storeSlug && (
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <h2 className="font-semibold text-gray-900">رابط متجرك</h2>
          <p className="mt-1 text-sm text-gray-500">شارك هذا الرابط مع عملائك</p>
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <code className="flex-1 truncate font-mono text-sm text-gray-900" dir="ltr">
              {process.env.NEXT_PUBLIC_SITE_URL ?? 'https://your-domain.com'}/store/{storeSlug}
            </code>
            <Copy className="h-4 w-4 shrink-0 text-gray-400" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {sections.map((s) => (
          <div key={s.title} className="rounded-xl border border-gray-100 bg-white p-5">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-nados-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                {s.badge}
              </span>
            </div>
            <h3 className="mt-3 font-semibold text-gray-900">{s.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
