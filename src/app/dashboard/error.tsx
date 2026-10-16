'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="rounded-xl border border-red-100 bg-white p-8 text-center">
      <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />
      <h2 className="mt-3 text-lg font-bold text-gray-900">
        تعذر تحميل هذا القسم
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        حاول تحديث الصفحة أو العودة لاحقًا
      </p>
      {error.digest && (
        <p className="mt-1 text-xs text-gray-400 font-mono" dir="ltr">
          {error.digest}
        </p>
      )}
      <button
        onClick={reset}        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-nados-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        <RefreshCw className="h-4 w-4" />
        إعادة المحاولة
      </button>
    </div>
  );
}
