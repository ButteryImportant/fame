import { createHmac } from 'node:crypto';
import { safeEqual } from './security.js';
import { transaction } from './db.js';
export function validSignature(payload, signature, secret) {
  if (!secret || typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  return safeEqual(
    createHmac('sha256', secret).update(payload).digest('hex'),
    signature.toLowerCase()
  );
}
export function createGateway(config) {
  async function request(endpoint, body) {
    let response;
    try {
      response = await fetch(`https://api.razorpay.com/v1${endpoint}`, {
        method: body ? 'POST' : 'GET',
        headers: {
          Authorization: `Basic ${Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw Object.assign(new Error('Payment service is temporarily unavailable. Please retry.'), {
        status: 502,
      });
    }
    const data = await response.json();
    if (!response.ok)
      throw Object.assign(
        new Error('Payment service could not complete the request. Please try again.'),
        { status: 502 }
      );
    return data;
  }
  return {
    createOrder: (body) => request('/orders', body),
    fetchPayment: (id) => request(`/payments/${encodeURIComponent(id)}`),
  };
}
export function applyCaptured(db, order, payment) {
  if (
    payment.order_id !== order.provider_order_id ||
    payment.amount !== order.amount ||
    payment.currency !== order.currency ||
    !['captured', 'refunded'].includes(payment.status) ||
    !payment.captured
  )
    throw Object.assign(new Error('Payment has not been captured for this order yet.'), {
      status: 409,
    });
  if (
    !Number.isInteger(payment.amount_refunded || 0) ||
    (payment.amount_refunded || 0) < 0 ||
    (payment.amount_refunded || 0) > order.amount
  )
    throw Object.assign(new Error('Invalid refund state.'), { status: 409 });
  return transaction(db, () => {
    const fresh = db.prepare('SELECT * FROM orders WHERE id=?').get(order.id);
    if (fresh.payment_id && fresh.payment_id !== payment.id)
      throw Object.assign(new Error('This order has another payment.'), { status: 409 });
    const refunded = Math.max(fresh.refund_amount, payment.amount_refunded || 0);
    const state = fresh.status === 'refunded' || refunded >= fresh.amount ? 'refunded' : 'captured';
    db.prepare(
      'UPDATE orders SET status=?,payment_id=?,refund_amount=?,paid_at=COALESCE(paid_at,?) WHERE id=?'
    ).run(state, payment.id, refunded, Date.now(), order.id);
    return { status: state, newlyGranted: state === 'captured' && fresh.status !== 'captured' };
  });
}
