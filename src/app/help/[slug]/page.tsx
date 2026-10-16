import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Eye, ThumbsUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { KNOWLEDGE_CATEGORY_LABELS } from '@/lib/validations/knowledge';
import { ArticleFeedback } from '@/components/knowledge/article-feedback';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('knowledge_articles')
    .select('title, summary')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  return {
    title: data ? `${data.title} — نادوس` : 'مقال غير موجود',
    description: data?.summary ?? '',
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from('knowledge_articles')
    .select('id, slug, title, summary, content, category, views_count, helpful_count, not_helpful_count')
    .eq('slug', slug)
    .eq('is_published', true)
    .is('deleted_at', null)
    .maybeSingle();

  if (!article) notFound();

  // Fire-and-forget view increment
  supabase.rpc('increment_article_views', { p_article_id: article.id }).then(() => {});

  // Related articles (same category)
  const { data: related } = await supabase
    .from('knowledge_articles')
    .select('id, slug, title')
    .eq('category', article.category)
    .eq('is_published', true)
    .is('deleted_at', null)
    .neq('id', article.id)
    .limit(4);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-3xl px-4 py-5">
          <Link
            href="/help"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-nados-primary"
          >
            <ArrowRight className="h-4 w-4" />
            مركز المساعدة
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <article className="rounded-2xl border border-gray-100 bg-white p-6 md:p-10">
          <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            {KNOWLEDGE_CATEGORY_LABELS[article.category] ?? article.category}
          </span>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">{article.title}</h1>
          {article.summary && (
            <p className="mt-2 text-gray-600 text-lg">{article.summary}</p>
          )}
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {article.views_count} مشاهدة
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5" />
              {article.helpful_count} وجده مفيدًا
            </span>
          </div>
          <div className="mt-8 prose prose-sm md:prose-base max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
            {article.content}
          </div>
        </article>

        <ArticleFeedback
          articleId={article.id}
          helpfulCount={article.helpful_count}
        />

        {related && related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-bold text-gray-900 mb-3">مقالات ذات صلة</h2>
            <div className="space-y-2">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/help/${r.slug}`}
                  className="block rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm text-gray-900 hover:border-nados-primary"
                >
                  {r.title}
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 rounded-xl border border-gray-100 bg-white p-6 text-center">
          <p className="text-gray-600">لم تجد ما تبحث عنه؟</p>
          <Link
            href="/dashboard/support/new"
            className="mt-3 inline-block rounded-lg bg-nados-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            تواصل مع فريق الدعم
          </Link>
        </div>
      </main>
    </div>
  );
}
