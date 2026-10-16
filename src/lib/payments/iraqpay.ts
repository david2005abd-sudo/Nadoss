import { IraqPay } from 'iraqpay';

// Singleton instance — configured from env
let instance: IraqPay | null = null;

export function getIraqPay(): IraqPay {
  if (!instance) {
    instance = new IraqPay({
      gateways: {
        zaincash: {
          msisdn: process.env.ZAINCASH_MSISDN!,
          merchantId: process.env.ZAINCASH_MERCHANT_ID!,
          secret: process.env.ZAINCASH_SECRET!,
        },
        fib: {
          clientId: process.env.FIB_CLIENT_ID!,
          clientSecret: process.env.FIB_CLIENT_SECRET!,
        },
        qicard: {
          username: process.env.QICARD_USERNAME!,
          password: process.env.QICARD_PASSWORD!,
          terminalId: process.env.QICARD_TERMINAL_ID!,
        },
        nasspay: {
          token: process.env.NASSPAY_TOKEN!, // SDK config type currently omits this provider field.
        } as never,
        //
        },
      },
      sandbox: process.env.NODE_ENV !== 'production',
      language: 'ar',
    });
  }
  return instance;
}

export type PaymentGateway = 'zaincash' | 'fib' | 'qicard' | 'nasspay' | 'cod';

export interface CreatePaymentParams {
  gateway: PaymentGateway;
  amount: number; // IQD integer
  orderId: string;
  description: string;
  callbackUrl: string;
}

export interface PaymentResult {
  id: string;
  redirectUrl?: string;
  qrCode?: string; // base64 image (FIB)
  readableCode?: string; // manual entry code (FIB)
  deepLinks?: {
    personal?: string;
    business?: string;
    corporate?: string;
  };
  status: 'pending' | 'paid' | 'failed' | 'refunded';
}

export async function createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
  const pay = getIraqPay();

  // COD is handled locally — no external gateway call
  if (params.gateway === 'cod') {
    return {
      id: `cod_${params.orderId}_${Date.now()}`,
      status: 'pending',
    };
  }

  const payment = await pay.createPayment({
    gateway: params.gateway,
    amount: Math.round(params.amount),
    orderId: params.orderId,
    description: params.description,
    callbackUrl: params.callbackUrl,
  });

  return {
    id: payment.id,
    redirectUrl: payment.redirectUrl,
    qrCode: payment.qrCode,
    readableCode: payment.readableCode,
    deepLinks: payment.deepLinks,
    status: 'pending',
  };
}

export async function verifyCallback(
  payload: unknown,
  gateway: PaymentGateway
): Promise<{ id: string; status: PaymentResult['status']; orderId?: string; amount?: number }> {
  const pay = getIraqPay();

  if (gateway === 'cod') {
    return { id: '', status: 'pending' };
  }

  const event = await pay.verifyCallback(payload as never, gateway as never);
  return {
    id: event.id ?? '',
    status: (event.status as PaymentResult['status']) ?? 'pending',
    orderId: event.orderId,
    amount: event.amount,
  };
}

export const GATEWAY_LABELS: Record<PaymentGateway, string> = {
  cod: 'الدفع عند الاستلام',
  zaincash: 'زين كاش',
  fib: 'المصرف العراقي الأول (FIB)',
  qicard: 'كي كارد',
  nasspay: 'ناس باي',
};

export const GATEWAY_DESCRIPTIONS: Record<PaymentGateway, string> = {
  cod: 'ادفع نقدًا عند استلام طلبك',
  zaincash: 'ادفع عبر محفظة زين كاش',
  fib: 'امسح رمز QR أو ادفع عبر تطبيق FIB',
  qicard: 'ادفع عبر بطاقة كي كارد',
  nasspay: 'ادفع عبر محفظة ناس باي',
};
