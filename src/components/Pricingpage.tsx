import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Check, ChevronDown, Youtube, Search, Users, Target, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { TermsModal } from "@/components/TermsModal";
import { Logo } from "@/components/Logo";

const YOCO_99 = "https://pay.yoco.com/mergemega?amount=1600";
const YOCO_299 = "https://pay.yoco.com/mergemega?amount=4876";

const SITE_ORIGIN = "https://signalmerge.co.za";

/**
 * Redirects to Yoco with `redirectOnPaymentSuccess` telling Yoco exactly which URL to
 * send the customer back to — including which plan they bought, as a URL query param.
 * This travels with the PAYMENT ITSELF, not the browser that started checkout, so it
 * works correctly even if someone pays on their phone and later opens the dashboard on
 * a laptop: whichever device completes the Yoco redirect reads `plan` from that URL and
 * activates the account in Supabase — the entitlement is server-side from that moment,
 * so any device logging into the same account sees it correctly from then on.
 */
function startCheckout(plan: "plan_99" | "plan_299", email?: string) {
  const base = plan === "plan_299" ? YOCO_299 : YOCO_99;
  const emailParam = email ? `&email=${encodeURIComponent(email)}` : "";
  const planCode = plan === "plan_299" ? "299" : "99";
  const returnUrl = `${SITE_ORIGIN}/?payment=success&plan=${planCode}${email ? `&email=${encodeURIComponent(email)}` : ""}`;
  const url = `${base}${emailParam}&redirectOnPaymentSuccess=${encodeURIComponent(returnUrl)}`;
  window.location.href = url;
}

interface UseCase {
  icon: any;
  title: string;
  body: string;
}

function ExpandableRow({ item }: { item: UseCase }) {
  const [open, setOpen] = useState(false);
  const Icon = item.icon;
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50/60 transition-colors"
      >
        <Icon className="w-4 h-4 text-primary shrink-0" />
        <span className="flex-1 text-xs font-black uppercase tracking-wider text-[#111]">{item.title}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 pt-0 text-xs text-gray-600 font-medium leading-relaxed">{item.body}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PricingPage() {
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [activePlan, setActivePlan] = useState<"plan_99" | "plan_299">("plan_299");

  const plan99Cases: UseCase[] = [
    {
      icon: Search,
      title: "What a credit actually is",
      body: "One credit = one lead returned to you. The $99 plan gives you 150 of them. Run as many searches as you like — you only spend a credit when a real lead comes back, and unused credits never expire or reset monthly.",
    },
    {
      icon: Target,
      title: "What you can do with 150 leads",
      body: "Most service businesses close on volume: if you contact 150 people who have publicly said they need what you sell, even a 3–5% response rate is several real conversations. That's the plan's job — replace cold lists with people who already raised their hand.",
    },
    {
      icon: MessageSquare,
      title: "Who this plan is for",
      body: "Freelancers, agencies, consultants and small service businesses who need clients now and don't want to buy ads or scrape stale contact databases. If you're testing whether SignalMerge finds real buyers in your niche, start here.",
    },
    {
      icon: Zap,
      title: "Example: a pest control company in Durban",
      body: "Searches 'pest control Durban', gets back real posts from people asking for a recommendation this week, each with the source link so they can reply directly where the person actually posted.",
    },
  ];

  const plan299Cases: UseCase[] = [
    {
      icon: Youtube,
      title: "Social Audience — what it actually does",
      body: "It reads the comments on your own YouTube videos and scores every person who commented against what you sell. Someone repeatedly describing a problem your product solves ranks far higher than someone who wrote 'great video'. You get the person, their comment, the video, why they were flagged, and a suggested outreach angle.",
    },
    {
      icon: Users,
      title: "Why your own audience is the warmest list you have",
      body: "These people already watch your content and already trust you. They are not cold. Most creators never find out which of their commenters were genuinely trying to buy something — that's the gap this closes.",
    },
    {
      icon: Target,
      title: "Prospects, not fans",
      body: "The goal is not your most engaged followers. It's the people whose engagement suggests a real need. A viewer who commented once asking how to solve a specific problem is worth more to you than a fan who comments on everything.",
    },
    {
      icon: Check,
      title: "Everything in the $99 plan, plus more credits",
      body: "The $299 plan includes all $99 features, and 500 credits instead of 150. Credits are one-time and non-renewing — they sit in your account until you spend them, with no monthly reset.",
    },
    {
      icon: MessageSquare,
      title: "You stay in control of outreach",
      body: "SignalMerge tells you who to contact and why. It never messages anyone on your behalf. Every suggested message is a draft for you to send personally.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-sans selection:bg-orange-100 selection:text-orange-600">
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-12 py-5 sm:py-8 max-w-7xl mx-auto gap-2">
        <Link to="/"><Logo /></Link>
        <Link
          to="/dashboard"
          className="rounded-xl bg-primary hover:bg-orange-700 text-white px-4 sm:px-6 py-2.5 text-xs font-bold transition-all shadow-lg shadow-orange-200"
        >
          Open Dashboard
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-12 pb-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-[#111] tracking-tighter leading-none mb-4">
            Two ways to find customers
          </h1>
          <p className="text-sm text-gray-500 font-medium max-w-xl mx-auto leading-relaxed">
            Both plans are one-time purchases. Credits never expire and never reset monthly —
            they stay in your account until you use them.
          </p>
        </div>

        {/* Plan toggle */}
        <div className="flex justify-center mb-10">
          <div className="bg-gray-100 p-1.5 rounded-2xl flex gap-1 border border-gray-200/50">
            <button
              onClick={() => setActivePlan("plan_99")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activePlan === "plan_99" ? "bg-white text-[#111] shadow-sm" : "text-gray-500 hover:text-[#111]"
              }`}
            >
              $99 Starter
            </button>
            <button
              onClick={() => setActivePlan("plan_299")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activePlan === "plan_299" ? "bg-white text-[#111] shadow-sm" : "text-gray-500 hover:text-[#111]"
              }`}
            >
              $299 Audience
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* $99 */}
          <motion.div
            animate={{ scale: activePlan === "plan_99" ? 1 : 0.985, opacity: activePlan === "plan_99" ? 1 : 0.75 }}
            transition={{ duration: 0.25 }}
            className={`bg-white border rounded-[2rem] p-8 flex flex-col ${
              activePlan === "plan_99" ? "border-primary shadow-xl shadow-orange-500/10" : "border-gray-100 shadow-sm"
            }`}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Starter</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-black text-[#111] tracking-tighter">$99</span>
              <span className="text-xs font-bold text-gray-400">one-time</span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 mb-6">R1,600 ZAR</p>

            <ul className="space-y-3 mb-8 flex-1">
              {["150 SignalMerge credits (non-renewing)", "Unlimited searches", "Real buyer-intent results from the live web", "Full source link on every lead", "Claude / MCP connector access"].map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-xs font-bold text-gray-700 leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => startCheckout("plan_99")}
              className="w-full h-14 rounded-2xl bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white text-xs font-black uppercase tracking-wider gap-2 transition-colors"
            >
              Get 150 Credits <Zap className="w-3.5 h-3.5" />
            </Button>
          </motion.div>

          {/* $299 */}
          <motion.div
            animate={{ scale: activePlan === "plan_299" ? 1 : 0.985, opacity: activePlan === "plan_299" ? 1 : 0.75 }}
            transition={{ duration: 0.25 }}
            className={`bg-white border rounded-[2rem] p-8 flex flex-col relative ${
              activePlan === "plan_299" ? "border-primary shadow-xl shadow-orange-500/10" : "border-gray-100 shadow-sm"
            }`}
          >
            <div className="absolute -top-3 left-8 bg-primary text-white font-black px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest shadow-md">
              Includes everything in $99
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 mt-2">Audience</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-black text-[#111] tracking-tighter">$299</span>
              <span className="text-xs font-bold text-gray-400">one-time</span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 mb-6">R4,876 ZAR</p>

            <ul className="space-y-3 mb-8 flex-1">
              {[
                "Everything in the $99 plan",
                "500 SignalMerge credits (non-renewing)",
                "Social Audience: YouTube audience intelligence",
                "Find buyers hiding in your own comment section",
                "Why each person is a prospect, with the evidence",
                "Suggested outreach angle for every prospect",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-xs font-bold text-gray-700 leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => startCheckout("plan_299")}
              className="w-full h-14 rounded-2xl bg-primary hover:bg-orange-650 text-white text-xs font-black uppercase tracking-wider gap-2 shadow-lg shadow-orange-500/10"
            >
              Unlock Social Audience <Zap className="w-3.5 h-3.5 fill-white" />
            </Button>
            <p className="text-[10px] text-gray-400 font-medium text-center mt-3">
              Social Audience setup is prepared within 1–3 business days of purchase.
            </p>
          </motion.div>
        </div>

        {/* The "why does $299 exist" section */}
        <div className="bg-gray-50 border border-gray-100 rounded-[2rem] p-8 mb-10">
          <h2 className="text-lg font-black text-[#111] tracking-tight mb-2">
            Why the $299 plan exists
          </h2>
          <p className="text-xs text-gray-600 font-medium leading-relaxed max-w-2xl">
            The $99 plan searches the <strong>open web</strong> for strangers who need what you sell.
            The $299 plan does that too — and then turns inward, to the people already watching your
            content. Those people know you, trust you, and some of them have quietly told you they have
            a problem you can solve. They're the warmest leads you already own and can't currently see.
          </p>
        </div>

        {/* Interactive detail */}
        <div className="mb-10">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">
            {activePlan === "plan_99" ? "Explore the $99 plan" : "Explore the $299 plan"}
          </h3>
          <div className="space-y-2.5">
            {(activePlan === "plan_99" ? plan99Cases : plan299Cases).map((item) => (
              <div key={item.title}><ExpandableRow item={item} /></div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4">
          <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
            <strong className="text-gray-700">On Social Audience data:</strong> it analyses comments on
            your own videos, the videos they were left on, repeat engagement across your content, and
            public channel information. YouTube does not make follower lists, other users' likes, or
            private viewing history available to third-party tools — so SignalMerge does not use or claim
            to use them.
          </p>
        </div>
      </main>

      <Footer onTermsClick={() => setIsTermsModalOpen(true)} />
      <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
    </div>
  );
}
