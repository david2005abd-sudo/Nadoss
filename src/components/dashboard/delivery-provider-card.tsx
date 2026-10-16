'use client';

import { useActionState, useState } from 'react';
import { CheckCircle2, Loader2, Settings2, X, Zap } from 'lucide-react';
import { saveDeliveryAccountAction, type DeliveryActionState } from '@/app/dashboard/delivery/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Company {
  id: number;
  name_ar: string;
  name_en: string;
  slug: string;
  api_type: string | null;
  supports_cod: boolean;
  logo_url: string | null;
}

interface AccountInfo {
  id: string;
  isActive: boolean;
  isDefault: boolean;
}

interface CredentialField {
  key: string;
  label: string;
  type?: string;
}

const initialState: DeliveryActionState = {};

export function DeliveryProviderCard({
  company,
  supported,
  account,
  credentialFields,
}: {
  company: Company;
  supported: boolean;
  account: AccountInfo | null;
  credentialFields: CredentialField[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(saveDeliveryAccountAction, initialState);

  return (
    <div className="relative rounded-xl border border-gray-100 bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
            {company.logo_url ? (
              <img src={company.logo_url} alt={company.name_ar} className="h-8 w-8 object-contain" />
            ) : (
              <span className="text-lg font-bold text-gray-400">{company.name_ar.charAt(0)}</span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{company.name_ar}</h3>
            <p className="text-xs text-gray-500">{company.name_en}</p>
          </div>
        </div>

        {account && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
            <CheckCircle2 className="h-3 w-3" />
            مرتبط
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
        {company.supports_cod && (
          <span className="rounded-md bg-blue-50 px-2 py-0.5 text-blue-700">COD</span>
        )}
        {company.api_type === 'aggregator' && (
          <span className="rounded-md bg-purple-50 px-2 py-0.5 text-purple-700">مجمّع</span>
        )}
        {company.api_type === 'direct' && (
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-700">API مباشر</span>
        )}
        {company.api_type === 'manual' && (
          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-gray-600">يدوي</span>
        )}
        {!supported && (
          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-amber-700">قريبًا</span>
        )}
      </div>

      {state.error && (
        <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="mt-3 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-800">
          {state.success}
        </div>
      )}

      {supported ? (
        <div className="mt-4 flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="flex-1">
            <Settings2 className="h-3.5 w-3.5" />
            {account ? 'تعديل البيانات' : 'ربط الحساب'}
          </Button>
        </div>
      ) : (
        <p className="mt-4 text-xs text-gray-400">التكامل قيد التطوير</p>
      )}

      {/* Credentials modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-nados-primary" />
                <h3 className="font-semibold text-gray-900">ربط {company.name_ar}</h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <form action={formAction} className="p-5 space-y-4">
              <input type="hidden" name="deliveryCompanyId" value={company.id} />
              <input type="hidden" name="slug" value={company.slug} />

              {state.error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                  {state.error}
                </div>
              )}

              {credentialFields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={`cred_${field.key}`}>{field.label}</Label>
                  <Input
                    id={`cred_${field.key}`}
                    name={`cred_${field.key}`}
                    type={field.type ?? 'text'}
                    required={field.key === 'apiKey'}
                    placeholder={field.label}
                  />
                </div>
              ))}

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="isDefault"
                  defaultChecked={account?.isDefault ?? false}
                  className="h-4 w-4 rounded border-gray-300 text-nados-primary focus:ring-nados-primary"
                />
                <span>تعيين كشركة افتراضية</span>
              </label>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isPending} className="flex-1">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  اختبار وحفظ
                </Button>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
