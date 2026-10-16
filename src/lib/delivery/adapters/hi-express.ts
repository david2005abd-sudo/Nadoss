import type {
  DeliveryAdapter,
  CreateShipmentInput,
  CreateShipmentOutput,
  TrackingOutput,
  DeliveryFeeEstimate,
  ShipmentStatus,
} from '../types';

const PROD_URL = 'https://api.hi-express.co';
const STAGING_URL = 'https://staging-api.hi-express.co';

function baseUrl(credentials: Record<string, string>): string {
  return credentials.environment === 'staging' ? STAGING_URL : PROD_URL;
}

function mapStatus(hiStatus: string): ShipmentStatus {
  const map: Record<string, ShipmentStatus> = {
    CREATED: 'created',
    PICKED_UP: 'picked_up',
    IN_TRANSIT: 'in_transit',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    FAILED: 'failed',
    RETURNED: 'returned',
    CANCELLED: 'returned',
  };
  return map[hiStatus.toUpperCase()] ?? 'in_transit';
}

export class HiExpressAdapter implements DeliveryAdapter {
  readonly slug = 'hi-express';
  readonly nameAr = 'هاي إكسبريس';

  private async request<T>(
    path: string,
    credentials: Record<string, string>,
    init: RequestInit = {}
  ): Promise<T> {
    const res = await fetch(`${baseUrl(credentials)}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.apiKey}`,
        'X-API-Key': credentials.apiKey,
        ...(init.headers ?? {}),
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        `HiExpress ${res.status}: ${(data as { message?: string }).message ?? 'Request failed'}`
      );
    }
    return data as T;
  }

  async testConnection(credentials: Record<string, string>): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.request('/api/v1/merchant/profile', credentials);
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
      reference_id: input.orderNumber,
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
      channel: 'nados',
    };

    const data = await this.request<{
      tracking_number: string;
      shipment_id: string;
      status: string;
      estimated_delivery?: string;
      airwaybill_url?: string;
    }>('/api/v1/shipments', credentials, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return {
      trackingNumber: data.tracking_number,
      externalId: data.shipment_id,
      status: mapStatus(data.status),
      estimatedDeliveryAt: data.estimated_delivery,
      labelUrl: data.airwaybill_url,
      rawResponse: data,
    };
  }

  async cancelShipment(
    trackingNumber: string,
    credentials: Record<string, string>
  ): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.request(`/api/v1/shipments/${trackingNumber}/cancel`, credentials, {
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
    }>(`/api/v1/shipments/${trackingNumber}/tracking`, credentials);

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
      fee: number;
      estimated_days: number;
    }>(`/api/v1/pricing/estimate?governorate_id=${governorateId}`, credentials);

    return {
      governorateId,
      feeIqd: data.fee,
      estimatedDays: data.estimated_days,
      provider: this.nameAr,
    };
  }

  async parseWebhook(
    payload: unknown,
    headers: Record<string, string>
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
