import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { OPPORTUNITIES } from '@/data/opportunities';
import { AccountShell } from './AccountShell';

interface Contact {
  opportunity_id: number;
  reference: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  details: string[] | null;
  links: { label: string; url: string }[] | null;
}

type Kind = 'web' | 'ecommerce';
const usd = (n: number) => `$${n}`; // 1 credit = 1 USD
const KIND_LABEL: Record<Kind, string> = { web: 'Web development', ecommerce: 'E-commerce' };
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const initials = (name: string) =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2);

/** The workspace for signed-up users. Same look as the landing page demo: filters on the left, opportunity cards on the right. */
export default function OpportunitiesHub({ handleLogout }: { handleLogout: () => void }) {
  // Only leads this user has unlocked are ever sent to the browser (see supabase/credits_and_paywall.sql)
  const [contacts, setContacts] = useState<Record<number, Contact>>({});
  const [balance, setBalance] = useState<number | null>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [kind, setKind] = useState<Kind>('web');
  const [state, setState] = useState('All');

  const loadAll = useCallback(async () => {
    const [w, p, u] = await Promise.all([
      supabase.from('wallets').select('balance').maybeSingle(),
      supabase.from('lead_prices').select('lead_group, credits'),
      supabase.rpc('get_my_unlocked_contacts'),
    ]);
    setBalance((w.data as { balance: number } | null)?.balance ?? 0);
    if (p.data) setPrices(Object.fromEntries((p.data as { lead_group: string; credits: number }[]).map((x) => [x.lead_group, x.credits])));
    if (Array.isArray(u.data)) setContacts(Object.fromEntries((u.data as Contact[]).map((c) => [c.opportunity_id, c])));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const unlock = async (id: number) => {
    setBusy(id);
    setErrors((e) => ({ ...e, [id]: '' }));
    const { data, error } = await supabase.rpc('unlock_opportunity', { p_opportunity_id: id });
    setBusy(null);
    if (error) {
      const m = error.message || '';
      const msg = m.includes('insufficient_credits')
        ? 'Not enough credits. Use "Buy credits" at the top to top up.'
        : m.includes('contact_not_available')
          ? 'Contact details for this lead are not available yet. You have not been charged.'
          : 'Something went wrong. You have not been charged. Please try again.';
      setErrors((e) => ({ ...e, [id]: msg }));
      return;
    }
    const row = data as Contact & { balance: number };
    setContacts((prev) => ({ ...prev, [id]: row }));
    setBalance(row.balance);
  };

  const keyOf = (o: (typeof OPPORTUNITIES)[number]) => (o.kind === 'web' ? o.state.replace(' (verify)', '') : o.group);
  const ofKind = useMemo(() => OPPORTUNITIES.filter((o) => o.kind === kind), [kind]);
  const states = useMemo(() => ['All', ...Array.from(new Set(ofKind.map(keyOf)))], [ofKind]);
  const shown = ofKind.filter((o) => state === 'All' || keyOf(o) === state);
  const count = (k: Kind) => OPPORTUNITIES.filter((o) => o.kind === k).length;

  return (
    <AccountShell
      navAction={
        <button type="button" className="sm-btn sm-btn-ghost" onClick={handleLogout}>
          Log out
        </button>
      }
    >
      <div className="sm-panel">
        <div className="sm-bar">
          <h1 className="sm-main-title" style={{ margin: 0 }}>Opportunities</h1>
          <div className="sm-examples" role="tablist">
            {(['web', 'ecommerce'] as Kind[]).map((k) => (
              <button
                key={k}
                type="button"
                role="tab"
                className="sm-example"
                aria-pressed={k === kind}
                onClick={() => { setKind(k); setState('All'); }}
              >
                {KIND_LABEL[k]} ({count(k)})
              </button>
            ))}
          </div>
        </div>

        <div className="sm-body">
          <div className="sm-side">
            <p className="sm-side-label">{kind === 'web' ? 'Filter by state' : 'Filter by type'}</p>
            <div className="sm-examples">
              {states.map((s) => (
                <button key={s} type="button" className="sm-example" aria-pressed={s === state} onClick={() => setState(s)}>
                  {s}
                </button>
              ))}
            </div>
            <p className="sm-side-hint">
              Check each original source before reaching out or bidding. Signals and deadlines require confirmation with the buyer.
            </p>
          </div>

          <div className="sm-main">
            <div className="sm-card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <strong>Credits: {balance === null ? '…' : balance}</strong>
                <span className="sm-side-hint" style={{ margin: 0 }}>1 credit = $1 USD. Credits do not reset each month.</span>
                <Link to="/buy-credits" className="sm-btn sm-btn-primary" style={{ marginLeft: 'auto' }}>
                  Buy credits
                </Link>
              </div>
            </div>
            <p className="sm-main-label">{shown.length} opportunities</p>
            <ol className="sm-results" style={{ minHeight: 0 }}>
              {shown.map((o) => {
                const c = contacts[o.id];
                const price = prices[o.group];
                return (
                  <li key={o.id} className="sm-card">
                    <div className="sm-card-head">
                      <span className="sm-avatar" aria-hidden="true">{initials(o.org)}</span>
                      <div className="sm-card-who">
                        <strong>{o.org}</strong>
                        <span>{o.state}</span>
                      </div>
                      <span className="sm-intent" data-intent="ready">{o.dateLabel}</span>
                    </div>
                    <blockquote className="sm-post">
                      <strong>{o.project}.</strong> {o.scope}
                    </blockquote>
                    <div className="sm-card-meta">
                      <span>{o.eligibility}</span>
                      {o.value && <span>{o.value}</span>}
                    </div>

                    <div className="sm-contact">
                      {c ? (
                        <div style={{ display: 'grid', gap: 4, width: '100%' }}>
                          {c.contact_name && <strong>{c.contact_name}</strong>}
                          {c.email && c.email.includes('@') ? (
                            <a className="sm-link" href={`mailto:${c.email}`}>{c.email}</a>
                          ) : (
                            <span>{c.email}</span>
                          )}
                          {c.phone && <span>{c.phone}</span>}
                          {(c.details ?? []).map((d) =>
                            isEmail(d) ? <a key={d} className="sm-link" href={`mailto:${d}`}>{d}</a> : <span key={d}>{d}</span>,
                          )}
                          {c.reference && <span>Reference: {c.reference}</span>}
                          {(c.links ?? []).map((l) => (
                            <a key={l.url} className="sm-link" href={l.url} target="_blank" rel="noreferrer">{l.label}</a>
                          ))}
                        </div>
                      ) : (
                        <>
                          <Lock size={16} aria-hidden="true" />
                          <span className="sm-blur" aria-hidden="true">name@example.com</span>
                          <span className="sm-blur" aria-hidden="true">+1 000 000 0000</span>
                          <button
                            type="button"
                            className="sm-btn sm-btn-primary"
                            style={{ marginLeft: 'auto' }}
                            disabled={busy === o.id || price === undefined}
                            onClick={() => unlock(o.id)}
                          >
                            {busy === o.id
                              ? 'Unlocking…'
                              : price === undefined
                                ? 'View contact details'
                                : `View contact details · ${usd(price)}`}
                          </button>
                          {errors[o.id] && (
                            <span style={{ flexBasis: '100%', fontSize: 13 }} role="alert">{errors[o.id]}</span>
                          )}
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <div className="sm-foot">
          <p>Signed in. Pay per lead with credits: unlock only the contacts you want.</p>
          <Link to="/" className="sm-btn sm-btn-ghost">Back to home</Link>
        </div>
      </div>
    </AccountShell>
  );
}
