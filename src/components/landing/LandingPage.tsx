import { useCallback, useRef, useState, type ReactNode } from 'react';
import './landing.css';
import { DemoPanel, type DemoRequest, type GetStartedContext } from './DemoPanel';
import { VERTICALS } from './demoData';

export interface ProofItem {
  quote: string;
  name: string;
  role: string;
}

export interface LandingPageProps {
  /** Called when someone clicks "Sign up". Defaults to going to /signup. */
  onSignUp?: () => void;
  /** Called when someone clicks "Contact sales". Defaults to going to /contact. */
  onContactSales?: () => void;
  /**
   * Called when someone clicks "Get started" in the demo. Receives the segment, a plain-English
   * description of the search (including the city), and, for "Find customers", the sales
   * specialist and lead count they picked.
   */
  onGetStarted?: (ctx: GetStartedContext) => void;
  /** Real customer quotes. The proof section only appears when you pass at least one. */
  proof?: ProofItem[];
  /** Replace the default wordmark with your own logo. */
  logo?: ReactNode;
  /** Called when the logo is clicked. Lets you use your router instead of a full page load. */
  onHome?: () => void;
  /** Extra nav content shown before "Contact sales" (hidden on small phones). */
  navExtra?: ReactNode;
  /** Replaces the default footer links. Pass router <Link>s or buttons. */
  footerLinks?: ReactNode;
}

function DefaultLogo() {
  return (
    <>
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <rect width="24" height="24" rx="7" fill="#E8590C" />
        <path
          d="M6 8h5c3 0 3 8 6 8h1M6 16h5c3 0 3-8 6-8h1"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span>Signalmerge</span>
    </>
  );
}

const DETAILS = [
  {
    term: 'Who is asking',
    description:
      'The post, search or question that made them a lead, so you know what to say first.',
  },
  {
    term: 'How recent it is',
    description: 'Every signal is timestamped, so you reach people while they are still deciding.',
  },
  {
    term: 'How serious they are',
    description:
      'Each lead is marked ready to buy, comparing options or asking around, so you can start with the warmest.',
  },
  {
    term: 'How to reach them',
    description: 'Contact details unlock when you run a real search.',
  },
];

export default function LandingPage({
  onSignUp = () => window.location.assign('/signup'),
  onContactSales = () => window.location.assign('/contact'),
  onGetStarted = () => window.location.assign('/signup'),
  proof = [],
  logo,
  onHome,
  navExtra,
  footerLinks,
}: LandingPageProps) {
  const [request, setRequest] = useState<DemoRequest | null>(null);
  const demoRef = useRef<HTMLElement>(null);

  const showDemo = useCallback((topicId?: string) => {
    setRequest((prev) => ({ topicId, nonce: (prev?.nonce ?? 0) + 1 }));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    demoRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }, []);

  return (
    <div className="sm-landing">
      <header className="sm-nav">
        <div className="sm-nav-inner">
          <a
            className="sm-logo"
            href="/"
            aria-label="Signalmerge home"
            onClick={(e) => {
              if (onHome) {
                e.preventDefault();
                onHome();
              }
            }}
          >
            {logo ?? <DefaultLogo />}
          </a>
          <nav className="sm-nav-links" aria-label="Page sections">
            <a href="#who">Who it is for</a>
            <a href="#what">What you get</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <div className="sm-nav-actions">
            {navExtra && <div className="sm-nav-extra">{navExtra}</div>}
            <button type="button" className="sm-btn sm-btn-ghost sm-hide-small" onClick={onContactSales}>
              Contact sales
            </button>
            <button type="button" className="sm-btn sm-btn-dark" onClick={onSignUp}>
              Sign up
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="sm-hero">
          <h1 className="sm-h1">Find people who are ready to buy from you.</h1>
          <p className="sm-hero-sub">
            Signalmerge finds people publicly asking for what you sell in any US city, and shows you
            who they are, what they said and when.
          </p>
          <div className="sm-hero-actions">
            <button type="button" className="sm-btn sm-btn-primary sm-btn-lg" onClick={() => showDemo()}>
              Try a demo
            </button>
            <p className="sm-hero-note">
              Type any US city below. The demo is free. Real searches are charged from the first one.
            </p>
          </div>
        </section>

        <section className="sm-demo" ref={demoRef} aria-label="Product demo">
          <DemoPanel request={request} onGetStarted={onGetStarted} />
        </section>

        <section className="sm-section" id="who">
          <div className="sm-wrap">
            <h2 className="sm-h2">Who it is for</h2>
            <div className="sm-aud-list">
              {VERTICALS.map((v) => (
                <div className="sm-aud" key={v.id}>
                  <div>
                    <h3 className="sm-h3 sm-h3-serif">{v.title}</h3>
                    <p className="sm-muted">{v.body}</p>
                  </div>
                  <button type="button" className="sm-btn sm-btn-ghost" onClick={() => showDemo(v.topicId)}>
                    See an example
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sm-section sm-section-tint" id="what">
          <div className="sm-wrap sm-split">
            <div>
              <h2 className="sm-h2">What every result tells you</h2>
              <p className="sm-lede">
                You never get a bare name and number. Each lead comes with the context to start a
                real conversation.
              </p>
            </div>
            <dl className="sm-defs">
              {DETAILS.map((item) => (
                <div className="sm-def" key={item.term}>
                  <dt>{item.term}</dt>
                  <dd>{item.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {proof.length > 0 && (
          <section className="sm-section">
            <div className="sm-wrap">
              <h2 className="sm-h2">What customers say</h2>
              <div className="sm-proof">
                {proof.map((item) => (
                  <figure className="sm-proof-item" key={item.name}>
                    <blockquote>&ldquo;{item.quote}&rdquo;</blockquote>
                    <figcaption>
                      <strong>{item.name}</strong>
                      <span>{item.role}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="sm-section sm-section-ruled" id="pricing">
          <div className="sm-wrap sm-center">
            <h2 className="sm-h2">Pricing that follows your choices</h2>
            <p className="sm-lede">
              Your price depends on how many leads you want and which sales specialist you pick.
              Choose one in the demo to see the numbers, or tell us what you need and we will build
              a custom plan.
            </p>
            <div className="sm-actions">
              <button type="button" className="sm-btn sm-btn-ghost sm-btn-lg" onClick={() => showDemo()}>
                Try the pricing demo
              </button>
              <button type="button" className="sm-btn sm-btn-primary sm-btn-lg" onClick={onContactSales}>
                Contact sales
              </button>
            </div>
          </div>
        </section>

        <section className="sm-band">
          <div className="sm-wrap sm-center">
            <h2 className="sm-h2 sm-h2-light">See what your future customers are saying right now.</h2>
            <div className="sm-band-actions">
              <button type="button" className="sm-btn sm-btn-light sm-btn-lg" onClick={() => showDemo()}>
                Try a demo
              </button>
              <button type="button" className="sm-btn sm-btn-outline-light sm-btn-lg" onClick={onSignUp}>
                Sign up
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="sm-footer">
        <div className="sm-footer-inner">
          <span>&copy; {new Date().getFullYear()} Signalmerge</span>
          <div className="sm-footer-links">
            {footerLinks ?? (
              <>
                <button type="button" onClick={onContactSales}>
                  Contact sales
                </button>
                <button type="button" onClick={onSignUp}>
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

export { LandingPage };
