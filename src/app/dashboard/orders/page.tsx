import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createOrderAction, updateOrderStatusAction } from "./actions";

export const dynamic = "force-dynamic";
const labels: Record<string,string> = { draft:"مسودة",pending:"جديد",confirmed:"مؤكد",preparing:"قيد التجهيز",ready:"جاهز",shipped:"قيد التوصيل",delivered:"تم التسليم",cancelled:"ملغي",returned:"مرتجع" };
const statuses = Object.keys(labels);
export default async function OrdersPage({searchParams}:{searchParams:{created?:string}}) {
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser(); if(!user) redirect("/login");
 const {data:membership}=await supabase.from("memberships").select("tenant_id").eq("user_id",user.id).limit(1).maybeSingle(); if(!membership) redirect("/onboarding");
 const [{data:products},{data:orders,error},{data:governorates}] = await Promise.all([
  supabase.from("products").select("id,name_ar,price_iqd,stock").eq("tenant_id",membership.tenant_id).eq("is_active",true).is("deleted_at",null).order("name_ar"),
  supabase.from("orders").select("id,order_number,status,total_iqd,created_at,customers(name,phone)").eq("tenant_id",membership.tenant_id).is("deleted_at",null).order("created_at",{ascending:false}).limit(100),
  supabase.from("iraq_governorates").select("id,name_ar,default_delivery_fee_iqd").eq("is_active",true).order("id")
 ]);
 return <main className="min-h-screen bg-nados-paper"><header className="border-b border-stone-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"><Link href="/dashboard" className="font-black">نادوس NADOS</Link><Link href="/dashboard" className="text-sm text-nados-terracotta">العودة للوحة التحكم ←</Link></div></header>
 <div className="mx-auto max-w-6xl px-5 py-9"><p className="text-sm font-bold text-nados-terracotta">المبيعات</p><h1 className="mt-2 text-3xl font-black">إدارة الطلبات</h1><p className="mt-2 text-sm text-slate-500">إنشاء الطلب يحفظ العميل والطلب وعناصره ويخصم المخزون ذريًا داخل قاعدة البيانات.</p>
 {searchParams.created==="1"&&<p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">تم إنشاء الطلب بنجاح.</p>}
 <section className="mt-7 rounded-2xl border border-stone-200 bg-white p-5 sm:p-7"><h2 className="text-lg font-extrabold">إنشاء طلب يدوي</h2>
 {!products?.length?<p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">أضف منتجًا متوفرًا بالمخزون أولًا من <Link href="/dashboard/products" className="font-bold underline">صفحة المنتجات</Link>.</p>:
 <form action={createOrderAction} className="mt-5 grid gap-4 sm:grid-cols-2">
 <label className="text-sm font-bold">اسم العميل *<input name="customerName" required minLength={2} maxLength={120} className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3 font-normal"/></label>
 <label className="text-sm font-bold">رقم الهاتف *<input name="phone" required minLength={7} maxLength={30} autoComplete="tel" className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3 font-normal" placeholder="07xxxxxxxxx"/></label>
 <label className="text-sm font-bold">المنتج *<select name="productId" required className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 font-normal">{products.map(p=><option key={p.id} value={p.id} disabled={p.stock<1}>{p.name_ar} — {Number(p.price_iqd).toLocaleString("ar-IQ")} د.ع (المتوفر {p.stock})</option>)}</select></label>
 <label className="text-sm font-bold">الكمية *<input name="quantity" type="number" min="1" max="10000" step="1" defaultValue="1" required className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3 font-normal"/></label>
 <label className="text-sm font-bold">المحافظة<select name="governorateId" defaultValue="" className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 font-normal"><option value="">اختيار لاحقًا</option>{governorates?.map(g=><option key={g.id} value={g.id}>{g.name_ar} — توصيل {Number(g.default_delivery_fee_iqd).toLocaleString("ar-IQ")} د.ع</option>)}</select></label>
 <label className="text-sm font-bold">المدينة<input name="city" maxLength={120} className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3 font-normal"/></label>
 <label className="text-sm font-bold sm:col-span-2">العنوان<input name="address" maxLength={500} className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3 font-normal"/></label>
 <label className="text-sm font-bold sm:col-span-2">ملاحظات<textarea name="notes" maxLength={2000} rows={2} className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3 font-normal"/></label>
 <button className="rounded-xl bg-nados-terracotta px-5 py-3 font-bold text-white sm:col-span-2">حفظ الطلب وخصم المخزون</button></form>}</section>
 <section className="mt-7 overflow-hidden rounded-2xl border border-stone-200 bg-white"><div className="border-b border-stone-100 p-5"><h2 className="font-extrabold">سجل الطلبات</h2><p className="mt-1 text-sm text-slate-500">{orders?.length??0} طلبًا حديثًا</p></div>
 {error?<p role="alert" className="p-5 text-sm text-red-700">تعذر تحميل الطلبات. تحقق من migrations وRLS.</p>:!orders?.length?<p className="p-8 text-center text-sm text-slate-500">لا توجد طلبات مسجلة بعد.</p>:
 <div className="divide-y divide-stone-100">{orders.map(o=>{const customer=Array.isArray(o.customers)?o.customers[0]:o.customers;return <article key={o.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><h3 className="font-bold">{o.order_number}</h3><p className="mt-1 text-sm text-slate-600">{customer?.name??"عميل"} · {customer?.phone??"—"}</p><p className="mt-1 text-xs text-slate-400">{new Date(o.created_at).toLocaleDateString("ar-IQ")}</p></div><strong>{Number(o.total_iqd).toLocaleString("ar-IQ")} د.ع</strong><form action={updateOrderStatusAction} className="flex items-center gap-2"><input type="hidden" name="orderId" value={o.id}/><select name="status" defaultValue={o.status} className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm">{statuses.map(s=><option key={s} value={s}>{labels[s]}</option>)}</select><button className="rounded-lg bg-nados-navy px-3 py-2 text-xs font-bold text-white">تحديث</button></form></article>})}</div>}</section>
 </div></main>;
}
