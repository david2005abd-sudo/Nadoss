import type { SupabaseClient } from '@supabase/supabase-js';
import type { AiExtraction } from './schemas';

export interface MatchedItem {
  originalName: string;
  quantity: number;
  notes: string | null;
  matchedProductId: string | null;
  matchedName: string | null;
  unitPriceIqd: number | null;
  stock: number | null;
  status: 'matched' | 'not_found' | 'ambiguous';
}

export interface MatchResult {
  items: MatchedItem[];
  totalMatched: number;
  totalUnmatched: number;
  subtotalIqd: number;
}

/**
 * Fuzzy match Arabic product names using trigram similarity via pg_trgm.
 * Falls back to ILIKE for short names.
 */
export async function matchProducts(
  supabase: SupabaseClient,
  tenantId: string,
  extraction: AiExtraction
): Promise<MatchResult> {
  const items: MatchedItem[] = [];

  for (const item of extraction.items) {
    const name = item.product_name.trim();
    if (!name) {
      items.push({
        originalName: item.product_name,
        quantity: item.quantity,
        notes: item.notes,
        matchedProductId: null,
        matchedName: null,
        unitPriceIqd: null,
        stock: null,
        status: 'not_found',
      });
      continue;
    }

    // Try exact ILIKE match first
    const { data: exact } = await supabase
      .from('products')
      .select('id, name_ar, name, price_iqd, stock')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .or(`name_ar.ilike.%${name}%,name.ilike.%${name}%`)
      .limit(3);

    if (exact && exact.length === 1) {
      const p = exact[0];
      items.push({
        originalName: name,
        quantity: item.quantity,
        notes: item.notes,
        matchedProductId: p.id,
        matchedName: p.name_ar || p.name,
        unitPriceIqd: p.price_iqd,
        stock: p.stock,
        status: 'matched',
      });
      continue;
    }

    if (exact && exact.length > 1) {
      items.push({
        originalName: name,
        quantity: item.quantity,
        notes: item.notes,
        matchedProductId: null,
        matchedName: null,
        unitPriceIqd: null,
        stock: null,
        status: 'ambiguous',
      });
      continue;
    }

    // Try trigram similarity (requires pg_trgm extension + index)
    const { data: fuzzy } = await supabase.rpc('match_products_fuzzy', {
      p_tenant_id: tenantId,
      p_query: name,
      p_limit: 3,
    });

    const fuzzyList = (fuzzy ?? []) as Array<{
      id: string;
      name_ar: string;
      name: string;
      price_iqd: number;
      stock: number;
      similarity: number;
    }>;

    if (fuzzyList.length > 0 && fuzzyList[0].similarity >= 0.35) {
      const p = fuzzyList[0];
      items.push({
        originalName: name,
        quantity: item.quantity,
        notes: item.notes,
        matchedProductId: p.id,
        matchedName: p.name_ar || p.name,
        unitPriceIqd: p.price_iqd,
        stock: p.stock,
        status: 'matched',
      });
      continue;
    }

    items.push({
      originalName: name,
      quantity: item.quantity,
      notes: item.notes,
      matchedProductId: null,
      matchedName: null,
      unitPriceIqd: null,
      stock: null,
      status: 'not_found',
    });
  }

  const totalMatched = items.filter((i) => i.status === 'matched').length;
  const totalUnmatched = items.filter((i) => i.status !== 'matched').length;
  const subtotalIqd = items.reduce(
    (s, i) => s + (i.unitPriceIqd ?? 0) * i.quantity,
    0
  );

  return { items, totalMatched, totalUnmatched, subtotalIqd };
}
