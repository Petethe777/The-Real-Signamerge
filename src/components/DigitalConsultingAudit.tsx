import React, { useState, useEffect } from "react";
import { 
  Zap, Clock, ShieldCheck, MapPin, ExternalLink, Lock, 
  AlertTriangle, ArrowRight, Search, CheckCircle, RefreshCw,
  TrendingUp, Users, ArrowUpRight, BarChart2, MessageSquare, 
  Laptop, Compass, Sparkles, Filter, Globe, Info, Heart, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { TermsModal } from "@/components/TermsModal";

// Types for Leads Database
interface Lead {
  id: string;
  platform: "LinkedIn" | "Instagram" | "Facebook" | "Reddit" | "TikTok";
  intent: string;
  location: string;
  time: string;
}

// Full 50-leads dataset of high-intent Digital Marketing & consulting buyers targeting European companies
const rawLeadsData: Lead[] = [
  {
    id: "lead-1",
    platform: "LinkedIn",
    intent: "Urgent: In dire need of a validated professional Digital Marketing agency. We have a budget of $3,500/mo and need help setting up our channels. Drop your recommendations or DM me.",
    location: "Malta & remote EU",
    time: "1h ago"
  },
  {
    id: "lead-2",
    platform: "Instagram",
    intent: "Who is the best independent web consultant for growing our e-commerce apparel brand in Europe? Budget is ready, looking for direct experience with high sales conversion funnels.",
    location: "Italy / Milan",
    time: "2h ago"
  },
  {
    id: "lead-3",
    platform: "Reddit",
    intent: "Looking for an expert who specializes in advanced SEO audits and organic growth for a tech startup. We reside in Sweden but target the DACH region. No generic agency pitches please.",
    location: "Sweden / Stockholm",
    time: "4h ago"
  },
  {
    id: "lead-4",
    platform: "Facebook",
    intent: "Need recommendation for a paid ads specialist who can scale our B2B SaaS platform. Budget is €5k recurring plus ad spend. Must have proven feedback and success stories in Europe.",
    location: "Germany / Munich",
    time: "6h ago"
  },
  {
    id: "lead-5",
    platform: "TikTok",
    intent: "We are restructuring our entire social content system. Sourcing a skilled consultant for high-frequency video strategy and brand authority coaching. DM portfolio stat lines.",
    location: "United Kingdom",
    time: "8h ago"
  },
  {
    id: "lead-6",
    platform: "LinkedIn",
    intent: "Hiring a digital marketing expert to optimize our local lead-gen pipelines. Malta-based client. Ready to start immediately with €2,500 retainer.",
    location: "Malta",
    time: "11h ago"
  },
  {
    id: "lead-7",
    platform: "Instagram",
    intent: "Looking to scale a beauty brand across southern Europe. Need direct outreach, TikTok ads scaling, and Instagram shop integration experts immediately.",
    location: "Spain / Barcelona",
    time: "12h ago"
  },
  {
    id: "lead-8",
    platform: "Reddit",
    intent: "Our WordPress site is completely stuck in search console. Looking to hire a technical SEO freelancer for a deep code and indexing audit ASAP.",
    location: "Netherlands",
    time: "14h ago"
  },
  {
    id: "lead-9",
    platform: "Facebook",
    intent: "Is anyone here a specialist in Meta ads for high-ticket coaching programs? Located in Ireland, targeting premium EU professionals. Comment or send details.",
    location: "Ireland / Dublin",
    time: "17h ago"
  },
  {
    id: "lead-10",
    platform: "TikTok",
    intent: "Need a creative consultant who knows how to script videos that actually trigger buy intent, not just random views. We sell premium organic matcha across Europe.",
    location: "France / Paris",
    time: "19h ago"
  },
  {
    id: "lead-11",
    platform: "LinkedIn",
    intent: "Our legal services firm is ready to contract an experienced PPC strategist. Need high compliance lead funnels set up before end of the month.",
    location: "Switzerland / Zürich",
    time: "21h ago"
  },
  {
    id: "lead-12",
    platform: "Instagram",
    intent: "Sourcing independent digital advisors who can implement CRM automation. We are burning leads due to slow response times. Please reach out with rates.",
    location: "Italy / Rome",
    time: "23h ago"
  },
  {
    id: "lead-13",
    platform: "Reddit",
    intent: "Looking for an expert Hubspot / Zapier workflow builder. Need to connect all lead capture from Linkedin and Meta with instant follow up emails.",
    location: "Sweden / Gothenburg",
    time: "1d ago"
  },
  {
    id: "lead-14",
    platform: "Facebook",
    intent: "Any agencies specializing in real estate lead generation? We're starting a development group in Malta and need continuous investor inquiries.",
    location: "Malta / Sliema",
    time: "1d ago"
  },
  {
    id: "lead-15",
    platform: "TikTok",
    intent: "Can anyone suggest a top-rated SEO copywriter for long-term blogging collaboration? Need someone fluent in English with high-conversion landing page records.",
    location: "United Kingdom / London",
    time: "1d ago"
  },
  {
    id: "lead-16",
    platform: "LinkedIn",
    intent: "Seeking a senior automation developer. We need to scrape, score, and deliver cold email campaign workflows safely in Europe.",
    location: "Germany / Berlin",
    time: "1d ago"
  },
  {
    id: "lead-17",
    platform: "Instagram",
    intent: "I need to completely redesign our service landing pages to boost optical conversion rates. Who is the absolute expert in UX psychology and modern Figma UI?",
    location: "Poland / Warsaw",
    time: "1d ago"
  },
  {
    id: "lead-18",
    platform: "Reddit",
    intent: "Who do you recommend for B2B LinkedIn outbound strategy? Looking to book 15-20 qualified demos a month with mid-size manufacturing companies.",
    location: "Austria / Vienna",
    time: "1d ago"
  },
  {
    id: "lead-19",
    platform: "Facebook",
    intent: "Sourcing dynamic digital specialists to take over our social media channels. We require content creation, posting frequency, and community reply monitoring.",
    location: "Belgium / Brussels",
    time: "1d ago"
  },
  {
    id: "lead-20",
    platform: "TikTok",
    intent: "Our Shopify organic traffic has tanked since the latest update. Need a qualified diagnostic expert to inspect and fix our schema markup.",
    location: "Denmark / Copenhagen",
    time: "2d ago"
  },
  {
    id: "lead-21",
    platform: "LinkedIn",
    intent: "Contract open: €4,000/mo for a growth marketer who can design and execute multithread outbound campaigns for our HR tech platform.",
    location: "Finland / Helsinki",
    time: "2d ago"
  },
  {
    id: "lead-22",
    platform: "Instagram",
    intent: "Need immediate help with setting up Google Analytics 4, Tag Manager, and custom server-side tracking. None of our conversion calculations are matching.",
    location: "Norway / Oslo",
    time: "2d ago"
  },
  {
    id: "lead-23",
    platform: "Reddit",
    intent: "Has anyone successfully used automated cold calling agents or AI video avatars? Sourcing a digital advisory team to consult on this.",
    location: "Portugal / Lisbon",
    time: "2d ago"
  },
  {
    id: "lead-24",
    platform: "Facebook",
    intent: "Looking for an expert in local SEO and Google Business Profile optimization. We run dental clinics and need to dominate top 3 maps positions.",
    location: "Malta / Valletta",
    time: "2d ago"
  },
  {
    id: "lead-25",
    platform: "TikTok",
    intent: "Urgent hire: TikTok Ads specialist with case studies proving sub-$30 customer acquisition costs for SaaS. Send a DM with reports.",
    location: "United Kingdom / Manchester",
    time: "2d ago"
  },
  {
    id: "lead-26",
    platform: "LinkedIn",
    intent: "We are scaling our premium translation agency and need help building automated sales funnels. Looking for high level marketing architects.",
    location: "Spain / Madrid",
    time: "2d ago"
  },
  {
    id: "lead-27",
    platform: "Instagram",
    intent: "Seeking a professional who can audit our digital footprint and build a robust authority roadmap. We are expert lawyers but invisible online.",
    location: "Greece / Athens",
    time: "2d ago"
  },
  {
    id: "lead-28",
    platform: "Reddit",
    intent: "Is anyone a genius with cold email deliverability? Need someone to configure custom domains, DMARC/SPF/DKIM, and clean up our spam rating.",
    location: "Sweden / Uppsala",
    time: "2d ago"
  },
  {
    id: "lead-29",
    platform: "Facebook",
    intent: "Hiring an agency or freelancer immediately to manage a €3,500/mo Meta ad spend. Focus: high-end luxury furniture imports in DACH region.",
    location: "Germany / Frankfurt",
    time: "2d ago"
  },
  {
    id: "lead-30",
    platform: "TikTok",
    intent: "Searching for someone to manage influencer matching and ambassador program mechanics in Europe for our eco-conscious shoe brand.",
    location: "Italy / Florence",
    time: "2d ago"
  },
  {
    id: "lead-31",
    platform: "LinkedIn",
    intent: "Looking to contract a growth partner who can audit and refine our onboarding funnel. Currently seeing 45% dropoff at checkout. Immediate start.",
    location: "United Kingdom / Bristol",
    time: "2d ago"
  },
  {
    id: "lead-32",
    platform: "Instagram",
    intent: "Who is the absolute best for custom newsletter marketing and sequence setup? Sourcing a copywriter to build high open-rate promotional automation.",
    location: "France / Lyon",
    time: "2d ago"
  },
  {
    id: "lead-33",
    platform: "Reddit",
    intent: "Our luxury boutique hotel is looking to boost bookings directly rather than relying on Booking.com fees. Sourcing a localized digital campaign strategist.",
    location: "Malta / Gozo",
    time: "2d ago"
  },
  {
    id: "lead-34",
    platform: "Facebook",
    intent: "Need recommendations for B2B advertising consultants with strong familiarity in European compliance laws and GDPR parameters.",
    location: "Netherlands / Amsterdam",
    time: "2d ago"
  },
  {
    id: "lead-35",
    platform: "TikTok",
    intent: "Is there a service that takes your video recordings and edits them into 30 engaging high-conversion social assets? In dire need of a content engine.",
    location: "Sweden / Malmö",
    time: "2d ago"
  },
  {
    id: "lead-36",
    platform: "LinkedIn",
    intent: "Our luxury yacht charter business in Malta needs a complete digital overhaul. We need expert SEO, premium Meta ads, and localized Google Maps listing authority.",
    location: "Malta",
    time: "3d ago"
  },
  {
    id: "lead-37",
    platform: "Instagram",
    intent: "We are struggling to get traffic to our new web platform. Looking to hire a creative performance digital consultant who is metric driven.",
    location: "Switzerland / Zurich",
    time: "3d ago"
  },
  {
    id: "lead-38",
    platform: "Reddit",
    intent: "Looking for an outbound manager to handle cold campaigns on LinkedIn. Direct experience with Sales Navigator and Apollo is necessary.",
    location: "UK / Edinburgh",
    time: "3d ago"
  },
  {
    id: "lead-39",
    platform: "Facebook",
    intent: "Hiring a digital marketing manager to help coordinate our localized ads in Switzerland. Budget is €3,000 monthly retainer.",
    location: "Switzerland / Geneva",
    time: "3d ago"
  },
  {
    id: "lead-40",
    platform: "TikTok",
    intent: "Sourcing viral marketer specializing in organic brand loops. We need to capture European Gen-Z attention for a fintech app.",
    location: "Germany / Hamburg",
    time: "3d ago"
  },
  {
    id: "lead-41",
    platform: "LinkedIn",
    intent: "We want to train our in-house sales team in advanced digital prospecting. Seeking a senior consultant to design a 4-week custom academy.",
    location: "Denmark / Aarhus",
    time: "3d ago"
  },
  {
    id: "lead-42",
    platform: "Instagram",
    intent: "ISO direct contact for a validated email marketing agency. Need verified statistics of active client portfolios in apparel niches.",
    location: "Italy / Milan",
    time: "3d ago"
  },
  {
    id: "lead-43",
    platform: "Reddit",
    intent: "Seeking a brilliant landing page optimizer. Our conversion rate is under 1.1%. Need direct UX audit and layout revisions.",
    location: "Ireland / Cork",
    time: "3d ago"
  },
  {
    id: "lead-44",
    platform: "Facebook",
    intent: "Sourcing a professional localized PPC manager for law firm clientele. Malta offices require a steady stream of corporate law inquiries.",
    location: "Malta / Valletta",
    time: "3d ago"
  },
  {
    id: "lead-45",
    platform: "TikTok",
    intent: "Can anyone recommend a trusted expert on Pinterest ads? Our brand targets European home decoration buyers.",
    location: "Netherlands / Rotterdam",
    time: "3d ago"
  },
  {
    id: "lead-46",
    platform: "LinkedIn",
    intent: "Seeking premium partner to handle global SEO structure. Multi-language target markets across Spain, Sweden, Switzerland.",
    location: "Spain / Madrid",
    time: "3d ago"
  },
  {
    id: "lead-47",
    platform: "Instagram",
    intent: "Hiring: Creative designer with strong copywriting instincts to produce weekly ad creatives for Instagram and TikTok. retainer starts at €1,500.",
    location: "Sweden / Stockholm",
    time: "3d ago"
  },
  {
    id: "lead-48",
    platform: "Reddit",
    intent: "Looking to audit our current digital agency spend. Need an independent consultant who is highly objective and doesn't sell standard retainers.",
    location: "Austria / Salzburg",
    time: "3d ago"
  },
  {
    id: "lead-49",
    platform: "Facebook",
    intent: "Our luxury hospitality brand in Germany is hiring a premium digital advisory firm. Comprehensive campaigns across Google, Meta, and Native directories.",
    location: "Germany / Cologne",
    time: "3d ago"
  },
  {
    id: "lead-50",
    platform: "TikTok",
    intent: "Need custom dashboards set up for all marketing metrics. We want real-time view of cost per lead, click rates, and ROI. Drop recommendations.",
    location: "UK / London",
    time: "3d ago"
  }
];

export default function DigitalConsultingAudit() {
  const navigate = useNavigate();
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [sessionLoading, setSessionLoading] = useState<boolean>(true);
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSubmitting, setLoginSubmitting] = useState<boolean>(false);

  // Search and Filter states for leads table
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("All");

  // 36-hour Countdown state (36 hours = 129600 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const savedTarget = localStorage.getItem("signalmerge_audit_expiry_target");
    const now = Date.now();
    if (savedTarget) {
      const target = parseInt(savedTarget, 10);
      const diff = Math.floor((target - now) / 1000);
      if (diff > 0) {
        return diff;
      }
    }
    const newTarget = now + 129600 * 1000;
    localStorage.setItem("signalmerge_audit_expiry_target", String(newTarget));
    return 129600;
  });

  // Check existing session on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && (session.user.email === "digitalconsultingpros@gmail.com" || session.user.email === "petemkhize@gmail.com")) {
        setIsAuthenticated(true);
      }
      setSessionLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (session.user.email === "digitalconsultingpros@gmail.com" || session.user.email === "petemkhize@gmail.com")) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Update timer countdown to match target date accurately
  useEffect(() => {
    const updateTime = () => {
      const savedTarget = localStorage.getItem("signalmerge_audit_expiry_target");
      if (savedTarget) {
        const target = parseInt(savedTarget, 10);
        const diff = Math.floor((target - Date.now()) / 1000);
        if (diff > 0) {
          setTimeLeft(diff);
        } else {
          // Reset to a brand new 36 hours once expired to maintain urgency
          const newTarget = Date.now() + 129600 * 1000;
          localStorage.setItem("signalmerge_audit_expiry_target", String(newTarget));
          setTimeLeft(129600);
        }
      }
    };

    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
    };
  };

  const timerString = formatCountdown(timeLeft);

  // Handling standard custom secure login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSubmitting(true);

    const emailClean = loginEmail.trim().toLowerCase();
    const passwordClean = loginPassword.trim();

    if (!emailClean || !passwordClean) {
      setLoginError("Please fill out all credentials.");
      setLoginSubmitting(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailClean,
        password: passwordClean
      });

      if (error) {
        setLoginError(error.message);
      } else if (data.session) {
        setIsAuthenticated(true);
      } else {
        setLoginError("Unauthorized. Only designated audit files allowed.");
      }
    } catch (err: any) {
      setLoginError(err.message || "An error occurred logging in.");
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  // Filter leads based on platform and search query
  const filteredLeads = rawLeadsData.filter((lead) => {
    const matchesPlatform = selectedPlatform === "All" || lead.platform === selectedPlatform;
    const matchesQuery = 
      lead.intent.toLowerCase().includes(searchQuery.toLowerCase()) || 
      lead.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlatform && matchesQuery;
  });

  // Unique platform list
  const platforms = ["All", "LinkedIn", "Instagram", "Facebook", "Reddit", "TikTok"];

  // Loading Screen
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-orange-600 animate-spin" />
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">CONNECTING TO COGNITIVE DISCOVERY CLUSTER...</p>
        </div>
      </div>
    );
  }

  // --- 1. RENDER SECURE GATE IF NOT AUTHENTICATED ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center px-6 font-sans relative overflow-hidden selection:bg-orange-500/30">
        {/* Background Decorative Rings */}
        <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] rounded-full bg-orange-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-orange-500/10 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md z-10">
          <div className="flex items-center gap-2 justify-center mb-8">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-600/20">
              <Zap className="text-white w-5 h-5 fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">Signalmerge</span>
          </div>

          <Card className="border border-orange-100 bg-white/90 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 border border-orange-200/60 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-3">
                <Lock className="w-3 h-3 text-orange-600" /> Secure Client Registry Gate
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customer Audit Lock</h1>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Enter your designated administrative email and passcode provided during onboarding for <span className="text-orange-600 font-bold">Digital Consulting Pros</span>.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
                  Client Email Address
                </label>
                <Input 
                  type="email"
                  placeholder="name@company.com"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl py-6 px-4 font-mono text-sm focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
                  Secure Access Key
                </label>
                <Input 
                  type="password"
                  placeholder="••••••••••••••"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl py-6 px-4 font-mono text-sm focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500"
                />
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-shake">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <p className="leading-normal">{loginError}</p>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loginSubmitting}
                className="w-full py-6 mt-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold tracking-wide transition-all shadow-lg shadow-orange-600/15 gap-2"
              >
                {loginSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Keys...
                  </>
                ) : (
                  <>
                    Access Custom Audit Report <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 border-t border-slate-200 pt-4 text-center">
              <span className="text-[9px] font-mono text-slate-400 tracking-wider">
                DECRYPTING ENCRYPTION STANDARD SEC-V4
              </span>
            </div>

          </Card>
        </div>
      </div>
    );
  }

  // --- 2. MAIN LOGGED IN AUDIT PAGE RENDER ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-orange-500/30 relative">
      
      {/* 36-HOUR COUNTDOWN RIGID HEAD-BAR */}
      <div className="sticky top-0 z-50 bg-orange-600 border-b border-orange-700 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-center text-xs">
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <AlertTriangle className="w-4 h-4 text-white animate-pulse shrink-0" />
          <span className="text-white font-bold uppercase tracking-wider">
            Urgent: Limited Malta Partner Cohort Slot — Slot is currently Reserved for Digital Consulting Pros
          </span>
        </div>
        <div className="flex items-center gap-2 justify-center font-mono text-white">
          <span className="text-orange-100 font-bold uppercase tracking-widest text-[10px]">TIMEOUT IN</span>
          <div className="flex items-center gap-1 bg-orange-900/50 border border-orange-400/30 px-3 py-1 rounded-md text-white font-black shadow-inner text-sm">
            <span>{timerString.hours}</span>
            <span className="animate-pulse">:</span>
            <span>{timerString.minutes}</span>
            <span className="animate-pulse">:</span>
            <span>{timerString.seconds}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-10 relative z-10">
        
        {/* ACTIVE ADMINISTRATIVE SESSION LOCKER FOOTER/CONTROL BAR */}
        <div className="mb-8 p-4 bg-orange-50/60 border border-orange-200/50 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-mono font-bold uppercase text-slate-500">Security Node Connection:</span>
            <span className="bg-white border border-slate-200 text-slate-800 font-bold px-2.5 py-1 rounded-lg">
              digitalconsultingpros@gmail.com
            </span>
            <span className="text-slate-400 font-bold">•</span>
            <span className="text-slate-600 font-medium">Designated Valletta Pipeline Gate</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleLogout}
              className="bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition-all flex items-center gap-1.5 focus:outline-none cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-red-500" /> Sign Out & Lock Secure Registry
            </button>
          </div>
        </div>

        {/* TOP COHORT ADVISORY CARD */}
        <div className="mb-10 p-5 bg-orange-50/30 border border-orange-200/50 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-orange-100 border border-orange-200/80 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest text-orange-700 uppercase">
              <Sparkles className="w-3 h-3 text-orange-600" /> Exclusive EU Onboarding Slots
            </div>
            <h4 className="text-base font-bold text-slate-900 tracking-tight">Capped Brand Partnerships Policy</h4>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              We operate exclusively with a hand-selected group of high-potential growth enterprises in Europe. To maintain superior API speeds and guarantee lead signal quality, we enforce strict capacity caps. <span className="text-orange-600 font-bold">Digital Consulting Pros</span> must act quickly; this live customer search audit will close indefinitely when the countdown expires.
            </p>
          </div>
          <div className="shrink-0 flex items-center">
            <div className="bg-white border border-orange-200 py-3 px-4 rounded-xl text-right shadow-sm">
              <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">REGISTRATION LIMIT</span>
              <span className="text-xl font-extrabold text-slate-900">3 SLOTS <span className="text-orange-600">LEFT</span></span>
            </div>
          </div>
        </div>

        {/* HERO HEADER AREA */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono px-3 py-1 bg-orange-100 text-orange-700 border border-orange-200/40 rounded-md font-bold uppercase">
                Enterprise Growth Report
              </span>
              <span className="text-xs font-mono px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-md font-bold uppercase">
                Valletta, Malta
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Customer Audit: <span className="text-orange-600">Digital Consulting Pros</span>
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
              Social engagement diagnostics and real-time high-conviction buying cues compiled for the year 2026. Review localized European traffic matrices and preview available signals below.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button onClick={handleLogout} className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all">
              Lock Registry Gate
            </Button>
            <a href="#payment-section" className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-lg shadow-orange-600/15 gap-1 inline-flex items-center">
              Claim Pipeline <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* HIGHER PERFORMANCE MATRICES (DAILY STATS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          <Card className="bg-white border border-slate-100 shadow-md rounded-2xl relative overflow-hidden group hover:border-orange-200 transition-all duration-300">
            <div className="absolute top-0 left-0 h-1 bg-[#00b2fe] w-full" />
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black font-mono tracking-widest text-[#00b2fe] uppercase">
                  TikTok Lead Generation
                </span>
                <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center border border-cyan-100">
                  <TrendingUp className="w-4 h-4 text-[#00b2fe]" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="block text-[11px] text-slate-500 font-medium">Daily Direct Website Enquiries</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900">101</span>
                  <span className="text-emerald-600 text-xs font-bold font-mono">⚡ Verified Live</span>
                </div>
              </div>
              <div className="border-t border-slate-100 mt-4 pt-4 text-[10px] text-slate-500 leading-normal flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#00b2fe]" /> Active search query matching 'Digital Promotion Malta'
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-100 shadow-md rounded-2xl relative overflow-hidden group hover:border-orange-200 transition-all duration-300">
            <div className="absolute top-0 left-0 h-1 bg-pink-500 w-full" />
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black font-mono tracking-widest text-pink-500 uppercase">
                  Instagram Social Pipeline
                </span>
                <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center border border-pink-100">
                  <span className="text-pink-500 font-bold block">★</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="block text-[11px] text-slate-500 font-medium">Daily High-Intent Outbound Sweeps</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900">123</span>
                  <span className="text-pink-500 text-xs font-bold font-mono">🔥 High Intent</span>
                </div>
              </div>
              <div className="border-t border-slate-100 mt-4 pt-4 text-[10px] text-slate-500 leading-normal flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-pink-500" /> Matches agency buyers & digital consulting filters
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-orange-200/60 shadow-md rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 bg-orange-600 w-full shadow-[0_0_10px_rgba(249,115,22,0.3)]" />
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-xl pointer-events-none" />
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black font-mono tracking-widest text-orange-600 uppercase">
                  Signalmerge Core Capability
                </span>
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center border border-orange-100">
                  <Zap className="w-4 h-4 text-orange-600 fill-orange-600" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="block text-[11px] text-slate-500 font-medium">Guaranteed Lead Volume Target</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">1,000</span>
                  <span className="text-slate-500 text-xs font-bold">Leads / Month</span>
                </div>
              </div>
              <div className="border-t border-slate-100 mt-4 pt-4 text-[10px] text-slate-500 leading-normal flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-600" /> Full metadata unlock of premium localized EU buyers
              </div>
            </CardContent>
          </Card>

        </div>

        {/* LEAD PREVIEW GRAPHICS INTERACTIVE LAYOUT */}
        <div className="bg-white border border-slate-200 shadow-md rounded-2xl overflow-hidden mb-12">
          
          {/* Table Header Controls */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Signalmerge Live Query Dashboard</h3>
                <span className="bg-orange-100 text-orange-850 border border-orange-200/60 text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase font-mono">
                  Preview Data
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Showing real social requests for digital marketing, advertising setup, and scaling specialists in Europe. Classified as live Preview Data.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input 
                  type="text" 
                  placeholder="Filter key queries / regions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-50 border-slate-200 text-slate-800 text-xs pl-10 pr-4 py-4 rounded-xl placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Platform category selectors */}
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-3 flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Source Channels:
            </span>
            {platforms.map((p) => {
              const count = p === "All" 
                ? rawLeadsData.length 
                : rawLeadsData.filter(l => l.platform === p).length;
              const isActive = selectedPlatform === p;
              return (
                <button
                  key={p}
                  onClick={() => setSelectedPlatform(p)}
                  className={`text-xs rounded-lg px-3 py-1.5 font-bold transition-all flex items-center gap-1.5 focus:outline-none ${
                    isActive 
                      ? "bg-orange-600 text-white shadow-md shadow-orange-600/10" 
                      : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span>{p}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.1 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-550"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Interactive Responsive Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] text-slate-500 tracking-wider font-mono font-bold uppercase">
                  <th className="py-4 px-6 font-bold">Source Node</th>
                  <th className="py-4 px-6 min-w-[320px] font-bold">Intent Signal (Compelling Social Media Posts)</th>
                  <th className="py-4 px-6 font-bold">Target Geography</th>
                  <th className="py-4 px-6 font-bold">Signal Age</th>
                  <th className="py-4 px-6 text-right font-bold">Outreach Node</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-sans">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => {
                    // Determine platform color badge
                    const colorMap = {
                      LinkedIn: "bg-blue-50 text-blue-600 border-blue-200/50",
                      Instagram: "bg-pink-50 text-pink-600 border-pink-200/50",
                      Facebook: "bg-indigo-50 text-indigo-600 border-indigo-200/50",
                      Reddit: "bg-orange-50 text-orange-600 border-orange-200/50",
                      TikTok: "bg-cyan-50 text-cyan-600 border-cyan-200/50"
                    };
                    const badgeStyle = colorMap[lead.platform] || "bg-slate-50 text-slate-600";

                    return (
                      <tr 
                        key={lead.id}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="py-5 px-6 font-mono text-xs">
                          <span className={`border px-2 py-1 rounded-md font-bold ${badgeStyle}`}>
                            {lead.platform}
                          </span>
                        </td>
                        <td className="py-5 px-6 max-w-sm sm:max-w-md lg:max-w-xl leading-relaxed text-slate-700 font-medium">
                          <p className="line-clamp-3 select-all">"{lead.intent}"</p>
                        </td>
                        <td className="py-5 px-6 font-mono text-xs text-slate-600 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-orange-600" /> {lead.location}
                          </div>
                        </td>
                        <td className="py-5 px-6 font-mono text-xs text-slate-500 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> {lead.time}
                          </div>
                        </td>
                        <td className="py-5 px-6 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-[10px] text-red-600 font-black px-2.5 py-1.5 rounded-xl uppercase tracking-wider justify-end shadow-inner select-none cursor-not-allowed">
                            <Lock className="w-3 h-3 text-red-500 animate-pulse" /> Only with Premium
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 bg-white">
                      No matching records found within the 50 live preview database leads.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Database Footer Summary */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-500 leading-normal font-mono font-bold uppercase tracking-wider">
            PREVIEW DATA • TOTAL DISCOVERED RECOVERY: 1,000+ EU SIGNALS EXPECTED THIS MONTH
          </div>
        </div>

        {/* COST RECKONER & YOKO CHECKOUT ACTION INTEGRITY CONTAINER */}
        <div id="payment-section" className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12 items-stretch">
          
          {/* Card left: pricing breakdown */}
          <Card className="bg-white border border-slate-200 rounded-2xl flex flex-col justify-between p-8 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-4">
              <span className="text-[10px] font-black font-mono tracking-widest text-orange-600 uppercase">
                Contract Pricing Breakdown
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Digital Consulting Pros Plan
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Unlock instant access to the Signalmerge real-time customer search engine. Filter premium leads, reveal source contact metrics, export with one click, and receive continuous push notifications of hot prospects in Malta and Europe.
              </p>

              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-600 shrink-0" />
                    <div>
                      <span className="block text-xs font-bold text-slate-800">Continuous 2026 Social Audits</span>
                      <span className="block text-[10px] text-slate-400 font-mono">Sweeping TikTok, Instagram, Reddit, Facebook & more</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600">Included</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-600 shrink-0" />
                    <div>
                      <span className="block text-xs font-bold text-slate-800">1,000 Monthly High-Intent Signals</span>
                      <span className="block text-[10px] text-slate-400 font-mono">Complete location metrics & organic text filters</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600">Included</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-600 shrink-0" />
                    <div>
                      <span className="block text-xs font-bold text-slate-800 font-sans">Full Database Dashboard Access</span>
                      <span className="block text-[10px] text-slate-400 font-mono">Instant CSV exports with unlocked direct buyer contact pointers</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600">Included</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 mt-6 flex items-center justify-between">
              <div>
                <span className="block text-[9px] text-slate-400 font-black uppercase font-mono">RECURRING VALUE LOCK</span>
                <span className="text-xs text-slate-500 font-medium">Commencing June 30, 2026</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-slate-900">€80 <span className="text-xs font-mono text-slate-500 font-normal">/ month</span></span>
              </div>
            </div>
          </Card>

          {/* Card right: setup pay checkout link standard standard */}
          <Card className="bg-white border border-orange-200 rounded-2xl p-8 relative flex flex-col justify-between overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black font-mono tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md uppercase">
                  Action Required Now
                </span>
                <span className="text-xs text-orange-600 font-mono font-black animate-pulse leading-none">
                  ⏳ 36h Limit
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Authorize One-Time Setup Fee</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Secure the European Signalmerge data pipeline allocation earmarked for Malta. Authorize the setup parameter fee immediately using the secure Yoco link below. Any delay in setup authorization risks automatic re-allocation to alternative digital firms.
              </p>

              {/* Huge Fee Breakdown */}
              <div className="bg-orange-50/40 border border-orange-100/60 p-4 rounded-xl flex items-center justify-between my-4">
                <div>
                  <span className="block text-[9.5px] font-black font-mono tracking-widest text-orange-700 leading-none mb-1">SETUP FEE (EUROS & ZAR)</span>
                  <span className="text-3xl font-extrabold text-slate-900">€160</span>
                  <span className="text-xs text-slate-500 ml-2">Equivalent to R3,040 ZAR</span>
                </div>
                <div className="text-right">
                   <span className="block text-[8px] font-black font-mono text-orange-600 leading-none uppercase">Yoco Portal Gate</span>
                   <span className="text-sm text-slate-500 font-mono font-medium">Secured Standard</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <a 
                href="https://pay.yoco.com/mergemega?amount=3040" 
                target="_blank" 
                rel="referrer noopener"
                className="block text-center py-5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold text-sm rounded-xl tracking-wide shadow-xl shadow-orange-500/25 transition-all text-sm uppercase flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                Pay Setup Fee Now (R3,040 ZAR) <ArrowUpRight className="w-5 h-5" />
              </a>

              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 font-mono select-none">
                <span className="flex items-center gap-1">🛡️ SSL Secure</span>
                <span>•</span>
                <span className="flex items-center gap-1">💳 Visa & Mastercard</span>
                <span>•</span>
                <span className="flex items-center gap-1">🇿🇦 Yoco Certified Direct</span>
              </div>
            </div>
          </Card>

        </div>

        {/* BOTTOM TIMED EXPIRY WARNING FOOTER */}
        <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-2xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <h5 className="text-sm font-bold text-slate-950 tracking-tight">Final Registry Authorization Decrypt Notice</h5>
              </div>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                Upon expiration of the <span className="text-red-600 font-bold font-mono">36-hour countdown</span>, this custom audit profile for Digital Consulting Pros Maltese hub will disconnect from active monitoring nodes, lock completely, and the reserved buyer allocation slot will automatically release to the next agency candidate on the European waitlist. Clear the R3,040 Setup via the secured Yoco portal above to guarantee long-term pipeline continuity.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span>© 2026 Signalmerge</span>
          </div>
          <div className="flex flex-wrap gap-6 items-center mt-3 md:mt-0">
            <Link to="/about" className="hover:text-orange-600 transition-colors uppercase text-xs font-bold">
              About
            </Link>
            <button 
              type="button" 
              onClick={() => setIsTermsModalOpen(true)}
              className="hover:text-orange-600 cursor-pointer transition-colors focus:outline-none uppercase text-xs font-bold"
            >
              Terms
            </button>
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className="hover:text-orange-600 cursor-pointer transition-colors focus:outline-none uppercase text-xs flex items-center gap-1 font-bold text-orange-600"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Previous Page
            </button>
          </div>
        </div>

        {/* Terms Modal */}
        <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />

      </div>
    </div>
  );
}
