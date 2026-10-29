import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_QUANTITY,
  LEAD_QUANTITIES,
  SALESPEOPLE,
  TOPICS,
  buildDemoResults,
  searchTitle,
  type BusinessResult,
  type Intent,
  type LeadResult,
  type Segment,
} from './demoData';

export interface DemoRequest {
  /** Topic to load. If omitted, the current topic is replayed. */
  topicId?: string;
  /** Change this number to trigger a new run, even for the same topic. */
  nonce: number;
}

export interface GetStartedContext {
  segment: Segment;
  /** Plain-English description of the search the visitor was looking at, including the city. */
  query: string;
  city: string;
  /** Only set for "Find customers" searches, where a sales specialist can be chosen. */
  salespersonId?: string;
  quantity?: number;
}

interface DemoPanelProps {
  request: DemoRequest | null;
  onGetStarted: (ctx: GetStartedContext) => void;
}

const DEFAULT_CITY = 'Austin, TX';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const SEGMENTS: { id: Segment; label: string }[] = [
  { id: 'customers', label: 'Find customers' },
  { id: 'businesses', label: 'Find local businesses' },
];

const INTENT_KEY: Record<Intent, string> = {
  'Ready to buy': 'ready',
  'Comparing options': 'comparing',
  'Asking around': 'asking',
};

function cleanCity(raw: string) {
  return raw.replace(/\s+/g, ' ').trim().slice(0, 60);
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);
}

function ArrowUpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 16V4M10 4L5 9M10 4l5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="3.5" y="8" width="11" height="7.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6 8V5.8a3 3 0 0 1 6 0V8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 1.5l1.9 4.1 4.5.5-3.3 3 .9 4.4L8 11.3l-4 2.2.9-4.4-3.3-3 4.5-.5L8 1.5z"
        fill="currentColor"
      />
    </svg>
  );
}

function LeadCard({ lead }: { lead: LeadResult }) {
  return (
    <li className="sm-card">
      <div className="sm-card-head">
        <span className="sm-avatar" aria-hidden="true">
          {initials(lead.name)}
        </span>
        <div className="sm-card-who">
          <strong>{lead.name}</strong>
          <span>{lead.area}</span>
        </div>
        <span className="sm-intent" data-intent={INTENT_KEY[lead.intent]}>
          {lead.intent}
        </span>
      </div>
      <blockquote className="sm-post">&ldquo;{lead.post}&rdquo;</blockquote>
      <div className="sm-card-meta">
        <span>{lead.source}</span>
        <span>{lead.when}</span>
      </div>
      <div className="sm-contact">
        <LockIcon />
        <span className="sm-blur" aria-hidden="true">
          (555) 000-0000
        </span>
        <span className="sm-blur" aria-hidden="true">
          name@example.com
        </span>
        <span className="sm-contact-note">Contact details unlock with a real search</span>
      </div>
    </li>
  );
}

function BusinessCard({ business }: { business: BusinessResult }) {
  return (
    <li className="sm-card">
      <div className="sm-card-head">
        <div className="sm-card-who">
          <strong>{business.name}</strong>
          <span>{business.area}</span>
        </div>
        <span className="sm-rating">
          <StarIcon />
          <strong>{business.rating.toFixed(1)}</strong>
          <span>{business.reviews} reviews</span>
        </span>
      </div>
      <p className="sm-why">{business.why}</p>
      <ul className="sm-tags">
        {business.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    </li>
  );
}

function SkeletonCard() {
  return (
    <li className="sm-card sm-skeleton" aria-hidden="true">
      <div className="sm-skel sm-skel-short" />
      <div className="sm-skel" />
      <div className="sm-skel sm-skel-mid" />
    </li>
  );
}

export function DemoPanel({ request, onGetStarted }: DemoPanelProps) {
  const inputId = useId();
  const errorId = useId();

  const [topicId, setTopicId] = useState(TOPICS[0].id);
  const [city, setCity] = useState(DEFAULT_CITY); // the city results were built for
  const [cityInput, setCityInput] = useState(DEFAULT_CITY); // what is typed in the box
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const [specialistId, setSpecialistId] = useState(SALESPEOPLE[0].id);
  const [quantity, setQuantity] = useState(DEFAULT_QUANTITY);

  const timer = useRef<number | undefined>(undefined);
  const latest = useRef({ topicId, city, cityInput });
  latest.current = { topicId, city, cityInput };

  const topic = TOPICS.find((t) => t.id === topicId) ?? TOPICS[0];
  const segment = topic.segment;
  const topics = TOPICS.filter((t) => t.segment === segment);
  const results = useMemo(() => buildDemoResults(topicId, city), [topicId, city]);
  const title = searchTitle(topic, city);

  const specialist = SALESPEOPLE.find((p) => p.id === specialistId) ?? SALESPEOPLE[0];
  const total = specialist.ratePerLead * quantity;

  const run = useCallback((nextTopicId: string, rawCity: string) => {
    const cleaned = cleanCity(rawCity);
    if (!cleaned) {
      setError('Type a city to see sample results, like Austin, TX.');
      return;
    }
    setError('');
    window.clearTimeout(timer.current);
    setTopicId(nextTopicId);
    setCity(cleaned);
    setCityInput(cleaned);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setRunning(false);
      return;
    }
    setRunning(true);
    timer.current = window.setTimeout(() => setRunning(false), 900);
  }, []);

  // Use what is typed if there is something there, otherwise fall back to the last good city.
  const currentCityText = () => (latest.current.cityInput.trim() ? latest.current.cityInput : latest.current.city);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (request) run(request.topicId ?? latest.current.topicId, currentCityText());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, run]);

  const chooseSegment = (next: Segment) => {
    if (next === segment) return;
    const first = TOPICS.find((t) => t.segment === next);
    if (first) run(first.id, currentCityText());
  };

  return (
    <div className="sm-panel">
      <form
        className="sm-bar"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          run(topicId, cityInput);
        }}
      >
        <label className="sm-visually-hidden" htmlFor={inputId}>
          City for the demo search
        </label>
        <div className="sm-bar-field">
          <input
            id={inputId}
            className="sm-city"
            type="text"
            autoComplete="off"
            maxLength={60}
            value={cityInput}
            placeholder="Type a US city, like Austin, TX"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={(e) => setCityInput(e.target.value)}
          />
          <button type="submit" className="sm-run" aria-label="Show sample results for this city">
            <ArrowUpIcon />
          </button>
        </div>
        <div className="sm-bar-row">
          <div className="sm-seg">
            {SEGMENTS.map((seg) => (
              <button
                key={seg.id}
                type="button"
                className="sm-chip"
                aria-pressed={segment === seg.id}
                onClick={() => chooseSegment(seg.id)}
              >
                {seg.label}
              </button>
            ))}
          </div>
        </div>
        {error && (
          <p className="sm-error" id={errorId} role="alert">
            {error}
          </p>
        )}
      </form>

      <div className="sm-body">
        <div className="sm-side">
          <p className="sm-side-label">What are you looking for?</p>
          <div className="sm-examples">
            {topics.map((t) => (
              <button
                key={t.id}
                type="button"
                className="sm-example"
                aria-pressed={t.id === topicId}
                onClick={() => run(t.id, currentCityText())}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="sm-side-hint">
            These are generated samples for the city you type, so you can see the format. Real
            searches use live data.
          </p>
        </div>

        <div className="sm-main">
          <p className="sm-main-label">Sample results</p>
          <h3 className="sm-main-title">{title}</h3>
          <div className="sm-visually-hidden" aria-live="polite">
            {running ? 'Searching' : `Showing ${results.length} sample results. ${title}.`}
          </div>
          <ol className="sm-results" aria-busy={running}>
            {running
              ? [0, 1, 2].map((i) => <SkeletonCard key={i} />)
              : results.map((result) =>
                  result.kind === 'lead' ? (
                    <LeadCard key={result.id} lead={result} />
                  ) : (
                    <BusinessCard key={result.id} business={result} />
                  ),
                )}
          </ol>
        </div>
      </div>

      {segment === 'customers' && (
        <div className="sm-sales">
          <h3 className="sm-sales-title">Choose a sales specialist</h3>
          <p className="sm-sales-sub">
            A specialist reaches out to your leads and books the conversations. Each has their own
            rate, so your price changes with who you pick.
          </p>

          <div className="sm-people" role="radiogroup" aria-label="Sales specialist">
            {SALESPEOPLE.map((person) => {
              const selected = person.id === specialistId;
              return (
                <label
                  key={person.id}
                  className={selected ? 'sm-person sm-person-selected' : 'sm-person'}
                >
                  <input
                    type="radio"
                    name="sm-specialist"
                    className="sm-visually-hidden"
                    checked={selected}
                    onChange={() => setSpecialistId(person.id)}
                  />
                  <span className="sm-avatar" aria-hidden="true">
                    {initials(person.name)}
                  </span>
                  <span className="sm-person-main">
                    <strong>{person.name}</strong>
                    <span className="sm-person-city">{person.city}</span>
                    <span className="sm-rating">
                      <StarIcon />
                      <strong>{person.rating.toFixed(1)}</strong>
                      <span>{person.reviews} reviews</span>
                    </span>
                    <span className="sm-person-bio">{person.bio}</span>
                  </span>
                  <span className="sm-person-rate">
                    <strong>{usd.format(person.ratePerLead)}</strong>
                    <span>per lead</span>
                  </span>
                </label>
              );
            })}
          </div>

          <div className="sm-quote">
            <div className="sm-qty">
              <span>How many leads?</span>
              {LEAD_QUANTITIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="sm-chip"
                  aria-pressed={q === quantity}
                  onClick={() => setQuantity(q)}
                >
                  {q}
                </button>
              ))}
            </div>
            <p className="sm-quote-total" aria-live="polite">
              <strong>{usd.format(total)}</strong>
              <span>
                {quantity} leads at {usd.format(specialist.ratePerLead)} each, with {specialist.name}
              </span>
            </p>
          </div>
          <p className="sm-quote-note">
            Sample specialists and sample pricing, for illustration. Your real quote depends on what
            you need and the specialist you are matched with.
          </p>
        </div>
      )}

      <div className="sm-foot">
        <p>Everything above is sample data. Real searches are charged from your first search.</p>
        <button
          type="button"
          className="sm-btn sm-btn-primary"
          onClick={() =>
            onGetStarted({
              segment,
              query: title,
              city,
              ...(segment === 'customers'
                ? { salespersonId: specialist.id, quantity }
                : {}),
            })
          }
        >
          Get started
        </button>
      </div>
    </div>
  );
}
