import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { SIGNUP_KEY } from '@/components/SignupGateModal';
import { AccountShell } from './AccountShell';

function friendlyLoginError(message: string) {
  const msg = message.toLowerCase();
  if (msg.includes('invalid login credentials')) return 'That email and password do not match.';
  if (msg.includes('email not confirmed')) {
    return 'Please confirm your email first. Check your inbox for the link we sent.';
  }
  if (msg.includes('rate limit')) return 'Too many attempts. Please wait a few minutes and try again.';
  return 'We could not log you in. Please try again.';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already logged in? Go straight to the dashboard.
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (data.session) {
          try {
            localStorage.setItem(SIGNUP_KEY, '1');
          } catch {}
          navigate('/dashboard', { replace: true });
        }
      })
      .catch(() => {});
  }, [navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (signInError) {
        setError(friendlyLoginError(signInError.message));
        return;
      }
      try {
        localStorage.setItem(SIGNUP_KEY, '1');
      } catch {}
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AccountShell
      navAction={
        <Link to="/contact-sales" className="sm-btn sm-btn-ghost">
          Contact sales
        </Link>
      }
    >
      <div className="sm-form-card sm-form-card-narrow">
        <h1 className="sm-form-title">Log in</h1>
        <form className="sm-form" onSubmit={handleSubmit} noValidate>
          <div className="sm-field">
            <label className="sm-label" htmlFor="sm-login-email">
              Email
            </label>
            <input
              id="sm-login-email"
              className="sm-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="sm-field">
            <label className="sm-label" htmlFor="sm-login-password">
              Password
            </label>
            <div className="sm-pw">
              <input
                id="sm-login-password"
                className="sm-input"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          {error && (
            <p className="sm-form-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="sm-btn sm-btn-primary sm-btn-lg sm-submit" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
          <p className="sm-form-foot">
            New here?{' '}
            <Link to="/contact-sales" className="sm-link">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </AccountShell>
  );
}
