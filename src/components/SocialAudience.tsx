import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Youtube, Lock, Loader2, CheckCircle2, Clock, Zap, Search, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SocialAudienceProps {
  profile: any;
}

interface SocialConfig {
  channel_url?: string;
  what_you_sell?: string;
  ideal_customer?: string;
  notes?: string;
}

/**
 * Social Audience Intelligence — YouTube (first provider).
 *
 * Setup is available to EVERY registered user. Only the prospect results are gated
 * behind the $299 plan (profiles.has_social_plan), and that gating is enforced
 * server-side in /api/social/prospects — this component only reflects it.
 *
 * Deliberately honest about scope: this surfaces people who ENGAGE with the user's own
 * content. YouTube's API does not expose follower lists, what a viewer liked elsewhere,
 * or private viewing behaviour, so nothing here claims otherwise.
 */
export default function SocialAudience({ profile }: SocialAudienceProps) {
  const email = profile?.email || "";

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [hasSocialPlan, setHasSocialPlan] = useState(false);
  const [setupStatus, setSetupStatus] = useState<string>("not_started");
  const [prospectCount, setProspectCount] = useState(0);
  const [prospects, setProspects] = useState<any[]>([]);

  const [channelUrl, setChannelUrl] = useState("");
  const [whatYouSell, setWhatYouSell] = useState("");
  const [idealCustomer, setIdealCustomer] = useState("");
  const [notes, setNotes] = useState("");

  const loadData = async () => {
    if (!email) {
      setIsLoading(false);
      return;
    }
    try {
      const [cfgRes, prosRes] = await Promise.all([
        fetch(`/api/social/config?email=${encodeURIComponent(email)}`),
        fetch(`/api/social/prospects?email=${encodeURIComponent(email)}`),
      ]);
      const cfg = await cfgRes.json();
      const pros = await prosRes.json();

      if (cfg && !cfg.error) {
        setHasSocialPlan(!!cfg.hasSocialPlan);
        setSetupStatus(cfg.setupStatus || "not_started");
        const c: SocialConfig = cfg.config || {};
        setChannelUrl(c.channel_url || "");
        setWhatYouSell(c.what_you_sell || "");
        setIdealCustomer(c.ideal_customer || "");
        setNotes(c.notes || "");
      }
      if (pros && !pros.error) {
        setProspectCount(pros.prospectCount ?? 0);
        setProspects(pros.locked ? [] : (pros.prospects || []));
        if (pros.setupStatus) setSetupStatus(pros.setupStatus);
      }
    } catch {
      setError("Couldn't load your Social Audience setup. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (!channelUrl.trim()) return setError("Please add your YouTube channel URL.");
    if (!whatYouSell.trim()) return setError("Please describe what you sell.");

    setIsSaving(true);
    try {
      const res = await fetch("/api/social/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, channelUrl, whatYouSell, idealCustomer, notes }),
      });
      const data = await res.json();
      if (data?.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      } else {
        setError(data?.error || "Couldn't save your setup. Please try again.");
      }
    } catch {
      setError("Couldn't save your setup. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const isConfigured = !!(channelUrl && whatYouSell);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading Social Audience</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-[2rem] shadow-xl shadow-orange-500/5 p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
            <Youtube className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h2 className="text-xl font-black text-[#111] tracking-tight">Social Audience Intelligence</h2>
              {hasSocialPlan ? (
                <span className="bg-green-50 text-green-700 border border-green-200 font-black px-3 py-1 rounded-full text-[9px] uppercase tracking-widest">
                  Active
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-500 border border-gray-200 font-black px-3 py-1 rounded-full text-[9px] uppercase tracking-widest">
                  Setup Open · Results Locked
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              Finds people already engaging with your own YouTube content whose comments suggest a real
              need for what you sell — not just your biggest fans. Each prospect comes with the comment,
              the video, and why they're worth contacting.
            </p>
          </div>
        </div>
      </div>

      {/* Setup form — open to everyone */}
      <div className="bg-white border border-gray-100 rounded-[2rem] shadow-xl shadow-orange-500/5 p-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-6 h-6 rounded-lg bg-primary text-white text-[10px] font-black flex items-center justify-center">1</span>
          <h3 className="text-sm font-black uppercase tracking-wider text-[#111]">Configure Your Audience Scan</h3>
        </div>
        <p className="text-xs text-gray-400 font-medium mb-6 ml-8">
          Available to every account — no purchase needed to set this up.
        </p>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 ml-1">
              Your YouTube Channel URL
            </label>
            <div className="relative">
              <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                type="text"
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
                placeholder="https://youtube.com/@yourchannel"
                className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50 focus:border-primary transition-all font-bold placeholder:font-medium placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 ml-1">
              What do you sell?
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                type="text"
                value={whatYouSell}
                onChange={(e) => setWhatYouSell(e.target.value)}
                placeholder="e.g. AI automation services for small businesses"
                className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50 focus:border-primary transition-all font-bold placeholder:font-medium placeholder:text-gray-400"
              />
            </div>
            <p className="text-[10px] text-gray-400 font-medium ml-1">
              This is what each commenter gets scored against — be specific.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 ml-1">
              Who is your ideal customer? <span className="text-gray-300">(optional)</span>
            </label>
            <Input
              type="text"
              value={idealCustomer}
              onChange={(e) => setIdealCustomer(e.target.value)}
              placeholder="e.g. agency owners drowning in manual reporting"
              className="h-14 px-4 rounded-2xl border-gray-100 bg-gray-50 focus:border-primary transition-all font-bold placeholder:font-medium placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 ml-1">
              Anything else we should know? <span className="text-gray-300">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Specific problems your product solves, phrases your buyers use, videos to prioritise..."
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-100 bg-gray-50 focus:border-primary focus:outline-none transition-all text-sm font-bold placeholder:font-medium placeholder:text-gray-400 resize-none leading-snug"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
              <p className="text-xs font-bold text-red-600">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={isSaving}
              className="h-12 px-6 rounded-2xl bg-primary hover:bg-orange-650 text-white text-xs font-black uppercase tracking-wider gap-2 shadow-lg shadow-orange-500/10"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Save Setup <Zap className="w-3.5 h-3.5 fill-white" /></>}
            </Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-xs font-black text-green-600 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> Saved
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Results — gated */}
      <div className="bg-white border border-gray-100 rounded-[2rem] shadow-xl shadow-orange-500/5 p-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-6 h-6 rounded-lg bg-primary text-white text-[10px] font-black flex items-center justify-center">2</span>
          <h3 className="text-sm font-black uppercase tracking-wider text-[#111]">Your Prospects</h3>
        </div>

        {/* Paid + setup complete → real results */}
        {hasSocialPlan && setupStatus === "complete" && prospects.length > 0 && (
          <div className="space-y-4">
            {prospects.map((p) => (
              <div key={p.id} className="border border-gray-100 rounded-2xl p-5 hover:border-primary/30 transition-colors">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-black text-[#111] text-sm">{p.display_name || "YouTube viewer"}</span>
                  {typeof p.intent_score === "number" && (
                    <span className="bg-orange-50 text-primary border border-orange-100 font-black px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-widest">
                      Intent {Math.round(p.intent_score)}%
                    </span>
                  )}
                </div>
                {p.evidence?.comment && (
                  <p className="text-sm text-gray-600 font-medium italic leading-relaxed mb-3">"{p.evidence.comment}"</p>
                )}
                {p.reasoning && (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-3">
                    <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-1">Why they're a prospect</p>
                    <p className="text-xs font-bold text-gray-700 leading-relaxed">{p.reasoning}</p>
                  </div>
                )}
                {p.outreach_angle && (
                  <div className="bg-orange-50/40 border border-orange-100 rounded-xl px-4 py-3 mb-3">
                    <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-1">Suggested outreach angle</p>
                    <p className="text-xs font-bold text-gray-700 leading-relaxed">{p.outreach_angle}</p>
                  </div>
                )}
                {p.evidence?.videoUrl && (
                  <a
                    href={p.evidence.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-xl border border-primary/25 bg-orange-50 text-primary hover:bg-primary hover:text-white transition-all gap-2 text-[10px] font-black uppercase px-4 py-2"
                  >
                    Open Comment <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
            <p className="text-[10px] text-gray-400 font-medium text-center pt-2">
              You decide who to contact — SignalMerge never messages anyone on your behalf.
            </p>
          </div>
        )}

        {/* Paid, setup still being prepared */}
        {hasSocialPlan && setupStatus !== "complete" && (
          <div className="text-center py-10 px-6 bg-orange-50/40 border border-orange-100 rounded-2xl">
            <Clock className="w-8 h-8 text-primary mx-auto mb-4" />
            <h4 className="text-base font-black text-[#111] mb-3 uppercase tracking-tight">
              Your Social Audience setup is being prepared
            </h4>
            <p className="text-xs text-gray-600 font-bold leading-relaxed max-w-md mx-auto">
              Because your account requires additional data processing and configuration, your results
              will be ready within <strong className="text-primary">1–3 business days</strong>. We'll let
              you know as soon as your setup is complete.
            </p>
          </div>
        )}

        {/* Paid + complete but genuinely nothing found — never fabricate */}
        {hasSocialPlan && setupStatus === "complete" && prospects.length === 0 && (
          <div className="text-center py-10 px-6 bg-gray-50 border border-gray-100 rounded-2xl">
            <p className="text-xs text-gray-600 font-bold leading-relaxed max-w-md mx-auto">
              No qualifying prospects yet. This usually means your channel's recent comments didn't show
              clear buying intent for what you sell. Try widening what you sell in your setup above.
            </p>
          </div>
        )}

        {/* Not paid → locked */}
        {!hasSocialPlan && (
          <div className="text-center py-10 px-6 bg-gray-50 border border-gray-100 rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
            {isConfigured ? (
              <>
                <h4 className="text-base font-black text-[#111] mb-3 uppercase tracking-tight">
                  Your setup is ready to run
                </h4>
                <p className="text-xs text-gray-600 font-bold leading-relaxed max-w-md mx-auto mb-6">
                  Unlock the $299 plan and we'll analyse your channel's comment history, score everyone
                  engaging with your content against what you sell, and hand you the ones worth
                  contacting — with the evidence for each.
                </p>
              </>
            ) : (
              <>
                <h4 className="text-base font-black text-[#111] mb-3 uppercase tracking-tight">
                  Complete your setup above to get started
                </h4>
                <p className="text-xs text-gray-600 font-bold leading-relaxed max-w-md mx-auto mb-6">
                  Add your channel and what you sell, then unlock the $299 plan to receive your scored
                  prospect list.
                </p>
              </>
            )}
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-primary hover:bg-orange-650 text-white text-xs font-black uppercase tracking-wider gap-2 shadow-lg shadow-orange-500/10 transition-colors"
            >
              Unlock Results — $299 <Zap className="w-3.5 h-3.5 fill-white" />
            </Link>
            <p className="text-[10px] text-gray-400 font-medium mt-4">
              Includes 500 SignalMerge credits + everything in the $99 plan.
            </p>
          </div>
        )}
      </div>

      {/* Honest scope note */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4">
        <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
          <strong className="text-gray-700">What this uses:</strong> comments on your videos, which video
          each comment was left on, repeat engagement across your content, and public channel information.
          YouTube does not make follower lists, other users' likes, or private viewing history available
          to any third-party tool, so SignalMerge does not use or claim to use them.
        </p>
      </div>
    </div>
  );
}
