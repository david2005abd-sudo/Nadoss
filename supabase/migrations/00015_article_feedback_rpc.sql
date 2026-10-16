CREATE OR REPLACE FUNCTION public.increment_article_feedback(
  p_article_id UUID,
  p_helpful BOOLEAN
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.knowledge_articles
  SET
    helpful_count = CASE WHEN p_helpful THEN helpful_count + 1 ELSE helpful_count END,
    not_helpful_count = CASE WHEN NOT p_helpful THEN not_helpful_count + 1 ELSE not_helpful_count END
  WHERE id = p_article_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_article_feedback(UUID, BOOLEAN) TO authenticated, anon;
