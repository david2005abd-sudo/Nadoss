import Link from 'next/link';
import { BookOpen, Search, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { KNOWLEDGE_CATEGORY_LABELS } from '@/lib/validations/knowledge';

export const revalidate = 120;

export default async function HelpCenterPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('knowledge_articles')
    .select('id, slug, title, summary, category, views_count, helpful_count')
    .eq('is_published', true)
    .is('deleted_at', null)
    .order('views_count', { ascending: false });

  if (category) query = query.eq('category', category);
  if (q) query = query.ilike('title', `%${q}%`);

  const { data: articles } = await query.limit(60);

  // Category counts
  const { data: catCounts } = await supabase
    .from('knowledge_articles')
    .select('category')
    .eq('is_published', true)
    .is('deleted_at', null);

  const countsByCategory = (catCounts ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.category] = (acc[row.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-l from-blue-50 via-white to-green-50 border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-nados-primary flex items-center justify-center text-white font-bold">
              ن
            </div>
            <span className="text-xl font-bold text-gray-900">نادوس</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            كيف يمكننا مساعدتك؟
          </h1>
          <p className="mt-2 text-gray-600">
            ابحث في مقالات المساعدة أو تواصل مع فريق الدعم
          </p>

          <form className="mt-6 mx-auto max-w-xl">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="search"
                name="q"
                defaultValue={q ?? ''}
                placeholder="ابحث عن مقال..."
                className="w-full rounded-xl border border-gray-200 bg-white pr-12 pl-4 py-3.5 text-base shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
              />
            </div>
          </form>

          <div className="mt-3 text-xs text-gray-500 flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3" />
            بحث ذكي مدعوم بالذكاء الاصطناعي
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* Categories */}
        {!q && !category && (
          <section className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-4">تصفح حسب الفئة</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(KNOWLEDGE_CATEGORY_LABELS).map(([key, label]) => {
                const count = countsByCategory[key] ?? 0;
                if (count === 0) return null;
                return (
                  <Link
                    key={key}
                    href={`/help?category=${key}`}
                    className="rounded-xl border border-gray-100 bg-white p-4 hover:border-nados-primary hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-nados-primary" />
                      <h3 className="font-medium text-gray-900">{label}</h3>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{count} مقال</p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Results */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {q ? `نتائج البحث عن "${q}"` : category ? KNOWLEDGE_CATEGORY_LABELS[category] : 'الأكثر مشاهدة'}
          </h2>

          {articles && articles.length > 0 ? (
            <div className="space-y-3">
              {articles.map((a) => (
                <Link
                  key={a.id}
                  href={`/help/${a.slug}`}
                  className="block rounded-xl border border-gray-100 bg-white p-5 hover:border-nados-primary hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{a.title}</h3>
                      {a.summary && (
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{a.summary}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {a.views_count} مشاهدة
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
              <p className="text-gray-500">
                {q ? 'لم نجد مقالات مطابقة' : 'لا توجد مقالات بعد'}
              </p>
              <p className="mt-2 text-sm text-gray-400">
                جرب كلمات مختلفة أو{' '}
                <Link href="/dashboard/support/new" className="text-nados-primary hover:underline">
                  تواصل مع الدعم
                </Link>
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
