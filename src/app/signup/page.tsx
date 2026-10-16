"use client";
import Link from "next/link";
import { useActionState } from "react";
import { signUpAction, type AuthState } from "@/app/auth/actions";
const initialState: AuthState = {};
export default function SignupPage() {
 const [state, action, pending] = useActionState(signUpAction, initialState);
 return <main className="min-h-screen bg-nados-paper px-5 py-12"><section className="mx-auto max-w-md rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-9">
 <Link href="/" className="text-sm font-bold text-nados-terracotta">← نادوس NADOS</Link><h1 className="mt-7 text-3xl font-black">ابدأ متجرك</h1><p className="mt-2 text-sm leading-7 text-slate-500">حساب واحد لمساحة متجرك ومنتجاتك وطلباتك.</p>
 <form action={action} className="mt-7 space-y-4"><label className="block text-sm font-bold">اسمك<input name="name" autoComplete="name" minLength={2} required className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 font-normal outline-none focus:border-nados-terracotta" /></label>
 <label className="block text-sm font-bold">اسم المتجر<input name="storeName" minLength={2} maxLength={80} required className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 font-normal outline-none focus:border-nados-terracotta" /></label>
 <label className="block text-sm font-bold">البريد الإلكتروني<input name="email" type="email" autoComplete="email" required className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 font-normal outline-none focus:border-nados-terracotta" /></label>
 <label className="block text-sm font-bold">كلمة المرور<input name="password" type="password" autoComplete="new-password" minLength={10} required className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 font-normal outline-none focus:border-nados-terracotta" /><small className="mt-1 block font-normal text-slate-400">10 أحرف على الأقل</small></label>
 {state.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}{state.success && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{state.success}</p>}
 <button disabled={pending} className="w-full rounded-xl bg-nados-terracotta px-4 py-3 font-bold text-white disabled:opacity-60">{pending ? "جارٍ إنشاء الحساب…" : "إنشاء الحساب والمتجر"}</button></form>
 <p className="mt-6 text-center text-sm text-slate-500">لديك حساب؟ <Link className="font-bold text-nados-terracotta" href="/login">سجّل الدخول</Link></p></section></main>;
}
