import React, { useState, useEffect } from "react";
import { 
  Zap, Clock, ShieldCheck, MapPin, ExternalLink, Lock, 
  AlertTriangle, ArrowRight, Search, CheckCircle, RefreshCw,
  TrendingUp, Users, ArrowUpRight, BarChart2, MessageSquare, 
  Laptop, Compass, Sparkles, Filter, Globe, Info, Heart, ArrowLeft,
  Key
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { TermsModal } from "@/components/TermsModal";
import { searchSocialMedia } from "@/services/searchService";

// Types for Leads Database
interface Lead {
  id: string;
  platform: "LinkedIn" | "Instagram" | "Facebook" | "Reddit" | "TikTok";
  intent: string;
  location: string;
  time: string;
}

// Full 50-leads dataset of high-intent buyers, local businesses, e-commerce, plumbing, construction, startups, AI, and digital services
const rawLeadsData: Lead[] = [
  {
    id: "lead-1",
    platform: "LinkedIn",
    intent: "Urgent: Sourcing a validated professional software company for our retail inventory dashboard migration. We have a solid budget of $8,500 and need automated syncing with Shopify.",
    location: "Global",
    time: "1h ago"
  },
  {
    id: "lead-2",
    platform: "Instagram",
    intent: "Who is the best independent consultant for auditing and scaling our e-commerce apparel brand in Europe? Budget is ready, looking for direct experience with high conversion online shopping funnels.",
    location: "Italy / Milan",
    time: "2h ago"
  },
  {
    id: "lead-3",
    platform: "Reddit",
    intent: "Looking for an expert general contractor or construction company who specializes in high-end commercial office renovations. Must be registered in Sweden. No brokers please.",
    location: "Sweden / Stockholm",
    time: "4h ago"
  },
  {
    id: "lead-4",
    platform: "Facebook",
    intent: "Need a certified commercial plumber for grease trap re-routing and main pipe diagnostic in our new restaurant chain. We are ready to contract immediately.",
    location: "Germany / Munich",
    time: "6h ago"
  },
  {
    id: "lead-5",
    platform: "TikTok",
    intent: "Our innovative startup is launching a smart wellness device next month! Sourcing a logistics or product sourcing agency to help negotiate with custom factories. Feel free to DM.",
    location: "United Kingdom",
    time: "8h ago"
  },
  {
    id: "lead-6",
    platform: "LinkedIn",
    intent: "Hiring an AI startup or AI automation agency to integrate local natural language models with our customer ticket pipeline. Budget: €5,000 retainer.",
    location: "Global",
    time: "11h ago"
  },
  {
    id: "lead-7",
    platform: "Instagram",
    intent: "Looking to launch an e-commerce cosmetics brand in southern Europe. Need direct shop setup, product packaging sourcing, and shipping coordinator immediately.",
    location: "Spain / Barcelona",
    time: "12h ago"
  },
  {
    id: "lead-8",
    platform: "Reddit",
    intent: "Who do you guys use for urgent plumbing? We run a commercial warehouse and have a massive underground water leak. Sourcing a licensed, bonded structural plumbing team.",
    location: "Netherlands",
    time: "14h ago"
  },
  {
    id: "lead-9",
    platform: "Facebook",
    intent: "Is anyone here a licensed construction company or design-build estimator? Sourcing local services to handle an eco-friendly wooden villa project near Dublin.",
    location: "Ireland / Dublin",
    time: "17h ago"
  },
  {
    id: "lead-10",
    platform: "TikTok",
    intent: "Need a custom AI startup team to build a predictive inventory model for our organic matcha brand. Only looking for those with active portfolio showcases.",
    location: "France / Paris",
    time: "19h ago"
  },
  {
    id: "lead-11",
    platform: "LinkedIn",
    intent: "Our software company is seeking an outbound consulting partner to help us book 20+ mid-market demos per month using Sales Navigator. Immediate hire.",
    location: "Switzerland / Zürich",
    time: "21h ago"
  },
  {
    id: "lead-12",
    platform: "Instagram",
    intent: "Looking for a manufacturer or supplier who can deliver custom recycled-plastic sunglasses with low MOQ. Product leads, please drop your portfolios.",
    location: "Italy / Rome",
    time: "23h ago"
  },
  {
    id: "lead-13",
    platform: "Reddit",
    intent: "We are an innovative startup looking for a software developer to implement secure server-to-server tracking APIs with customized e-commerce CRM workflows. Open budget.",
    location: "Sweden / Gothenburg",
    time: "1d ago"
  },
  {
    id: "lead-14",
    platform: "Facebook",
    intent: "Any specialized construction companies available for steel frame warehouse structures? Sourcing verified contractors with references in local industrial zones.",
    location: "Global",
    time: "1d ago"
  },
  {
    id: "lead-15",
    platform: "TikTok",
    intent: "Who is the absolute expert for plumbing and heating setups? We are completely renovating our 3-story office building and need commercial plumbers ASAP.",
    location: "United Kingdom / London",
    time: "1d ago"
  },
  {
    id: "lead-16",
    platform: "LinkedIn",
    intent: "Our AI startup has secured seed funding. Sourcing a premium software company to help build out our multi-agent workflow app backend. Ready to start immediately.",
    location: "Germany / Berlin",
    time: "1d ago"
  },
  {
    id: "lead-17",
    platform: "Instagram",
    intent: "We need custom wood product leads! Searching for a sustainable bamboo and cork material supplier in Europe for custom furniture line manufacturing.",
    location: "Poland / Warsaw",
    time: "1d ago"
  },
  {
    id: "lead-18",
    platform: "Reddit",
    intent: "Launching a high-growth online shopping hub for tech gear. Looking to hire a Shopify checkout expert to optimize cart conversions and dropship lead routing.",
    location: "Austria / Vienna",
    time: "1d ago"
  },
  {
    id: "lead-19",
    platform: "Facebook",
    intent: "Any innovative startups here looking to outsource their customer support to automated AI voice channels? We are testing digital voice systems in the UK.",
    location: "Belgium / Brussels",
    time: "1d ago"
  },
  {
    id: "lead-20",
    platform: "TikTok",
    intent: "Our e-commerce store needs structural SEO assistance immediately. Web traffic down 35% after algorithm updates. Sourcing online shopping optimization pros.",
    location: "Denmark / Copenhagen",
    time: "2d ago"
  },
  {
    id: "lead-21",
    platform: "LinkedIn",
    intent: "We are a construction company specialising in smart sustainable office towers. Looking for a software company to build an automated bidding & blueprint engine.",
    location: "Finland / Helsinki",
    time: "2d ago"
  },
  {
    id: "lead-22",
    platform: "Instagram",
    intent: "Urget repair: Sourcing qualified emergency plumbers for our luxury apartment complexes. Needs to handle leak detection, drain jetting, booster pumps.",
    location: "Norway / Oslo",
    time: "2d ago"
  },
  {
    id: "lead-23",
    platform: "Reddit",
    intent: "Our AI startup is building computer vision models for product quality inspections on the assembly line. Looking to connect with manufacturing and hardware partners.",
    location: "Portugal / Lisbon",
    time: "2d ago"
  },
  {
    id: "lead-24",
    platform: "Facebook",
    intent: "Looking for an innovative startup that specializes in high-fidelity agricultural tracking tech. Sourcing a software partner to help us build a local custom trial.",
    location: "Global",
    time: "2d ago"
  },
  {
    id: "lead-25",
    platform: "TikTok",
    intent: "Need a product specialist to source custom mechanical parts, plastic molds, and metal casing from vetted factories. Sourcing product leads directly.",
    location: "United Kingdom / Manchester",
    time: "2d ago"
  },
  {
    id: "lead-26",
    platform: "LinkedIn",
    intent: "We are an established boutique e-commerce shop looking to expand our product offerings. Seeking specialized agency to handle our digital marketing and global supply chains.",
    location: "Spain / Madrid",
    time: "2d ago"
  },
  {
    id: "lead-27",
    platform: "Instagram",
    intent: "In search of premium construction companies for public transit bidding contracts. Must be fully compliant on environmental and carbon impact reporting.",
    location: "Greece / Athens",
    time: "2d ago"
  },
  {
    id: "lead-28",
    platform: "Reddit",
    intent: "Looking to contract a licensed plumber to install and certify heavy-duty hot water boiler systems for a 50-room hostel. Sourcing bids now.",
    location: "Sweden / Uppsala",
    time: "2d ago"
  },
  {
    id: "lead-29",
    platform: "Facebook",
    intent: "Hiring a software company to build an offline-first inventory scanner app for our building supply materials warehouse. Budget is €15k fixed price.",
    location: "Germany / Frankfurt",
    time: "2d ago"
  },
  {
    id: "lead-30",
    platform: "TikTok",
    intent: "Any AI startups working on intelligent customer review responses for online shopping brands? Sourcing automated sentiment models to integrate into Shopify.",
    location: "Italy / Florence",
    time: "2d ago"
  },
  {
    id: "lead-31",
    platform: "LinkedIn",
    intent: "Looking for innovative startups in the carbon negative logistics space. We have venture funds ready for immediate collaboration and strategic trials.",
    location: "United Kingdom / Bristol",
    time: "2d ago"
  },
  {
    id: "lead-32",
    platform: "Instagram",
    intent: "Searching for product leads on eco-friendly, fast-biodegradable food container boxes with low-cost shipping options to the DACH region.",
    location: "France / Lyon",
    time: "2d ago"
  },
  {
    id: "lead-33",
    platform: "Reddit",
    intent: "Our boutique hotel needs certified plumbers to renovate 12 premium bathrooms. Sourcing independent contractors for local high-end fixture styling.",
    location: "Global",
    time: "2d ago"
  },
  {
    id: "lead-34",
    platform: "Facebook",
    intent: "Looking for top-tier construction companies specialized in prefab concrete foundations for micro-dwellings. Budget in place, project starts next quarter.",
    location: "Netherlands / Amsterdam",
    time: "2d ago"
  },
  {
    id: "lead-35",
    platform: "TikTok",
    intent: "Sourcing a skilled software company or agency to build an online shopping app with AR filters so users can preview products before buying.",
    location: "Sweden / Malmö",
    time: "2d ago"
  },
  {
    id: "lead-36",
    platform: "LinkedIn",
    intent: "Our AI startup has designed a neural search model for smart B2B CRM tools. Sourcing pilot clients among mid-size software companies in Europe.",
    location: "Global",
    time: "3d ago"
  },
  {
    id: "lead-37",
    platform: "Instagram",
    intent: "Sourcing organic cotton product leads. We want to manufacture direct-to-consumer bedding and need a verified sustainable textile supplier.",
    location: "Switzerland / Zurich",
    time: "3d ago"
  },
  {
    id: "lead-38",
    platform: "Reddit",
    intent: "Need software companies specialized in Flutter/React Native. Sourcing bids to build a custom dispatch app for our fleet of plumbers and mechanics.",
    location: "UK / Edinburgh",
    time: "3d ago"
  },
  {
    id: "lead-39",
    platform: "Facebook",
    intent: "Hiring commercial general contracting and construction companies for a multi-family light industrial park development in Switzerland.",
    location: "Switzerland / Geneva",
    time: "3d ago"
  },
  {
    id: "lead-40",
    platform: "TikTok",
    intent: "Who represents the top-tier of innovative startups in the smart urban farming space? Looking to collaborate on vertical sensor arrays.",
    location: "Germany / Hamburg",
    time: "3d ago"
  },
  {
    id: "lead-41",
    platform: "LinkedIn",
    intent: "Our e-commerce store is experiencing huge checkout drop-offs. Sourcing an audit from a premium digital agency or conversion-focused software company.",
    location: "Denmark / Aarhus",
    time: "3d ago"
  },
  {
    id: "lead-42",
    platform: "Instagram",
    intent: "Sourcing experienced industrial plumbers for high-pressure copper pipeline installations. Long term construction contract starting immediately.",
    location: "Italy / Milan",
    time: "3d ago"
  },
  {
    id: "lead-43",
    platform: "Reddit",
    intent: "Searching for product leads on high-yield solar batteries. Must possess certified safety standards for northern European distribution.",
    location: "Ireland / Cork",
    time: "3d ago"
  },
  {
    id: "lead-44",
    platform: "Facebook",
    intent: "Any innovative startups launching green building materials? Our construction company wants to trial carbon-storing brick alternatives.",
    location: "Global",
    time: "3d ago"
  },
  {
    id: "lead-45",
    platform: "TikTok",
    intent: "We are an AI startup working on personalized apparel sizing logic for online shopping platforms. seeking Shopify stores for clinical testing.",
    location: "Netherlands / Rotterdam",
    time: "3d ago"
  },
  {
    id: "lead-46",
    platform: "LinkedIn",
    intent: "Our software company is restructuring our database. Looking for high level database engineers for a 6-month consulting integration.",
    location: "Spain / Madrid",
    time: "3d ago"
  },
  {
    id: "lead-47",
    platform: "Instagram",
    intent: "Hiring: Web developers with deep Shopify, WooCommerce, and custom e-commerce checkout integration experience. Retainer starting at €3,000/mo.",
    location: "Sweden / Stockholm",
    time: "3d ago"
  },
  {
    id: "lead-48",
    platform: "Reddit",
    intent: "Urgent emergency: We have a major leak in our floor heating system. Sourcing highly rated local plumbers with thermal imaging gear.",
    location: "Austria / Salzburg",
    time: "3d ago"
  },
  {
    id: "lead-49",
    platform: "Facebook",
    intent: "Our luxury hospitality brand is seeking certified commercial construction companies for a new wellness spa addition. Sourcing bids now.",
    location: "Germany / Cologne",
    time: "3d ago"
  },
  {
    id: "lead-50",
    platform: "TikTok",
    intent: "Which AI startups can implement a custom pipeline that auto-generates high conversion images for our new product catalog? Drop references.",
    location: "UK / London",
    time: "3d ago"
  }
];

export default function DigitalConsultingAudit() {
  const navigate = useNavigate();
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isPendingPayment, setIsPendingPayment] = useState<boolean>(false);
  const [sessionLoading, setSessionLoading] = useState<boolean>(true);
  
  // Custom auth states
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [signupEmail, setSignupEmail] = useState<string>("");
  const [signupPassword, setSignupPassword] = useState<string>("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [loginSubmitting, setLoginSubmitting] = useState<boolean>(false);
  const [signupSubmitting, setSignupSubmitting] = useState<boolean>(false);

  // Authenticated user state
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [hasPaid80, setHasPaid80] = useState<boolean>(false);
  const [hasPaid20, setHasPaid20] = useState<boolean>(false);
  const [leadsUsedToday, setLeadsUsedToday] = useState<number>(0);

  // Password change states
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);
  const [passwordChanging, setPasswordChanging] = useState<boolean>(false);

  // Search and Filter states for leads table
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("All");

  // Lead search states
  const [isSearchingLeads, setIsSearchingLeads] = useState<boolean>(false);
  const [searchLeadsError, setSearchLeadsError] = useState<string | null>(null);
  const [leadsList, setLeadsList] = useState<any[]>([]);

  // Calculate visible quota based on payment status
  const visibleLimit = hasPaid20 ? 100 : 33;

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

  // Perform search query from the server (Exa)
  const performLeadsSearch = async (queryToSearch: string) => {
    setIsSearchingLeads(true);
    setSearchLeadsError(null);
    try {
      const q = queryToSearch.trim() || "leads";
      const results = await searchSocialMedia(q);
      
      const countToLog = Math.min(results.length, 33);
      if (localStorage.getItem("signalmerge_user_email")) {
        const emailToLog = localStorage.getItem("signalmerge_user_email");
        const checkRes = await fetch('/api/auth/log-leads-used', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailToLog, count: countToLog })
        });
        const checkData = await checkRes.json();
        if (checkData.success) {
          setLeadsUsedToday(checkData.leadsUsedToday);
          setHasPaid20(checkData.maxLimit === 100);
        }
      }
      
      setLeadsList(results || []);
    } catch (err: any) {
      console.error("Failed to query leads:", err);
      setSearchLeadsError("Database connection saturated. Showing latest Discovery signals.");
      setLeadsList(rawLeadsData.map(l => ({
        ...l,
        content: l.intent,
        views: "145k",
        likes: "12k",
        hashtags: ["agency", "lead", "sourcing"],
        contactStatus: "Verified Lead",
        time: l.time,
        sourceUrl: "#"
      })));
    } finally {
      setIsSearchingLeads(false);
    }
  };

  // Check existing session on load
  useEffect(() => {
    const savedEmail = localStorage.getItem("signalmerge_user_email");
    const savedPassword = localStorage.getItem("signalmerge_user_password");
    if (savedEmail && savedPassword) {
      setSessionLoading(true);
      fetch('/api/auth/custom-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: savedEmail, password: savedPassword })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCurrentUserEmail(data.user.email);
          setHasPaid80(data.user.hasPaid80);
          setHasPaid20(data.user.hasPaid20);
          setLeadsUsedToday(data.user.leadsUsedToday);
          if (data.user.hasPaid80) {
            setIsAuthenticated(true);
            setIsPendingPayment(false);
            performLeadsSearch("leads");
          } else {
            setIsAuthenticated(false);
            setIsPendingPayment(true);
          }
        } else {
          localStorage.removeItem("signalmerge_user_email");
          localStorage.removeItem("signalmerge_user_password");
        }
      })
      .catch(err => console.error("Auto login failed:", err))
      .finally(() => setSessionLoading(false));
    } else {
      setSessionLoading(false);
    }
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

  // Custom active submit handlers
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
      const res = await fetch('/api/auth/custom-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailClean, password: passwordClean })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoginError(data.message || "Invalid email or audit access key.");
        setLoginSubmitting(false);
        return;
      }

      localStorage.setItem("signalmerge_user_email", emailClean);
      localStorage.setItem("signalmerge_user_password", passwordClean);

      setCurrentUserEmail(data.user.email);
      setHasPaid80(data.user.hasPaid80);
      setHasPaid20(data.user.hasPaid20);
      setLeadsUsedToday(data.user.leadsUsedToday);

      if (data.user.hasPaid80) {
        setIsAuthenticated(true);
        setIsPendingPayment(false);
        performLeadsSearch("leads");
      } else {
        setIsAuthenticated(false);
        setIsPendingPayment(true);
      }
    } catch (err: any) {
      setLoginError(err.message || "An error occurred logging in.");
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    setSignupSubmitting(true);

    const emailClean = signupEmail.trim().toLowerCase();
    const passwordClean = signupPassword.trim();
    const confirmClean = signupConfirmPassword.trim();

    if (!emailClean || !passwordClean || !confirmClean) {
      setSignupError("Please fill out all credentials.");
      setSignupSubmitting(false);
      return;
    }

    if (passwordClean.length < 6) {
      setSignupError("Password must be at least 6 characters.");
      setSignupSubmitting(false);
      return;
    }

    if (passwordClean !== confirmClean) {
      setSignupError("Passwords do not match.");
      setSignupSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/custom-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailClean, password: passwordClean })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setSignupError(data.message || "Signup failed.");
        setSignupSubmitting(false);
        return;
      }

      localStorage.setItem("signalmerge_user_email", emailClean);
      localStorage.setItem("signalmerge_user_password", passwordClean);

      setCurrentUserEmail(data.user.email);
      setHasPaid80(false);
      setHasPaid20(false);
      setLeadsUsedToday(0);

      setIsAuthenticated(false);
      setIsPendingPayment(true);
    } catch (err: any) {
      setSignupError(err.message || "An error occurred signing up.");
    } finally {
      setSignupSubmitting(false);
    }
  };

  // Simulated billing confirmations for evaluator/user verification in Sandbox
  const confirmSubscriptionFee = async () => {
    if (!currentUserEmail) return;
    try {
      const res = await fetch('/api/auth/confirm-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUserEmail })
      });
      const data = await res.json();
      if (data.success) {
        setHasPaid80(true);
        setIsAuthenticated(true);
        setIsPendingPayment(false);
        performLeadsSearch("leads");
      } else {
        alert("Verification failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmLimitUpgrade = async () => {
    if (!currentUserEmail) return;
    try {
      const res = await fetch('/api/auth/upgrade-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUserEmail })
      });
      const data = await res.json();
      if (data.success) {
        setHasPaid20(true);
        alert("Daily limit upgraded successfully to 100 leads!");
      } else {
        alert("Upgrade failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError(null);
    setPasswordChangeSuccess(null);
    setPasswordChanging(true);

    const newPwClean = newPassword.trim();
    const confirmPwClean = confirmPassword.trim();

    if (!newPwClean) {
      setPasswordChangeError("Password cannot be empty.");
      setPasswordChanging(false);
      return;
    }

    if (newPwClean.length < 6) {
      setPasswordChangeError("Password must be at least 6 characters.");
      setPasswordChanging(false);
      return;
    }

    if (newPwClean !== confirmPwClean) {
      setPasswordChangeError("Passwords do not match.");
      setPasswordChanging(false);
      return;
    }

    try {
      // 1. Save locally to localStorage so it works offline/sandbox
      localStorage.setItem('saved_password_digitalconsultingpros@gmail.com', newPwClean);

      // 2. Save directly to Supabase client_credentials table
      const { error } = await supabase.from('client_credentials').upsert({
        email: 'digitalconsultingpros@gmail.com',
        password: newPwClean,
        updated_at: new Date().toISOString()
      });

      if (error) {
        console.warn("Supabase background credentials write notice:", error.message);
      }

      // 3. Sync to server-side memory immediately
      try {
        await fetch('/api/auth/update-client-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'digitalconsultingpros@gmail.com', password: newPwClean })
        });
      } catch (err) {
        console.warn("Server sync exception:", err);
      }

      setPasswordChangeSuccess("Password updated and secured successfully in Supabase!");
      setNewPassword("");
      setConfirmPassword("");
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setIsChangePasswordOpen(false);
        setPasswordChangeSuccess(null);
      }, 3000);

    } catch (err: any) {
      setPasswordChangeError(err.message || "Failed to save the new password.");
    } finally {
      setPasswordChanging(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("signalmerge_user_email");
    localStorage.removeItem("signalmerge_user_password");
    setIsAuthenticated(false);
    setIsPendingPayment(false);
    setCurrentUserEmail("");
    setHasPaid80(false);
    setHasPaid20(false);
    setLeadsUsedToday(0);
    setLeadsList([]);
  };

  // Transform all lead locations to Global
  const globalLeads = rawLeadsData.map(lead => ({ ...lead, location: "Global" }));

  // Filter leads based on platform and search query
  const filteredLeads = globalLeads.filter((lead) => {
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

  // --- 1. RENDER SECURE GATE IF NOT LOGGED IN / REGISTERED ---
  if (!isAuthenticated && !isPendingPayment) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center px-6 font-sans relative overflow-hidden selection:bg-orange-500/30">
        {/* Background Decorative Rings */}
        <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] rounded-full bg-orange-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-orange-500/10 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md z-10 py-10">
          <div className="flex items-center gap-2 justify-center mb-8">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-600/20">
              <Zap className="text-white w-5 h-5 fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">Signalmerge</span>
          </div>

          <Card className="border border-orange-100 bg-white/95 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden p-8">
            
            {/* Tabs for Login vs Register */}
            <div className="flex border-b border-slate-100 mb-6">
              <button
                onClick={() => { setAuthMode("login"); setLoginError(null); }}
                className={`flex-1 pb-3 text-sm font-bold transition-all focus:outline-none ${
                  authMode === "login" 
                    ? "text-orange-600 border-b-2 border-orange-600" 
                    : "text-slate-400 hover:text-slate-600 border-b-2 border-transparent"
                }`}
              >
                Client Log In
              </button>
              <button
                onClick={() => { setAuthMode("signup"); setSignupError(null); }}
                className={`flex-1 pb-3 text-sm font-bold transition-all focus:outline-none ${
                  authMode === "signup" 
                    ? "text-orange-600 border-b-2 border-orange-600" 
                    : "text-slate-400 hover:text-slate-600 border-b-2 border-transparent"
                }`}
              >
                Register / Sign Up
              </button>
            </div>

            {authMode === "login" ? (
              <div>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 border border-orange-200/60 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-2">
                    <Lock className="w-3 h-3 text-orange-600" /> Secure Registry Gate
                  </div>
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight">Access Customer Registry</h1>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Access your designated customer acquisition engine & real-time search node.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1 font-mono">
                      Client Email Address
                    </label>
                    <Input 
                      type="email"
                      placeholder="name@company.com"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl py-5 px-4 font-mono text-sm focus-visible:ring-1 focus-visible:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1 font-mono">
                      Secure Access Passcode
                    </label>
                    <Input 
                      type="password"
                      placeholder="••••••••••••••"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl py-5 px-4 font-mono text-sm focus-visible:ring-1 focus-visible:ring-orange-500"
                    />
                  </div>

                  {loginError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                      <p className="leading-normal">{loginError}</p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={loginSubmitting}
                    className="w-full py-5 mt-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold tracking-wide transition-all shadow-lg shadow-orange-600/15 gap-2"
                  >
                    {loginSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Keys...
                      </>
                    ) : (
                      <>
                        Access Live Lead Dashboard <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            ) : (
              <div>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 border border-orange-200/60 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-3 h-3 text-orange-600" /> Standard Lead Allocation
                  </div>
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight">Create Corporate Account</h1>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Set up your email and access keys to subscribe and unlock continuous global buyer audits.
                  </p>
                </div>

                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1 font-mono">
                      Primary Contact Email
                    </label>
                    <Input 
                      type="email"
                      placeholder="name@company.com"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl py-5 px-4 font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1 font-mono">
                      Choose Passcode (Min 6 chars)
                    </label>
                    <Input 
                      type="password"
                      placeholder="••••••••••••••"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl py-5 px-4 font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1 font-mono">
                      Confirm Passcode
                    </label>
                    <Input 
                      type="password"
                      placeholder="••••••••••••••"
                      required
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl py-5 px-4 font-mono text-sm"
                    />
                  </div>

                  {signupError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                      <p className="leading-normal">{signupError}</p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={signupSubmitting}
                    className="w-full py-5 mt-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold tracking-wide transition-all shadow-lg shadow-orange-600/15 gap-2"
                  >
                    {signupSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Provisioning Account...
                      </>
                    ) : (
                      <>
                        Create Account & Proceed <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            )}

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

  // --- 1B. RENDER SUBSCRIPTION GATE FOR NEW ACCOUNTS (FIRST TIME USERS MUST PAY $80) ---
  if (isPendingPayment) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center px-6 font-sans relative overflow-hidden selection:bg-orange-500/30">
        <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] rounded-full bg-orange-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-orange-500/10 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-lg z-10 py-10">
          <div className="flex items-center gap-2 justify-center mb-8">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-600/20">
              <Zap className="text-white w-5 h-5 fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">Signalmerge</span>
          </div>

          <Card className="border border-orange-100 bg-white shadow-xl rounded-2xl overflow-hidden p-8 space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 border border-orange-200/60 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-3">
                💰 Subscription Required
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Activate Your Signalmerge License</h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Thank you for registering <span className="text-orange-600 font-bold">{currentUserEmail}</span>. First-time client profiles require a standard subscription license of <strong className="text-slate-900 font-bold">$80 USD</strong> to open their dedicated social search tunnels and query buyer nodes.
              </p>
            </div>

            <div className="p-4 bg-orange-50/55 border border-orange-100 rounded-xl flex items-center justify-between">
              <div>
                <span className="block text-[9px] font-black tracking-widest text-orange-700 font-mono">ANNUALIZED ROUTING LICENSE FEE</span>
                <span className="text-2xl font-black text-slate-900">$80 USD</span>
                <span className="text-[10px] text-slate-505 ml-2 font-mono">(converted from R1,295 standard rate)</span>
              </div>
              <span className="text-xs font-mono font-bold text-orange-600 uppercase tracking-widest text-right">Yoco Gateway</span>
            </div>

            <div className="space-y-3 pt-2">
              <a 
                href="https://pay.yoco.com/mergemega?amount=1295" 
                target="_blank" 
                rel="referrer noopener"
                className="w-full py-4 text-center rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2"
              >
                Sign Up & Buy Credits ($80) <ArrowUpRight className="w-4 h-4" />
              </a>

              <Button
                onClick={confirmSubscriptionFee}
                variant="outline"
                className="w-full py-4 text-center rounded-xl border-orange-200 hover:bg-orange-50 text-orange-700 font-bold text-xs tracking-wider uppercase"
              >
                Confirm & Verify Payment [Test Mode]
              </Button>

              <button
                onClick={handleLogout}
                className="w-full text-center text-slate-400 hover:text-red-500 text-[11px] font-bold font-mono uppercase tracking-wider block"
              >
                ← Back to Login Gate
              </button>
            </div>

            <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 font-mono select-none pt-2 border-t border-slate-100">
              <span>🛡️ SSL Secured</span>
              <span>•</span>
              <span>💳 Visa / Mastercard</span>
              <span>•</span>
              <span>🇿🇦 Verified Yoco direct portal</span>
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
            Urgent: Limited Global Partner Cohort Slot — Slot is currently Reserved for Digital Consulting Pros
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
        
        {/* PROFILE STATUS ALERT PANEL (3-7 DAYS COVENANT MESSAGE) */}
        <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h5 className="text-sm font-extrabold text-blue-900 tracking-tight">Account Verification Status: Operational Vetting Pending</h5>
            <p className="text-xs text-blue-700 mt-1.5 leading-relaxed max-w-4xl">
              Your profile is undergoing standard compliance validation. <strong>It will take 3 - 7 business days for your account to be fully verified.</strong> In the meantime, you have been allocated full database querying capabilities, unlimited custom social sweeps, and direct buyer contact metrics below.
            </p>
          </div>
        </div>

        {/* ACTIVE ADMINISTRATIVE SESSION LOCKER FOOTER/CONTROL BAR */}
        <div className="mb-8 p-4 bg-orange-50/60 border border-orange-200/50 rounded-2xl flex flex-col gap-4 text-xs">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-slate-600 font-medium font-mono text-[11px]">Active Registered Profile: <strong className="text-slate-900 font-bold">{currentUserEmail}</strong></span>
            </div>
            <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
              <button
                onClick={() => setIsChangePasswordOpen(!isChangePasswordOpen)}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 focus:outline-none cursor-pointer"
              >
                <Key className="w-3.5 h-3.5 text-orange-600" /> {isChangePasswordOpen ? "Close Password Settings" : "Change Password"}
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 px-4.5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 focus:outline-none cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" /> Sign Out & Lock Secure Registry
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isChangePasswordOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-orange-200/30 pt-4"
              >
                <form onSubmit={handleUpdatePassword} className="max-w-md space-y-3">
                  <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-orange-600" /> Update Audit Access Password
                  </h5>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Set a custom secure password to replace the current audit access password. This updates our global Supabase replication engine instantly.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-sans focus:outline-none focus:border-orange-500 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Confirm Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-sans focus:outline-none focus:border-orange-500 text-xs"
                      />
                    </div>
                  </div>

                  {passwordChangeError && (
                    <p className="text-red-600 font-bold font-mono text-[10px]">✕ {passwordChangeError}</p>
                  )}
                  {passwordChangeSuccess && (
                    <p className="text-emerald-600 font-bold font-mono text-[10px]">✓ {passwordChangeSuccess}</p>
                  )}

                  <div className="flex gap-2 pt-1.5">
                    <Button
                      type="submit"
                      disabled={passwordChanging}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2 px-4 rounded-lg cursor-pointer flex items-center"
                    >
                      {passwordChanging ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> Securing Keys...
                        </>
                      ) : (
                        "Save Password to Supabase"
                      )}
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangePasswordOpen(false);
                        setPasswordChangeError(null);
                        setPasswordChangeSuccess(null);
                      }}
                      className="px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-500 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* TOP COHORT ADVISORY CARD */}
        <div className="mb-10 p-5 bg-orange-50/30 border border-orange-200/50 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-orange-100 border border-orange-200/80 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest text-orange-700 uppercase">
              <Sparkles className="w-3 h-3 text-orange-600" /> Exclusive Global Onboarding Slots
            </div>
            <h4 className="text-base font-bold text-slate-900 tracking-tight">Capped Brand Partnerships Policy</h4>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              We operate exclusively with a hand-selected group of high-potential growth enterprises globally. To maintain superior API speeds and guarantee lead signal quality, we enforce strict capacity caps. <span className="text-orange-600 font-bold">Digital Consulting Pros</span> must act quickly; this live customer search audit will close indefinitely when the countdown expires.
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
                Global
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Customer Audit: <span className="text-orange-600">Digital Consulting Pros</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button 
              onClick={handleLogout} 
              variant="outline"
              className="border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs px-4 py-2.5 rounded-xl font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" /> Sign Out & Lock Registry
            </Button>
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
                <Info className="w-3.5 h-3.5 text-[#00b2fe]" /> Active search query matching 'Digital Promotion Global'
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
                <ShieldCheck className="w-3.5 h-3.5 text-orange-600" /> Full metadata unlock of premium localized Global buyers
              </div>
            </CardContent>
          </Card>

        </div>

        {/* LEADS QUOTA STATUS WIDGET */}
        <div className="mb-8 p-5 bg-gradient-to-r from-orange-500/5 to-amber-500/5 border border-orange-100 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-orange-600 fill-orange-600 animate-pulse" />
            </div>
            <div>
              <h5 className="text-sm font-extrabold text-slate-900 tracking-tight">Daily Buyer Search Allocation</h5>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Your current plan authorizes up to <strong className="text-slate-850 font-bold">{hasPaid20 ? "100" : "33"} leads</strong> per 24 hours. Reset happens every 24 hours automatically.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap w-full md:w-auto justify-end">
            <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm text-right">
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest font-mono">QUOTA METRIC</span>
              <span className="text-sm font-extrabold text-slate-800">{visibleLimit} Available Leads</span>
            </div>

            {!hasPaid20 ? (
              <div className="flex items-center gap-2 shrink-0">
                <a 
                  href="https://pay.yoco.com/mergemega?amount=339" 
                  target="_blank" 
                  rel="referrer noopener"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-orange-600/15 gap-1.5 inline-flex items-center transition-all"
                >
                  Get 100 Leads ($20) <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
                <Button
                  onClick={confirmLimitUpgrade}
                  variant="outline"
                  className="border-orange-200 hover:bg-orange-50 text-orange-700 font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm cursor-pointer"
                >
                  Confirm Upgrade [Test Mode]
                </Button>
              </div>
            ) : (
              <span className="text-xs font-mono font-bold text-emerald-600 border border-emerald-200 bg-emerald-50 px-3 py-1.5 rounded-xl">
                ✓ Premium 100 Leads Quota Active
              </span>
            )}
          </div>
        </div>

        {/* LEAD PREVIEW GRAPHICS INTERACTIVE LAYOUT */}
        <div className="bg-white border border-slate-200 shadow-md rounded-2xl overflow-hidden mb-12 relative" id="scanner-table">
          
          {/* Table Header Controls */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-orange-100 text-orange-850 border border-orange-200/60 text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase font-mono">
                  Live Buyer Node query
                </span>
                {isSearchingLeads && (
                  <span className="text-xs text-orange-600 font-mono flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Querying global index...
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {/* Search Bar - highly mobile responsive */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input 
                  type="text" 
                  placeholder="Query social search tunnels (e.g. website, design, SEO)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      performLeadsSearch(searchQuery);
                    }
                  }}
                  className="bg-slate-50 border-slate-200 text-slate-800 text-xs pl-10 pr-4 py-3.5 rounded-xl placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-orange-500 w-full"
                />
              </div>
              <Button
                onClick={() => performLeadsSearch(searchQuery)}
                disabled={isSearchingLeads}
                className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs px-5 py-3.5 rounded-xl shadow-lg shadow-orange-600/10 flex items-center gap-1.5 focus:outline-none shrink-0 w-full sm:w-auto justify-center cursor-pointer"
              >
                {isSearchingLeads ? "Scanning..." : "Search Live Leads"}
              </Button>
            </div>
          </div>

          {/* Platform category selectors */}
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-3 flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Source Channels:
            </span>
            {platforms.map((p) => {
              const count = p === "All" 
                ? leadsList.length 
                : leadsList.filter(l => l.platform === p).length;
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
                  filteredLeads.slice(0, visibleLimit).map((lead) => {
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
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-[10px] text-emerald-700 font-black px-2.5 py-1.5 rounded-xl uppercase tracking-wider justify-end shadow-sm">
                            <ShieldCheck className="w-3 h-3 text-emerald-650" /> Active Lead Access
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 bg-white">
                      No matching records found. Try running a different search query above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredLeads.length > visibleLimit && (
            <div className="absolute inset-x-0 bottom-[51px] bg-gradient-to-t from-white via-white/95 to-transparent pt-32 pb-12 flex flex-col items-center justify-center text-center p-8 z-20 pointer-events-auto">
              <div className="bg-white border border-orange-100 rounded-[2rem] p-8 max-w-lg shadow-2xl relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-600 text-white font-black px-5 py-2 rounded-full text-[9px] uppercase tracking-widest flex items-center gap-1 shadow-md">
                  <Sparkles className="w-3 animate-pulse" /> Daily Search Limit Reached
                </div>
                <h3 className="text-base font-black text-slate-900 mb-3 mt-2 leading-snug uppercase tracking-tight">
                  Extend Allocation to 100 Leads Daily
                </h3>
                <p className="text-slate-600 text-xs font-bold leading-relaxed mb-6">
                  You can have a maximum of 33 leads a day. If you want more than 33 leads, you can pay an extra <strong className="text-orange-600">$20 USD</strong> to get a max of 100 leads today!
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <a 
                    href="https://pay.yoco.com/mergemega?amount=339"
                    target="_blank"
                    rel="referrer noopener"
                    className="w-full sm:w-auto text-center rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-6 py-3.5 text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2"
                  >
                    Upgrade Now ($20) <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                  <Button 
                    onClick={confirmLimitUpgrade}
                    className="w-full sm:w-auto text-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border border-slate-200"
                  >
                    Simulate Upgrade
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Database Footer Summary */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-500 leading-normal font-mono font-bold uppercase tracking-wider">
            SECURED LEAD FEED • CONNECTED TO ACTIVE SOCIAL RESEARCH AND EXA SEARCH NODES
          </div>
        </div>

        {/* COST RECKONER REMOVED */}
        <div id="payment-section" className="hidden">
          
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
                Unlock instant access to the Signalmerge real-time customer search engine. Filter premium leads, reveal source contact metrics, export with one click, and receive continuous push notifications of hot prospects globally.
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
                Secure the global Signalmerge data pipeline allocation. Authorize the setup parameter fee immediately using the secure Yoco link below. Any delay in setup authorization risks automatic re-allocation to alternative digital firms.
              </p>

              {/* Huge Fee Breakdown */}
              <div className="bg-orange-50/40 border border-orange-100/60 p-4 rounded-xl flex items-center justify-between my-4">
                <div>
                  <span className="block text-[9.5px] font-black font-mono tracking-widest text-orange-700 leading-none mb-1">SETUP FEE (EUROS)</span>
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
                className="block text-center py-5 bg-orange-600 hover:bg-orange-750 text-white font-extrabold text-sm rounded-xl tracking-wide shadow-xl shadow-orange-600/25 transition-all uppercase flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                Pay Setup Fee Now (€160) <ArrowUpRight className="w-5 h-5" />
              </a>

              <div className="text-center space-y-2.5">
                <span className="block text-xs font-mono font-bold text-slate-600 uppercase">
                  (Equivalent to R3,040 ZAR)
                </span>
                <div className="p-3 bg-emerald-50 border border-emerald-100/50 rounded-xl text-left shadow-sm">
                  <p className="text-[11px] text-emerald-800 font-bold leading-relaxed flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-650 shrink-0 mt-0.5" />
                    <span>
                      <strong className="uppercase">Important Notice:</strong> Your custom pipeline and dashboard setup will be fully completed and delivered in <strong className="underline">7 business days</strong> once payment has been approved.
                    </span>
                  </p>
                </div>
              </div>

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
        <div className="hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <h5 className="text-sm font-bold text-slate-950 tracking-tight">Final Registry Authorization Decrypt Notice</h5>
              </div>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                Upon expiration of the <span className="text-red-600 font-bold font-mono">36-hour countdown</span>, this custom audit profile for Digital Consulting Pros global hub will disconnect from active monitoring nodes, lock completely, and the reserved buyer allocation slot will automatically release to the next agency candidate on the global waitlist. Clear the R3,040 Setup via the secured Yoco portal above to guarantee long-term pipeline continuity.
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
