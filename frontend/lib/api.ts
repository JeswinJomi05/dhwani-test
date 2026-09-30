export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
let refreshing: Promise<unknown> | null = null;
export async function api<T>(path: string, body?: unknown, method = body === undefined ? 'GET' : 'POST', retry = true): Promise<T> {
  const response = await fetch(`/api/guest/${path}`, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store' });
  const result = await response.json();
  if (response.status === 401 && retry && !path.startsWith('auth/') && path !== 'otp/send') {
    if (!refreshing) refreshing = api('auth/guest/refresh', {}, 'POST', false).finally(() => { refreshing = null; });
    await refreshing;
    return api<T>(path, body, method, false);
  }
  if (!response.ok || result.ok === false || result.success === false) throw new ApiError(result.message || 'Request failed. Please try again.', response.status);
  return result.data as T;
}
export type Booking = { id: string; publicReference: string; status: string; sharingType: string; amountPaise: number; cancellationFeePercent: number; refundAmountPaise?: number | null };
export type Checkout = { booking: Booking; orderId: string; keyId: string; amountPaise: number; currency: string };
export type PaymentResult = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type Options = { key: string; order_id: string; amount: number; currency: string; name: string; handler: (result: PaymentResult) => void; modal: { ondismiss: () => void } };
declare global { interface Window { Razorpay?: new (options: Options) => { open: () => void } } }
export async function loadCheckout() {
  if (window.Razorpay) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    const timer = setTimeout(() => { script.remove(); reject(new Error('Payment checkout took too long to load. Please retry.')); }, 15000);
    script.onload = () => { clearTimeout(timer); resolve(); };
    script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error('Unable to load payment checkout. Please retry.')); };
    document.body.appendChild(script);
  });
  if (!window.Razorpay) throw new Error('Payment checkout is unavailable.');
}
