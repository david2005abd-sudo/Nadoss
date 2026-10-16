import { MessageCircle, Copy, CheckCircle2 } from 'lucide-react';

interface NumberRow {
  id: string;
  phone_number_id: string;
  display_phone_number: string | null;
  waba_id: string | null;
  is_active: boolean;
}

export function WhatsAppSetupCard({
  existing,
  webhookUrl,
  verifyToken,
}: {
  existing: NumberRow[];
  webhookUrl: string;
  verifyToken: string;
}) {
  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-gray-100 bg-white p-5 space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-green-600" />
          <h2 className="font-semibold text-gray-900">خطوات الربط</h2>
        </div>

        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>سجّل في <a href="https://business.facebook.com" target="_blank" rel="noreferrer" className="text-nados-primary hover:underline">Meta Business</a></li>
          <li>أنشئ تطبيق WhatsApp من لوحة المطورين</li>
          <li>انسخ <strong>Phone Number ID</strong> و <strong>WABA ID</strong></li>
          <li>أضف Webhook URL و Verify Token أدناه</li>
          <li>أدخل بيانات الرقم في الحقول أدناه واحفظ</li>
        </ol>

        <div className="space-y-2">
          <LabeledCopy label="Webhook URL" value={webhookUrl} />
          <LabeledCopy label="Verify Token" value={verifyToken} />
        </div>
      </section>

      {existing.length > 0 && (
        <section className="rounded-xl border border-gray-100 bg-white p-5">
          <h2 className="font-semibold text-gray-900 mb-3">أرقام مرتبطة</h2>
          <div className="space-y-2">
            {existing.map((n) => (
              <div
                key={n.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {n.display_phone_number ?? n.phone_number_id}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">
                    {n.phone_number_id}
                  </p>
                </div>
                {n.is_active && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
                    <CheckCircle2 className="h-3 w-3" />
                    نشط
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-xl border border-amber-100 bg-amber-50 p-5 text-sm text-amber-800">
        <strong>ملاحظة:</strong> إضافة أرقام جديدة تتم حاليًا من قبل فريق نادوس. تواصل معنا
        لإضافة رقمك.
      </section>
    </div>
  );
}

function LabeledCopy({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-700">{label}</p>
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
        <code className="flex-1 text-xs font-mono text-gray-900 truncate" dir="ltr">
          {value || '—'}
        </code>
        <Copy className="h-3.5 w-3.5 text-gray-400" />
      </div>
    </div>
  );
}
