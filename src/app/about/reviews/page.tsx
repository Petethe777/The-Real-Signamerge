import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShieldAlert, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { TermsModal } from "@/components/TermsModal";
import { supabase } from "@/lib/supabase";
import { COUNTRIES, INTERESTS, PLATFORMS } from "./categories";
import { WriteReviewModal, type AccountLite } from "./WriteReviewModal";

interface Account extends AccountLite {
  link: string | null;
  interests: string[];
  verified: boolean;
  created_at: string;
  reviews: { rating: number }[];
}
interface FeedAccount extends AccountLite {
  link: string | null;
  interests: string[];
  verified: boolean;
}
interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  author_name: string;
  is_guest: boolean;
  created_at: string;
  business_id: string;
  businesses: FeedAccount | null;
}

const avg = (a: Account) => (a.reviews.length ? a.reviews.reduce((s, r) => s + r.rating, 0) / a.reviews.length : 0);
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
const where = (a: { platform: string; country: string; location: string | null }) =>
  [a.platform, a.country, a.location].filter(Boolean).join(" · ");
const plural = (n: number) => `${n} ${n === 1 ? "review" : "reviews"}`;

function UnverifiedBadge() {
  return (
    <span title="Added by a user and not yet verified by the account owner"
      className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 rounded-full px-2 py-0.5">
      <ShieldAlert className="w-3 h-3" /> Unverified
    </span>
  );
}

function ReviewCard({ r, onOpenAccount }: { r: Review; onOpenAccount: (id: string) => void; key?: string }) {
  const a = r.businesses;
  return (
    <article className="rounded-2xl border border-gray-100 p-6 bg-white">
      <div className="flex items-start gap-3">
        <span className="shrink-0 rounded-md bg-[#111] text-white text-sm font-black px-2.5 py-1">{r.rating}/5</span>
        {r.title && <h3 className="text-lg font-black text-[#111] leading-snug">{r.title}</h3>}
      </div>
      <p className="text-base text-gray-700 leading-relaxed mt-3 whitespace-pre-line">{r.body}</p>
      <p className="text-xs text-gray-400 mt-3">
        {r.author_name}{r.is_guest ? " · Guest" : ""} · {fmtDate(r.created_at)}
      </p>
      {a && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
          <span>About</span>
          <button onClick={() => onOpenAccount(a.id)} className="font-bold text-gray-700 hover:text-primary">{a.name}</button>
          {!a.verified && <UnverifiedBadge />}
          <span className="text-gray-400">· {where(a)}</span>
          {a.interests.length > 0 && <span className="text-gray-400">· {a.interests.join(", ")}</span>}
        </div>
      )}
    </article>
  );
}

const selectCls = "border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-700";

export default function ReviewDirectoryPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [feed, setFeed] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [platform, setPlatform] = useState("all");
  const [country, setCountry] = useState("all");
  const [interest, setInterest] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Account | null>(null);
  const [selectedReviews, setSelectedReviews] = useState<Review[]>([]);
  const [writeOpen, setWriteOpen] = useState(false);
  const [preset, setPreset] = useState<AccountLite | null>(null);
  const [termsOpen, setTermsOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [myInterests, setMyInterests] = useState<string[]>([]);

  useEffect(() => {
    document.title = "Social Media Account Reviews | Signalmerge";
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "description");
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", "Read honest reviews of social media accounts and creators, and share your own experience.");
  }, []);

  const load = useCallback(async () => {
    const [feedRes, acctRes] = await Promise.all([
      supabase
        .from("reviews")
        .select("id,rating,title,body,author_name,is_guest,created_at,business_id,businesses(id,name,platform,country,location,link,interests,verified)")
        .order("created_at", { ascending: false })
        .limit(150),
      supabase
        .from("businesses")
        .select("id,name,platform,country,location,link,interests,verified,created_at,reviews(rating)")
        .order("created_at", { ascending: false })
        .limit(300),
    ]);
    if (feedRes.error || acctRes.error) setLoadError("Couldn't load reviews right now.");
    else {
      setLoadError("");
      setFeed((feedRes.data as unknown as Review[]) ?? []);
      setAccounts((acctRes.data as unknown as Account[]) ?? []);
    }
    setLoading(false);
  }, []);

  const loadUser = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    setEmail(user?.email ?? null);
    if (user) {
      const { data: prefs } = await supabase.from("reviewer_preferences").select("categories").eq("user_id", user.id).maybeSingle();
      setMyInterests(prefs?.categories ?? []);
    } else setMyInterests([]);
  }, []);

  useEffect(() => { load(); loadUser(); }, [load, loadUser]);

  const openAccount = async (id: string) => {
    const a = accounts.find((x) => x.id === id);
    if (!a) return;
    setSelected(a);
    setSelectedReviews([]);
    const { data } = await supabase
      .from("reviews")
      .select("id,rating,title,body,author_name,is_guest,created_at,business_id")
      .eq("business_id", id)
      .order("created_at", { ascending: false })
      .limit(50);
    setSelectedReviews(((data as unknown as Review[]) ?? []).map((r) => ({ ...r, businesses: null })));
  };

  const startReview = (a: AccountLite | null) => { setPreset(a); setWriteOpen(true); };

  const afterSubmit = async () => {
    await Promise.all([load(), loadUser()]);
    if (selected) openAccount(selected.id);
  };

  const q = query.trim().toLowerCase();
  const matchesFilters = (a: { platform: string; country: string; interests: string[] }) =>
    (platform === "all" || a.platform === platform) &&
    (country === "all" || a.country === country) &&
    (interest === "all" || a.interests.includes(interest));

  const visibleReviews = useMemo(
    () => feed.filter((r) => {
      const a = r.businesses;
      if (!a || !matchesFilters(a)) return false;
      if (!q) return true;
      return (
        r.body.toLowerCase().includes(q) ||
        (r.title ?? "").toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        (a.location ?? "").toLowerCase().includes(q)
      );
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [feed, platform, country, interest, q],
  );

  const forYou = useMemo(
    () => feed.filter((r) => r.businesses?.interests.some((i) => myInterests.includes(i))).slice(0, 3),
    [feed, myInterests],
  );

  const visibleAccounts = useMemo(
    () => accounts
      .filter((a) => matchesFilters(a) && (!q || a.name.toLowerCase().includes(q) || (a.location ?? "").toLowerCase().includes(q)))
      .sort((a, b) => b.reviews.length - a.reviews.length)
      .slice(0, 10),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accounts, platform, country, interest, q],
  );

  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-4 sm:px-12 py-5 sm:py-8 max-w-7xl mx-auto">
        <Link to="/"><Logo /></Link>
        <Button onClick={() => startReview(null)} className="rounded-xl bg-primary hover:bg-orange-700 text-white font-bold gap-1.5">
          <Plus className="w-4 h-4" /> Write a review
        </Button>
      </nav>

      <header className="max-w-3xl mx-auto px-4 sm:px-12 pt-6 pb-8 text-center">
        <h1 className="text-3xl sm:text-5xl font-black text-[#111] tracking-tight">What people say about social media accounts</h1>
        <p className="text-gray-500 mt-4">Read real experiences before you follow, buy or collaborate. Share yours. No account needed.</p>
        <div className="relative mt-7">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search reviews"
            className="pl-12 border-2 border-orange-100 rounded-2xl h-auto py-4 text-base focus-visible:ring-0 focus-visible:border-primary" />
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={selectCls} aria-label="Platform">
            <option value="all">All platforms</option>
            {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className={selectCls} aria-label="Country">
            <option value="all">All countries</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={interest} onChange={(e) => setInterest(e.target.value)} className={selectCls} aria-label="Interest">
            <option value="all">All interests</option>
            {INTERESTS.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-12 pb-24">
        {forYou.length > 0 && (
          <section className="mb-10">
            <h2 className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-3">Reviews matching your interests</h2>
            <div className="space-y-4">{forYou.map((r) => <ReviewCard key={r.id} r={r} onOpenAccount={openAccount} />)}</div>
          </section>
        )}

        <h2 className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-3">Latest reviews</h2>
        {loading ? (
          <p className="text-center text-gray-400 py-16">Loading…</p>
        ) : loadError ? (
          <p className="text-center text-red-600 py-16">{loadError}</p>
        ) : visibleReviews.length === 0 ? (
          <div className="text-center py-14 border border-dashed border-gray-200 rounded-3xl">
            <p className="text-gray-500 mb-4">{feed.length === 0 ? "No reviews yet. Be the first to write one." : "No reviews match those filters."}</p>
            <Button onClick={() => startReview(null)} className="rounded-xl bg-primary hover:bg-orange-700 text-white font-bold">Write a review</Button>
          </div>
        ) : (
          <div className="space-y-4">{visibleReviews.map((r) => <ReviewCard key={r.id} r={r} onOpenAccount={openAccount} />)}</div>
        )}

        {visibleAccounts.length > 0 && (
          <section className="mt-14">
            <h2 className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-3">Browse accounts</h2>
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl">
              {visibleAccounts.map((a) => (
                <button key={a.id} onClick={() => openAccount(a.id)} className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50">
                  <span className="text-sm text-gray-700">
                    <span className="font-bold">{a.name}</span>
                    <span className="text-gray-400"> · {where(a)}</span>
                  </span>
                  <span className="text-xs text-gray-500 shrink-0">
                    {a.reviews.length ? `${avg(a).toFixed(1)}/5 · ${plural(a.reviews.length)}` : "No reviews"}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      {selected && (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-start sm:items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-6 sm:p-7 my-auto relative">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" aria-label="Close"><X className="w-5 h-5" /></button>
            <p className="text-xs text-gray-400">Reviews of</p>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black text-[#111]">{selected.name}</h2>
              {!selected.verified && <UnverifiedBadge />}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {where(selected)}{selected.interests.length > 0 ? ` · ${selected.interests.join(", ")}` : ""}
            </p>
            {selected.link && <p className="text-xs text-gray-400 mt-0.5 break-all">{selected.link}</p>}
            <p className="text-sm text-gray-600 mt-3">
              {selected.reviews.length ? `${avg(selected).toFixed(1)} out of 5 from ${plural(selected.reviews.length)}` : "No reviews yet"}
            </p>
            <Button onClick={() => startReview(selected)} className="mt-4 rounded-xl bg-primary hover:bg-orange-700 text-white font-bold">Write a review</Button>

            <div className="mt-6 space-y-4 max-h-[55vh] overflow-y-auto">
              {selectedReviews.map((r) => (
                <div key={r.id} className="border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[#111] text-white text-xs font-black px-2 py-0.5">{r.rating}/5</span>
                    <span className="text-xs text-gray-400">{fmtDate(r.created_at)}</span>
                  </div>
                  {r.title && <p className="font-bold text-[#111] mt-2">{r.title}</p>}
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{r.body}</p>
                  <p className="text-xs text-gray-400 mt-2">{r.author_name}{r.is_guest ? " · Guest" : ""}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <WriteReviewModal
        isOpen={writeOpen}
        onClose={() => setWriteOpen(false)}
        accounts={accounts}
        presetAccount={preset}
        signedInEmail={email}
        onSubmitted={afterSubmit}
        onOpenTerms={() => setTermsOpen(true)}
      />
      <Footer onTermsClick={() => setTermsOpen(true)} />
      <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
    </div>
  );
}
