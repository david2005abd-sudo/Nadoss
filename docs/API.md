# API and server actions — NADOS
## Authentication
- signInAction: تسجيل الدخول والتحقق من عضوية المستخدم؛ ينشئ المتجر عبر RPC إن كانت بيانات اسم المتجر محفوظة في user metadata.
- signUpAction: ينشئ حسابًا ويحفظ الاسم واسم المتجر في metadata؛ بعد تأكيد البريد ينشئ المتجر عند أول دخول.
- signOutAction: إنهاء الجلسة.
- completeStoreAction: استكمال إنشاء متجر للحسابات التي لا تحمل اسم متجر.
## Products
- createProductAction: يتحقق من الاسم والسعر والمخزون وSKU ثم يضيف المنتج في tenant المستخدم.
- deleteProductAction: يؤرشف المنتج ولا يحذفه نهائيًا.
## Database RPC
- create_store_for_current_user(p_store_name): يتطلب مستخدمًا مصادقًا وينشئ tenant وعضوية owner ذريًا.
## Gaps
- لا توجد بعد API عامة للطلبات أو webhooks أو متجر عام.
- لا تمرر مفتاح service role إلى المتصفح.
