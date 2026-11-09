import { useId, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { SIGNUP_KEY } from '@/components/SignupGateModal';
import { TermsModal } from '@/components/TermsModal';
import { AccountShell } from './AccountShell';
import { CITIES_BY_STATE, US_STATES } from '@/lib/usLocations';

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
  const [confirmEmail, setConfirmEmail] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

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
        navigate('/dashboard');
        return;
      }

      setConfirmEmail(cleanEmail);
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

  if (confirmEmail) {
    return (
      <AccountShell navAction={navAction}>
        <div className="sm-form-card sm-form-card-narrow sm-done">
          <h2>Check your email</h2>
          <p>
            We sent a confirmation link to <strong>{confirmEmail}</strong>. Open it to activate your
            account, then log in with the email and password you just chose.
          </p>
          <Link to="/login" className="sm-btn sm-btn-primary">
            Go to log in
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
