import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ArticleForm } from '@/components/dashboard/article-form';
import { createArticleAction } from '../actions';

export default async function NewArticlePage() {
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .limit(1)
    .single();

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/dashboard/knowledge"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-nados-primary"
        >
          <ArrowRight className="h-4 w-4" />
          العودة لقاعدة المعرفة
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">مقال جديد</h1>
      </div>

      <ArticleForm
        action={createArticleAction}
        canCreatePlatform={membership?.role === 'owner'}
        submitLabel="إنشاء المقال"
      />
    </div>
  );
}
