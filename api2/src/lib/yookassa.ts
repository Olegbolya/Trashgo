const SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;
const API_URL = 'https://api.yookassa.ru/v3';

export function isYooKassaEnabled(): boolean {
  return !!SHOP_ID && !!SECRET_KEY;
}

function authHeader(): string {
  return 'Basic ' + Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString('base64');
}

export interface YooKassaPayment {
  id: string;
  status: string;
  confirmation?: { confirmation_url?: string };
  metadata?: Record<string, string>;
}

export async function createPayment(
  amountRub: number,
  description: string,
  returnUrl: string,
  metadata: Record<string, string>,
): Promise<YooKassaPayment> {
  const idempotenceKey = crypto.randomUUID();
  const res = await fetch(`${API_URL}/payments`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader(),
      'Content-Type': 'application/json',
      'Idempotence-Key': idempotenceKey,
    },
    body: JSON.stringify({
      amount: { value: amountRub.toFixed(2), currency: 'RUB' },
      confirmation: { type: 'redirect', return_url: returnUrl },
      description,
      metadata,
      capture: true,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`YooKassa error ${res.status}: ${err.slice(0, 200)}`);
  }
  return res.json();
}

export async function getPayment(paymentId: string): Promise<YooKassaPayment> {
  const res = await fetch(`${API_URL}/payments/${paymentId}`, {
    headers: { 'Authorization': authHeader() },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`YooKassa getPayment error ${res.status}`);
  return res.json();
}
