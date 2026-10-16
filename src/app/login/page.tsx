"use client";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { signInAction, type AuthState } from "@/app/auth/actions";
const initialState: AuthState = {};
function SubmitButton(){ const { pending }=useFormStatus(); return <button disabled={pending} className="w-full rounded-xl bg-nados-navy px-4 py-3 font-bold text-white disabled:opacity-60">{pending ? "جارٍ الدخول…" : "تسجيل الدخول"}</button>; }
export default function LoginPage() {
 const [state, action] = useFormState(signInAction, initialState);
 return <main className="min-h-screen bg-nados-paper px-5 py-12"><section className="mx-auto max-w-md rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-9">
 <Link href="/" className="text-sm font-bold text-nados-terracotta">← نادوس NADOS</Link><h1 className="mt-7 text-3xl font-black">أهلًا بعودتك</h1><p className="mt-2 text-sm leading-7 text-slate-500">سجّل الدخول لإدارة متجرك وطلباتك.</p>
 <form action={action} className="mt-7 space-y-4"><label className="block text-sm font-bold">البريد الإلكتروني<input name="email" type="email" autoComplete="email" required className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 font-normal outline-none focus:border-nados-terracotta" /></label>
 <label className="block text-sm font-bold">كلمة المرور<input name="password" type="password" autoComplete="current-password" minLength={8} required className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 font-normal outline-none focus:border-nados-terracotta" /></label>
 {state?.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}{state?.success && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{state.success}</p>}<SubmitButton /></form>
 <p className="mt-6 text-center text-sm text-slate-500">ما عندك حساب؟ <Link className="font-bold text-nados-terracotta" href="/signup">أنشئ متجرًا مجانيًا</Link></p></section></main>;
}
