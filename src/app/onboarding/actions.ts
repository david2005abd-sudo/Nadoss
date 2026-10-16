"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export type AuthState = { error?: string };
export async function completeStoreAction(_state: AuthState, formData: FormData): Promise<AuthState> {
 const storeName=String(formData.get("storeName")??"").trim();
 if(storeName.length<2||storeName.length>80)return {error:"اسم المتجر يجب أن يكون بين حرفين و80 حرفًا."};
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)redirect("/login");
 const {error}=await supabase.rpc("create_store_for_current_user",{p_store_name:storeName});
 if(error)return {error:"تعذر إنشاء المتجر. تأكد من تطبيق migration 00002 ثم حاول مجددًا."};
 redirect("/dashboard");
}
