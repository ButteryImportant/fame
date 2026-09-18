let csrf = '';
export function setCsrf(value) {
  csrf = value || '';
}
export async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    credentials: 'same-origin',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.method && options.method !== 'GET' ? { 'X-CSRF-Token': csrf } : {}),
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const data = await response
    .json()
    .catch(() => ({ error: 'Unable to read the server response.' }));
  if (!response.ok)
    throw Object.assign(new Error(data.error || 'Please try again.'), { status: response.status });
  if (data.csrf) setCsrf(data.csrf);
  return data;
}
export const money = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value / 100);
export function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const old = document.querySelector('script[data-razorpay]');
    if (old) old.remove();
    const script = document.createElement('script');
    script.dataset.razorpay = 'true';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () =>
      window.Razorpay ? resolve() : reject(new Error('Checkout could not load. Please retry.'));
    script.onerror = () => {
      script.remove();
      reject(new Error('Checkout could not load. Check your connection and retry.'));
    };
    document.head.append(script);
  });
}
