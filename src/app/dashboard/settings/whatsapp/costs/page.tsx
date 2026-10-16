import Link from 'next/link';
import { ArrowRight, MessageCircle, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getWhatsAppMonthlySummary, checkWhatsAppQuota, WHATSAPP_FREE_TIER } from '@/lib/whatsapp/cost-tracker';

export default async function WhatsAppCostsPage() {
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id')
    .limit(1)
    .single();

  const [summary, quota] = await Promise.all([
    getWhatsAppMonthlySummary(membership!.tenant_id),
    checkWhatsAppQuota(membership!.tenant_id),
  ]);

  // 6-month history
  const { data: history } = await supabase
    .from('whatsapp_usage')
    .select('period_start, messages_sent, billable_messages, total_cost_usd, cost_charged_to_tenant_usd')
    .eq('tenant_id', membership!.tenant_id)
    .order('period_start', { ascending: false })
    .limit(6);

  const usedPct = summary ? (summary.messagesSent / Math.max(1, summary.messagesSent + quota.remaining)) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/settings/whatsapp"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-nados-primary"
        >
          <ArrowRight className="h-4 w-4" />
          العودة لإعدادات واتساب
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">تكاليف WhatsApp API</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          متابعة استهلاكك الشهري حسب أسعار Meta الجديدة (من 1 أكتوبر 2026)
        </p>
      </div>

      {/* Alert banners */}
      {quota.level === 'exceeded' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">تجاوزت الحد الشهري</h3>
            <p className="text-sm text-red-800 mt-1">
              استهلكت {quota.used} من {quota.limit} رسالة. تكلفة إضافية متوقعة:{' '}
              ~${quota.estimatedExtraCostUsd.toFixed(2)}.
            </p>
            <Link
              href="/dashboard/billing"
              className="mt-2 inline-block rounded-lg bg-red-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-red-700"
            >
              ترقية الخطة
            </Link>
          </div>
        </div>
      )}

      {quota.level === 'critical' && quota.level !== 'exceeded' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900">اقتربت من الحد</h3>
            <p className="text-sm text-amber-800 mt-1">
              تبقى {quota.remaining} رسالة فقط هذا الشهر.
            </p>
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500">الرسائل المُرسلة</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {summary?.messagesSent ?? 0}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                من أصل {quota.limit} رسالة/شهر
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <MessageCircle className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500">الحصة المجانية</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {summary?.freeQuotaUsed ?? 0} / {WHATSAPP_FREE_TIER}
              </p>
              <p className="mt-1 text-xs text-green-600">
                متبقٍ: {Math.max(0, WHATSAPP_FREE_TIER - (summary?.freeQuotaUsed ?? 0))}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500">رسائل مدفوعة</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {summary?.billableMessages ?? 0}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                بعد الحصة المجانية (1,000)
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500">التكلفة الإجمالية</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                ${summary?.totalCostUsd.toFixed(2) ?? '0.00'}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                المتوقع نهاية الشهر: ${summary?.projectedMonthEndUsd.toFixed(2) ?? '0.00'}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Cost breakdown */}
      <section className="rounded-xl border border-gray-100 bg-white p-5">
        <h2 className="font-semibold text-gray-900 mb-4">تفصيل التكلفة</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-600">سعر الرسالة (العراق)</span>
            <span className="font-medium text-gray-900">$0.0079 / رسالة</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-600">الحصة المجانية الشهرية</span>
            <span className="font-medium text-green-700">1,000 رسالة</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-600">تكلفة Meta الإجمالية</span>
            <span className="font-medium text-gray-900">
              ${summary?.totalCostUsd.toFixed(2) ?? '0.00'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-600">مُحتسب عليك</span>
            <span className="font-medium text-gray-900">
              ${summary?.chargedToTenantUsd.toFixed(2) ?? '0.00'}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">تتحمله نادوس</span>
            <span className="font-medium text-green-700">
              ${summary?.absorbedByPlatformUsd.toFixed(2) ?? '0.00'}
            </span>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="rounded-xl border border-gray-100 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">السجل الشهري</h2>
        </div>
        {history && history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="px-5 py-3 text-right font-medium">الشهر</th>
                  <th className="px-5 py-3 text-right font-medium">الرسائل</th>
                  <th className="px-5 py-3 text-right font-medium">مدفوعة</th>
                  <th className="px-5 py-3 text-right font-medium">تكلفة Meta</th>
                  <th className="px-5 py-3 text-right font-medium">مُحتسب عليك</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.map((h) => (
                  <tr key={h.period_start}>
                    <td className="px-5 py-3 text-gray-900">
                      {new Date(h.period_start).toLocaleDateString('ar-IQ', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3 text-gray-700">{h.messages_sent}</td>
                    <td className="px-5 py-3 text-gray-700">{h.billable_messages}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">
                      ${Number(h.total_cost_usd).toFixed(2)}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">
                      ${Number(h.cost_charged_to_tenant_usd).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-12 text-center text-sm text-gray-400">
            لا يوجد استهلاك مسجل بعد
          </div>
        )}
      </section>

      {/* Info */}
      <section className="rounded-xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-900">
        <strong>ملاحظة:</strong> اعتبارًا من 1 أكتوبر 2026، تفرض Meta رسومًا على رسائل الخدمة
        (Service Messages) بعد أول 1,000 رسالة مجانية شهريًا لكل رقم أعمال. الرسائل الواردة من
        العملاء إليك لا تخضع للرسوم.
      </section>
    </div>
  );
}
