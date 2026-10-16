-- ============================================
-- NADOS — Support Tickets, Live Chat, Knowledge Base
-- ============================================

-- Extend existing support_tickets with category + SLA + tags
ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general'
    CHECK (category IN ('general', 'billing', 'technical', 'delivery', 'order', 'product', 'account', 'feature_request')),
  ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sla_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sla_breached BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS closed_by UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant_status
  ON public.support_tickets(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant_category
  ON public.support_tickets(tenant_id, category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_sla
  ON public.support_tickets(sla_due_at)
  WHERE status IN ('open', 'in_progress', 'waiting');

-- ============================================
-- Ticket messages (chat thread)
-- ============================================
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'staff', 'system')),
  sender_name TEXT,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'file', 'system_event')),
  attachments JSONB DEFAULT '[]'::jsonb,
  is_internal BOOLEAN DEFAULT FALSE,
  read_by_customer_at TIMESTAMPTZ,
  read_by_staff_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ticket_messages_ticket
  ON public.ticket_messages(ticket_id, created_at ASC);
CREATE INDEX idx_ticket_messages_tenant
  ON public.ticket_messages(tenant_id);

-- pgvector must be enabled before creating the embedding column.
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- ============================================
-- Knowledge base articles
-- ============================================
CREATE TABLE IF NOT EXISTS public.knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE, -- NULL = platform-level article
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  summary TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT FALSE,
  is_platform BOOLEAN DEFAULT FALSE, -- platform-wide article (visible to all tenants)
  views_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  embedding extensions.vector(1536), -- pgvector for semantic search
  author_id UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique per tenant (or globally for platform articles)
CREATE UNIQUE INDEX idx_knowledge_articles_slug
  ON public.knowledge_articles(COALESCE(tenant_id, '00000000-0000-0000-0000-000000000000'::uuid), slug)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_knowledge_articles_tenant
  ON public.knowledge_articles(tenant_id, is_published);
CREATE INDEX idx_knowledge_articles_platform
  ON public.knowledge_articles(is_platform, is_published);
CREATE INDEX idx_knowledge_articles_tags
  ON public.knowledge_articles USING gin(tags);

-- pgvector extension is enabled above before table creation.

-- IVFFlat index for embedding search
CREATE INDEX idx_knowledge_articles_embedding
  ON public.knowledge_articles
  USING ivfflat (embedding extensions.vector_cosine_ops)
  WITH (lists = 100)
  WHERE embedding IS NOT NULL;

-- ============================================
-- Article feedback
-- ============================================
CREATE TABLE IF NOT EXISTS public.article_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.knowledge_articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_helpful BOOLEAN NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_article_feedback_article ON public.article_feedback(article_id);

-- ============================================
-- Ticket categories dictionary per tenant
-- ============================================
CREATE TABLE IF NOT EXISTS public.ticket_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_categories ENABLE ROW LEVEL SECURITY;

-- Ticket messages: tenant-scoped, but customers can't see internal notes
CREATE POLICY "ticket_messages_select_own" ON public.ticket_messages
  FOR SELECT USING (
    tenant_id = (SELECT public.get_tenant_id())
    AND (
      is_internal = FALSE
      OR (SELECT public.get_user_role()) IN ('owner', 'admin', 'staff')
    )
  );

CREATE POLICY "ticket_messages_insert_own" ON public.ticket_messages
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT public.get_tenant_id())
  );

CREATE POLICY "ticket_messages_update_own" ON public.ticket_messages
  FOR UPDATE USING (
    tenant_id = (SELECT public.get_tenant_id())
  );

-- Knowledge articles: public read for published platform + tenant articles
CREATE POLICY "knowledge_articles_public_read" ON public.knowledge_articles
  FOR SELECT USING (
    is_published = TRUE
    AND deleted_at IS NULL
  );

CREATE POLICY "knowledge_articles_tenant_write" ON public.knowledge_articles
  FOR INSERT WITH CHECK (
    (tenant_id IS NULL AND is_platform = TRUE AND (SELECT public.get_user_role()) = 'owner')
    OR (tenant_id = (SELECT public.get_tenant_id()) AND (SELECT public.get_user_role()) IN ('owner', 'admin'))
  );

CREATE POLICY "knowledge_articles_tenant_update" ON public.knowledge_articles
  FOR UPDATE USING (
    (tenant_id IS NULL AND is_platform = TRUE AND (SELECT public.get_user_role()) = 'owner')
    OR (tenant_id = (SELECT public.get_tenant_id()) AND (SELECT public.get_user_role()) IN ('owner', 'admin'))
  );

CREATE POLICY "article_feedback_insert" ON public.article_feedback
  FOR INSERT WITH CHECK (
    tenant_id IS NULL OR tenant_id = (SELECT public.get_tenant_id())
  );

CREATE POLICY "article_feedback_select" ON public.article_feedback
  FOR SELECT USING (
    tenant_id IS NULL OR tenant_id = (SELECT public.get_tenant_id())
  );

CREATE POLICY "ticket_categories_select" ON public.ticket_categories
  FOR SELECT USING (
    tenant_id = (SELECT public.get_tenant_id())
  );

CREATE POLICY "ticket_categories_write" ON public.ticket_categories
  FOR ALL USING (
    tenant_id = (SELECT public.get_tenant_id())
    AND (SELECT public.get_user_role()) IN ('owner', 'admin')
  );

-- ============================================
-- Triggers
-- ============================================
CREATE TRIGGER trg_knowledge_articles_updated_at
  BEFORE UPDATE ON public.knowledge_articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Update ticket last_activity + status auto-transition on new message
CREATE OR REPLACE FUNCTION public.handle_ticket_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update ticket activity
  UPDATE public.support_tickets
  SET
    last_activity_at = NEW.created_at,
    status = CASE
      WHEN NEW.sender_type = 'staff' AND status IN ('open', 'in_progress') THEN 'waiting'
      WHEN NEW.sender_type = 'customer' AND status = 'waiting' THEN 'in_progress'
      ELSE status
    END,
    first_response_at = CASE
      WHEN NEW.sender_type = 'staff' AND first_response_at IS NULL THEN NEW.created_at
      ELSE first_response_at
    END
  WHERE id = NEW.ticket_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_ticket_message_activity
  AFTER INSERT ON public.ticket_messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_ticket_message();

-- ============================================
-- Enable Supabase Realtime (Broadcast) for ticket messages
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;

-- ============================================
-- RPC: semantic search for knowledge base
-- ============================================
CREATE OR REPLACE FUNCTION public.search_knowledge_articles(
  p_query_embedding vector(1536),
  p_tenant_id UUID,
  p_match_count INTEGER DEFAULT 5,
  p_match_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  title TEXT,
  summary TEXT,
  category TEXT,
  is_platform BOOLEAN,
  similarity FLOAT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ka.id,
    ka.slug,
    ka.title,
    ka.summary,
    ka.category,
    ka.is_platform,
    1 - (ka.embedding <=> p_query_embedding) AS similarity
  FROM public.knowledge_articles ka
  WHERE ka.is_published = TRUE
    AND ka.deleted_at IS NULL
    AND ka.embedding IS NOT NULL
    AND (ka.is_platform = TRUE OR ka.tenant_id = p_tenant_id)
    AND 1 - (ka.embedding <=> p_query_embedding) > p_match_threshold
  ORDER BY ka.embedding <=> p_query_embedding
  LIMIT p_match_count;
$$;

GRANT EXECUTE ON FUNCTION public.search_knowledge_articles(vector, UUID, INTEGER, FLOAT)
  TO authenticated, anon, service_role;

-- ============================================
-- RPC: increment article views / helpful votes
-- ============================================
CREATE OR REPLACE FUNCTION public.increment_article_views(p_article_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.knowledge_articles
  SET views_count = views_count + 1
  WHERE id = p_article_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_article_views(UUID) TO authenticated, anon;
