import React, { useState } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

export const SIGNUP_KEY = "signalmerge_signed_up";

interface Props {
  isOpen: boolean;
  firstSearch: string;
  onComplete: () => void;
  onOpenTerms: () => void;
}

/** Non-dismissable signup popup: no close button, no backdrop/Escape close. */
export function SignupGateModal({ isOpen, firstSearch, onComplete, onOpenTerms }: Props) {
  const [step, setStep] = useState<"form" | "done">("form");
  const [customerType, setCustomerType] = useState("");
  const [location, setLocation] = useState("");
  const [offeringType, setOfferingType] = useState<"product" | "service" | "">("");
  const [industry, setIndustry] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!customerType.trim() || !location.trim() || !offeringType || !industry || !email.trim() || !password) {
      return setError("Please complete every field.");
    }
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (!terms) return setError("You must tick the Terms box to continue.");
    setSaving(true);
    try {
      const cleanEmail = email.trim().toLowerCase();

      // 1) Create the real Signalmerge account (Supabase Auth + profile row)
      const r = await fetch("/api/auth/custom-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const data = await r.json().catch(() => ({}));
      const alreadyExists = !r.ok && /already exists/i.test(data.message || "");
      if (!r.ok && !alreadyExists) throw new Error(data.message || "Could not create your account.");

      // 2) Log them in so they are a signed-in Signalmerge user
      const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (alreadyExists && signInError) {
        throw new Error("An account with this email already exists. Enter your existing password to continue.");
      }
      const userId = signIn?.user?.id ?? null;

      // 3) Save their answers + Terms acceptance
      const { error: dbError } = await supabase.from("lead_signups").insert({
        user_id: userId,
        email: cleanEmail,
        customer_type: customerType.trim(),
        location: location.trim(),
        offering_type: offeringType,
        industry,
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        pricing_acknowledged: true,
        weekly_email_opt_in: true,
        first_search: firstSearch.trim() || null,
      });
      if (dbError) throw new Error("Could not save your details. Please try again.");

      // 4) Copy location onto their profile (best effort)
      if (userId) {
        await supabase.from("profiles").update({ location: location.trim() }).eq("id", userId);
      }
      try { localStorage.setItem(SIGNUP_KEY, "1"); } catch {}
      setStep("done");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const label = "block text-left text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1.5";
  const field = "border border-gray-200 rounded-xl px-4 py-3 h-auto text-sm";

  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 my-auto">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="text-white w-5 h-5 fill-white" />
          </div>
          <span className="text-lg font-bold text-[#111]">Signalmerge</span>
        </div>

        {step === "form" ? (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-[#111]">Sign up to see your customers</h2>
              <p className="text-sm text-gray-500 mt-1">Tell us who you're looking for and we'll email them to you weekly.</p>
            </div>
            <div>
              <label className={label}>Type of customer you're looking for</label>
              <Input className={field} value={customerType} onChange={(e) => setCustomerType(e.target.value)} placeholder="e.g. restaurant owners needing a website" />
            </div>
            <div>
              <label className={label}>Where are you from?</label>
              <Input className={field} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City / country" />
            </div>
            <div>
              <label className={label}>What industry are you in?</label>
              <div className="grid grid-cols-1 gap-2">
                {(["Digital Marketing", "Web/Software Development", "Ecommerce"] as const).map((ind) => (
                  <button
                    key={ind} type="button" onClick={() => setIndustry(ind)}
                    className={`rounded-xl border px-4 py-3 text-sm font-bold text-left transition-all ${
                      industry === ind ? "border-primary bg-orange-50 text-primary" : "border-gray-200 text-gray-600"
                    }`}
                  >{ind}</button>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Signalmerge currently only serves these industries.</p>
            </div>
            <div>
              <label className={label}>Are you selling a…</label>
              <div className="grid grid-cols-2 gap-2">
                {(["product", "service"] as const).map((o) => (
                  <button
                    key={o} type="button" onClick={() => setOfferingType(o)}
                    className={`rounded-xl border px-4 py-3 text-sm font-bold capitalize transition-all ${
                      offeringType === o ? "border-primary bg-orange-50 text-primary" : "border-gray-200 text-gray-600"
                    }`}
                  >{o}</button>
                ))}
              </div>
            </div>
            <div>
              <label className={label}>Email</label>
              <Input type="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
            </div>
            <div>
              <label className={label}>Create a password</label>
              <Input type="password" className={field} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" />
            </div>

            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-xs text-gray-600 text-left">
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 h-4 w-4 accent-orange-600" />
                <span>
                  I have read and agree to the{" "}
                  <button type="button" onClick={onOpenTerms} className="text-primary font-bold underline">Terms</button>
                </span>
              </label>
            </div>

            {error && <p className="text-sm text-red-600 font-medium text-left">{error}</p>}
            <Button type="submit" disabled={saving} className="w-full rounded-xl bg-primary hover:bg-orange-700 text-white py-6 font-bold">
              {saving ? "Signing you up…" : "Sign up"}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-5 py-4">
            <h2 className="text-xl font-black text-[#111]">You're in!</h2>
            <p className="text-base text-gray-700 leading-relaxed">
              You'll get a list of people looking for your {offeringType} via email every Monday.
            </p>
            <Button onClick={onComplete} className="w-full rounded-xl bg-primary hover:bg-orange-700 text-white py-6 font-bold">
              Continue to search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
