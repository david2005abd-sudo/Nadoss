// ============================================
// NADOS — Unified Delivery Adapter Types
// ============================================

export interface ShipmentRecipient {
  name: string;
  phone: string;
  governorateId: number;
  governorateName: string;
  city: string;
  address: string;
  coordinates?: { lat: number; lng: number };
}

export interface ShipmentItem {
  name: string;
  quantity: number;
  unitPriceIqd: number;
}

export interface CreateShipmentInput {
  orderId: string;
  orderNumber: string;
  recipient: ShipmentRecipient;
  items: ShipmentItem[];
  codAmountIqd: number;
  deliveryFeeIqd?: number;
  notes?: string;
  isPickup?: boolean;
}

export interface CreateShipmentOutput {
  trackingNumber: string;
  externalId: string;
  status: ShipmentStatus;
  estimatedDeliveryAt?: string;
  labelUrl?: string;
  rawResponse: unknown;
}

export type ShipmentStatus =
  | 'created'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'returned';

export interface TrackingEvent {
  status: ShipmentStatus;
  description: string;
  location?: string;
  timestamp: string;
}

export interface TrackingOutput {
  trackingNumber: string;
  status: ShipmentStatus;
  events: TrackingEvent[];
  driverName?: string;
  driverPhone?: string;
  estimatedDeliveryAt?: string;
}

export interface DeliveryFeeEstimate {
  governorateId: number;
  feeIqd: number;
  estimatedDays: number;
  provider: string;
}

export interface DeliveryAdapter {
  /** Unique slug matching delivery_companies.slug */
  readonly slug: string;
  /** Human-readable name */
  readonly nameAr: string;

  /** Test connection with stored credentials */
  testConnection(credentials: Record<string, string>): Promise<{ ok: boolean; error?: string }>;

  /** Create a shipment with the carrier */
  createShipment(
    input: CreateShipmentInput,
    credentials: Record<string, string>
  ): Promise<CreateShipmentOutput>;

  /** Cancel an existing shipment */
  cancelShipment(
    trackingNumber: string,
    credentials: Record<string, string>
  ): Promise<{ ok: boolean; error?: string }>;

  /** Get tracking status and events */
  trackShipment(
    trackingNumber: string,
    credentials: Record<string, string>
  ): Promise<TrackingOutput>;

  /** Estimate delivery fee for a governorate (optional — not all adapters support it) */
  estimateFee?(
    governorateId: number,
    credentials: Record<string, string>
  ): Promise<DeliveryFeeEstimate>;

  /** Parse incoming webhook payload into standardized status update */
  parseWebhook(
    payload: unknown,
    headers: Record<string, string>
  ): Promise<{
    trackingNumber: string;
    status: ShipmentStatus;
    description: string;
    timestamp: string;
    driverName?: string;
    driverPhone?: string;
  }>;
}
