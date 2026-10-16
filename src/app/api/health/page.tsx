export const dynamic = 'force-static';

export default function HealthPage() {
  const checks = {
    app: 'ok',
    database: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-right" dir="rtl">
      <h1 className="text-2xl font-bold text-gray-900">حالة النظام</h1>
      <p className="mt-2 text-sm text-gray-500">فحص صحة منصة نادوس</p>
      <div className="mt-6 rounded-xl border border-gray-100 bg-white p-5 font-mono text-sm" dir="ltr">
        {Object.entries(checks).map(([key, value]) => (
          <p key={key} className="py-1 text-left">
            <span className="text-gray-500">{key}:</span>{' '}
            <span className="text-nados-secondary">{value}</span>
          </p>
        ))}
      </div>
      <p className="mt-6 text-xs text-gray-400">
        هذه نسخة ثابتة — الفحص الحي الكامل متوفر على النسخة المربوطة بالخادم.
      </p>
    </div>
  );
}
