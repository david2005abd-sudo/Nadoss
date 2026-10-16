'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MoreVertical, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { deleteProductAction, toggleProductActiveAction } from '@/app/dashboard/products/actions';

export function ProductRowActions({
  id,
  name,
  isActive,
}: {
  id: string;
  name: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`هل أنت متأكد من حذف "${name}"؟`)) return;
    setOpen(false);
    startTransition(async () => {
      const result = await deleteProductAction(id);
      if (result.error) alert(result.error);
      else router.refresh();
    });
  }

  function handleToggle() {
    setOpen(false);
    startTransition(async () => {
      const result = await toggleProductActiveAction(id, !isActive);
      if (result.error) alert(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
            <Link
              href={`/dashboard/products/${id}`}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              <Pencil className="h-3.5 w-3.5" />
              تعديل
            </Link>
            <button
              onClick={handleToggle}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-right"
            >
              {isActive ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  تعطيل
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  تنشيط
                </>
              )}
            </button>
            <button
              onClick={handleDelete}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-nados-danger hover:bg-red-50 text-right border-t border-gray-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
              حذف
            </button>
          </div>
        </>
      )}
    </div>
  );
}
