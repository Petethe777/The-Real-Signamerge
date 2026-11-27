import { useEffect, useMemo, useState } from 'react';
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
const KIND_LABEL: Record<Kind, string> = { web: 'Web development', ecommerce: 'E-commerce' };
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const initials = (name: string) =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2);

/** The workspace for signed-up users. Same look as the landing page demo: filters on the left, opportunity cards on the right. */
export default function OpportunitiesHub({ handleLogout }: { handleLogout: () => void }) {
  const [contacts, setContacts] = useState<Record<number, Contact>>({});
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [failed, setFailed] = useState(false);
  const [kind, setKind] = useState<Kind>('web');
  const [state, setState] = useState('All');

  // Contact details come from Supabase and can only be read by logged-in users (see supabase/opportunity_contacts.sql)
  useEffect(() => {
    supabase
      .from('opportunity_contacts')
      .select('*')
      .then(({ data, error }) => {
        if (error || !data) return setFailed(true);
        setContacts(Object.fromEntries((data as Contact[]).map((c) => [c.opportunity_id, c])));
      });
  }, []);

  const keyOf = (o: (typeof OPPORTUNITIES)[number]) => (o.kind === 'web' ? o.state.replace(' (verify)', '') : o.group);
  const ofKind = useMemo(() => OPPORTUNITIES.filter((o) => o.kind === kind), [kind]);
  const states = useMemo(() => ['All', ...Array.from(new Set(ofKind.map(keyOf)))], [ofKind]);
  const shown = ofKind.filter((o) => state === 'All' || keyOf(o) === state);
  const count = (k: Kind) => OPPORTUNITIES.filter((o) => o.kind === k).length;

  const toggle = (id: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

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
            <p className="sm-main-label">{shown.length} opportunities</p>
            <ol className="sm-results" style={{ minHeight: 0 }}>
              {shown.map((o) => {
                const c = contacts[o.id];
                const isOpen = open.has(o.id);
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
                      {isOpen && c ? (
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
                            disabled={!c}
                            onClick={() => toggle(o.id)}
                          >
                            {c ? 'View contact details' : failed ? 'Unavailable' : 'Loading…'}
                          </button>
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
          <p>Signed in. Contact details unlock on each card.</p>
          <Link to="/" className="sm-btn sm-btn-ghost">Back to home</Link>
        </div>
      </div>
    </AccountShell>
  );
}
