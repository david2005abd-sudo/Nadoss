'use client';

import { useActionState } from 'react';
import { resetPasswordAction, type ActionState } from '../actions';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';

const initialState: ActionState = {};

export default function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      <FormField
        label="كلمة المرور الجديدة"
        name="password"
        type="password"
        placeholder="8 أحرف على الأقل"
        required
        autoComplete="new-password"
        errors={state.fieldErrors?.password}
      />
      <FormField
        label="تأكيد كلمة المرور"
        name="confirmPassword"
        type="password"
        placeholder="أعد كتابة كلمة المرور"
        required
        autoComplete="new-password"
        errors={state.fieldErrors?.confirmPassword}
      />
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'جارٍ تحديث كلمة المرور...' : 'حفظ كلمة المرور الجديدة'}
      </Button>
    </form>
  );
}
