'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Trash2 } from 'lucide-react';
import { deleteArticleAction } from '@/app/dashboard/knowledge/actions';

export function ArticleRowActions({
  id,
  title,
  isPlatform,
}: {
  id: string;
  title: string;
  isPlatform: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`هل أنت متأكد من حذف "${title}"؟`)) return;
    setOpen(false);
    startTransition(async () => {
      const result = await deleteArticleAction(id);
      if (result.error) alert(result.error);
      else router.refresh();
    });
  }

  if (isPlatform) return null;

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
          <div className="absolute left-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
            <button
              onClick={handleDelete}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-nados-danger hover:bg-red-50 text-right"
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
