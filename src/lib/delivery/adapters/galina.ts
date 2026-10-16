import type {
  DeliveryAdapter,
  CreateShipmentInput,
  CreateShipmentOutput,
  TrackingOutput,
  DeliveryFeeEstimate,
  ShipmentStatus,
} from '../types';

function mapStatus(galinaStatus: string): ShipmentStatus {
  const map: Record<string, ShipmentStatus> = {
    new: 'created',
    created: 'created',
    picked_up: 'picked_up',
    at_warehouse: 'in_transit',
    in_transit: 'in_transit',
    out_for_delivery: 'out_for_delivery',
    delivered: 'delivered',
    failed: 'failed',
    rejected: 'failed',
    returned: 'returned',
    cancelled: 'returned',
  };
  return map[galinaStatus.toLowerCase()] ?? 'in_transit';
}

export class GalinaAdapter implements DeliveryAdapter {
  readonly slug = 'galina';
  readonly nameAr = 'جالينا إكسبريس';

  private async request<T>(
    path: string,
    credentials: Record<string, string>,
    init: RequestInit = {}
  ): Promise<T> {
    // Galina requires API Base URL in credentials
    const base = credentials.baseUrl ?? 'https://api.galinaexpress.com';

    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': credentials.apiKey,
        'X-Tenant-Id': credentials.tenantId,
        'X-Supplier-Id': credentials.supplierId ?? '',
        ...(init.headers ?? {}),
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        `Galina ${res.status}: ${(data as { message?: string }).message ?? 'Request failed'}`
      );
    }
    return data as T;
  }

  async testConnection(credentials: Record<string, string>): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.request('/v1/me', credentials);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }

  async createShipment(
    input: CreateShipmentInput,
    credentials: Record<string, string>
  ): Promise<CreateShipmentOutput> {
    const body = {
      reference: input.orderNumber,
      service_type: input.isPickup ? 'pickup' : 'delivery',
      receiver: {
        name: input.recipient.name,
        phone: input.recipient.phone.replace('+964', '0'),
        province: input.recipient.governorateName,
        city: input.recipient.city,
        address: input.recipient.address,
        location: input.recipient.coordinates,
      },
      parcels: input.items.map((i) => ({
        description: i.name,
        quantity: i.quantity,
        value: i.unitPriceIqd,
      })),
      cod: input.codAmountIqd,
      notes: input.notes ?? '',
    };

    const data = await this.request<{
      tracking_code: string;
      id: string;
      status: string;
      estimated_delivery?: string;
    }>('/v1/shipments', credentials, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return {
      trackingNumber: data.tracking_code,
      externalId: data.id,
      status: mapStatus(data.status),
      estimatedDeliveryAt: data.estimated_delivery,
      rawResponse: data,
    };
  }

  async cancelShipment(
    trackingNumber: string,
    credentials: Record<string, string>
  ): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.request(`/v1/shipments/${trackingNumber}/cancel`, credentials, {
        method: 'POST',
      });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Cancel failed' };
    }
  }

  async trackShipment(
    trackingNumber: string,
    credentials: Record<string, string>
  ): Promise<TrackingOutput> {
    const data = await this.request<{
      tracking_code: string;
      status: string;
      courier_name?: string;
      courier_phone?: string;
      estimated_delivery?: string;
      history: Array<{
        status: string;
        note: string;
        location?: string;
        created_at: string;
      }>;
    }>(`/v1/shipments/${trackingNumber}`, credentials);

    return {
      trackingNumber: data.tracking_code,
      status: mapStatus(data.status),
      driverName: data.courier_name,
      driverPhone: data.courier_phone,
      estimatedDeliveryAt: data.estimated_delivery,
      events: (data.history ?? []).map((e) => ({
        status: mapStatus(e.status),
        description: e.note,
        location: e.location,
        timestamp: e.created_at,
      })),
    };
  }

  async estimateFee(
    governorateId: number,
    credentials: Record<string, string>
  ): Promise<DeliveryFeeEstimate> {
    const data = await this.request<{
      fee: number;
      eta_days: number;
    }>(`/v1/pricing?governorate_id=${governorateId}`, credentials);

    return {
      governorateId,
      feeIqd: data.fee,
      estimatedDays: data.eta_days,
      provider: this.nameAr,
    };
  }

  async parseWebhook(
    payload: unknown
  ): Promise<{
    trackingNumber: string;
    status: ShipmentStatus;
    description: string;
    timestamp: string;
    driverName?: string;
    driverPhone?: string;
  }> {
    const data = payload as {
      tracking_code: string;
      status: string;
      note?: string;
      created_at?: string;
      courier?: { name?: string; phone?: string };
    };

    return {
      trackingNumber: data.tracking_code,
      status: mapStatus(data.status),
      description: data.note ?? '',
      timestamp: data.created_at ?? new Date().toISOString(),
      driverName: data.courier?.name,
      driverPhone: data.courier?.phone,
    };
  }
}
