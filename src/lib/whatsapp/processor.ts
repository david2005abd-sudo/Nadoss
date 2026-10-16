import type { SupabaseClient } from '@supabase/supabase-js';
import { getWhatsAppClient } from './client';
import type { InboundMessage } from './types';
import { extractOrderFromMessage } from '@/lib/ai/extractor';
import { matchProducts } from '@/lib/ai/matcher';
import { buildCustomerReply, buildMerchantNotification } from '@/lib/ai/reply';

interface ProcessInput {
  phoneNumberId: string;
  message: InboundMessage;
  contactName: string | null;
  supabase: SupabaseClient;
}

const SUPPORTED_TYPES = ['text', 'interactive', 'button'] as const;

export async function processInboundMessage(input: ProcessInput) {
  const { supabase, message, phoneNumberId, contactName } = input;

  // 1. Resolve tenant by phone_number_id
  const { data: mapping } = await supabase
    .from('whatsapp_numbers')
    .select('tenant_id, is_active')
    .eq('phone_number_id', phoneNumberId)
    .maybeSingle();

  if (!mapping || !mapping.is_active) {
    console.warn(`[whatsapp] No tenant mapped for phone_number_id=${phoneNumberId}`);
    return;
  }

  const tenantId = mapping.tenant_id;

  // 2. Extract text body
  const text = extractText(message);
  if (!text) {
    await sendText(message.from, 'عذرًا، حاليًا نستقبل الرسائل النصية فقط 🙏');
    return;
  }

  // 3. Upsert conversation
  const conversationId = await upsertConversation(supabase, {
    tenantId,
    phone: message.from,
    channel: 'whatsapp',
    externalId: message.from, // wa_id = phone for WhatsApp
  });

  // 4. Persist inbound message
  const messageId = await persistMessage(supabase, {
    tenantId,
    conversationId,
    direction: 'inbound',
    senderType: 'customer',
    content: text,
    contentType: 'text',
    externalMessageId: message.id,
  });

  // 5. Check usage counter (ai_messages)
  const quota = await checkAiQuota(supabase, tenantId);
  if (!quota.ok) {
    await sendText(
      message.from,
      'وصلت للحد الأقصى من رسائل البوت لهذا الشهر. سيتواصل معك فريقنا قريبًا 🙏'
    );
    return;
  }

  // 6. Fetch tenant config + products list + governorates
  const [tenantRes, productsRes, govRes] = await Promise.all([
    supabase.from('tenants').select('id, name, slug').eq('id', tenantId).single(),
    supabase
      .from('products')
      .select('name_ar, name, price_iqd')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .limit(200),
    supabase
      .from('iraq_governorates')
      .select('name_ar')
      .eq('is_active', true)
      .order('id'),
  ]);

  const tenant = tenantRes.data;
  const products = productsRes.data ?? [];
  const governorates = (govRes.data ?? []).map((g) => g.name_ar);

  if (!tenant) return;

  const productsList = products
    .map((p) => `- ${p.name_ar || p.name} — ${p.price_iqd} د.ع`)
    .join('\n');
  const governoratesList = governorates.join('، ');

  // 7. AI extraction
  let extraction;
  try {
    const result = await extractOrderFromMessage(text, {
      storeName: tenant.name,
      productsList: productsList || '(لا توجد منتجات)',
      governoratesList,
      customerPhone: message.from,
    });
    extraction = result;

    // Persist extraction
    await supabase.from('ai_extractions').insert({
      tenant_id: tenantId,
      message_id: messageId,
      conversation_id: conversationId,
      raw_input: text,
      extracted_data: result.data as never,
      confidence: result.data.confidence,
      status: 'pending',
      model_used: result.modelUsed,
      tokens_used: result.tokensUsed,
      processing_time_ms: result.processingMs,
    });

    // Increment quota
    await supabase.rpc('increment_ai_usage', { p_tenant_id: tenantId });
  } catch (err) {
    console.error('[whatsapp:ai]', err);
    await sendText(
      message.from,
      'صار عندنا خلل مؤقت في قراءة طلبك 🙏، سيتواصل معك الفريق قريبًا'
    );
    return;
  }

  // 8. Match products
  const match = await matchProducts(supabase, tenantId, extraction.data);

  // 9. Resolve customer (find or create)
  const customerId = await upsertCustomer(supabase, {
    tenantId,
    phone: message.from,
    name: extraction.data.customer_name ?? contactName,
    governorate: extraction.data.governorate,
    city: extraction.data.city,
    address: extraction.data.address,
  });

  // 10. Create draft order (only if at least one item matched)
  let orderId: string | null = null;
  if (match.totalMatched > 0) {
    orderId = await createDraftOrder(supabase, {
      tenantId,
      customerId,
      conversationId,
      extraction: extraction.data,
      match,
    });

    // Link extraction to order
    if (orderId) {
      await supabase
        .from('ai_extractions')
        .update({ status: 'matched', order_id: orderId })
        .eq('tenant_id', tenantId)
        .eq('message_id', messageId);
    }
  } else {
    await supabase
      .from('ai_extractions')
      .update({ status: 'failed' })
      .eq('tenant_id', tenantId)
      .eq('message_id', messageId);
  }

  // 11. Persist outbound reply in DB (for conversation history)
  const customerReply = buildCustomerReply(extraction.data, match, {
    storeName: tenant.name,
  });

  await persistMessage(supabase, {
    tenantId,
    conversationId,
    direction: 'outbound',
    senderType: 'bot',
    content: customerReply,
    contentType: 'text',
    aiExtraction: extraction.data as never,
  });

  // 12. Send reply to customer
  await sendText(message.from, customerReply);

  // 13. Notify merchant (if a phone is set)
  const { data: tenantFull } = await supabase
    .from('tenants')
    .select('phone, name')
    .eq('id', tenantId)
    .single();

  if (tenantFull?.phone) {
    const merchantMsg = buildMerchantNotification(extraction.data, match, {
      orderId: orderId ?? undefined,
      customerPhone: message.from,
      conversationId,
    });
    await sendText(tenantFull.phone, merchantMsg);
  }
}

// ============================================
// Helpers
// ============================================

function extractText(message: InboundMessage): string | null {
  if (message.type === 'text' && message.text?.body) return message.text.body;
  if (message.type === 'interactive') {
    if (message.interactive?.button_reply) return message.interactive.button_reply.title;
    if (message.interactive?.list_reply) return message.interactive.list_reply.title;
  }
  if (message.type === 'button') {
    // Legacy button reply
    const btn = (message as unknown as { button?: { text?: string } }).button;
    if (btn?.text) return btn.text;
  }
  return null;
}

async function sendText(to: string, body: string) {
  try {
    const client = getWhatsAppClient();
    await client.messages.sendText({
      to: to.startsWith('+') ? to : `+${to}`,
      text: { body },
    });
  } catch (err) {
    console.error('[whatsapp:send]', err);
  }
}

async function upsertConversation(
  supabase: SupabaseClient,
  input: { tenantId: string; phone: string; channel: string; externalId: string }
): Promise<string> {
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('tenant_id', input.tenantId)
    .eq('external_id', input.externalId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString(), status: 'open' })
      .eq('id', existing.id);
    return existing.id;
  }

  const { data: created, error } = await supabase
    .from('conversations')
    .insert({
      tenant_id: input.tenantId,
      channel: 'whatsapp',
      external_id: input.externalId,
      phone: input.phone,
      status: 'open',
      last_message_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error || !created) throw new Error('CONVERSATION_CREATE_FAILED');
  return created.id;
}

async function persistMessage(
  supabase: SupabaseClient,
  input: {
    tenantId: string;
    conversationId: string;
    direction: 'inbound' | 'outbound';
    senderType: 'customer' | 'bot' | 'staff';
    content: string;
    contentType: string;
    externalMessageId?: string;
    aiExtraction?: unknown;
  }
): Promise<string> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      tenant_id: input.tenantId,
      conversation_id: input.conversationId,
      direction: input.direction,
      sender_type: input.senderType,
      content: input.content,
      content_type: input.contentType,
      external_message_id: input.externalMessageId ?? null,
      ai_extraction: (input.aiExtraction as never) ?? null,
    })
    .select('id')
    .single();

  if (error || !data) throw new Error('MESSAGE_PERSIST_FAILED');
  return data.id;
}

async function checkAiQuota(
  supabase: SupabaseClient,
  tenantId: string
): Promise<{ ok: boolean; current: number; limit: number }> {
  const periodStart = new Date();
  periodStart.setDate(1);
  const period = periodStart.toISOString().split('T')[0];

  const { data } = await supabase
    .from('usage_counters')
    .select('current_value, limit_value')
    .eq('tenant_id', tenantId)
    .eq('metric', 'ai_messages')
    .eq('period_start', period)
    .maybeSingle();

  const current = data?.current_value ?? 0;
  const limit = data?.limit_value ?? 100;
  return { ok: current < limit, current, limit };
}

async function upsertCustomer(
  supabase: SupabaseClient,
  input: {
    tenantId: string;
    phone: string;
    name: string | null;
    governorate: string | null;
    city: string | null;
    address: string | null;
  }
): Promise<string> {
  // Resolve governorate id from name (best-effort)
  let governorateId: number | null = null;
  if (input.governorate) {
    const { data: gov } = await supabase
      .from('iraq_governorates')
      .select('id')
      .ilike('name_ar', `%${input.governorate}%`)
      .maybeSingle();
    governorateId = gov?.id ?? null;
  }

  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .eq('tenant_id', input.tenantId)
    .eq('phone', input.phone)
    .is('deleted_at', null)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('customers')
      .update({
        name: input.name ?? undefined,
        governorate_id: governorateId ?? undefined,
        city: input.city ?? undefined,
        address: input.address ?? undefined,
      })
      .eq('id', existing.id);
    return existing.id;
  }

  const { data: created, error } = await supabase
    .from('customers')
    .insert({
      tenant_id: input.tenantId,
      name: input.name,
      phone: input.phone,
      governorate_id: governorateId,
      city: input.city,
      address: input.address,
    })
    .select('id')
    .single();

  if (error || !created) throw new Error('CUSTOMER_CREATE_FAILED');
  return created.id;
}

async function createDraftOrder(
  supabase: SupabaseClient,
  input: {
    tenantId: string;
    customerId: string;
    conversationId: string;
    extraction: { payment_method: string; notes: string | null; governorate: string | null; city: string | null; address: string | null };
    match: Awaited<ReturnType<typeof matchProducts>>;
  }
): Promise<string | null> {
  const { data: tenant } = await supabase
    .from('tenants')
    .select('phone')
    .eq('id', input.tenantId)
    .single();

  // Resolve governorate + delivery fee
  let governorateId: number | null = null;
  let deliveryFee = 0;
  if (input.extraction.governorate) {
    const { data: gov } = await supabase
      .from('iraq_governorates')
      .select('id, delivery_fee_iqd')
      .ilike('name_ar', `%${input.extraction.governorate}%`)
      .maybeSingle();
    if (gov) {
      governorateId = gov.id;
      deliveryFee = gov.delivery_fee_iqd ?? 0;
    }
  }

  const paymentMap: Record<string, string> = {
    cod: 'cod',
    zaincash: 'zaincash',
    fib: 'fib',
    qicard: 'qicard',
    nasspay: 'nasspay',
    unknown: 'cod',
  };

  const matchedItems = input.match.items.filter((i) => i.status === 'matched');
  const subtotal = matchedItems.reduce(
    (s, i) => s + (i.unitPriceIqd ?? 0) * i.quantity,
    0
  );
  const total = subtotal + deliveryFee;

  const orderNumber = `WA-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      tenant_id: input.tenantId,
      customer_id: input.customerId,
      order_number: orderNumber,
      status: 'draft',
      payment_method: paymentMap[input.extraction.payment_method] ?? 'cod',
      payment_status: 'pending',
      subtotal_iqd: subtotal,
      delivery_fee_iqd: deliveryFee,
      total_iqd: total,
      governorate_id: governorateId,
      city: input.extraction.city,
      address: input.extraction.address,
      notes: input.extraction.notes,
      source: 'whatsapp',
    })
    .select('id')
    .single();

  if (error || !order) {
    console.error('[whatsapp:order]', error);
    return null;
  }

  // Insert order items (matched only)
  const itemsPayload = matchedItems.map((i) => ({
    tenant_id: input.tenantId,
    order_id: order.id,
    product_id: i.matchedProductId,
    product_name: i.matchedName ?? i.originalName,
    quantity: i.quantity,
    unit_price_iqd: i.unitPriceIqd ?? 0,
    total_price_iqd: (i.unitPriceIqd ?? 0) * i.quantity,
    notes: i.notes,
  }));

  if (itemsPayload.length > 0) {
    await supabase.from('order_items').insert(itemsPayload);
  }

  // Audit log
  await supabase.from('audit_log').insert({
    tenant_id: input.tenantId,
    action: 'order.created.whatsapp',
    entity_type: 'order',
    entity_id: order.id,
    new_values: {
      order_number: orderNumber,
      source: 'whatsapp',
      matched_items: matchedItems.length,
    },
  });

  return order.id;
}
