"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createOrderAction(formData: FormData) {
 const customerName=String(formData.get("customerName")??"").trim();
 const phone=String(formData.get("phone")??"").trim();
 const governorateRaw=String(formData.get("governorateId")??"");
 const governorateId=governorateRaw ? Number(governorateRaw) : null;
 const city=String(formData.get("city")??"").trim();
 const address=String(formData.get("address")??"").trim();
 const notes=String(formData.get("notes")??"").trim();
 const productId=String(formData.get("productId")??"");
 const quantity=Number(formData.get("quantity"));
 if(customerName.length<2||phone.replace(/\s/g,"").length<7||!productId||!/^[0-9a-f-]{36}$/i.test(productId)||!Number.isSafeInteger(quantity)||quantity<1||quantity>10000) throw new Error("تحقق من بيانات العميل والمنتج والكمية.");
 if(governorateId!==null&&(!Number.isInteger(governorateId)||governorateId<1||governorateId>100)) throw new Error("المحافظة غير صحيحة.");
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)redirect("/login");
 const {data:membership}=await supabase.from("memberships").select("tenant_id").eq("user_id",user.id).limit(1).maybeSingle();
 if(!membership)redirect("/onboarding");
 const {error}=await supabase.rpc("create_order_for_current_user",{p_customer_name:customerName,p_phone:phone,p_governorate_id:governorateId,p_city:city,p_address:address,p_notes:notes,p_items:[{product_id:productId,quantity}]});
 if(error)throw new Error(error.message.includes("Insufficient stock")?"الكمية المطلوبة أكبر من المخزون المتوفر.":"تعذر إنشاء الطلب. تحقق من توفر المنتج والمحافظة وتطبيق migration 00003.");
 revalidatePath("/dashboard/orders"); revalidatePath("/dashboard/products"); revalidatePath("/dashboard");
 redirect("/dashboard/orders?created=1");
}

export async function updateOrderStatusAction(formData: FormData) {
 const orderId=String(formData.get("orderId")??"");
 const status=String(formData.get("status")??"");
 const allowed=["draft","pending","confirmed","preparing","ready","shipped","delivered","cancelled","returned"];
 if(!/^[0-9a-f-]{36}$/i.test(orderId)||!allowed.includes(status))throw new Error("بيانات تحديث الطلب غير صحيحة.");
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)redirect("/login");
 const {data:membership}=await supabase.from("memberships").select("tenant_id").eq("user_id",user.id).limit(1).maybeSingle(); if(!membership)redirect("/onboarding");
 const {error}=await supabase.from("orders").update({status,updated_at:new Date().toISOString()}).eq("id",orderId).eq("tenant_id",membership.tenant_id).is("deleted_at",null);
 if(error)throw new Error("تعذر تحديث حالة الطلب.");
 revalidatePath("/dashboard/orders"); revalidatePath("/dashboard");
}
