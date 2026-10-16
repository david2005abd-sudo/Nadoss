"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function getTenantId() {
 const supabase = await createClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) redirect("/login");
 const { data: membership, error } = await supabase.from("memberships").select("tenant_id").eq("user_id", user.id).limit(1).maybeSingle();
 if (error || !membership) redirect("/onboarding");
 return { supabase, tenantId: membership.tenant_id };
}
export async function createProductAction(formData: FormData) {
 const name = String(formData.get("name") ?? "").trim();
 const description = String(formData.get("description") ?? "").trim();
 const price = Number(formData.get("price"));
 const stock = Number(formData.get("stock"));
 const sku = String(formData.get("sku") ?? "").trim() || null;
 if (name.length < 1 || name.length > 180 || !Number.isSafeInteger(price) || price < 0 || !Number.isSafeInteger(stock) || stock < 0) throw new Error("تحقق من اسم المنتج والسعر والمخزون.");
 const { supabase, tenantId } = await getTenantId();
 const { error } = await supabase.from("products").insert({ tenant_id: tenantId, name_ar: name, description_ar: description || null, price_iqd: price, stock, sku });
 if (error) throw new Error(error.code === "23505" ? "رمز SKU مستخدم مسبقًا في هذا المتجر." : "تعذر حفظ المنتج. تحقق من قاعدة البيانات وRLS.");
 revalidatePath("/dashboard/products");
 revalidatePath("/dashboard");
}
export async function deleteProductAction(formData: FormData) {
 const id = String(formData.get("id") ?? "");
 if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("معرّف المنتج غير صحيح.");
 const { supabase, tenantId } = await getTenantId();
 const { error } = await supabase.from("products").update({ deleted_at: new Date().toISOString(), is_active: false }).eq("id", id).eq("tenant_id", tenantId);
 if (error) throw new Error("تعذر أرشفة المنتج.");
 revalidatePath("/dashboard/products");
}
