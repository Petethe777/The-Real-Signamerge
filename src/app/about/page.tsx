import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Zap, 
  Star, 
  MapPin, 
  ChevronRight, 
  ArrowLeft, 
  Quote, 
  Globe, 
  Heart, 
  
  TrendingUp, 
  Target, 
  Compass, 
  Users, 
  Clock, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube,
  Music2,
  X,
  CheckCircle2,
  Lock,
  ArrowRight
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { OrangeDots } from "@/components/ui/OrangeDots";
import { TermsModal } from "@/components/TermsModal";

// 1. Initial Testimonials List
interface FloatingTestimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  avatarText: string;
  avatarColor: string;
  text: string;
  rating: number;
  initialLeft: number; // percentage left (e.g. 10 to 90)
  speed: number;       // speed of vertical fall
  platform: 'Instagram' | 'TikTok' | 'Twitter' | 'LinkedIn' | 'YouTube' | 'Reddit';
  stats: string;
}

const initialTestimonials: FloatingTestimonial[] = [
  {
    id: "testi-1",
    name: "Chris B.",
    role: "Digital Freelancer",
    location: "Cape Town, ZA",
    avatarText: "CB",
    avatarColor: "bg-orange-500",
    text: "Went from struggling to find local consulting clients to having a three-month waitlist. Unreal automated results in just days.",
    rating: 5,
    initialLeft: 8,
    speed: 0.14,
    platform: "LinkedIn",
    stats: "+140% Client Acquisition"
  },
  {
    id: "testi-2",
    name: "Sarah J.",
    role: "Marketing Director",
    location: "Austin, TX",
    avatarText: "SJ",
    avatarColor: "bg-emerald-500",
    text: "The social keyword signals are scary accurate. Found 5 high-ticket buyers in less than 3 clicks. Completely replaced cold emailing.",
    rating: 5,
    initialLeft: 78,
    speed: 0.11,
    platform: "Twitter",
    stats: "+$18,400 Outbound Revenue"
  },
  {
    id: "testi-3",
    name: "Mike R.",
    role: "SaaS Co-Founder",
    location: "Johannesburg, ZA",
    avatarText: "MR",
    avatarColor: "bg-blue-600",
    text: "Signalmerge is the exact universal sales utility we have been dreaming about. Direct buyer match-rate outperforms Google Search completely.",
    rating: 5,
    initialLeft: 18,
    speed: 0.18,
    platform: "Twitter",
    stats: "3x Direct Connection ROI"
  },
  {
    id: "testi-4",
    name: "Elena K.",
    role: "B2B Consultant",
    location: "Berlin, GER",
    avatarText: "EK",
    avatarColor: "bg-purple-600",
    text: "While legacy platforms focus purely on eyeball reach, Signalmerge delivers high-fidelity connection to buyers actively requesting help.",
    rating: 5,
    initialLeft: 84,
    speed: 0.08,
    platform: "LinkedIn",
    stats: "Zero Ad Spent Required"
  },
  {
    id: "testi-5",
    name: "Kabelo M.",
    role: "E-Commerce Founder",
    location: "Durban, ZA",
    avatarText: "KM",
    avatarColor: "bg-pink-500",
    text: "We spent thousands driving cold traffic. Signalmerge connects us straight with users who post purchase triggers. Conversion rate doubled.",
    rating: 5,
    initialLeft: 12,
    speed: 0.15,
    platform: "Instagram",
    stats: "210% Higher Intent"
  },
  {
    id: "testi-6",
    name: "David L.",
    role: "VP of Sales",
    location: "London, UK",
    avatarText: "DL",
    avatarColor: "bg-cyan-600",
    text: "Outstanding engineering from Mergemega. Direct engagement leads to actual relationships, which beats generic advertising noise of Google any day.",
    rating: 5,
    initialLeft: 72,
    speed: 0.16,
    platform: "LinkedIn",
    stats: "+40% Outbound Closing"
  },
  {
    id: "testi-7",
    name: "Naledi S.",
    role: "Growth Marketer",
    location: "Johannesburg, ZA",
    avatarText: "NS",
    avatarColor: "bg-teal-600",
    text: "The real-time crawler operates beautifully. We identify active buyer requests on Twitter and Reddit, step in first, and seal the premium deal.",
    rating: 5,
    initialLeft: 22,
    speed: 0.10,
    platform: "Reddit",
    stats: "Instant 3-Click Outreach"
  },
  {
    id: "testi-8",
    name: "James P.",
    role: "Agency Founder",
    location: "San Francisco, CA",
    avatarText: "JP",
    avatarColor: "bg-amber-600",
    text: "Our entire team is hyper-focused on hot active prospects now. The local intelligence module driven by our own small language model operates smoothly and transparently.",
    rating: 5,
    initialLeft: 80,
    speed: 0.13,
    platform: "YouTube",
    stats: "Save 12 Hours Weekly"
  }
];

// Timeline milestones for interactive sales timeline
const successTimeline = [
  {
    day: "Day 1",
    title: "Connection Audit",
    explanation: "Our crawlers immediately map your custom industry keywords (e.g. 'need landing page', 'hire n8n expert') across the social media grid.",
    badge: "Calibration Active",
    previewCode: `Crawler Node: ONLINE\nTargeting: 5 Platforms\nKeywords Configured: True`,
    stat: "Scanning 10,000+ posts/min"
  },
  {
    day: "Day 3",
    title: "Intention Identification",
    explanation: "Advanced intent classifiers running on our own small language model filter out general chit-chat and highlight users exhibiting verified ready-to-buy signal behavior.",
    badge: "Intent Signal Lock",
    previewCode: `Parsing Signifiers...\nSignal Found: "Looking for an expert..."\nConfidence: 97% Verified`,
    stat: "High-Intent Signal List Locked"
  },
  {
    day: "Day 7",
    title: "The Direct Connection",
    explanation: "Instead of burning money on cold ads hoping for clicks, your sales team directly starts customized handshakes on LinkedIn, Twitter or Instagram in just 3 clicks.",
    badge: "Direct Handshake",
    previewCode: `Direct Link Generated: x.com/prospect\nEngagement Trigger: Auto-Generated\nStatus: Connection Outbound`,
    stat: "92% Open Rate vs 1.2% cold reach"
  },
  {
    day: "Day 30",
    title: "Sales Outperformance",
    explanation: "A fully calibrated, automated intelligence pipeline now drives client bookings around the clock, completely outperforming legacy Google/Meta spend.",
    badge: "Performance Sovereign",
    previewCode: `Outbound CAC: -83%\nOverall Deal Flow: +400%\nUniversal Infrastructure: Absolute`,
    stat: "$4,500+ average added monthly cashflow"
  }
];

export default function AboutPage() {
  const navigate = useNavigate();
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [focusedTestimonial, setFocusedTestimonial] = useState<FloatingTestimonial | null>(null);
  const [activeTimelineIdx, setActiveTimelineIdx] = useState(0);

  // States to keep track of dynamic Y positions for moving particles
  const [testimonialsPos, setTestimonialsPos] = useState<
    { id: string; topVal: number; leftVal: number; isHovered: boolean }[]
  >([]);

  // Initialize randomized top offsets across the vertical screen
  useEffect(() => {
    const initialized = initialTestimonials.map((t, idx) => ({
      id: t.id,
      // Stagger them nicely throughout the scrollable height
      topVal: idx * 11 + Math.random() * 8, // percentages
      leftVal: t.initialLeft,
      isHovered: false,
    }));
    setTestimonialsPos(initialized);
  }, []);

  // Frame loop updater for fluid downwards drift
  useEffect(() => {
    let animId: number;
    const update = () => {
      setTestimonialsPos((prev) =>
        prev.map((p) => {
          if (p.isHovered) return p; // Pause floating on mouse hover
          const config = initialTestimonials.find((t) => t.id === p.id);
          const currentSpeed = config ? config.speed : 0.1;
          let nextTop = p.topVal + currentSpeed;
          // If it drifts past the screen floor, wrap back to top with randomized horizontal repositioning
          if (nextTop > 105) {
            nextTop = -12;
            const newLeft = 5 + Math.random() * 90;
            return { ...p, topVal: nextTop, leftVal: newLeft };
          }
          return { ...p, topVal: nextTop };
        })
      );
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleHoverChange = (id: string, hovered: boolean) => {
    setTestimonialsPos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isHovered: hovered } : p))
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-zinc-900 selection:bg-orange-500 selection:text-white relative overflow-hidden flex flex-col justify-between">
      
      {/* Decorative Gradient Overlays */}
      <div className="absolute top-0 inset-x-0 h-[800px] bg-gradient-to-b from-orange-500/5 via-transparent to-transparent pointer-events-none z-0" />
      <OrangeDots />

      {/* Floating Testimonials - Viewport Drifting Layer (Fixed background) */}
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
        {testimonialsPos.map((pos) => {
          const original = initialTestimonials.find((t) => t.id === pos.id);
          if (!original) return null;
          return (
            <div
              key={pos.id}
              style={{
                top: `${pos.topVal}vh`,
                left: `${pos.leftVal}%`,
              }}
              className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-300"
              onMouseEnter={() => handleHoverChange(pos.id, true)}
              onMouseLeave={() => handleHoverChange(pos.id, false)}
            >
              <button
                onClick={() => setFocusedTestimonial(original)}
                className={`flex flex-col text-left max-w-[200px] sm:max-w-[260px] p-3 sm:p-4 rounded-2xl bg-black border border-zinc-800 shadow-[0_10px_35px_-8px_rgba(0,0,0,0.5)] backdrop-blur-md outline-none focus:outline-none transition-all active:scale-95 ${
                  pos.isHovered ? "scale-105 border-zinc-700 shadow-[0_20px_50px_rgba(0,0,0,0.7)] z-40" : "opacity-90 scale-95"
                }`}
                title="Click to zoom testimony"
              >
                {/* 5 Stars */}
                <div className="flex gap-0.5 mb-1.5 shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                {/* Text Snippet */}
                <p className="text-[10px] sm:text-xs text-zinc-100 font-medium leading-relaxed italic line-clamp-2 select-none pointer-events-none">
                  "{original.text}"
                </p>
                {/* User Intro */}
                <div className="mt-2 flex items-center gap-1.5 pointer-events-none">
                  <div className={`w-5 h-5 rounded-md ${original.avatarColor} text-[8px] font-bold text-white flex items-center justify-center shrink-0`}>
                    {original.avatarText}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[8px] sm:text-[9px] font-black text-white truncate">{original.name}</p>
                    <p className="text-[7px] sm:text-[8px] font-medium text-zinc-400 truncate">{original.role}</p>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Header / Nav Area */}
      <header className="relative z-30 max-w-7xl mx-auto w-full px-4 sm:px-8 py-5">
        <div className="flex justify-between items-center bg-white/60 backdrop-blur-md border border-orange-500/10 rounded-2xl px-5 py-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm group-hover:bg-black transition-colors duration-300">
              <Zap className="text-white w-4 h-4 fill-white animate-pulse" />
            </div>
            <span className="text-lg font-black tracking-tight text-[#111]">Signalmerge</span>
          </Link>
          
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-black text-gray-500 hover:text-primary uppercase tracking-wider bg-white/80 border border-gray-100 hover:border-orange-200 px-4 py-2 rounded-xl transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        </div>
      </header>

      {/* Main Layout Grid */}
      <main className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-20 sm:space-y-32 flex-1 w-full">
        
        {/* HERO SECTION: Origin Story & Vision Focus */}
        <section className="text-center space-y-6 pt-6 sm:pt-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/5 text-primary text-[10px] font-black tracking-widest uppercase shadow-sm"
          >
            <Zap className="w-3.5 h-3.5" />
            Real-Time Sales Sovereign
          </motion.div>

          <h1 className="inline-block bg-white px-6 py-4 rounded-3xl border border-orange-100 shadow-[0_10px_35px_-8px_rgba(249,115,22,0.15)] text-4xl sm:text-6xl md:text-7xl font-black text-[#111] tracking-tighter leading-none">
            Focused on <br />
            <span className="text-primary italic underline decoration-wavy underline-offset-8">Connection</span>, <br />
            not outreach.
          </h1>

          <p className="max-w-2xl mx-auto bg-white p-5 rounded-2xl border border-orange-100 shadow-[0_10px_35px_-8px_rgba(249,115,22,0.15)] text-base sm:text-lg text-zinc-550 font-medium leading-relaxed">
            Signalmerge is compiling a universal online sales infrastructure for companies worldwide, designed to fundamentally outperform Meta and Google, delivering pure customer connection opportunities in just 3 clicks.
          </p>

          <div className="flex justify-center gap-4 pt-4">
            <Link 
              to="/dashboard"
              className="bg-[#111] hover:bg-black text-white text-xs font-black uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-lg shadow-black/10 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Initialize Intent Engine
            </Link>
          </div>
        </section>

        {/* STATS STRIP */}
        <section className="bg-white/80 border border-orange-100/60 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl shadow-orange-500/5 grid grid-cols-1 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-orange-100">
          <div className="pt-4 md:pt-0">
            <h4 className="text-4xl font-black text-primary leading-none">Global</h4>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-2">Companies Worldwide</p>
          </div>
          <div className="pt-4 md:pt-0 md:pl-4">
            <h4 className="text-4xl font-black text-zinc-900 leading-none">2021</h4>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-2">First Version Launched</p>
          </div>
          <div className="pt-4 md:pt-0 md:pl-4">
            <h4 className="text-4xl font-black text-zinc-900 leading-none">2026</h4>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-2">Engine 4.0 Built</p>
          </div>
          <div className="pt-4 md:pt-0 md:pl-4">
            <h4 className="text-4xl font-black text-zinc-900 leading-none">3 Click</h4>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-2">Universal Handshake</p>
          </div>
        </section>

        {/* HOW TO IDENTIFY CLIENTS IN REAL-TIME */}
        <section className="space-y-8">
          <div className="text-center space-y-4 flex flex-col items-center">
            <span className="text-xs font-black text-primary uppercase tracking-[0.2em] block">The System Architecture</span>
            <h2 className="inline-block bg-white px-6 py-3.5 rounded-2xl border border-orange-100 shadow-[0_8px_25px_rgba(249,115,22,0.12)] text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
              Direct Sales vs. Spray-and-Pray Reach
            </h2>
            <p className="max-w-xl mx-auto bg-white p-4 rounded-xl border border-orange-100 shadow-[0_6px_18px_rgba(249,115,22,0.1)] text-sm text-zinc-500 font-bold leading-relaxed">
              Legacy networks like Google and Meta sell you ad impressions—passive eyeballs that rarely convert. We scan platforms for high-intent signals so we can connect you directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-4">
            {/* The Old Reach Model */}
            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4 flex flex-col items-start">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                  <X className="w-5 h-5" />
                </div>
                <h3 className="bg-white px-4 py-2 rounded-xl border border-orange-100 shadow-[0_6px_15px_rgba(249,115,22,0.08)] text-xl font-black text-zinc-900 inline-block">Legacy Reach Advertisements</h3>
                <p className="bg-white p-4 rounded-xl border border-orange-100 shadow-[0_6px_15px_rgba(249,115,22,0.08)] text-xs text-zinc-500 font-medium leading-relaxed block">
                  You spend thousands bidding on broad keywords or random demographic metrics. They stream your banner ad to thousands of passive, disinterested feeds, charging for accidental clicks that lead to dead-ends.
                </p>
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2 text-[11px] font-bold text-red-550">
                <div className="flex justify-between">
                  <span>Average Cost per Click:</span>
                  <span className="font-mono text-zinc-700">$3.80 - $6.50</span>
                </div>
                <div className="flex justify-between">
                  <span>Actual conversion intent:</span>
                  <span className="font-mono text-zinc-700">Less than 1.5%</span>
                </div>
              </div>
            </div>

            {/* The Real-Time connection Model */}
            <div className="bg-white border-2 border-orange-150/80 rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xl shadow-orange-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl">
                The Connection Absolute
              </div>
              <div className="space-y-4 flex flex-col items-start">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-primary">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="bg-white px-4 py-2 rounded-xl border border-orange-100 shadow-[0_6px_18px_rgba(249,115,22,0.12)] text-xl font-black text-zinc-900 inline-block">Signalmerge Intent Sniffers</h3>
                <p className="bg-white p-4 rounded-xl border border-orange-100 shadow-[0_6px_18px_rgba(249,115,22,0.12)] text-xs text-zinc-550 font-medium leading-relaxed block">
                  We monitor continuous channels. When a manager posts "Looking for a custom designer" or "Can anyone recommend a good outreach tool?", we capture the signal, match it with your ICP metrics via LLM, and provide their direct handle immediately.
                </p>
              </div>
              <div className="border-t border-orange-100 pt-4 space-y-2 text-[11px] font-bold text-primary">
                <div className="flex justify-between">
                  <span>Success Connection Method:</span>
                  <span className="font-mono text-zinc-700">Direct Message</span>
                </div>
                <div className="flex justify-between">
                  <span>Inherent Purchase Intention:</span>
                  <span className="font-mono text-zinc-700">100% Active</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOUNDER'S STORY SECTION */}
        <section className="relative rounded-[3rem] bg-white border border-gray-150 p-6 sm:p-12 overflow-hidden shadow-2xl">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Col: Photo & Name Label */}
            <div className="lg:col-span-5 flex flex-col items-center space-y-4">
              <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-full overflow-hidden border-4 border-orange-100 shadow-xl group">
                <img 
                  src="/Peter Profile.png"
                  alt="Founder Peter"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
              </div>
              
              <div className="text-center space-y-2 flex flex-col items-center">
                <h4 className="bg-white px-4 py-2 rounded-xl border border-orange-100 shadow-[0_6px_15px_rgba(249,115,22,0.1)] text-lg font-black text-zinc-900 inline-block text-center">Peter</h4>
                <p className="bg-white px-3 py-1.5 rounded-lg border border-orange-100 shadow-[0_4px_12px_rgba(249,115,22,0.08)] text-[10px] font-black text-primary uppercase tracking-widest mt-2 block w-fit">Founder/Director, Mergemega (Pty) Ltd</p>
                <div className="flex gap-1.5 items-center justify-center mt-2 text-zinc-400 font-bold text-xs">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>Durban, SA</span>
                </div>
              </div>
            </div>

            {/* Right Col: Letter Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2">
                <Quote className="w-8 h-8 text-orange-200 fill-orange-100/40 shrink-0" />
                <h3 className="bg-white px-5 py-2.5 rounded-xl border border-orange-100 shadow-[0_6px_18px_rgba(249,115,22,0.12)] text-2xl font-black text-[#111] tracking-tight inline-block">The Mergemega Pipeline</h3>
              </div>
              
              <div className="space-y-4 text-xs sm:text-sm text-zinc-650 font-medium leading-relaxed">
                <p className="bg-white p-4 rounded-xl border border-orange-100 shadow-[0_6px_15px_rgba(249,115,22,0.08)] block">
                  In 2021, we launched the first version of <span className="font-bold text-black uppercase">Signalmerge</span> to build standard digital bridges so companies worldwide could find clients and access global cashflow systems seamlessly, without the crippling friction of massive gatekeepers.
                </p>
                <p className="bg-white p-4 rounded-xl border border-orange-100 shadow-[0_6px_15px_rgba(249,115,22,0.08)] block">
                  Over the years, we scaled and refined our technology. In 2026, we built <span className="text-primary font-black uppercase">Signalmerge Engine 4.0</span>, powered entirely by our own custom-engineered small language model. This proprietary local intelligence bypasses expensive advertising spend and finds active high-intent buyers in real-time.
                </p>
                <p className="bg-white p-4 rounded-xl border border-orange-100 shadow-[0_6px_15px_rgba(249,115,22,0.08)] block">
                  By focusing purely on direct, authentic customer connection rather than broadcast reach, Signalmerge helps companies scale worldwide. Connecting businesses that are actively seeking solutions with the providers equipped to deliver them. It's that simple. 
                </p>
                <p className="bg-white p-4 rounded-xl border border-orange-100 shadow-[0_6px_15px_rgba(249,115,22,0.08)] font-bold text-[#111] italic block">
                  "Let's remove the expensive billboard fees. Let's make connections authentic, direct, and immediate."
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* TIMELINE SECTION: INTERACTIVE CUSTOMER SATISFACTION EXPECTATIONS */}
        <section className="space-y-8">
          <div className="text-center space-y-4 flex flex-col items-center">
            <span className="text-xs font-black text-primary uppercase tracking-[0.2em] block">Client Path Timeline</span>
            <h2 className="bg-white px-6 py-3 rounded-2xl border border-orange-100 shadow-[0_8px_25px_rgba(249,115,22,0.12)] text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight inline-block">
              Interactive Success Roadmap
            </h2>
            <p className="max-w-xl mx-auto bg-white p-4 rounded-xl border border-orange-100 shadow-[0_6px_18px_rgba(249,115,22,0.1)] text-sm text-zinc-500 font-bold block">
              What can a business owner expect within the first month? Toggle the milestone stages below to view technical execution presets.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Interactive Timeline Tabs (Left Col) */}
            <div className="lg:col-span-5 space-y-3">
              {successTimeline.map((item, idx) => {
                const isActive = idx === activeTimelineIdx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveTimelineIdx(idx)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all text-sm flex items-start gap-3 outline-none focus:outline-none ${
                      isActive 
                        ? "bg-white border-primary shadow-lg shadow-orange-500/5 scale-[1.01]" 
                        : "bg-white/50 border-gray-150 hover:bg-white hover:border-orange-200"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-mono text-xs font-black ${
                      isActive ? "bg-primary text-white" : "bg-zinc-100 text-zinc-500"
                    }`}>
                      {item.day.replace("Day ", "")}
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#111]">{item.title}</span>
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider bg-orange-50 text-primary border border-primary/10">
                          {item.day}
                        </span>
                      </div>
                      <p className={`bg-white px-2.5 py-1 rounded-lg border border-orange-100 shadow-[0_4px_10px_rgba(249,115,22,0.06)] text-zinc-500 text-xs font-medium leading-normal mt-1 block transition-all duration-300 ${
                        isActive ? "whitespace-normal break-words" : "truncate"
                      }`}>
                        {item.explanation}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Interactive Preview Panel (Right Col) */}
            <div className="lg:col-span-7 bg-[#111] rounded-[2rem] p-6 text-zinc-300 font-mono text-xs shadow-2xl relative overflow-hidden flex flex-col justify-between h-[360px]">
              
              {/* Fake Terminal Chrome Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-zinc-500 text-[10px] ml-2 font-bold">signalmerge_process_node.py</span>
                </div>
                <div className="bg-primary/10 text-primary text-[9px] font-bold px-2.5 py-0.5 rounded-full border border-primary/20">
                  {successTimeline[activeTimelineIdx].badge}
                </div>
              </div>

              {/* Technical Code Preview */}
              <div className="flex-1 space-y-4">
                <div>
                  <span className="text-primary font-black">❯ import</span> signalmerge_sdk_v4 as sm
                  <br />
                  <span className="text-primary font-black">❯ client</span> = sm.connect(project_id="mergemega_za")
                </div>

                <div className="p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-800 text-emerald-400">
                  <pre className="whitespace-pre-wrap leading-relaxed font-semibold">
                    {successTimeline[activeTimelineIdx].previewCode}
                  </pre>
                </div>

                <div className="text-zinc-500 italic text-[11px]">
                  # Real-Time Outcomes Metrics:
                  <div className="text-zinc-300 font-bold block mt-1">
                    {successTimeline[activeTimelineIdx].stat}
                  </div>
                </div>
              </div>

              {/* Fake Terminal Footer */}
              <div className="border-t border-zinc-800 pt-3 mt-4 flex items-center justify-between text-zinc-600 text-[10px]">
                <span>System Host: Signalmerge_Engine_Infrastructure</span>
                <span>Active Step: {activeTimelineIdx + 1}/4</span>
              </div>
            </div>

          </div>
        </section>

        {/* GLOBAL CLIENT INTELLIGENCE SOVEREIGNTY BAR */}
        <section className="border-t border-gray-150 pt-16 flex flex-col items-center text-center space-y-6">
          
          {/* Globe Logo Visualization */}
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-primary border border-orange-100">
            <Globe className="w-5 h-5 animate-spin-slow text-primary" style={{ animationDuration: '15s' }} />
          </div>

          <div className="space-y-4 flex flex-col items-center">
            <h3 className="bg-white px-5 py-2.5 rounded-xl border border-orange-100 shadow-[0_6px_15px_rgba(249,115,22,0.1)] text-lg font-black text-zinc-900 tracking-wider uppercase inline-block">Global Client Intelligence</h3>
            <p className="max-w-xl bg-white p-4 rounded-xl border border-orange-100 shadow-[0_6px_18px_rgba(249,115,22,0.12)] text-xs sm:text-sm text-zinc-550 font-medium leading-relaxed block">
              Signalmerge is fully owned and conceptualized by <span className="font-bold underline text-zinc-800">Mergemega (Pty) Ltd</span>, serving progressive companies worldwide. Initially launched in 2021 and scale-engineered as Engine 4.0 in 2026, our systems operate globally to connect high-intent clients with absolute, friction-free precision.
            </p>
          </div>

          <div className="text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase">
            Serving Companies Worldwide • Durban Roots
          </div>
        </section>

      </main>

      <Footer onTermsClick={() => setIsTermsModalOpen(true)} />
      <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />

      {/* ZOOM MODAL FOR FLOATING TESTIMONIAL DETAIL */}
      <AnimatePresence>
        {focusedTestimonial && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop click to dismiss */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFocusedTestimonial(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative bg-black w-full max-w-lg rounded-[2.5rem] border border-zinc-805 shadow-2xl p-6 sm:p-10 text-center space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setFocusedTestimonial(null)}
                className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-full transition-colors outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-orange-500 via-primary to-orange-400" />

              {/* Avatar circle */}
              <div className="mx-auto flex items-center justify-center mt-4">
                <div className={`w-16 h-16 rounded-2xl ${focusedTestimonial.avatarColor} text-white font-black text-xl flex items-center justify-center shadow-lg shadow-black/40`}>
                  {focusedTestimonial.avatarText}
                </div>
              </div>

              {/* Name Details */}
              <div>
                <span className="text-[10px] font-black text-white bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 uppercase tracking-widest leading-none">
                  Verified Client Signal
                </span>
                <h3 className="text-xl font-black text-white mt-3">{focusedTestimonial.name}</h3>
                <p className="text-xs text-zinc-400 font-bold">{focusedTestimonial.role}</p>
                <div className="flex gap-1 items-center justify-center text-zinc-450 text-[11px] font-bold mt-1">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{focusedTestimonial.location}</span>
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex justify-center gap-1">
                {[...Array(focusedTestimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Large quote */}
              <div className="relative p-5 bg-zinc-900 rounded-2xl border border-zinc-800 text-left">
                <Quote className="absolute -top-3 left-4 w-7 h-7 text-zinc-800 fill-zinc-805/20" />
                <p className="text-zinc-100 text-sm sm:text-base font-medium leading-relaxed italic text-center pt-2 select-text">
                  "{focusedTestimonial.text}"
                </p>
              </div>

              {/* Statistics & platform Badge info */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800 pt-4 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 uppercase tracking-wider">Acquisition Metric:</span>
                  <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2 py-1 rounded-lg">
                    {focusedTestimonial.stats}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] uppercase font-black uppercase">
                  <span>Source Platform: </span>
                  <span className="text-white">{focusedTestimonial.platform}</span>
                </div>
              </div>

              <div>
                <button 
                  onClick={() => {
                    setFocusedTestimonial(null);
                  }}
                  className="w-full bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider py-3.5 rounded-xl transition-all"
                >
                  Return to About Page
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
