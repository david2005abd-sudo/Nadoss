# DATABASE — NADOS
## Implemented migration (not yet applied)
`supabase/migrations/00001_core_schema.sql` defines:
- tenants, memberships
- iraq_governorates (18 seed rows)
- categories, products
- customers, orders
- tenant membership helper functions and RLS policies.

## Planned entities
subscription_plans, subscriptions, usage_counters, invoices, order_items, delivery_companies, tenant_delivery_accounts, shipments, conversations, messages, ai_extractions, support_tickets, audit_log, service_categories, staff_members, bookings.

## Requirements before production
- Apply the migration to a disposable Supabase project first.
- Test cross-tenant reads and writes with two authenticated users.
- Review security-definer helper ownership and grants in the target project.
- Add policies for every new tenant-owned table before exposing it to clients.
- Add audit logging, update triggers, and transaction-safe stock/order handling.
- The migration being present in GitHub does not mean the database has been deployed.
