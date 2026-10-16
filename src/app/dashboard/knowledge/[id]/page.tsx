import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ArticleForm } from '@/components/dashboard/article-form';
import { updateArticleAction } from '../actions';

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id, role')
    .limit(1)
    .single();

  const { data: article } = await supabase
    .from('knowledge_articles')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (!article) notFound();

  const boundAction = updateArticleAction.bind(null, id);

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
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          تعديل: {article.title}
        </h1>
      </div>

      <ArticleForm
        action={boundAction as never}
        canCreatePlatform={membership?.role === 'owner'}
        initial={{
          slug: article.slug,
          title: article.title,
          titleEn: article.title_en ?? '',
          summary: article.summary ?? '',
          content: article.content,
          category: article.category,
          tags: (article.tags ?? []).join(', '),
          isPublished: article.is_published,
          isPlatform: article.is_platform,
        }}
        submitLabel="حفظ التغييرات"
      />
    </div>
  );
}
