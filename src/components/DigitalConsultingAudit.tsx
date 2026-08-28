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

// Full 50-leads dataset (reference/fallback only when live Exa returns zero results)
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
    intent: "Who is the best independent consultant for auditing and scaling our e-commerce apparel brand in Europe? Budget is ready, looking for direct experience with high conversion online shop",
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
  const performLeadsSearch
