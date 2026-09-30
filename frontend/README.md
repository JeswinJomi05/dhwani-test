# PgBee Stay Hub

## Setup

Install with `npm install`. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_STAYHUB_ID` to a real venue UUID and `NEXT_PUBLIC_STAYHUB_SHARING_TYPE` to its exact rent sharing type. Booking is disabled until both are configured. These public settings require a rebuild when changed.

`PGBEE_API_URL` defaults to `https://server.pgbee.co.in`. For a local backend on port 3000, run `npm run dev -- --port 3001`. Production: `npm run build`, then `npm start`; HTTPS is required for secure session cookies.

## Integration

Guest registration, OTP sign-in/resend, session refresh/logout, seat checkout, Razorpay payment verification, booking history and cancellation use the endpoints documented in `openapi.json`. An allowlisted same-origin server route keeps access and refresh tokens in HTTP-only cookies. Refresh cookies last for the browser session; the backend controls token validity. Razorpay uses the public key and order returned by checkout, never a frontend secret. See [Razorpay documentation](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/).

## Contract limitations

Venue list/detail endpoints require superadmin access and include guest data. The rent read endpoint is documented for hostels, not stay hubs. The frontend therefore uses configured venue/sharing identifiers and shows only the server checkout price. No admin credentials are needed or exposed. Configure a matching rent row and capacity in the backend.

Property photos use the ten supplied JPEGs in `assets/photos`, with five shown in the gallery and all ten in the photo viewer. Amenities, location and map remain illustrative and labelled in the UI. Contact/group enquiries use the existing phone contacts because no guest host-message API is documented. Wishlist remains page-session-only. Currency selection does not convert payment amounts.

Checkout reserves one seat per authenticated guest; dates and party size are not accepted by the API. Dialog state survives closing/reopening within the page session. After a reload, refresh booking history to reconcile pending payments. The spec has no endpoint to resume an existing checkout order. If verification cannot be retried after a reload, backend webhook/support reconciliation is needed; do not pay again to resolve an uncertain payment.

## Checks

Run `npm run typecheck`, `npm test`, and `npm run build`. Tests mock API responses and do not send SMS or charge money. Before launch, exercise OTP delivery, capacity conflicts, payment failures/dismissal, verification retries and cancellation refunds with backend/Razorpay test credentials.
