import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { AccountShell } from './AccountShell';
import { AUTO_CHECKOUT, CREDIT_PACKS, SUPPORT_EMAIL, formatZar } from '@/data/creditPacks';

interface Claim {
  id: number;
  credits: number;
  reference: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const CLAIM_ERRORS: Record<string, string> = {
  invalid_reference: 'Please enter the payment reference from your Yoco receipt (at least 4 characters).',
  reference_already_used: 'That reference has already been submitted.',
  too_many_pending: 'You already have several payments waiting to be confirmed. Please wait for those first.',
  invalid_pack: 'Please choose a credit pack.',
};

/** Buy credits: explains the rand payment, then sends the user to the Yoco payment link for the chosen pack. */
export default function BuyCreditsPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [credits, setCredits] = useState(CREDIT_PACKS[1].credits);
  const [agreed, setAgreed] = useState(false);
  const [manual, setManual] = useState(false);       // automatic checkout unavailable: use the static Yoco link
  const [starting, setStarting] = useState(false);
  const [reason, setReason] = useState<string | null>(null);   // why automatic checkout failed
  const [params] = useSearchParams();
  const payment = params.get('payment');
  const [balance, setBalance] = useState<number | null>(null);
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);

  const pack = CREDIT_PACKS.find((p) => p.credits === credits)!;

  const loadClaims = useCallback(async () => {
    const { data } = await supabase
      .from('payment_claims')
      .select('id, credits, reference, status, created_at')
      .order('id', { ascending: false })
      .limit(10);
    if (data) setClaims(data as Claim[]);
  }, []);

  // After Yoco sends the customer back, credits arrive via webhook within seconds: watch the balance.
  useEffect(() => {
    if (payment !== 'success') return;
    let tries = 0;
    const tick = async () => {
      const { data } = await supabase.from('wallets').select('balance').maybeSingle();
      if (data) setBalance((data as { balance: number }).balance);
      if (++tries >= 10) clearInterval(timer);
    };
    const timer = setInterval(tick, 3000);
    tick();
    return () => clearInterval(timer);
  }, [payment]);

  const startCheckout = async () => {
    // Switch off in creditPacks.ts to use only the static Yoco links.
    if (!AUTO_CHECKOUT) {
      window.open(pack.url, '_blank', 'noopener');
      setManual(true);
      return;
    }
    setStarting(true);
    setMessage(null);
    setReason(null);
    let why = 'unknown';
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', { body: { credits } });
      if (!error && data?.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      if (error) {
        const ctx = (error as { context?: Response }).context;
        const status = ctx?.status;
        let code = '';
        try { code = (await ctx?.json())?.error ?? ''; } catch { /* no body */ }
        why = code || (status === 404 ? 'function_not_deployed' : status ? `http_${status}` : error.name || 'network_error');
      } else {
        why = 'no_redirect_url';
      }
    } catch (e) {
      why = e instanceof Error ? e.message : 'unexpected_error';
    }
    console.error('Automatic checkout failed:', why);
    setReason(why);
    setStarting(false);
    setManual(true);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (!user) return navigate('/login', { replace: true });
      setEmail(user.email ?? null);
      loadClaims();
    });
  }, [navigate, loadClaims]);

  const submitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const { error } = await supabase.rpc('submit_payment_claim', { p_credits: credits, p_reference: reference });
    setSubmitting(false);
    if (error) {
      const key = Object.keys(CLAIM_ERRORS).find((k) => (error.message || '').includes(k));
      return setMessage({ ok: false, text: key ? CLAIM_ERRORS[key] : 'Something went wrong. Please try again.' });
    }
    setReference('');
    setMessage({ ok: true, text: 'Thank you. We will confirm your payment and add your credits.' });
    loadClaims();
  };

  return (
    <AccountShell
      navAction={
        <Link to="/dashboard" className="sm-btn sm-btn-ghost">
          Back to opportunities
        </Link>
      }
    >
      <div className="sm-form-card" style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 className="sm-form-title">Buy credits</h1>
        <p className="sm-field-hint">1 credit = $1 USD. Credits do not reset each month. You only pay for the leads you unlock.</p>

        {payment === 'success' && (
          <div className="sm-card" style={{ margin: '12px 0' }} role="status">
            <strong>Thank you, your payment went through.</strong>
            <p className="sm-field-hint" style={{ margin: '6px 0 0' }}>
              Your credits are added automatically, usually within a few seconds.
              {balance !== null && <> Current balance: <strong>{balance} credits</strong>.</>}
            </p>
          </div>
        )}
        {(payment === 'cancelled' || payment === 'failed') && (
          <p className="sm-form-error" role="alert">
            {payment === 'cancelled' ? 'Payment cancelled. You have not been charged.' : 'The payment did not go through. You have not been charged.'}
          </p>
        )}

        <div className="sm-field" role="radiogroup" aria-label="Credit pack">
          {CREDIT_PACKS.map((p) => (
            <label key={p.credits} className="sm-check" style={{ cursor: 'pointer' }}>
              <input
                type="radio"
                name="pack"
                checked={credits === p.credits}
                onChange={() => { setCredits(p.credits); setAgreed(false); setManual(false); }}
              />
              <span className="sm-check-text">
                <strong>{p.credits} credits</strong> for ${p.usd} USD
              </span>
            </label>
          ))}
        </div>

        <div className="sm-card" style={{ margin: '12px 0' }}>
          <strong>You will pay in South African rand (ZAR)</strong>
          <p className="sm-field-hint" style={{ margin: '6px 0 0' }}>
            Our prices are in US dollars, but Yoco charges in rand. For {pack.credits} credits you will be charged
            <strong> {formatZar(pack.zar)}</strong> at Yoco checkout. If your card is in another currency, your bank
            converts the amount and may add its own fees.
          </p>
        </div>

        <div className="sm-card" style={{ margin: '12px 0' }}>
          <strong>Use this email at Yoco checkout</strong>
          <p style={{ margin: '6px 0' }}><code>{email ?? '…'}</code></p>
          <p className="sm-field-hint" style={{ margin: 0 }}>
            It must be exactly the same as your Signalmerge account email, or we cannot match the payment to your account.
          </p>
        </div>

        <label className="sm-check">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span className="sm-check-text">
            I understand I will be charged {formatZar(pack.zar)} in rand, and I will use {email ?? 'my account email'} at checkout.
          </span>
        </label>

        <button
          type="button"
          className="sm-btn sm-btn-primary sm-btn-lg sm-submit"
          disabled={!agreed || starting}
          onClick={startCheckout}
        >
          {starting ? 'Opening Yoco…' : `Continue to Yoco · ${formatZar(pack.zar)}`}
        </button>

        {manual && AUTO_CHECKOUT && (
          <div className="sm-card" style={{ margin: '12px 0' }} role="status">
            <strong>Automatic checkout is not available right now</strong>
            {reason && <p className="sm-field-hint" style={{ margin: '4px 0 0' }}>Reason: <code>{reason}</code></p>}
            <p className="sm-field-hint" style={{ margin: '6px 0' }}>
              You can still pay with our payment link. Use <strong>{email}</strong> at checkout, then enter your receipt
              reference below. We add your credits once the payment is confirmed.
            </p>
            <a className="sm-btn sm-btn-ghost" href={pack.url} target="_blank" rel="noreferrer">
              Open Yoco payment link · {formatZar(pack.zar)}
            </a>
          </div>
        )}

        {manual && (
          <form className="sm-form" onSubmit={submitClaim} style={{ marginTop: 24 }} noValidate>
            <h2 className="sm-form-title" style={{ fontSize: 18 }}>After you have paid</h2>
            <div className="sm-field">
              <label className="sm-label" htmlFor="sm-ref">Yoco payment reference (from your receipt email)</label>
              <input id="sm-ref" className="sm-input" value={reference} onChange={(e) => setReference(e.target.value)} />
              <span className="sm-field-hint">
                For the {pack.credits}-credit pack ({formatZar(pack.zar)}). We check it against Yoco, then add your credits.
              </span>
            </div>
            {message && (
              <p className={message.ok ? 'sm-field-hint' : 'sm-form-error'} role="alert">{message.text}</p>
            )}
            <button type="submit" className="sm-btn sm-btn-primary sm-submit" disabled={submitting || !reference.trim()}>
              {submitting ? 'Sending…' : 'I have paid'}
            </button>
          </form>
        )}

        {claims.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <strong>Your payments</strong>
            <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
              {claims.map((c) => (
                <li key={c.id} className="sm-field-hint">
                  {c.credits} credits · {c.reference} · {c.status === 'approved' ? 'credited' : c.status === 'pending' ? 'waiting for confirmation' : 'not matched'}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="sm-form-foot">Problem with a payment? Email {SUPPORT_EMAIL}.</p>
      </div>
    </AccountShell>
  );
}
