'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { api, ApiError, loadCheckout, type Booking, type Checkout, type PaymentResult } from '../../lib/api';
import { otpRequestNotice } from '../../lib/otp';

const venueId = process.env.NEXT_PUBLIC_STAYHUB_ID || '';
const sharingType = process.env.NEXT_PUBLIC_STAYHUB_SHARING_TYPE || '';
const money = (paise: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);

export default function GuestPanel({ bookingMode, onPaymentOpen, onPaymentClose }: { bookingMode: boolean; onPaymentOpen: () => void; onPaymentClose: () => void }) {
  const [signedIn, setSignedIn] = useState(false);
  const [register, setRegister] = useState(false);
  const [phone, setPhone] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [proof, setProof] = useState<PaymentResult | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const lock = useRef(false);

  async function refreshBookings() {
    const data = await api<{ bookings: Booking[] }>('bookings/stayhub');
    setBookings(data.bookings);
    setSignedIn(true);
  }
  useEffect(() => {
    let active = true;
    api<{ bookings: Booking[] }>('bookings/stayhub').then(data => { if (active) { setBookings(data.bookings); setSignedIn(true); } }).catch(err => { if (active && !(err instanceof ApiError && err.status === 401)) setError(err.message); }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, []);

  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(''); setNotice('');
    try { await action(); } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please retry.');
      if (err instanceof ApiError && err.status === 401) setSignedIn(false);
    } finally { lock.current = false; setBusy(false); }
  }
  async function sendGuestCode() {
    const result = await api<{ sent?: boolean; devCode?: string | null }>('otp/send', { phoneNo: phone, purpose: 'guest_login' });
    setNotice(otpRequestNotice(result));
    setCodeSent(true);
  }
  function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void run(async () => {
      if (codeSent) {
        await api('auth/guest/verify-otp', { phoneNo: phone, code: data.get('code') });
        setSignedIn(true); setCodeSent(false); await refreshBookings();
      } else {
        if (register) {
          await api('auth/guest/register', { name: data.get('name'), gender: data.get('gender'), age: Number(data.get('age')), phoneNo: phone, ...(data.get('email') ? { email: data.get('email') } : {}) });
          setCodeSent(true);
          setNotice('Registration accepted. Enter the six-digit code when the SMS arrives. If it does not arrive, contact the stay team.');
        } else await sendGuestCode();
      }
    });
  }
  async function verify(result: PaymentResult) {
    if (!checkout) return;
    const data = await api<{ booking: Booking }>('payments/stayhub/verify', { bookingId: checkout.booking.id, razorpayOrderId: result.razorpay_order_id, razorpayPaymentId: result.razorpay_payment_id, razorpaySignature: result.razorpay_signature });
    setBookings(previous => [data.booking, ...previous.filter(item => item.id !== data.booking.id)]);
    setNotice(`Booking ${data.booking.publicReference} is ${data.booking.status.replaceAll('_', ' ')}.`);
    setCheckout(null); setProof(null);
  }
  async function pay() {
    if (!checkout) return;
    await loadCheckout();
    const widget = new window.Razorpay!({ key: checkout.keyId, order_id: checkout.orderId, amount: checkout.amountPaise, currency: checkout.currency, name: 'PgBee Stay Hub',
      handler: result => { onPaymentClose(); setProof(result); void run(() => verify(result)); },
      modal: { ondismiss: () => { onPaymentClose(); setNotice('Payment window closed. Your booking remains pending until payment is verified.'); } },
    });
    onPaymentOpen();
    try { widget.open(); } catch (err) { onPaymentClose(); throw err; }
  }
  return <section className="guest-panel" aria-busy={busy}>
    <h2>{bookingMode ? 'Book your festival stay' : 'Your account & bookings'}</h2>
    {error && <p className="api-error" role="alert">{error}</p>}
    {notice && <p className="api-notice" role="status">{notice}</p>}
    {busy && <p role="status">Please wait…</p>}
    {!signedIn ? <form onSubmit={authenticate}><p>Sign in with the exact phone number used to register. New guests must register before requesting a sign-in code.</p><fieldset disabled={busy}>
      {!codeSent && <><label>Phone number<input type="tel" autoComplete="tel" pattern="[0-9]{10,15}" title="10 to 15 digits, without spaces or +" required value={phone} onChange={e => setPhone(e.target.value)}/></label>
        {register && <><label>Full name<input name="name" autoComplete="name" minLength={2} maxLength={100} pattern="[A-Za-z ]+" required/></label><label>Gender<select name="gender" required><option>Male</option><option>Female</option><option>Other</option></select></label><label>Age<input type="number" name="age" min={13} max={120} required/></label><label>Email (optional)<input name="email" type="email" autoComplete="email"/></label></>}
      </>}
      {codeSent && <label>Verification code for {phone}<input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required/></label>}
      <button className="primary" type="submit">{codeSent ? 'Verify & sign in' : register ? 'Register & send code' : 'Send sign-in code'}</button>
      {codeSent ? <><button type="button" className="option" onClick={() => void run(sendGuestCode)}>Resend code</button><button className="option" type="button" onClick={() => { setCodeSent(false); setNotice(''); setError(''); }}>Change phone number</button></> : <button type="button" className="option" onClick={() => { setRegister(!register); setNotice(''); setError(''); }}>{register ? 'Already registered? Sign in' : 'New guest? Register'}</button>}
    </fieldset></form> : <>
      {bookingMode && <div className="checkout-details"><p>One seat per guest account. For multiple guests, use our group enquiry contacts.</p>
        {!venueId || !sharingType ? <p role="status">Online booking is not available yet. Please contact the stay team.</p> : checkout ? <><h3>{checkout.booking.sharingType}</h3><p>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: checkout.currency }).format(checkout.amountPaise / 100)}</p><p>Reference: {checkout.booking.publicReference}</p><button disabled={busy} className="primary" onClick={() => void run(() => proof ? verify(proof) : pay())}>{proof ? 'Retry payment verification' : 'Continue to payment'}</button>{proof && <p>Payment received by checkout; confirmation is pending. Retry verification before making another payment.</p>}</> : <><p>Sharing: {sharingType}. The server will return your price before payment.</p><button disabled={busy} className="primary" onClick={() => void run(async () => { const data = await api<Checkout>('bookings/stayhub/checkout', { stayhubId: venueId, sharingType }); setCheckout(data); setBookings(previous => [data.booking, ...previous.filter(item => item.id !== data.booking.id)]); })}>Reserve a seat & review price</button></>}
      </div>}
      <h3>Your bookings</h3><button disabled={busy} className="option" onClick={() => void run(refreshBookings)}>Refresh bookings</button>
      {!bookings.length && <p>No bookings yet.</p>}
      {bookings.map(item => <article className="booking-card" key={item.id}><strong>{item.publicReference}</strong><p>{item.sharingType} · {money(item.amountPaise)}</p><p>Status: {item.status.replaceAll('_', ' ')}</p>{item.refundAmountPaise != null && <p>Refund: {money(item.refundAmountPaise)}</p>}
        {['pending', 'confirmed', 'checkin_pending'].includes(item.status) && (cancelId === item.id ? <><p>Cancel this booking? The recorded cancellation fee is {item.cancellationFeePercent}%. The server determines the refund.</p><button className="option" disabled={busy} onClick={() => void run(async () => { const data = await api<{ booking: Booking }>(`bookings/stayhub/${item.id}/cancel`, {}, 'PATCH'); setBookings(previous => previous.map(b => b.id === item.id ? data.booking : b)); if (checkout?.booking.id === item.id) { setCheckout(null); setProof(null); } setCancelId(null); setNotice('Booking cancelled.'); })}>Confirm cancellation</button><button className="option" disabled={busy} onClick={() => setCancelId(null)}>Keep booking</button></> : <button className="option" disabled={busy} onClick={() => setCancelId(item.id)}>Cancel booking</button>)}
      </article>)}
      <button className="option" disabled={busy} onClick={() => void run(async () => { await api('auth/guest/logout', {}); setSignedIn(false); setBookings([]); setCheckout(null); setProof(null); })}>Sign out</button>
    </>}
  </section>;
}
