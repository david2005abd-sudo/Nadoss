'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useNasaq } from '@/lib/nasaq/store';
import { BUSINESS_TYPES } from '@/lib/nasaq/config';
import { IconAi, IconPlus, IconX } from '@/components/nasaq/icons';
import { getIcon } from '@/components/nasaq/icons';

type Msg = { role: 'user' | 'assistant'; text: string; time: string };

const QUICK_PROMPTS: Record<string, string[]> = {
 store: [
  'اكتب وصفًا تسويقيًا لأفضل منتج لدي',
  'اقترح باقة هدايا لزيادة متوسط السلة',
  'جهز رسالة استرجاع للعملاء الذين لم يشتروا منذ شهر',
 ],
 restaurant: [
  'اقترح عرض غداء ترويجي',
  'حسّن وصف برغر كلاسيكي مشوي',
  'اكتب رسالة شكر للزبائن المنتظمين',
 ],
 maintenance: [
  'جهز مسودة عرض سعر لصيانة دورية شاملة',
  'اكتب تذكيرًا لعميل بموعد الفحص القادم',
  'لخّص حالة قطع الغيار المنخفضة',
 ],
 engineering: [
  'جهز مسودة عرض لتصميم واجهة تجارية',
  'اكتب نبذة تعريفية عن المكتب',
  'اقترح مراحل إدارة مشروع هندسي',
 ],
 realestate: [
  'اكتب وصفًا ترويجيًا لفيلا معروضة',
  'اقترح رسالة متابعة لطلب معاينة',
  'لخّص أداء الوحدات المتاحة',
 ],
 digital: [
  'اكتب وصفًا لبطاقة ألعاب رقمية',
  'اقترح باقة شحن موسمية',
  'جهز رسالة دعم للعميل عند عدم وصول الكود',
 ],
 default: [
  'اكتب وصفًا تسويقيًا لأفضل منتج لدي',
  'اقترح فكرة عرض ترويجي لهذا الأسبوع',
  'لخّص أهم 3 أفعال لمشروعي اليوم',
 ],
};

/** ردود سياقية سريعة مبنيّة على نوع نشاط المشروع. */
function reply(businessType: string, prompt: string, storeName: string): string {
 const bt = BUSINESS_TYPES.find((b) => b.id === businessType);
 const type = bt?.name ?? 'مشروعك';
 const p = prompt.trim();

 if (p.includes('وصف')) {
  return `اقتراح وصف ترويجي لـ ${storeName}:\n\n"احصل على ${type.includes('متجر') ? 'منتج' : 'خدمة'} بجودة عالية وسعر ينافس، مع توصيل سريع ودفع عند الاستلام. رضا العميل هو أولويتنا، وضمان استبدال خلال 7 أيام."\n\nيمكنك نسخ هذا الوصف وتعديله حسب منتجك الفعلي.`;
 }
 if (p.includes('عرض') || p.includes('تروييج') || p.includes('باقة')) {
  return `فكرة عرض ترويجي لـ ${storeName}:\n\n• اشترِ 2 واستلم الثالث مجانًا (أو خصم 20% على الفئة الأقل حركة).\n• حدّد العرض لمدة 7 أيام وأعلقه في وحدة "التسويق والعروض".\n• اربطه بكوبون خصم مثل ${(storeName.slice(0, 4) || 'SALE').toUpperCase()}20.`;
 }
 if (p.includes('عرض سعر')) {
  return `مسودة عرض سعر لـ ${storeName}:\n\n1. نطاق العمل والوصف الفني.\n2. المدة المتوقعة.\n3. البنود السعرية والملاحظات.\n4. شروط الدفع والضمان.\n\nأرسلها للعميل عبر وحدة "عروض الأسعار" وسجّلها بحالة "بانتظار موافقة العميل".`;
 }
 if (p.includes('لخّص') || p.includes('ملخص')) {
  return `ملخص سريع لـ ${storeName}:\n\n• راجع الطلبات الجديدة وحوّلها إلى "مكتمل" عند التنفيذ.\n• تفقّد الكميات المنخفضة في المخزون.\n• رد على أي استفسارات معلقة من العملاء.`;
 }
 if (p.includes('رسالة')) {
  return `مسودة رسالة لـ ${storeName}:\n\n"مرحبًا [اسم العميل]، نشكر لك تعاملك مع ${storeName}! نتمنى أن تكون تجربتك ممتعة. هل تكرمتنا بتقييمك لمساعدتنا في تحسين خدماتنا؟"\n\nأرسلها من وحدة "العملاء" بحملة استرجاع .`;
 }

 return `أقترح على ${storeName}:\n\n1. مراجعة الطلبات الجديدة وتحديث حالتها.\n2. متابعة الأصناف منخفضة المخزون وإعادة الطلب.\n3. تجربة عرض ترويجي قصير لتنشيط المبيعات.\n\nاكتب لي تفاصيل أكثر عن "${p.slice(0, 40)}…" لأجهّز لك اقتراحًا أدق.`;
}

/**
 * The AI assistant module body. Rendered inside the dashboard chrome (and
 * also reused standalone at /ai-assistant).
 */
export default function AiAssistantModule({ standalone = false }: { standalone?: boolean }) {
 const { project } = useNasaq();
 const [open, setOpen] = useState(true);
 const [messages, setMessages] = useState<Msg[]>([]);
 const [input, setInput] = useState('');
 const [typing, setTyping] = useState(false);
 const endRef = useRef<HTMLDivElement>(null);

 const storeName = project?.name ?? 'مشروعك';
 const businessType = project?.businessType ?? '';
 const quick = QUICK_PROMPTS[businessType] ?? QUICK_PROMPTS.default;

 useEffect(() => {
  endRef.current?.scrollIntoView({ behavior: 'smooth' });
 }, [messages, typing]);

 function send(text: string) {
  const prompt = text.trim();
  if (!prompt) return;
  const now = new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });
  setMessages((m) => [...m, { role: 'user', text: prompt, time: now }]);
  setInput('');
  setTyping(true);
  window.setTimeout(() => {
   setMessages((m) => [...m, { role: 'assistant', text: reply(businessType, prompt, storeName), time: now }]);
   setTyping(false);
  }, 700);
 }

 return (
  <div className="space-y-5">
   {standalone && (
    <div className="flex flex-wrap items-end justify-between gap-3">
     <div>
      <nav className="breadcrumbs" aria-label="مسار التنقل">
       <span>{storeName}</span>
       <span aria-hidden="true">/</span>
       <span className="font-medium text-text-primary">المساعد الذكي</span>
      </nav>
      <h1 className="text-xl font-extrabold sm:text-2xl">المساعد الذكي (AI) — سياق مشروعك</h1>
     </div>
     <Link href="/dashboard" className="btn btn-outline btn-sm">رجوع للوحة</Link>
    </div>
   )}

   <div className="card" style={{ background: 'var(--light-purple)' }}>
    <span className="badge badge-warning">وضع الردود السريعة</span>
    <p className="mt-2 text-sm">
     يتعرف المساعد على نوع نشاطك (
     {BUSINESS_TYPES.find((b) => b.id === businessType)?.name ?? 'غير محدد'}) ويقدّم اقتراحات مناسبة، دون
     إرسال بياناتك إلى أي خادم خارجي.
    </p>
   </div>

   <div className="ai-drawer" style={{ position: 'static', height: 460 }}>
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
     <div className="flex items-center gap-2">
      <span className="icon-box-purple icon-box"><IconAi /></span>
      <div>
       <span className="block text-sm font-bold">المساعد الذكي لنَسَق</span>
       <span className="text-xs text-muted" id="ai-context-label">
        السياق الحالي: {storeName} — {BUSINESS_TYPES.find((b) => b.id === businessType)?.name ?? 'غير محدد'}
       </span>
      </div>
     </div>
     <div className="flex items-center gap-2">
      <span className="badge badge-success" id="ai-provider-status-badge">المساعد جاهز</span>
      <button type="button" className="btn btn-ghost !px-2" onClick={() => setOpen(false)} aria-label="إخفاء">
       <IconX size={16} />
      </button>
     </div>
    </div>

    {open && (
     <>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
       {messages.length === 0 && (
        <div className="text-center text-sm text-muted">ابدأ بكتابة طلب أو اختر من الاقتراحات السريعة أدناه.</div>
       )}
       {messages.map((m, i) => (
        <div key={`${m.time}-${i}`} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
         <div className={m.role === 'user' ? 'ai-msg user' : 'ai-msg assistant'} style={{ whiteSpace: 'pre-line' }}>
          {m.text}
          <span className="block text-[10px] text-muted">{m.time}</span>
         </div>
        </div>
       ))}
       {typing && (
        <div className="flex justify-end" id="ai-typing-indicator">
         <div className="ai-msg assistant">يكتب…</div>
        </div>
       )}
       <div ref={endRef} />
      </div>

      <div className="flex flex-wrap gap-1 border-t border-border px-4 py-2" id="ai-quick-prompts">
       {quick.map((q) => (
        <button key={q} type="button" className="btn btn-outline btn-sm" onClick={() => send(q)}>
         {q}
        </button>
       ))}
      </div>

      <form
       id="ai-chat-form"
       className="flex items-center gap-2 border-t border-border px-4 py-3"
       onSubmit={(e) => {
        e.preventDefault();
        send(input);
       }}
      >
       <input
        id="ai-input-field"
        className="form-control"
        placeholder="اكتب طلبك للمساعد الذكي..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
       />
       <button type="submit" className="btn btn-primary btn-sm">
        <IconPlus size={16} /> إرسال
       </button>
      </form>
     </>
    )}
   </div>

   {!open && (
    <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
     <IconAi size={16} /> إعادة فتح المحادثة
    </button>
   )}

   <div className="grid-3">
    <div className="card">
     <span className="icon-box mb-2">{getIcon('sparkle', { size: 18 })}</span>
     <h3 className="text-sm font-bold">أوصاف المنتجات والوجبات</h3>
     <p className="mt-1 text-xs text-muted">اقتراح أوصاف ترويجية مختصرة ومتوافقة مع محركات البحث.</p>
    </div>
    <div className="card">
     <span className="icon-box mb-2">{getIcon('chart', { size: 18 })}</span>
     <h3 className="text-sm font-bold">تحليل النشاط ال</h3>
     <p className="mt-1 text-xs text-muted">قراءة مؤشرات الطلبات والمخزون واقتراح الإجراءات.</p>
    </div>
    <div className="card">
     <span className="icon-box mb-2">{getIcon('file', { size: 18 })}</span>
     <h3 className="text-sm font-bold">مسودات عروض الأسعار</h3>
     <p className="mt-1 text-xs text-muted">تنظيم بنود العرض الفني والمالي بلهجة احترافية.</p>
    </div>
   </div>
  </div>
 );
}
