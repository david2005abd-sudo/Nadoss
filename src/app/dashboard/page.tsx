import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Boxes, ClipboardList, PackagePlus, Store, Truck, Users, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/auth/actions";

export const dynamic = "force-dynamic";
export default async function DashboardPage() {
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)redirect("/login");
 const {data:membership}=await supabase.from("memberships").select("tenant_id,role").eq("user_id",user.id).limit(1).maybeSingle();
 if(!membership)redirect("/onboarding");
 const tenantId=membership.tenant_id;
 const [{data:store},{count:productCount},{count:orderCount},{count:customerCount},{data:orders}] = await Promise.all([
  supabase.from("tenants").select("name").eq("id",tenantId).single(),
  supabase.from("products").select("id",{count:"exact",head:true}).eq("tenant_id",tenantId).is("deleted_at",null),
  supabase.from("orders").select("id",{count:"exact",head:true}).eq("tenant_id",tenantId).is("deleted_at",null),
  supabase.from("customers").select("id",{count:"exact",head:true}).eq("tenant_id",tenantId).is("deleted_at",null),
  supabase.from("orders").select("id,order_number,status,total_iqd,created_at").eq("tenant_id",tenantId).is("deleted_at",null).order("created_at",{ascending:false}).limit(6)
 ]);
 const modules=[
  {icon:ClipboardList,title:"الطلبات",description:"إدارة الطلبات ومتابعة مراحلها",href:"#orders",value:orderCount??0,unit:"طلب حقيقي"},
  {icon:Boxes,title:"المنتجات والمخزون",description:"الكتالوج والكميات والأسعار",href:"/dashboard/products",value:productCount??0,unit:"منتج"},
  {icon:Users,title:"العملاء",description:"بيانات العملاء وسجل الطلبات",href:"#customers",value:customerCount??0,unit:"عميل"},
  {icon:Truck,title:"التوصيل",description:"تجهيز تكاملات الشحن لاحقًا",href:"#delivery",value:"—",unit:"غير مربوط بعد"}
 ];
 const statuses:Record<string,string>={draft:"مسودة",pending:"طلب جديد",confirmed:"مؤكد",preparing:"قيد التجهيز",ready:"جاهز للشحن",shipped:"قيد التوصيل",delivered:"تم التسليم",cancelled:"ملغي",returned:"مرتجع"};
 return <main className="min-h-screen bg-nados-paper">
  <header className="border-b border-stone-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4"><Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-nados-navy text-white"><Store size={20}/></span><span className="font-black">نادوس <span className="text-nados-terracotta">NADOS</span></span></Link><div className="flex items-center gap-3"><span className="hidden text-sm text-slate-500 sm:inline">{user.email}</span><form action={signOutAction}><button className="flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm font-bold"><LogOut size={15}/> خروج</button></form></div></div></header>
  <div className="mx-auto max-w-7xl px-5 py-10"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-bold text-nados-terracotta">مساحة التاجر</p><h1 className="mt-2 text-3xl font-black">أهلًا بك في {store?.name??"متجرك"}</h1><p className="mt-2 text-slate-600">هذه لوحة بيانات متجرك الفعلية من قاعدة البيانات.</p></div><Link href="/dashboard/products" className="inline-flex w-fit items-center gap-2 rounded-xl bg-nados-terracotta px-5 py-3 font-bold text-white"><PackagePlus size={18}/> إضافة منتج</Link></div>
  <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{modules.map(({icon:Icon,title,description,href,value,unit})=><Link key={title} href={href} className="rounded-2xl border border-stone-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-md"><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#f5e8e1] text-nados-terracotta"><Icon size={21}/></span><span className="text-2xl font-black">{value}</span></div><h2 className="mt-5 font-extrabold">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p><p className="mt-3 text-xs text-slate-400">{unit}</p></Link>)}</div>
  <section id="orders" className="mt-8 rounded-2xl border border-stone-200 bg-white p-6"><div className="flex items-center justify-between"><div><h2 className="text-lg font-extrabold">آخر الطلبات</h2><p className="mt-1 text-sm text-slate-500">طلبات محفوظة في قاعدة البيانات</p></div><ClipboardList className="text-nados-terracotta"/></div>
  {!orders?.length?<p className="py-10 text-center text-sm text-slate-500">لا توجد طلبات بعد. ستظهر هنا عند تسجيلها.</p>:<div className="mt-4 divide-y divide-stone-100">{orders.map(order=><div key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-bold">{order.order_number}</p><p className="mt-1 text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString("ar-IQ")}</p></div><span className="rounded-full bg-nados-paper px-3 py-1 text-xs font-bold">{statuses[order.status]??order.status}</span><strong>{Number(order.total_iqd).toLocaleString("ar-IQ")} د.ع</strong></div>)}</div>}</section>
  <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-5 text-sm leading-7 text-slate-600">المتجر مرتبط بحسابك ويستخدم عزل البيانات عبر RLS. تكاملات الدفع والتوصيل وواتساب غير مفعلة إلى أن تُربط بمفاتيح موثقة وتُختبر على بيئة تجريبية.</div>
  </div></main>;
}
