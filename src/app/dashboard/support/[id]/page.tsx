import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { TicketStatusBadge } from '@/components/dashboard/ticket-status-badge';
import { TicketChat } from '@/components/dashboard/ticket-chat';
import { TicketSidebar } from '@/components/dashboard/ticket-sidebar';

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id, role')
    .limit(1)
    .single();

  const { data: ticket } = await supabase
    .from('support_tickets')
    .select(
      'id, subject, description, status, priority, category, sla_due_at, sla_breached, related_order_id, assigned_to, created_at, resolved_at, tenants(name)'
    )
    .eq('id', id)
    .eq('tenant_id', membership!.tenant_id)
    .maybeSingle();

  if (!ticket) notFound();

  const { data: messages } = await supabase
    .from('ticket_messages')
    .select('id, sender_id, sender_type, sender_name, content, content_type, is_internal, created_at')
    .eq('ticket_id', id)
    .order('created_at', { ascending: true });

  const tenant = ticket.tenants as unknown as { name: string } | null;
  const isStaff = ['owner', 'admin', 'staff'].includes(membership!.role);

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/dashboard/support"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-nados-primary"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للتذاكر
        </Link>
        <div className="mt-2 flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <TicketStatusBadge status={ticket.status} />
              <span className="text-xs text-gray-500">
                {new Date(ticket.created_at).toLocaleString('ar-IQ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <TicketChat
            ticketId={id}
            initialMessages={messages ?? []}
            currentUserId={(await supabase.auth.getUser()).data.user?.id ?? ''}
            isStaff={isStaff}
          />
        </div>

        <TicketSidebar
          ticketId={id}
          status={ticket.status}
          priority={ticket.priority}
          category={ticket.category}
          slaDueAt={ticket.sla_due_at}
          slaBreached={ticket.sla_breached}
          relatedOrderId={ticket.related_order_id}
          isStaff={isStaff}
        />
      </div>
    </div>
  );
}
