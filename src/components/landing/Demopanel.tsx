import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEMO_EXAMPLES,
  type BusinessResult,
  type Intent,
  type LeadResult,
  type Segment,
} from './demoData';

export interface DemoRequest {
  /** Example to load. If omitted, the current example is replayed. */
  exampleId?: string;
  /** Change this number to trigger a new run, even for the same example. */
  nonce: number;
}

export interface GetStartedContext {
  segment: Segment;
  query: string;
}

interface DemoPanelProps {
  request: DemoRequest | null;
  onGetStarted: (ctx: GetStartedContext) => void;
}

const SEGMENTS: { id: Segment; label: string }[] = [
  { id: 'customers', label: 'Find customers' },
  { id: 'businesses', label: 'Find local businesses' },
];

const INTENT_KEY: Record<Intent, string> = {
  'Ready to buy': 'ready',
  'Comparing options': 'comparing',
  'Asking around': 'asking',
};

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
          082 000 0000
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
  const [exampleId, setExampleId] = useState(DEMO_EXAMPLES[0].id);
  const [running, setRunning] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const currentId = useRef(exampleId);
  currentId.current = exampleId;

  const example = DEMO_EXAMPLES.find((e) => e.id === exampleId) ?? DEMO_EXAMPLES[0];
  const segment = example.segment;
  const examples = DEMO_EXAMPLES.filter((e) => e.segment === segment);

  const run = useCallback((id: string) => {
    window.clearTimeout(timer.current);
    setExampleId(id);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setRunning(false);
      return;
    }
    setRunning(true);
    timer.current = window.setTimeout(() => setRunning(false), 900);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (request) run(request.exampleId ?? currentId.current);
  }, [request, run]);

  const chooseSegment = (next: Segment) => {
    if (next === segment) return;
    const first = DEMO_EXAMPLES.find((e) => e.segment === next);
    if (first) run(first.id);
  };

  return (
    <div className="sm-panel">
      <div className="sm-bar">
        <p className="sm-query">
          <span className="sm-visually-hidden">Demo search: </span>
          {example.query}
        </p>
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
          <button
            type="button"
            className="sm-run"
            aria-label="Run this demo search again"
            onClick={() => run(exampleId)}
          >
            <ArrowUpIcon />
          </button>
        </div>
      </div>

      <div className="sm-body">
        <div className="sm-side">
          <p className="sm-side-label">Pick an example</p>
          <div className="sm-examples">
            {examples.map((ex) => (
              <button
                key={ex.id}
                type="button"
                className="sm-example"
                aria-pressed={ex.id === exampleId}
                onClick={() => run(ex.id)}
              >
                {ex.label}
              </button>
            ))}
          </div>
          <p className="sm-side-hint">
            This is a demo, so searches are pre-selected. Sign up to search for anything.
          </p>
        </div>

        <div className="sm-main">
          <p className="sm-main-label">Sample results</p>
          <div className="sm-visually-hidden" aria-live="polite">
            {running
              ? 'Searching'
              : `Showing ${example.results.length} sample results for ${example.query}`}
          </div>
          <ol className="sm-results" aria-busy={running}>
            {running
              ? [0, 1, 2].map((i) => <SkeletonCard key={i} />)
              : example.results.map((result) =>
                  result.kind === 'lead' ? (
                    <LeadCard key={result.id} lead={result} />
                  ) : (
                    <BusinessCard key={result.id} business={result} />
                  ),
                )}
          </ol>
        </div>
      </div>

      <div className="sm-foot">
        <p>Sample results for illustration. Real searches are charged from your first search.</p>
        <button
          type="button"
          className="sm-btn sm-btn-primary"
          onClick={() => onGetStarted({ segment, query: example.query })}
        >
          Get started
        </button>
      </div>
    </div>
  );
}
