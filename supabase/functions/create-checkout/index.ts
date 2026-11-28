// Creates a Yoco checkout for the signed-in user and returns the Yoco payment page URL.
// Secrets (supabase secrets set ...): YOCO_SECRET_KEY, SITE_URL (e.g. https://signalmerge.co.za)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const yocoKey = Deno.env.get('YOCO_SECRET_KEY');
    const site = (Deno.env.get('SITE_URL') ?? '').replace(/\/$/, '');
    if (!yocoKey || !site) return json({ error: 'not_configured' }, 503);

    // Who is asking? (taken from their login token, never from the request body)
    const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: 'not_authenticated' }, 401);

    // The price comes from our own table, so the browser cannot choose its own amount.
    const { credits } = await req.json();
    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: pack } = await admin.from('credit_packs').select('credits, zar').eq('credits', credits).maybeSingle();
    if (!pack) return json({ error: 'invalid_pack' }, 400);
    const amountCents = pack.zar * 100;

    const res = await fetch('https://payments.yoco.com/api/checkouts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${yocoKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify({
        amount: amountCents,
        currency: 'ZAR',
        successUrl: `${site}/buy-credits?payment=success`,
        cancelUrl: `${site}/buy-credits?payment=cancelled`,
        failureUrl: `${site}/buy-credits?payment=failed`,
        metadata: { userId: user.id, credits: pack.credits },
      }),
    });
    const checkout = await res.json();
    if (!res.ok || !checkout?.id || !checkout?.redirectUrl) {
      console.error('Yoco checkout failed', res.status, JSON.stringify(checkout));
      return json({ error: 'yoco_error' }, 502);
    }

    const { error } = await admin.from('credit_checkouts').insert({
      checkout_id: checkout.id, user_id: user.id, credits: pack.credits, amount_cents: amountCents,
    });
    if (error) {
      console.error('Could not save checkout', error.message);
      return json({ error: 'db_error' }, 500);
    }
    return json({ redirectUrl: checkout.redirectUrl });
  } catch (e) {
    console.error(e);
    return json({ error: 'server_error' }, 500);
  }
});
