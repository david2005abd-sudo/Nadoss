## [0.1.2] — 2026-10-16
### أُضيف
- `src/lib/validations/booking.ts` — schemas + state machine
- `src/app/dashboard/bookings/actions.ts` — 9 server actions
- `src/lib/whatsapp/sender.ts` — outbound-only WhatsApp sender
- صفحات لوحة التحكم: bookings list, new, detail, services, staff, calendar
- مكونات: BookingForm, BookingStatusBadge, BookingStatusUpdater, RescheduleForm, BookingCalendar, ServiceCategoryCreateForm, ServiceCategoryRowActions, StaffCreateForm
- صفحة عامة: `/store/[slug]/book` (Wizard 3 خطوات) + success
- إشعار WhatsApp للتاجر عند حجز جديد
- تحديث sidebar بقسم "الحجوزات"

## [0.1.1] — 2026-10-16
- WhatsApp Cost Tracker + Wayl Integration (المرحلة 10 — الجزء 2)
