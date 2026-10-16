'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
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
    <html lang="ar" dir="rtl">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="mt-4 text-xl font-bold text-gray-900">
              حدث خطأ غير متوقع
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              نعتذر عن الإزعاج. فريقنا التقني تم إبلاغه وسيعمل على حل المشكلة.
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-gray-400 font-mono" dir="ltr">
                {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              className="mt-6 rounded-lg bg-nados-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              حاول مرة أخرى
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
