"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; success?: string };

export async function signInAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) return { error: "أدخل بريدًا صحيحًا وكلمة مرور من 8 أحرف على الأقل." };
  let supabase;
  try { supabase = await createClient(); } catch (e) { return { error: e instanceof Error ? e.message : "تعذر الاتصال بالإعدادات." }; }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور." };
  redirect("/dashboard");
}

export async function signUpAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const storeName = String(formData.get("storeName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (name.length < 2 || storeName.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 10) return { error: "أكمل الاسم واسم المتجر والبريد، واجعل كلمة المرور 10 أحرف على الأقل." };
  let supabase;
  try { supabase = await createClient(); } catch (e) { return { error: e instanceof Error ? e.message : "إعدادات Supabase غير مكتملة." }; }
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
  if (error || !data.user) return { error: "تعذر إنشاء الحساب. قد يكون البريد مستخدمًا أو إعدادات البريد تحتاج مراجعة." };
  if (!data.session) return { success: "تم إنشاء الحساب. افتح رسالة التأكيد في بريدك، ثم سجّل الدخول لإنشاء المتجر." };
  const { error: storeError } = await supabase.rpc("create_store_for_current_user", { p_store_name: storeName });
  if (storeError) return { error: "تم إنشاء حسابك لكن إنشاء المتجر لم يكتمل. سجّل الدخول وأعد المحاولة أو راجع إعدادات قاعدة البيانات." };
  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
