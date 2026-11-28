// Receives Yoco's signed "payment.succeeded" notification and adds the credits.
// Deploy with --no-verify-jwt (Yoco does not send a Supabase login token).
// Secrets: YOCO_WEBHOOK_SECRET (the whsec_... value returned when you register the webhook)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const b64decode = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const b64encode = (b: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(b)));

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Standard Webhooks signature: base64 HMAC-SHA256 over "{webhook-id}.{webhook-timestamp}.{raw body}"
async function verify(body: string, headers: Headers, secret: string) {
  const id = headers.get('webhook-id');
  const ts = headers.get('webhook-timestamp');
  const sigHeader = headers.get('webhook-signature');
  if (!id || !ts || !sigHeader || !secret.startsWith('whsec_')) return false;
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 180) return false;       // replay protection
  const key = await crypto.subtle.importKey('raw', b64decode(secret.slice(6)), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expected = b64encode(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${id}.${ts}.${body}`)));
  return sigHeader.split(' ').some((entry) => {
    const [version, sig] = entry.split(',');
    return version === 'v1' && !!sig && safeEqual(sig, expected);
  });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });
  const secret = Deno.env.get('YOCO_WEBHOOK_SECRET');
  if (!secret) return new Response('not configured', { status: 500 });

  const body = await req.text();                                           // raw body, before any JSON parsing
  if (!(await verify(body, req.headers, secret))) return new Response('bad signature', { status: 400 });

  const event = JSON.parse(body);
  if (event.type !== 'payment.succeeded') return new Response('ignored', { status: 200 });

  // Yoco sends us every payment on the account. Only act on checkouts we created.
  const checkoutId = event.payload?.metadata?.checkoutId;
  if (!checkoutId) return new Response('no checkout id', { status: 200 });
  const amount = typeof event.payload?.amount === 'number' ? event.payload.amount : null;

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data, error } = await admin.rpc('complete_checkout', { p_checkout_id: checkoutId, p_amount_cents: amount });
  if (error) {
    console.error('complete_checkout failed', error.message);
    return new Response('error', { status: 500 });                         // Yoco will retry
  }
  console.log('checkout', checkoutId, data);
  return new Response('ok', { status: 200 });
});
