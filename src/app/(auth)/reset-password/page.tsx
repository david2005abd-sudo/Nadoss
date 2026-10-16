import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ResetPasswordForm from './form';

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/forgot-password');
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">تعيين كلمة مرور جديدة</h1>
      <p className="mb-6 text-sm text-gray-500">
        تم التحقق من رقم هاتفك. اختر كلمة مرور جديدة لحسابك.
      </p>
      <ResetPasswordForm />
    </div>
  );
}
