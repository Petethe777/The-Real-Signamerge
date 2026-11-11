import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { SIGNUP_KEY } from '@/components/SignupGateModal';
import { TermsModal } from '@/components/TermsModal';
import { AccountShell } from './AccountShell';
import { CITIES_BY_STATE, US_STATES } from '../landing/demoData';

const BUSINESS_TYPES = [
  'Digital marketing agency',
  'Freelance marketer or consultant',
  'E-commerce store',
  'E-commerce agency or service provider',
  'Other',
];

const COUNTRY = 'United States';

const MIN_LEADS = 30;
const MAX_LEADS = 150;
const LEADS_STEP = 10;

type FieldKey =
  | 'fullName'
  | 'email'
  | 'password'
  | 'state'
  | 'city'
  | 'businessType'
  | 'businessTypeOther'
  | 'terms';

type Errors = Partial<Record<FieldKey, string>>;

/** What the landing page demo passes along when someone clicks "Get started". */
interface DemoState {
  query?: string;
  salespersonId?: string;
  quantity?: number;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function startingLeads(demo?: DemoState) {
  const wanted = demo?.quantity ?? MIN_LEADS;
  const clamped = Math.min(MAX_LEADS, Math.max(MIN_LEADS, wanted));
  return Math.round(clamped / LEADS_STEP) * LEADS_STEP;
}

function friendlySignupError(err: { message: string; status?: number }) {
  const msg = err.message.toLowerCase();
  if (msg.includes('already registered')) {
    return 'An account with this email already exists. Try logging in instead.';
  }
  if (err.status === 429 || msg.includes('rate limit')) {
    return 'Too many attempts. Please wait a few minutes and try again.';
  }
  if (msg.includes('password')) return err.message;
  return 'We could not create your account. Please check your details and try again.';
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p className="sm-field-error" id={id}>
      {message}
    </p>
  );
}

export default function ContactSalesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const demo = (location.state as { demo?: DemoState } | null)?.demo;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState('');
  const cityListId = useId();
  const [city, setCity] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [businessTypeOther, setBusinessTypeOther] = useState('');
  const [leads, setLeads] = useState(startingLeads(demo));
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // If someone who is already logged in lands here, point them to the dashboard instead of the form
  const [alreadySignedIn, setAlreadySignedIn] = useState(false);
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (data.session) setAlreadySignedIn(true);
      })
      .catch(() => {});
  }, []);

  const validate = (): Errors => {
    const found: Errors = {};
    if (fullName.trim().length < 2) found.fullName = 'Enter your full name.';
    if (!EMAIL_PATTERN.test(email.trim())) found.email = 'Enter a valid email address.';
    if (password.length < 8) found.password = 'Use at least 8 characters.';
    if (!state) found.state = 'Choose your state.';
    if (city.trim().length < 2) found.city = 'Enter your city.';
    if (!businessType) found.businessType = 'Choose the type that fits best.';
    if (businessType === 'Other' && businessTypeOther.trim().length < 2) {
      found.businessTypeOther = 'Tell us what kind of business you run.';
    }
    if (!acceptedTerms) found.terms = 'Please accept the Terms to continue.';
    return found;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setFormError('');
    const found = validate();
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`#sm-field-${firstInvalid}`)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          // Stored by Supabase with the account, then copied into public.sales_inquiries
          // by the trigger in supabase/sales_inquiries.sql.
          data: {
            full_name: fullName.trim(),
            country: COUNTRY,
            state,
            city: city.trim(),
            business_type: businessType,
            business_type_other: businessType === 'Other' ? businessTypeOther.trim() : null,
            leads_per_month: leads,
            demo_search: demo?.query ?? null,
            demo_specialist_id: demo?.salespersonId ?? null,
            accepted_terms_at: new Date().toISOString(),
          },
        },
      });

      if (error) {
        setFormError(friendlySignupError(error));
        return;
      }

      // With "Confirm email" on, Supabase hides existing accounts by returning a user with no identities.
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setFormError('An account with this email already exists. Try logging in instead.');
        return;
      }

      if (data.session) {
        try {
          localStorage.setItem(SIGNUP_KEY, '1');
        } catch {}
        navigate('/thank-you');
        return;
      }

      // Email confirmation is on: the thank you page reminds them to open the link we sent
      navigate('/thank-you', { state: { confirmEmail: cleanEmail } });
    } catch (err) {
      console.error(err);
      setFormError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const navAction = (
    <Link to="/login" className="sm-btn sm-btn-ghost">
      Log in
    </Link>
  );

  if (alreadySignedIn) {
    return (
      <AccountShell navAction={navAction}>
        <div className="sm-form-card sm-form-card-narrow sm-done">
          <h2>You are already signed in</h2>
          <p>Your account is ready. Head to your dashboard to continue.</p>
          <Link to="/dashboard" className="sm-btn sm-btn-primary">
            Go to dashboard
          </Link>
        </div>
      </AccountShell>
    );
  }

  const err = (key: FieldKey) => (errors[key] ? `sm-error-${key}` : undefined);

  return (
    <AccountShell navAction={navAction}>
      <div className="sm-account-grid">
        <div>
          <h1 className="sm-account-title">Tell us what you need.</h1>
          <p className="sm-account-lede">
            Create your account and tell us about your business. We will review your request and
            come back with a plan and the right sales specialist for you.
          </p>
          <div className="sm-next">
            <p className="sm-next-item">
              <strong>Your email and password are your login.</strong>
              <span>Use them to sign in to your account any time.</span>
            </p>
            <p className="sm-next-item">
              <strong>You choose how many leads you want.</strong>
              <span>From 30 to 150 a month. You can change it later.</span>
            </p>
            <p className="sm-next-item">
              <strong>We build the plan around you.</strong>
              <span>Pricing depends on your lead volume and the specialist you are matched with.</span>
            </p>
          </div>
        </div>

        <div className="sm-form-card">
          <form className="sm-form" ref={formRef} onSubmit={handleSubmit} noValidate>
            <div className="sm-field">
              <label className="sm-label" htmlFor="sm-field-fullName">
                Full name
              </label>
              <input
                id="sm-field-fullName"
                className="sm-input"
                type="text"
                autoComplete="name"
                maxLength={100}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                aria-invalid={errors.fullName ? true : undefined}
                aria-describedby={err('fullName')}
              />
              <FieldError id="sm-error-fullName" message={errors.fullName} />
            </div>

            <div className="sm-field">
              <label className="sm-label" htmlFor="sm-field-email">
                Email
              </label>
              <input
                id="sm-field-email"
                className="sm-input"
                type="email"
                autoComplete="email"
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={err('email')}
              />
              <FieldError id="sm-error-email" message={errors.email} />
            </div>

            <div className="sm-field">
              <label className="sm-label" htmlFor="sm-field-password">
                Password
              </label>
              <div className="sm-pw">
                <input
                  id="sm-field-password"
                  className="sm-input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  maxLength={72}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={errors.password ? true : undefined}
                  aria-describedby={err('password') ?? 'sm-hint-password'}
                />
                <button
                  type="button"
                  className="sm-pw-toggle"
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="sm-field-hint" id="sm-hint-password">
                At least 8 characters. You will use this with your email to log in.
              </p>
              <FieldError id="sm-error-password" message={errors.password} />
            </div>

            <div className="sm-field-row">
              <div className="sm-field">
                <label className="sm-label" htmlFor="sm-field-country">
                  Country
                </label>
                <input
                  id="sm-field-country"
                  className="sm-input sm-input-locked"
                  type="text"
                  value={COUNTRY}
                  readOnly
                  aria-readonly="true"
                />
              </div>

              <div className="sm-field">
                <label className="sm-label" htmlFor="sm-field-state">
                  State
                </label>
                <select
                  id="sm-field-state"
                  className="sm-select"
                  autoComplete="address-level1"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  aria-invalid={errors.state ? true : undefined}
                  aria-describedby={err('state')}
                >
                  <option value="">Choose a state</option>
                  {US_STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <FieldError id="sm-error-state" message={errors.state} />
              </div>
            </div>

            <div className="sm-field">
              <label className="sm-label" htmlFor="sm-field-city">
                City
              </label>
              <input
                id="sm-field-city"
                className="sm-input"
                type="text"
                autoComplete="address-level2"
                maxLength={80}
                list={cityListId}
                placeholder={state ? 'Start typing your city' : 'Choose a state first'}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                aria-invalid={errors.city ? true : undefined}
                aria-describedby={err('city')}
              />
              <datalist id={cityListId}>
                {(CITIES_BY_STATE[state] ?? []).map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <FieldError id="sm-error-city" message={errors.city} />
            </div>

            <div className="sm-field">
              <label className="sm-label" htmlFor="sm-field-businessType">
                What type of business are you?
              </label>
              <select
                id="sm-field-businessType"
                className="sm-select"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                aria-invalid={errors.businessType ? true : undefined}
                aria-describedby={err('businessType')}
              >
                <option value="">Choose one</option>
                {BUSINESS_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <FieldError id="sm-error-businessType" message={errors.businessType} />
            </div>

            {businessType === 'Other' && (
              <div className="sm-field">
                <label className="sm-label" htmlFor="sm-field-businessTypeOther">
                  Tell us what you do
                </label>
                <input
                  id="sm-field-businessTypeOther"
                  className="sm-input"
                  type="text"
                  maxLength={120}
                  value={businessTypeOther}
                  onChange={(e) => setBusinessTypeOther(e.target.value)}
                  aria-invalid={errors.businessTypeOther ? true : undefined}
                  aria-describedby={err('businessTypeOther')}
                />
                <FieldError id="sm-error-businessTypeOther" message={errors.businessTypeOther} />
              </div>
            )}

            <div className="sm-field">
              <div className="sm-leads-head">
                <label className="sm-label" htmlFor="sm-field-leads">
                  Leads per month
                </label>
                <p className="sm-leads-value" aria-hidden="true">
                  {leads} <span>leads a month</span>
                </p>
              </div>
              <input
                id="sm-field-leads"
                className="sm-range"
                type="range"
                min={MIN_LEADS}
                max={MAX_LEADS}
                step={LEADS_STEP}
                value={leads}
                onChange={(e) => setLeads(Number(e.target.value))}
                aria-valuetext={`${leads} leads per month`}
              />
              <div className="sm-range-scale" aria-hidden="true">
                <span>{MIN_LEADS}</span>
                <span>{MAX_LEADS}</span>
              </div>
            </div>

            <div className="sm-field">
              <div className="sm-check">
                <input
                  id="sm-field-terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  aria-invalid={errors.terms ? true : undefined}
                  aria-describedby={err('terms')}
                />
                <p className="sm-check-text">
                  <label htmlFor="sm-field-terms">I agree to the Terms.</label>{' '}
                  <button type="button" className="sm-link" onClick={() => setTermsOpen(true)}>
                    Read the Terms
                  </button>
                </p>
              </div>
              <FieldError id="sm-error-terms" message={errors.terms} />
            </div>

            {formError && (
              <p className="sm-form-error" role="alert">
                {formError}{' '}
                {formError.includes('logging in') && (
                  <Link to="/login" className="sm-link">
                    Log in
                  </Link>
                )}
              </p>
            )}

            <button type="submit" className="sm-btn sm-btn-primary sm-btn-lg sm-submit" disabled={submitting}>
              {submitting ? 'Creating your account…' : 'Create account and contact sales'}
            </button>
            <p className="sm-form-foot">
              Already have an account?{' '}
              <Link to="/login" className="sm-link">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>

      <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
    </AccountShell>
  );
}

/* ---------- Thank you page (opened right after the form is submitted) ---------- */

const ORANGE = '#E8590C';
const ORANGE_DEEP = '#CC4400';
const ORANGE_LIGHT = '#F2762F';
const PEACH = '#FFE9D8';
const PEACH_EDGE = '#F3C4A3';
const CHEEK = '#FFB48A';
const INK = '#1B1816';

interface FluffProps {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  n: number;
  r: number;
  fill: string;
  /** Soft outline colour, used on white fur so it stays visible on a white page */
  edge?: string;
}

/** A fluffy blob: an ellipse ringed with overlapping circles, so the outline looks like fur. */
function Fluff({ cx, cy, rx, ry, n, r, fill, edge }: FluffProps) {
  const dots = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return { x: +(cx + rx * Math.cos(a)).toFixed(1), y: +(cy + ry * Math.sin(a)).toFixed(1) };
  });
  return (
    <g>
      {edge && (
        <g fill={edge}>
          <ellipse cx={cx} cy={cy} rx={rx + 1.6} ry={ry + 1.6} />
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={r + 1.6} />
          ))}
        </g>
      )}
      <g fill={fill}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={r} />
        ))}
      </g>
    </g>
  );
}

function Sparkle({ x, y, scale, delay }: { x: number; y: number; scale: number; delay: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path
        className="sm-ty-spark"
        style={{ animationDelay: delay }}
        d="M0 -12 L3 -3 L12 0 L3 3 L0 12 L-3 3 L-12 0 L-3 -3 Z"
        fill={ORANGE}
      />
    </g>
  );
}

/** The fluffy orange and white character. It waves, blinks and bobs (see account.css). */
export function Mascot() {
  return (
    <svg
      className="sm-ty-svg"
      viewBox="0 0 360 440"
      role="img"
      aria-label="A friendly fluffy orange and white character smiling and waving hello"
    >
      <ellipse cx="180" cy="424" rx="92" ry="11" fill="rgba(27,24,22,0.10)" />

      <Sparkle x={62} y={96} scale={1.1} delay="0s" />
      <Sparkle x={308} y={58} scale={0.8} delay="0.6s" />
      <Sparkle x={326} y={250} scale={1} delay="1.1s" />
      <Sparkle x={40} y={262} scale={0.7} delay="1.6s" />

      <g className="sm-ty-bob">
        {/* legs and feet */}
        <rect x="131" y="326" width="38" height="72" rx="19" fill={ORANGE_DEEP} />
        <rect x="191" y="326" width="38" height="72" rx="19" fill={ORANGE_DEEP} />
        <Fluff cx={150} cy={402} rx={22} ry={9} n={10} r={11} fill="#fff" edge={PEACH_EDGE} />
        <Fluff cx={210} cy={402} rx={22} ry={9} n={10} r={11} fill="#fff" edge={PEACH_EDGE} />

        {/* resting arm */}
        <g transform="rotate(10 112 238)">
          <Fluff cx={98} cy={282} rx={17} ry={46} n={12} r={11} fill={ORANGE_LIGHT} />
          <Fluff cx={98} cy={338} rx={13} ry={10} n={8} r={10} fill="#fff" edge={PEACH_EDGE} />
        </g>

        {/* body, belly and lightning bolt */}
        <Fluff cx={180} cy={276} rx={70} ry={66} n={16} r={18} fill={ORANGE} />
        <Fluff cx={180} cy={290} rx={40} ry={44} n={12} r={10} fill="#fff" edge={PEACH_EDGE} />
        <path d="M187 262 L163 294 H179 L172 318 L198 282 H182 Z" fill={ORANGE} />

        {/* head */}
        <circle cx="102" cy="148" r="17" fill={ORANGE} />
        <circle cx="102" cy="148" r="8" fill={PEACH} />
        <circle cx="258" cy="148" r="17" fill={ORANGE} />
        <circle cx="258" cy="148" r="8" fill={PEACH} />
        <Fluff cx={180} cy={150} rx={76} ry={64} n={18} r={19} fill={ORANGE} />
        <circle cx="166" cy="72" r="11" fill={ORANGE_DEEP} />
        <circle cx="183" cy="66" r="13" fill={ORANGE_DEEP} />
        <circle cx="200" cy="74" r="10" fill={ORANGE_DEEP} />

        {/* face */}
        <Fluff cx={180} cy={160} rx={50} ry={40} n={14} r={9} fill="#fff" edge={PEACH_EDGE} />
        <g className="sm-ty-eye">
          <ellipse cx="160" cy="150" rx="8" ry="11" fill={INK} />
          <circle cx="163" cy="145" r="3" fill="#fff" />
        </g>
        <g className="sm-ty-eye">
          <ellipse cx="200" cy="150" rx="8" ry="11" fill={INK} />
          <circle cx="203" cy="145" r="3" fill="#fff" />
        </g>
        <circle cx="140" cy="173" r="9" fill={CHEEK} opacity="0.8" />
        <circle cx="220" cy="173" r="9" fill={CHEEK} opacity="0.8" />
        <ellipse cx="180" cy="166" rx="6" ry="4.5" fill={ORANGE_LIGHT} />
        <path d="M156 180 Q180 206 204 180" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />

        {/* waving arm (rotated around the shoulder by the CSS animation) */}
        <g transform="rotate(24 252 238)">
          <g className="sm-ty-wave">
            <Fluff cx={260} cy={176} rx={17} ry={64} n={14} r={11} fill={ORANGE_LIGHT} />
            <Fluff cx={262} cy={108} rx={22} ry={18} n={10} r={12} fill="#fff" edge={PEACH_EDGE} />
          </g>
        </g>
      </g>
    </svg>
  );
}

const HEADLINE = ['We', 'can\u2019t', 'wait', 'to', 'bring', 'you', 'customers.'];

const CONFETTI_COLORS = [ORANGE, ORANGE_DEEP, '#F7C9A8', CHEEK];
const CONFETTI = Array.from({ length: 18 }, (_, i) => ({
  x: 4 + ((i * 53) % 92),
  delay: ((i * 7) % 10) * 0.5,
  duration: 5 + (i % 5) * 0.7,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  spin: i % 2 === 0 ? 540 : -420,
}));

export function ThankYouPage() {
  const location = useLocation();
  const confirmEmail = (location.state as { confirmEmail?: string } | null)?.confirmEmail;

  return (
    <AccountShell
      navAction={
        <Link to="/login" className="sm-btn sm-btn-ghost">
          Log in
        </Link>
      }
    >
      <Link to="/" className="sm-back" aria-label="Back to the home page">
        <ArrowLeft size={20} aria-hidden="true" />
        <span>Back to home</span>
      </Link>

      <div className="sm-ty">
        <div className="sm-ty-rings" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="sm-ty-confetti" aria-hidden="true">
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              style={
                {
                  '--x': `${c.x}%`,
                  '--d': `${c.delay}s`,
                  '--t': `${c.duration}s`,
                  '--c': c.color,
                  '--r': `${c.spin}deg`,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <div className="sm-ty-figure">
          <Mascot />
        </div>

        <h1 className="sm-ty-title">
          {HEADLINE.map((word, i) => (
            <span key={i}>
              <span className="sm-ty-word" style={{ '--i': i } as CSSProperties}>
                {i === HEADLINE.length - 1 ? <em>{word}</em> : word}
              </span>{' '}
            </span>
          ))}
        </h1>
        <p className="sm-ty-sub">We&rsquo;ll be in touch with you soon.</p>

        {confirmEmail && (
          <p className="sm-ty-note">
            One last step: we sent a confirmation link to <strong>{confirmEmail}</strong>. Open it
            to activate your login.
          </p>
        )}
      </div>
    </AccountShell>
  );
}
