import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Star, Search, Utensils, ShoppingBag, Wrench, Sparkles, Car, Briefcase, Dumbbell, Megaphone, ShieldAlert, X, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { TermsModal } from "@/components/TermsModal";
import { supabase } from "@/lib/supabase";
import { CATEGORIES, categoryLabel } from "./categories";
import { WriteReviewModal, type BusinessLite } from "./WriteReviewModal";

const ICONS: Record<string, any> = {
  "digital-creators": Megaphone,
  "restaurants-food": Utensils,
  "online-stores": ShoppingBag,
  "home-services": Wrench,
  "beauty-personal-care": Sparkles,
  automotive: Car,
  "professional-services": Briefcase,
  "health-fitness": Dumbbell,
};

interface Business extends BusinessLite {
  link: string | null;
  description: string | null;
  verified: boolean;
  created_at: string;
  reviews: { rating: number }[];
}
interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  author_name: string;
  is_guest: boolean;
  created_at: string;
}

const avg = (b: Business) => (b.reviews.length ? b.reviews.reduce((s, r) => s + r.rating, 0) / b.reviews.length : 0);
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

function Stars({ value, size = "w-4 h-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`${size} ${n <= Math.round(value) ? "fill-primary text-primary" : "text-gray-300"}`} />
      ))}
    </span>
  );
}

function UnverifiedBadge() {
  return (
    <span title="Added by a user and not yet verified by the business owner"
      className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 rounded-full px-2.5 py-1">
      <ShieldAlert className="w-3 h-3" /> Unverified
    </span>
  );
}

function BusinessCard({ b, onOpen }: { b: Business; onOpen: () => void; key?: string }) {
  const Icon = ICONS[b.category] ?? Briefcase;
  return (
    <button onClick={onOpen} className="text-left rounded-2xl border border-gray-100 p-5 bg-white hover:border-primary/40 hover:shadow-md transition-all">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-primary">
          <Icon className="w-3.5 h-3.5" /> {categoryLabel(b.category)}
        </span>
        {!b.verified && <UnverifiedBadge />}
      </div>
      <h3 className="text-lg font-black text-[#111] leading-snug">{b.name}</h3>
      {b.location && <p className="text-xs text-gray-400 mt-0.5">{b.location}</p>}
      <div className="flex items-center gap-2 mt-3 text-sm">
        {b.reviews.length ? (
          <>
            <Stars value={avg(b)} />
            <span className="font-bold text-[#111]">{avg(b).toFixed(1)}</span>
            <span className="text-gray-400">({b.reviews.length})</span>
          </>
        ) : (
          <span className="text-gray-400">No reviews yet</span>
        )}
      </div>
    </button>
  );
}

export default function ReviewDirectoryPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Business | null>(null);
  const [selectedReviews, setSelectedReviews] = useState<Review[]>([]);
  const [writeOpen, setWriteOpen] = useState(false);
  const [preset, setPreset] = useState<BusinessLite | null>(null);
  const [termsOpen, setTermsOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);

  useEffect(() => {
    document.title = "Local Business Reviews | Signalmerge";
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "description");
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", "Read and write honest reviews of restaurants, online stores, home services, beauty, automotive, professional services, health and fitness, and digital creators.");
  }, []);

  const loadBusinesses = useCallback(async () => {
    const { data, error } = await supabase
      .from("businesses")
      .select("id,name,category,location,link,description,verified,created_at,reviews(rating)")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) setLoadError("Couldn't load businesses right now.");
    else { setLoadError(""); setBusinesses((data as unknown as Business[]) ?? []); }
    setLoading(false);
  }, []);

  const loadUser = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    setEmail(user?.email ?? null);
    if (user) {
      const { data: prefs } = await supabase.from("reviewer_preferences").select("categories").eq("user_id", user.id).maybeSingle();
      setInterests(prefs?.categories ?? []);
    } else setInterests([]);
  }, []);

  useEffect(() => { loadBusinesses(); loadUser(); }, [loadBusinesses, loadUser]);

  const openBusiness = async (b: Business) => {
    setSelected(b);
    setSelectedReviews([]);
    const { data } = await supabase
      .from("reviews")
      .select("id,rating,title,body,author_name,is_guest,created_at")
      .eq("business_id", b.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setSelectedReviews((data as Review[]) ?? []);
  };

  const startReview = (b: BusinessLite | null) => { setPreset(b); setWriteOpen(true); };

  const afterSubmit = async () => {
    await Promise.all([loadBusinesses(), loadUser()]);
    if (selected) openBusiness(selected);
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return businesses.filter((b) =>
      (category === "all" || b.category === category) &&
      (!q || b.name.toLowerCase().includes(q) || (b.location ?? "").toLowerCase().includes(q)));
  }, [businesses, category, query]);

  const recommended = useMemo(
    () => businesses.filter((b) => interests.includes(b.category) && b.reviews.length > 0)
      .sort((a, b) => avg(b) - avg(a)).slice(0, 3),
    [businesses, interests],
  );

  const countFor = (id: string) => businesses.filter((b) => b.category === id).length;

  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-4 sm:px-12 py-5 sm:py-8 max-w-7xl mx-auto">
        <Link to="/"><Logo /></Link>
        <Button onClick={() => startReview(null)} className="rounded-xl bg-primary hover:bg-orange-700 text-white font-bold gap-1.5">
          <Plus className="w-4 h-4" /> Write a review
        </Button>
      </nav>

      <header className="max-w-3xl mx-auto px-4 sm:px-12 pt-6 pb-8 text-center">
        <h1 className="text-3xl sm:text-5xl font-black text-[#111] tracking-tight">Local business reviews</h1>
        <p className="text-gray-500 mt-4">See what real people are saying, and share your own experience. No account needed.</p>
        <div className="relative mt-7">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a business or place"
            className="pl-12 border-2 border-orange-100 rounded-2xl h-auto py-4 text-base focus-visible:ring-0 focus-visible:border-primary" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-12 pb-24">
        {/* Featured: creators */}
        <button onClick={() => setCategory("digital-creators")}
          className="w-full text-left rounded-3xl bg-[#0A0A0A] text-white p-6 sm:p-8 mb-6 flex items-center gap-5 hover:bg-[#161616] transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0"><Megaphone className="w-6 h-6" /></div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Featured category</p>
            <h2 className="text-xl sm:text-2xl font-black">Digital creators &amp; influencers</h2>
            <p className="text-sm text-gray-400 mt-1">Is that creator worth following, or that influencer worth working with? Read what people say.</p>
          </div>
        </button>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setCategory("all")}
            className={`rounded-full px-4 py-2 text-sm font-bold ${category === "all" ? "bg-[#111] text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}>
            All ({businesses.length})
          </button>
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setCategory(c.id)}
              className={`rounded-full px-4 py-2 text-sm font-bold ${category === c.id ? "bg-[#111] text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}>
              {c.label} ({countFor(c.id)})
            </button>
          ))}
        </div>

        {recommended.length > 0 && (
          <section className="mb-10">
            <h2 className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-3">Recommended for you</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {recommended.map((b) => <BusinessCard key={b.id} b={b} onOpen={() => openBusiness(b)} />)}
            </div>
          </section>
        )}

        {loading ? (
          <p className="text-center text-gray-400 py-16">Loading…</p>
        ) : loadError ? (
          <p className="text-center text-red-600 py-16">{loadError}</p>
        ) : visible.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-3xl">
            <p className="text-gray-500 mb-4">{businesses.length === 0 ? "No businesses yet. Be the first to add one." : "Nothing matches that yet."}</p>
            <Button onClick={() => startReview(null)} className="rounded-xl bg-primary hover:bg-orange-700 text-white font-bold">Add a business &amp; review it</Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map((b) => <BusinessCard key={b.id} b={b} onOpen={() => openBusiness(b)} />)}
          </div>
        )}
      </main>

      {/* Business detail */}
      {selected && (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-start sm:items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-6 sm:p-7 my-auto relative">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" aria-label="Close"><X className="w-5 h-5" /></button>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-primary">{categoryLabel(selected.category)}</span>
              {!selected.verified && <UnverifiedBadge />}
            </div>
            <h2 className="text-2xl font-black text-[#111]">{selected.name}</h2>
            {selected.location && <p className="text-sm text-gray-400">{selected.location}</p>}
            {selected.link && <p className="text-sm text-gray-500 mt-1 break-all">{selected.link}</p>}
            <div className="flex items-center gap-2 mt-3 text-sm">
              {selected.reviews.length ? (<><Stars value={avg(selected)} /><span className="font-bold">{avg(selected).toFixed(1)}</span><span className="text-gray-400">({selected.reviews.length} reviews)</span></>) : <span className="text-gray-400">No reviews yet</span>}
            </div>
            <Button onClick={() => startReview(selected)} className="mt-5 rounded-xl bg-primary hover:bg-orange-700 text-white font-bold">Write a review</Button>

            <div className="mt-6 space-y-4 max-h-[50vh] overflow-y-auto">
              {selectedReviews.map((r) => (
                <div key={r.id} className="border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2"><Stars value={r.rating} /><span className="text-xs text-gray-400">{fmtDate(r.created_at)}</span></div>
                  {r.title && <p className="font-bold text-[#111] mt-1">{r.title}</p>}
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{r.body}</p>
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
        businesses={businesses}
        presetBusiness={preset}
        signedInEmail={email}
        onSubmitted={afterSubmit}
        onOpenTerms={() => setTermsOpen(true)}
      />
      <Footer onTermsClick={() => setTermsOpen(true)} />
      <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
    </div>
  );
}
