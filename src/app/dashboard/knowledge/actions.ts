'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { articleSchema, articleFeedbackSchema } from '@/lib/validations/knowledge';
import { generateEmbedding } from '@/lib/ai/embeddings';

export interface ArticleActionState {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
}

function toFieldErrors(errors: Record<string, string[] | undefined>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(errors)) if (v && v.length) out[k] = v;
  return out;
}

async function getCtx() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single();
  if (!membership) redirect('/login');
  return { supabase, tenantId: membership.tenant_id, role: membership.role, userId: user.id };
}

export async function createArticleAction(
  _prev: ArticleActionState,
  formData: FormData
): Promise<ArticleActionState> {
  const raw = {
    slug: formData.get('slug'),
    title: formData.get('title'),
    titleEn: formData.get('titleEn') ?? '',
    summary: formData.get('summary') ?? '',
    content: formData.get('content'),
    category: formData.get('category'),
    tags: formData.get('tags') ?? '',
    isPublished: formData.get('isPublished') === 'on',
    isPlatform: formData.get('isPlatform') === 'on',
  };

  const parsed = articleSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error.flatten().fieldErrors) };
  }
  const data = parsed.data;

  const { supabase, tenantId, userId, role } = await getCtx();

  // Platform articles only for owners
  const isPlatform = data.isPlatform && role === 'owner';

  // Generate embedding from title + summary + content
  let embedding: number[] | null = null;
  try {
    embedding = await generateEmbedding(
      `${data.title}\n${data.summary ?? ''}\n${data.content}`
    );
  } catch (err) {
    console.warn('[knowledge] Embedding failed, article will be text-only', err);
  }

  const tags = data.tags
    ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  const { error } = await supabase.from('knowledge_articles').insert({
    tenant_id: isPlatform ? null : tenantId,
    slug: data.slug,
    title: data.title,
    title_en: data.titleEn || null,
    summary: data.summary || null,
    content: data.content,
    category: data.category,
    tags,
    is_published: data.isPublished,
    is_platform: isPlatform,
    author_id: userId,
    embedding: embedding as never,
  });

  if (error) {
    if (error.code === '23505') return { error: 'يوجد مقال بنفس الرابط' };
    return { error: 'تعذر إنشاء المقال' };
  }

  revalidatePath('/dashboard/knowledge');
  redirect('/dashboard/knowledge?created=1');
}

export async function updateArticleAction(
  id: string,
  _prev: ArticleActionState,
  formData: FormData
): Promise<ArticleActionState> {
  const raw = {
    slug: formData.get('slug'),
    title: formData.get('title'),
    titleEn: formData.get('titleEn') ?? '',
    summary: formData.get('summary') ?? '',
    content: formData.get('content'),
    category: formData.get('category'),
    tags: formData.get('tags') ?? '',
    isPublished: formData.get('isPublished') === 'on',
    isPlatform: formData.get('isPlatform') === 'on',
  };

  const parsed = articleSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error.flatten().fieldErrors) };
  }
  const data = parsed.data;

  const { supabase, tenantId, role } = await getCtx();

  // Fetch existing to check ownership
  const { data: existing } = await supabase
    .from('knowledge_articles')
    .select('tenant_id, is_platform')
    .eq('id', id)
    .maybeSingle();

  if (!existing) return { error: 'المقال غير موجود' };
  if (existing.is_platform && role !== 'owner') {
    return { error: 'صلاحيات غير كافية لتعديل مقالات المنصة' };
  }
  if (!existing.is_platform && existing.tenant_id !== tenantId) {
    return { error: 'صلاحيات غير كافية' };
  }

  // Regenerate embedding
  let embedding: number[] | null = null;
  try {
    embedding = await generateEmbedding(
      `${data.title}\n${data.summary ?? ''}\n${data.content}`
    );
  } catch {
    // keep existing embedding
  }

  const tags = data.tags
    ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  const update: Record<string, unknown> = {
    slug: data.slug,
    title: data.title,
    title_en: data.titleEn || null,
    summary: data.summary || null,
    content: data.content,
    category: data.category,
    tags,
    is_published: data.isPublished,
  };
  if (embedding) update.embedding = embedding;

  const { error } = await supabase
    .from('knowledge_articles')
    .update(update)
    .eq('id', id);

  if (error) return { error: 'تعذر تحديث المقال' };

  revalidatePath('/dashboard/knowledge');
  revalidatePath(`/dashboard/knowledge/${id}`);
  redirect('/dashboard/knowledge?updated=1');
}

export async function deleteArticleAction(id: string): Promise<ArticleActionState> {
  const { supabase, tenantId, role } = await getCtx();

  const { data: existing } = await supabase
    .from('knowledge_articles')
    .select('tenant_id, is_platform')
    .eq('id', id)
    .maybeSingle();

  if (!existing) return { error: 'المقال غير موجود' };
  if (existing.is_platform && role !== 'owner') {
    return { error: 'صلاحيات غير كافية' };
  }

  const { error } = await supabase
    .from('knowledge_articles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { error: 'تعذر حذف المقال' };
  revalidatePath('/dashboard/knowledge');
  return { success: 'تم حذف المقال' };
}

export async function submitArticleFeedbackAction(
  _prev: ArticleActionState,
  formData: FormData
): Promise<ArticleActionState> {
  const raw = {
    articleId: formData.get('articleId'),
    isHelpful: formData.get('isHelpful') === 'true',
    comment: formData.get('comment') ?? '',
  };

  const parsed = articleFeedbackSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error.flatten().fieldErrors) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get tenant if authenticated
  let tenantId: string | null = null;
  if (user) {
    const { data: m } = await supabase
      .from('memberships')
      .select('tenant_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();
    tenantId = m?.tenant_id ?? null;
  }

  await supabase.from('article_feedback').insert({
    tenant_id: tenantId,
    article_id: parsed.data.articleId,
    user_id: user?.id ?? null,
    is_helpful: parsed.data.isHelpful,
    comment: parsed.data.comment || null,
  });

  // Update counter
  await supabase.rpc('increment_article_feedback', {
    p_article_id: parsed.data.articleId,
    p_helpful: parsed.data.isHelpful,
  });

  revalidatePath(`/help/${parsed.data.articleId}`);
  return { success: 'شكرًا لتقييمك!' };
}
