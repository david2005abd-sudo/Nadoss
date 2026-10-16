import type {
  DeliveryAdapter,
  CreateShipmentInput,
  CreateShipmentOutput,
  TrackingOutput,
  DeliveryFeeEstimate,
  ShipmentStatus,
} from '../types';

const BASE_URL = 'https://api.tryboxy.com';

function mapStatus(boxyStatus: string): ShipmentStatus {
  const map: Record<string, ShipmentStatus> = {
    pending: 'created',
    confirmed: 'created',
    picked_up: 'picked_up',
    in_transit: 'in_transit',
    out_for_delivery: 'out_for_delivery',
    delivered: 'delivered',
    failed: 'failed',
    returned: 'returned',
    cancelled: 'returned',
  };
  return map[boxyStatus.toLowerCase()] ?? 'in_transit';
}

export class BoxyAdapter implements DeliveryAdapter {
  readonly slug = 'boxy';
  readonly nameAr = 'بوكسي';

  private async request<T>(
    path: string,
    credentials: Record<string, string>,
    init: RequestInit = {}
  ): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.apiKey}`,
        'X-Tenant-Id': credentials.tenantId,
        ...(init.headers ?? {}),
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        `Boxy ${res.status}: ${(data as { message?: string }).message ?? 'Request failed'}`
      );
    }
    return data as T;
  }

  async testConnection(credentials: Record<string, string>): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.request('/v1/account', credentials);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }

  async createShipment(
    input: CreateShipmentInput,
    credentials: Record<string, string>
  ): Promise<CreateShipmentOutput> {
    // Boxy supports courier hint for smart selection
    const body = {
      reference: input.orderNumber,
      recipient: {
        name: input.recipient.name,
        phone: input.recipient.phone.replace('+964', '0'),
        governorate: input.recipient.governorateName,
        city: input.recipient.city,
        address: input.recipient.address,
        coordinates: input.recipient.coordinates,
      },
      items: input.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unit_price: i.unitPriceIqd,
      })),
      cod_amount: input.codAmountIqd,
      notes: input.notes ?? '',
      service_type: input.isPickup ? 'pickup' : 'delivery',
      // Boxy smart selection: 'auto' | 'cheapest' | 'fastest' | specific slug
      courier_preference: credentials.courierPreference ?? 'auto',
    };

    const data = await this.request<{
      tracking_number: string;
      shipment_id: string;
      status: string;
      courier: { name: string; slug: string };
      estimated_delivery?: string;
      label_url?: string;
      fee?: number;
    }>('/v1/shipments', credentials, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return {
      trackingNumber: data.tracking_number,
      externalId: data.shipment_id,
      status: mapStatus(data.status),
      estimatedDeliveryAt: data.estimated_delivery,
      labelUrl: data.label_url,
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
      tracking_number: string;
      status: string;
      driver_name?: string;
      driver_phone?: string;
      estimated_delivery?: string;
      events: Array<{
        status: string;
        description: string;
        location?: string;
        timestamp: string;
      }>;
    }>(`/v1/shipments/${trackingNumber}/tracking`, credentials);

    return {
      trackingNumber: data.tracking_number,
      status: mapStatus(data.status),
      driverName: data.driver_name,
      driverPhone: data.driver_phone,
      estimatedDeliveryAt: data.estimated_delivery,
      events: (data.events ?? []).map((e) => ({
        status: mapStatus(e.status),
        description: e.description,
        location: e.location,
        timestamp: e.timestamp,
      })),
    };
  }
  async estimateFee(
    governorateId: number,
    credentials: Record<string, string>
  ): Promise<DeliveryFeeEstimate> {
    const data = await this.request<{
      estimates: Array<{ provider: string; fee: number; estimated_days: number }>;
    }>(`/v1/pricing/estimate?governorate_id=${governorateId}&cod_amount=0`, credentials);

    // Boxy returns multiple options — we take the cheapest
    const cheapest = (data.estimates ?? []).sort((a, b) => a.fee - b.fee)[0];

    return {
      governorateId,
      feeIqd: cheapest?.fee ?? 0,
      estimatedDays: cheapest?.estimated_days ?? 3,
      provider: `${this.nameAr} — ${cheapest?.provider ?? 'auto'}`,
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
      tracking_number: string;
      status: string;
      description?: string;
      timestamp?: string;
      driver?: { name?: string; phone?: string };
    };

    return {
      trackingNumber: data.tracking_number,
      status: mapStatus(data.status),
      description: data.description ?? '',
      timestamp: data.timestamp ?? new Date().toISOString(),
      driverName: data.driver?.name,
      driverPhone: data.driver?.phone,
    };
  }
}
