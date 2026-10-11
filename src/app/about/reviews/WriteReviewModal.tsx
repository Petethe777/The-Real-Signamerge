import React, { useEffect, useMemo, useState } from "react";
import { Star, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { CATEGORIES, categoryLabel } from "./categories";

export interface BusinessLite {
  id: string;
  name: string;
  category: string;
  location: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  businesses: BusinessLite[];
  presetBusiness: BusinessLite | null;
  signedInEmail: string | null;
  onSubmitted: () => void;
  onOpenTerms: () => void;
}

const label = "block text-left text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1.5";
const field = "border border-gray-200 rounded-xl px-4 py-3 h-auto text-sm";

export function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`}>
          <Star className={`w-8 h-8 ${n <= value ? "fill-primary text-primary" : "text-gray-300"}`} />
        </button>
      ))}
    </div>
  );
}

export function WriteReviewModal({ isOpen, onClose, businesses, presetBusiness, signedInEmail, onSubmitted, onOpenTerms }: Props) {
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<BusinessLite | null>(null);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newLink, setNewLink] = useState("");

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [identity, setIdentity] = useState<"guest" | "signup">("guest");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [terms, setTerms] = useState(false);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<"" | "guest" | "member">("");

  useEffect(() => {
    if (isOpen) {
      setPicked(presetBusiness);
      setMode("existing");
      setDone("");
      setError("");
    }
  }, [isOpen, presetBusiness]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return businesses.filter((b) => b.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query, businesses]);

  if (!isOpen) return null;

  const toggleInterest = (id: string) =>
    setInterests((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "existing" && !picked) return setError("Choose the business you're reviewing, or add a new one.");
    if (mode === "new" && (newName.trim().length < 2 || !newCategory)) {
      return setError("Enter the business name and pick a category.");
    }
    if (!rating) return setError("Tap the stars to give a rating.");
    if (body.trim().length < 10) return setError("Please write at least a short sentence about your experience.");
    if (!displayName.trim()) return setError("Enter the name to show on your review.");
    const wantsAccount = !signedInEmail && identity === "signup";
    if (wantsAccount) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email address.");
      if (password.length < 6) return setError("Password must be at least 6 characters.");
    }
    if (!terms) return setError("You must tick the Terms box to continue.");

    setSaving(true);
    try {
      // 1) Account (optional)
      let userId: string | null = null;
      if (signedInEmail) {
        const { data } = await supabase.auth.getUser();
        userId = data.user?.id ?? null;
      } else if (wantsAccount) {
        const cleanEmail = email.trim().toLowerCase();
        const r = await fetch("/api/auth/custom-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, password }),
        });
        const d = await r.json().catch(() => ({}));
        const exists = !r.ok && /already exists/i.test(d.message || "");
        if (!r.ok && !exists) throw new Error(d.message || "Could not create your account.");
        const { data: si, error: siErr } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (siErr) {
          throw new Error(exists
            ? "An account with this email already exists. Enter its password, or post as a guest."
            : "Account created, but we couldn't log you in. Please try again.");
        }
        userId = si.user?.id ?? null;
      }

      // 2) Business (existing or newly created as Unverified)
      let businessId = picked?.id ?? "";
      if (mode === "new") {
        const { data: biz, error: bizErr } = await supabase
          .from("businesses")
          .insert({
            name: newName.trim(),
            category: newCategory,
            location: newLocation.trim() || null,
            link: newLink.trim() || null,
            verified: false,
            created_by: userId,
          })
          .select("id")
          .single();
        if (bizErr) {
          if (bizErr.code === "23505") throw new Error("That business is already listed. Search for it and review it there.");
          throw new Error("Could not add the business. Please try again.");
        }
        businessId = biz.id;
      }

      // 3) Review
      const { error: revErr } = await supabase.from("reviews").insert({
        business_id: businessId,
        rating,
        title: title.trim() || null,
        body: body.trim(),
        author_name: displayName.trim(),
        user_id: userId,
        is_guest: userId === null,
        terms_accepted: true,
      });
      if (revErr) throw new Error("Could not save your review. Please try again.");

      // 4) Interests for personalized recommendations (best effort)
      if (userId && wantsAccount && interests.length) {
        await supabase.from("reviewer_preferences").upsert({ user_id: userId, email: email.trim().toLowerCase(), categories: interests });
      }

      setDone(userId ? "member" : "guest");
      onSubmitted();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-start sm:items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-7 my-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" aria-label="Close">
          <X className="w-5 h-5" />
        </button>

        {done ? (
          <div className="text-center py-8 space-y-4">
            <h2 className="text-xl font-black text-[#111]">Thank you!</h2>
            <p className="text-gray-600">Your review is live.</p>
            {done === "member" && interests.length > 0 && (
              <p className="text-sm text-gray-500">We'll use your interests to show you recommendations on this page.</p>
            )}
            <Button onClick={onClose} className="rounded-xl bg-primary hover:bg-orange-700 text-white px-8 py-5 font-bold">Done</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <h2 className="text-xl font-black text-[#111]">Write a review</h2>

            {/* Business */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {(["existing", "new"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setMode(m)}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition-all ${mode === m ? "border-primary bg-orange-50 text-primary" : "border-gray-200 text-gray-600"}`}>
                    {m === "existing" ? "Find a business" : "Add a new business"}
                  </button>
                ))}
              </div>

              {mode === "existing" ? (
                picked ? (
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm">
                    <span className="font-bold text-[#111]">{picked.name}<span className="font-medium text-gray-400"> · {categoryLabel(picked.category)}</span></span>
                    <button type="button" onClick={() => { setPicked(null); setQuery(""); }} className="text-primary font-bold text-xs">Change</button>
                  </div>
                ) : (
                  <div>
                    <Input className={field} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by business name" />
                    {matches.length > 0 && (
                      <div className="mt-2 border border-gray-100 rounded-xl divide-y">
                        {matches.map((b) => (
                          <button key={b.id} type="button" onClick={() => setPicked(b)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50">
                            <span className="font-bold">{b.name}</span>
                            <span className="text-gray-400"> · {categoryLabel(b.category)}{b.location ? ` · ${b.location}` : ""}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {query.trim() && matches.length === 0 && (
                      <p className="text-xs text-gray-500 mt-2">No match. <button type="button" className="text-primary font-bold" onClick={() => { setMode("new"); setNewName(query); }}>Add it as a new business</button></p>
                    )}
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className={label}>Business name</label>
                    <Input className={field} value={newName} onChange={(e) => setNewName(e.target.value)} />
                  </div>
                  <div>
                    <label className={label}>Category</label>
                    <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className={`${field} w-full bg-white`}>
                      <option value="">Select a category</option>
                      {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={label}>City / area <span className="normal-case font-medium text-gray-400">(optional)</span></label>
                    <Input className={field} value={newLocation} onChange={(e) => setNewLocation(e.target.value)} />
                  </div>
                  <div>
                    <label className={label}>Website or social handle <span className="normal-case font-medium text-gray-400">(optional)</span></label>
                    <Input className={field} value={newLink} onChange={(e) => setNewLink(e.target.value)} placeholder="e.g. @handle or https://..." />
                  </div>
                  <p className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
                    <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    A business added by a reviewer is listed as <strong>Unverified</strong> until its owner claims it.
                  </p>
                </div>
              )}
            </div>

            {/* Review */}
            <div className="space-y-3">
              <div>
                <label className={label}>Your rating</label>
                <StarInput value={rating} onChange={setRating} />
              </div>
              <div>
                <label className={label}>Headline <span className="normal-case font-medium text-gray-400">(optional)</span></label>
                <Input className={field} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
              </div>
              <div>
                <label className={label}>Your review</label>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} rows={4}
                  placeholder="Share what happened. Stick to your own honest experience."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className={label}>Name to show</label>
                <Input className={field} value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={60} placeholder="First name or nickname" />
              </div>
            </div>

            {/* Identity */}
            {signedInEmail ? (
              <p className="text-xs text-gray-500">Posting as a member ({signedInEmail}).</p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setIdentity("guest")}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-bold ${identity === "guest" ? "border-primary bg-orange-50 text-primary" : "border-gray-200 text-gray-600"}`}>
                    Post as guest
                  </button>
                  <button type="button" onClick={() => setIdentity("signup")}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-bold ${identity === "signup" ? "border-primary bg-orange-50 text-primary" : "border-gray-200 text-gray-600"}`}>
                    Sign up for recommendations
                  </button>
                </div>
                {identity === "signup" && (
                  <div className="space-y-3">
                    <div>
                      <label className={label}>Email</label>
                      <Input type="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div>
                      <label className={label}>Create a password</label>
                      <Input type="password" className={field} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="At least 6 characters" />
                    </div>
                    <div>
                      <label className={label}>What do you want recommendations for?</label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((c) => (
                          <button key={c.id} type="button" onClick={() => toggleInterest(c.id)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-bold ${interests.includes(c.id) ? "border-primary bg-orange-50 text-primary" : "border-gray-200 text-gray-600"}`}>
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <label className="flex items-start gap-2 cursor-pointer text-xs text-gray-600">
              <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 h-4 w-4 accent-orange-600" />
              <span>
                I have read and agree to the{" "}
                <button type="button" onClick={onOpenTerms} className="text-primary font-bold underline">Terms</button>
                , and this review is my honest experience.
              </span>
            </label>

            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
            <Button type="submit" disabled={saving} className="w-full rounded-xl bg-primary hover:bg-orange-700 text-white py-6 font-bold">
              {saving ? "Posting…" : "Post review"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
