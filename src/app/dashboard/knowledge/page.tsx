import Link from 'next/link';
import { BookOpen, Plus, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { KNOWLEDGE_CATEGORY_LABELS } from '@/lib/validations/knowledge';
import { ArticleRowActions } from '@/components/dashboard/article-row-actions';

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; created?: string; updated?: string }>;
}) {
  const { q, created, updated } = await searchParams;
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id, role')
    .limit(1)
    .single();

  const tenantId = membership!.tenant_id;

  let query = supabase
    .from('knowledge_articles')
    .select('id, slug, title, summary, category, is_published, is_platform, views_count, helpful_count, not_helpful_count, created_at')
    .or(`tenant_id.eq.${tenantId},is_platform.eq.true`)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (q) query = query.ilike('title', `%${q}%`);

  const { data: articles } = await query.limit(100);
  const isOwner = membership!.role === 'owner';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">قاعدة المعرفة</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            مقالات مساعدة لعملائك وفريقك
          </p>
        </div>
        <Link href="/dashboard/knowledge/new">
          <Button>
            <Plus className="h-4 w-4" />
            مقال جديد
          </Button>
        </Link>
      </div>

      {created && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          تم إنشاء المقال بنجاح
        </div>
      )}
      {updated && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          تم تحديث المقال
        </div>
      )}

      <form>
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ''}
            placeholder="ابحث في المقالات..."
            className="w-full rounded-lg border border-gray-300 bg-white pr-9 pl-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
          />
        </div>
      </form>

      {articles && articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((a) => (
            <div key={a.id} className="flex flex-col rounded-xl border border-gray-100 bg-white p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                  {KNOWLEDGE_CATEGORY_LABELS[a.category] ?? a.category}
                </span>
                {a.is_platform && (
                  <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700">
                    منصة
                  </span>
                )}
                {!a.is_published && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    مسودة
                  </span>
                )}
              </div>

              <Link href={`/dashboard/knowledge/${a.id}`}>
                <h3 className="font-semibold text-gray-900 hover:text-nados-primary line-clamp-2">
                  {a.title}
                </h3>
              </Link>
              {a.summary && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2 flex-1">{a.summary}</p>
              )}

              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                <span>{a.views_count} مشاهدة</span>
                <div className="flex items-center gap-2">
                  <span>👍 {a.helpful_count}</span>
                  <span>👎 {a.not_helpful_count}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Link href={`/dashboard/knowledge/${a.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    تعديل
                  </Button>
                </Link>
                {(isOwner || !a.is_platform) && (
                  <ArticleRowActions
                    id={a.id}
                    title={a.title}
                    isPlatform={a.is_platform}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-3 text-gray-500">
            {q ? 'لا توجد مقالات مطابقة' : 'لا توجد مقالات بعد'}
          </p>
          {!q && (
            <Link href="/dashboard/knowledge/new" className="mt-4 inline-block">
              <Button>
                <Plus className="h-4 w-4" />
                أنشئ أول مقال
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
