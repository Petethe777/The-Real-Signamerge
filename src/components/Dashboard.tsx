import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Zap, 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  Instagram, 
  ArrowLeft,
  CheckCircle2,
  Globe,
  Music2,
  Eye,
  Heart,
  Twitter,
  Linkedin,
  Youtube,
  Loader2,
  LogOut,
  User,
  X,
  Mail,
  ArrowRight,
  ShieldCheck,
  Check,
  Clock,
  Sparkles,
  TrendingUp,
  Users,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DemandResult } from "@/types";
import { tiktokDataset, instagramDataset } from "@/data/datasets";
import { mockClients } from "@/data/mockClients";
import { searchSocialMedia, detectQueryCountry } from "@/services/geminiService";
import { supabase, isSupabaseConfigured, saveSearchQuery } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { AnimatePresence } from "motion/react";
import { TermsModal } from "./TermsModal";

const PlatformIcon = ({ platform }: { platform: DemandResult['platform'] }) => {
  switch (platform) {
    case 'Instagram': return <Instagram className="w-4 h-4 text-[#E4405F]" />;
    case 'TikTok': return <Music2 className="w-4 h-4 text-[#000000]" />;
    case 'Twitter': return <Twitter className="w-4 h-4 text-[#1DA1F2]" />;
    case 'LinkedIn': return <Linkedin className="w-4 h-4 text-[#0A66C2]" />;
    case 'YouTube': return <Youtube className="w-4 h-4 text-[#FF0000]" />;
    case 'Reddit': return <Search className="w-4 h-4 text-[#FF4500]" />;
    default: return <Search className="w-4 h-4 text-gray-400" />;
  }
};

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#F97324', '#111111', '#94A3B8', '#E2E8F0'];

export const getPlatformReach = (keywords: string[] | undefined | null, platform: string) => {
  const kws = keywords && Array.isArray(keywords) ? keywords.filter(k => k && k.trim().length > 0) : [];
  if (kws.length === 0) {
    switch(platform) {
      case 'Instagram': return 110;
      case 'TikTok': return 140;
      case 'LinkedIn': return 45;
      case 'YouTube': return 75;
      case 'Twitter': return 55;
      default: return 50;
    }
  }

  const score = kws.reduce((acc, kw) => acc + kw.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0), 0);
  
  let multiplier = 1;
  switch (platform) {
    case 'Instagram': multiplier = 1.1; break;
    case 'TikTok': multiplier = 1.3; break;
    case 'LinkedIn': multiplier = 0.45; break;
    case 'YouTube': multiplier = 0.75; break;
    case 'Twitter': multiplier = 0.55; break;
  }

  const baseReach = 70 + (score % 50);
  return Math.round(baseReach * multiplier);
};

const BIDashboard = ({ profile, handleLogout }: { profile: any, handleLogout: () => void }) => {
  const isOwner = profile?.email === 'petemkhize@gmail.com';
  const isApproved = isOwner || profile?.role === 'admin' || profile?.is_approved === true;
  const isAdmin = isOwner || profile?.role === 'admin';
  
  // The Admin has full master workspace override capability.
  // Each workspace is loaded from either the current user pool or active profile.
  const [activeWorkspace, setActiveWorkspace] = useState<any>(profile);
  const [activeTab, setActiveTab] = useState<'discovery' | 'analytics'>(() => {
    const isOwnerUser = profile?.email === 'petemkhize@gmail.com' || profile?.role === 'admin';
    return isOwnerUser ? 'analytics' : 'discovery';
  });

  const [isAuditing, setIsAuditing] = useState(isApproved);
  const [isAdminView, setIsAdminView] = useState(false);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  // Local state for live social keyword searching inside Discovery Hub
  const [innerSearchValue, setInnerSearchValue] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [liveResults, setLiveResults] = useState<DemandResult[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
  const [isSearchingTransition, setIsSearchingTransition] = useState(false);
  const [correctedQuery, setCorrectedQuery] = useState<string | null>(null);

  useEffect(() => {
    // If Admin accesses, fetch registered accounts to allow approvals and dashboard switching
    if (isOwner) {
      fetchProfiles();
    }
  }, [isAdminView, profile]);

  const fetchProfiles = async () => {
    setLoadingProfiles(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
      setAllProfiles(data);
      // Auto-update standard profiles if they were modified
      const currentActiveFromDb = data.find((p: any) => p.id === activeWorkspace?.id);
      if (currentActiveFromDb) {
        setActiveWorkspace(currentActiveFromDb);
      }
    }
    setLoadingProfiles(false);
  };

  const approveUser = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: true })
      .eq('id', userId);
    if (!error) {
      await fetchProfiles();
    }
  };

  useEffect(() => {
    if (isAuditing) {
      const timer = setTimeout(() => {
        setIsAuditing(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuditing]);

  // Dynamic Workspace resolution
  const userKeywords = activeWorkspace?.customer_keywords || ['leads', 'sales', 'growth'];
  const userPhrases = activeWorkspace?.customer_phrases || [];
  const servicePricing = Number(activeWorkspace?.selling_region?.pricing) || 1500;
  const stateScope = activeWorkspace?.selling_region?.state || "California";
  const countyScope = activeWorkspace?.selling_region?.county || "Statewide";
  const integrationsList = activeWorkspace?.selling_region?.integrations || [];

  const totalReachNum = ['Instagram', 'TikTok', 'LinkedIn', 'YouTube', 'Twitter'].reduce(
    (acc, plat) => acc + getPlatformReach(userKeywords, plat), 0
  );
  
  // Real-time keyword fetching inside BIDashboard
  useEffect(() => {
    async function fetchSearch() {
      const q = activeQuery || userKeywords[0] || 'leads';
      setIsLoadingResults(true);
      setSearchFeedback(null);
      setCorrectedQuery(null);
      try {
        const res = await searchSocialMedia(q);
        if (res && (res as any)._rateLimited) {
          setLiveResults(res || []);
          setSearchFeedback("AI Scanner is busy. Showing cached results.");
          if ((res as any).correctedQuery) {
            setCorrectedQuery((res as any).correctedQuery);
          }
        } else {
          setLiveResults(res || []);
          if ((res as any).correctedQuery) {
            setCorrectedQuery((res as any).correctedQuery);
          }
        }
      } catch (err) {
        setSearchFeedback("AI Scanner at capacity. Showing 2026 database fallback.");
      } finally {
        setIsLoadingResults(false);
      }
    }
    fetchSearch();
  }, [activeQuery, userKeywords]);

  // Predict monthly earnings scaled-down to make it about $20,000 USD max.
  const minEarnings = Math.min(Math.round(totalReachNum * 0.005 * servicePricing), 8500) || 1200;
  const maxEarnings = Math.min(Math.round(totalReachNum * 0.015 * servicePricing), 20000) || 4500;

  const mockSalesData = [
    { name: 'Week 1', sales: Math.round(minEarnings / 4), leads: Math.round(totalReachNum * 0.005 / 4) },
    { name: 'Week 2', sales: Math.round(minEarnings / 4 * 1.15), leads: Math.round(totalReachNum * 0.005 / 4 * 1.3) },
    { name: 'Week 3', sales: Math.round(minEarnings / 4 * 0.92), leads: Math.round(totalReachNum * 0.005 / 4 * 0.85) },
    { name: 'Week 4', sales: Math.round(minEarnings / 4 * 1.25), leads: Math.round(totalReachNum * 0.005 / 4 * 1.1) },
  ];

  const dynamicPlatformData = [
    { name: 'Instagram', value: getPlatformReach(userKeywords, 'Instagram') },
    { name: 'TikTok', value: getPlatformReach(userKeywords, 'TikTok') },
    { name: 'LinkedIn', value: getPlatformReach(userKeywords, 'LinkedIn') },
    { name: 'YouTube', value: getPlatformReach(userKeywords, 'YouTube') },
    { name: 'Twitter', value: getPlatformReach(userKeywords, 'Twitter') },
  ];

  // Merge datasets for search queries inside BIDashboard
  const allResults = useMemo(() => {
    const clientsAsResults: DemandResult[] = mockClients.map(client => {
      let sourceUrl = `https://www.google.com/search?q=${encodeURIComponent(client.name + ' ' + client.handle)}`;
      
      const cleanHandle = client.handle.startsWith('@') ? client.handle.substring(1) : client.handle;
      
      if (client.platform === 'Twitter') {
        sourceUrl = `https://x.com/${cleanHandle}`;
      } else if (client.platform === 'LinkedIn') {
        sourceUrl = `https://www.linkedin.com/in/${cleanHandle}`;
      } else if (client.platform === 'Reddit') {
        sourceUrl = `https://www.reddit.com/${cleanHandle.startsWith('u/') ? cleanHandle : 'u/' + cleanHandle}`;
      } else if (client.platform === 'Instagram') {
        sourceUrl = `https://www.instagram.com/${cleanHandle}`;
      }

      return {
        id: `client-${client.id}`,
        platform: client.platform as any,
        content: client.intent,
        views: `${client.score}% Match`,
        likes: 'Direct Lead',
        hashtags: [],
        location: client.location,
        contactStatus: 'Hot Prospect',
        time: '2026',
        sourceUrl
      };
    });

    return [...liveResults, ...tiktokDataset, ...instagramDataset, ...clientsAsResults];
  }, [liveResults]);

  const filteredResults = useMemo(() => {
    const q = correctedQuery || activeQuery || userKeywords[0] || "";
    if (!q) return allResults.slice(0, 10);
    const lowerQuery = q.toLowerCase();
    const targetCountry = detectQueryCountry(lowerQuery);
    
    return allResults.filter(item => {
      if (targetCountry) {
        const itemLoc = item.location.toLowerCase();
        const itemContent = item.content.toLowerCase();
        let isCountryMatch = false;

        if (targetCountry === "china" && (itemLoc.includes("china") || itemLoc.includes("hong kong") || itemLoc.includes("hongkong") || itemContent.includes("china") || itemContent.includes("chinese"))) isCountryMatch = true;
        else if (targetCountry === "philippines" && (itemLoc.includes("philippines") || itemLoc.includes("manila") || itemLoc.includes("philipines"))) isCountryMatch = true;
        else if (targetCountry === "thailand" && (itemLoc.includes("thailand") || itemLoc.includes("bangkok"))) isCountryMatch = true;
        else if (targetCountry === "vietnam" && (itemLoc.includes("vietnam") || itemLoc.includes("hanoi") || itemLoc.includes("viet nam"))) isCountryMatch = true;
        else if (targetCountry === "hong kong" && (itemLoc.includes("hong kong") || itemLoc.includes("hongkong"))) isCountryMatch = true;
        else if (targetCountry === "singapore" && itemLoc.includes("singapore")) isCountryMatch = true;
        else if (targetCountry === "sweden" && (itemLoc.includes("sweden") || itemLoc.includes("stockholm") || itemLoc.includes("gothenburg") || itemContent.includes("sweden") || itemContent.includes("swedish"))) isCountryMatch = true;
        else if (targetCountry === "switzerland" && (itemLoc.includes("switzerland") || itemLoc.includes("zurich") || itemLoc.includes("geneva") || itemLoc.includes("swiss") || itemContent.includes("switzerland") || itemContent.includes("swiss"))) isCountryMatch = true;
        else if (targetCountry === "italy" && (itemLoc.includes("italy") || itemLoc.includes("milan") || itemLoc.includes("italian") || itemContent.includes("italy") || itemContent.includes("italian"))) isCountryMatch = true;
        else if (targetCountry === "usa" && (itemLoc.includes("usa") || itemLoc.includes("united states") || itemLoc.includes("ny") || itemLoc.includes("ca") || itemLoc.includes("tx") || itemLoc.includes("fl") || itemLoc.includes("wa"))) isCountryMatch = true;
        else if (targetCountry === "uk" && (itemLoc.includes("uk") || itemLoc.includes("united kingdom") || itemLoc.includes("london") || itemLoc.includes("ireland"))) isCountryMatch = true;
        else if (targetCountry === "south africa" && (itemLoc.includes("south africa") || itemLoc.includes("johannesburg") || itemLoc.includes("cape town") || itemLoc.includes("durban") || itemLoc.includes("pretoria") || itemLoc.includes("port elizabeth") || itemLoc.includes("soweto") || itemLoc.includes("sandton") || itemLoc.includes("sa"))) isCountryMatch = true;
        else if (itemLoc.includes(targetCountry)) isCountryMatch = true;

        if (!isCountryMatch) return false;
      }

      return (
        item.content.toLowerCase().includes(lowerQuery) ||
        (item.hashtags && item.hashtags.some(tag => tag.toLowerCase().includes(lowerQuery))) ||
        item.location.toLowerCase().includes(lowerQuery) ||
        item.platform.toLowerCase().includes(lowerQuery) ||
        lowerQuery.split(' ').some(word => word.length > 2 && item.content.toLowerCase().includes(word))
      );
    });
  }, [correctedQuery, activeQuery, userKeywords, allResults]);

  const handleLocalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!innerSearchValue.trim()) return;
    
    // Save inner keyword search to Supabase
    saveSearchQuery(innerSearchValue, profile?.email);
    
    setIsSearchingTransition(true);
    setTimeout(() => {
      setActiveQuery(innerSearchValue);
      setIsSearchingTransition(false);
    }, 1500);
  };

  // Dynamic leads specific to workspace keywords
  const dynamicLeads = useMemo(() => {
    const defaultLeads = [
      { name: "Alpha Ventures", role: "Co-Founder", content: `urgently looking for expert solutions in ${userKeywords[0] || 'outreach'}. Must support workflows.`, platform: "LinkedIn", match: "94%", date: "Today, 10:14 AM" },
      { name: "@creator_flow", role: "Marketing Lead", content: `does anyone know the best tools to trigger active ${userKeywords[1] || 'branding'} campaigns in ${stateScope}?`, platform: "Instagram", match: "89%", date: "Today, 09:21 AM" },
      { name: "Digital Solutions LLC", role: "Ops Director", content: `Seeking consulting services regarding ${userKeywords[2] || 'automation'}. Paying premium.`, platform: "Twitter", match: "92%", date: "Yesterday" },
      { name: "Apex Global", role: "VP of Enterprise", content: `Can anyone recommend an n8n or Zapier developer for customized client onboarding in ${countyScope}?`, platform: "LinkedIn", match: "95%", date: "Yesterday" },
      { name: "@trend_master", role: "Brand Lead", content: `need urgent help optimizing video attention spikes on YouTube. DM me!`, platform: "YouTube", match: "86%", date: "2 days ago" },
      { name: "Vibe Tech Group", role: "Growth Hacker", content: `Looking for localized campaigns with hot conversion nodes. Budget is open.`, platform: "TikTok", match: "88%", date: "3 days ago" }
    ];
    return defaultLeads;
  }, [userKeywords, stateScope, countyScope]);

  // Attention capturing content hooks generator
  const attentionGrabbingContent = useMemo(() => {
    const k1 = userKeywords[0] || "Campaigns";
    const k2 = userKeywords[1] || "Growth";
    const k3 = userKeywords[2] || "Automation";
    return [
      { hook: `The 2026 Blueprint: Why ${k1} Is Outperforming Standard Channels`, reach: "14.2k", rate: "8.4% Integration", category: "High Impact" },
      { hook: `How we achieved rapid conversions in ${stateScope} utilizing automated signifiers`, reach: "9.8k", rate: "7.9% Match", category: "Localized" },
      { hook: `Stop using static lists — set up active nodes for ${k2} and ${k3}`, reach: "11.1k", rate: "9.1% Share Ratio", category: "Trending" },
      { hook: `A confidential guide to client retention using custom intelligence pipelines`, reach: "7.6k", rate: "8.2% Save Rate", category: "Premium Content" },
    ];
  }, [userKeywords, stateScope]);

  // Country Reach Breakdown
  const countryReachBreakdown = useMemo(() => {
    return [
      { country: "United States", percentage: 42, count: Math.round(totalReachNum * 0.42) },
      { country: "United Kingdom", percentage: 20, count: Math.round(totalReachNum * 0.20) },
      { country: "South Africa", percentage: 15, count: Math.round(totalReachNum * 0.15) },
      { country: "Canada", percentage: 13, count: Math.round(totalReachNum * 0.13) },
      { country: "Australia", percentage: 10, count: Math.round(totalReachNum * 0.10) },
    ];
  }, [totalReachNum]);

  // Hot Time Optimization slots
  const bestTimesToReach = useMemo(() => {
    return [
      { slot: "09:00 - 11:30 (AM)", engagement: "Peak YouTube & LinkedIn Search", indicator: "94% Hot" },
      { slot: "14:00 - 16:00 (PM)", engagement: "High Instagram & Twitter Retweets", indicator: "87% Active" },
      { slot: "18:00 - 20:30 (PM)", engagement: "Maximum TikTok Visual Spike", indicator: "98% Critical" }
    ];
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      {/* Real-time Loader Overlay */}
      {isAuditing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-white/40 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white border border-orange-100 p-12 rounded-[3rem] shadow-2xl max-w-lg w-full text-center"
          >
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <Zap className="w-10 h-10 text-primary fill-primary" />
            </div>
            <h2 className="text-3xl font-black text-[#111] tracking-tight mb-4">Auditing Workspace...</h2>
            <p className="text-gray-500 font-medium mb-8">
              Your custom 2026 intelligence report and sales dashboard will be <span className="text-[#111] font-bold underline decoration-primary decoration-2">ready in the next few seconds.</span>
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400">
                <span>Calibrating Neural Search Signifiers</span>
                <span>84%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[84%] rounded-full shadow-[0_0_10px_rgba(249,115,36,0.5)]" />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-primary/10 p-2.5 rounded-2xl">
            <Zap className="w-6 h-6 text-primary fill-primary" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-[#111] flex items-center gap-2">
              <span>{activeWorkspace?.company_name || "Workspace Clients"} Intelligence Hub</span>
              {isOwner && (
                <span className="bg-[#111] text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Admin Panel
                </span>
              )}
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              {activeTab === 'analytics' ? 'Analytical predictive models' : 'Discovery Hub prospect ledger'}
            </p>
          </div>
        </div>

        {/* Action Controls & Tab Switching */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Main Workspace Navigation */}
          <div className="bg-gray-100 p-1.5 rounded-2xl flex gap-1 border border-gray-200/50">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white text-[#111] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Analytical Dashboard
            </button>
            <button
              onClick={() => setActiveTab('discovery')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'discovery'
                  ? 'bg-white text-[#111] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Discovery Hub (Leads)
            </button>
          </div>

          {/* Admin Switch Board */}
          {isOwner && (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsAdminView(!isAdminView)}
                variant="outline"
                className={`rounded-xl font-bold h-11 text-xs px-4 uppercase tracking-wider transition-all ${
                  isAdminView
                    ? 'bg-primary border-primary text-white hover:bg-primary/95'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {isAdminView ? "Hide Admin Portal" : "Admin Approvals"}
              </Button>

              <div className="h-6 w-px bg-gray-200" />
              
              {/* Workspace Quick-Selector */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
                <span className="text-[9px] font-black text-gray-400 uppercase">Viewing:</span>
                <select
                  className="bg-transparent border-none text-xs font-black text-[#111] focus:ring-0 cursor-pointer max-w-[140px]"
                  value={activeWorkspace?.id || ''}
                  onChange={(e) => {
                    const found = allProfiles.find((p: any) => p.id === e.target.value);
                    if (found) {
                      setActiveWorkspace(found);
                      setIsAdminView(false);
                    }
                  }}
                >
                  <option value={profile.id}>{profile.company_name} (Self)</option>
                  {allProfiles.filter((p: any) => p.id !== profile.id).map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.company_name || p.email} ({p.is_approved ? 'Approved' : 'Pending'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="hidden lg:flex flex-col items-end px-3">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Access Tier</span>
            <span className="text-xs font-bold text-primary">Enterprise Node 4.0</span>
          </div>

          <Button 
            onClick={handleLogout} 
            variant="outline" 
            className="rounded-xl h-11 border-gray-200 text-xs font-black uppercase text-gray-700 tracking-wider hover:bg-red-50 hover:text-red-600 hover:border-red-100"
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Sandbox Info Banner if workspace is not approved */}
      {!activeWorkspace?.is_approved && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold shadow-md">
          <div className="flex items-center gap-2 text-left">
            <ShieldCheck className="w-5 h-5 shrink-0 text-white fill-orange-600" />
            <span>
              Workspace Pending Authorization — Your unique Signalmerge dashboard is active in validation mode. An admin is reviewing your search parameters to grant full production access.
            </span>
          </div>
          {isOwner && (
            <Button
              onClick={() => approveUser(activeWorkspace.id)}
              className="bg-white hover:bg-gray-100 text-[#111] font-black rounded-xl text-[9px] uppercase tracking-wider px-4 h-8 shrink-0 border-none"
            >
              Approve Workspace
            </Button>
          )}
        </div>
      )}

      {/* Admin Approvals & User Management Drawer */}
      {isAdminView && isOwner && (
        <main className="p-8 max-w-7xl mx-auto w-full animate-in fade-in-50 slide-in-from-top-4 duration-200">
          <div className="bg-white rounded-[2rem] border border-orange-100 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-gray-100 bg-orange-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-[#111] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  Administrator Approvals Panel
                </h2>
                <p className="text-xs text-gray-500 font-medium">Verify credentials and authorize unique workspace instances</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-gray-200 w-fit">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[10px] font-black uppercase text-gray-400">{allProfiles.length} Members Logged</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Company & Client Registration</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Scope Parameters</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Status Verification</th>
                    <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {allProfiles.map((user) => {
                    const isSelf = user.id === profile.id;
                    const reach = ['Instagram', 'TikTok', 'LinkedIn', 'YouTube', 'Twitter'].reduce(
                      (acc, plat) => acc + getPlatformReach(user.customer_keywords, plat), 0
                    );
                    return (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-[#111]">
                              {user.company_name || "New Registry"} {isSelf && " (You)"}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">{user.email}</span>
                            <span className="text-[8px] text-gray-400 uppercase tracking-wider mt-1">ID: {user.id}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-xs space-y-1">
                            <span className="font-bold text-gray-600 block">Pricing: <span className="text-primary">${user.selling_region?.pricing || 1500}</span></span>
                            <span className="text-[10px] font-medium text-gray-400 block truncate max-w-[200px]">
                              Keywords: {user.customer_keywords?.filter((k: any) => k).join(', ') || "None"}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          {user.is_approved ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase">
                              <CheckCircle2 className="w-3.5 h-3.5 fill-green-50 text-green-600" /> Authorized
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase">
                              <Loader2 className="w-3 h-3 animate-spin" /> Pending Approval
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <Button
                              onClick={() => {
                                setActiveWorkspace(user);
                                setIsAdminView(false);
                              }}
                              className="bg-gray-100 hover:bg-gray-200 text-[#111] rounded-xl text-[10px] font-black uppercase tracking-wider px-4 h-9"
                            >
                              Explore Dashboard
                            </Button>
                            
                            {!user.is_approved && (
                              <Button 
                                onClick={() => approveUser(user.id)}
                                className="bg-primary hover:bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider px-5 h-9"
                              >
                                Approve Access
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {/* Main Panel Viewport */}
      {activeTab === 'analytics' ? (
        /* ANALYTICAL DASHBOARD PAGE */
        <div className="relative w-full">
          {!isApproved && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-white/20 backdrop-blur-[6px] select-none pointer-events-none">
              <div className="text-center max-w-lg mx-auto bg-white/95 border border-orange-100/80 shadow-2xl rounded-[2.5rem] p-10 flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300 pointer-events-auto">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center shadow-inner relative animate-pulse">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-[#111] tracking-tight">Analytical Workspace Restricted</h3>
                  <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                    This high-fidelity predictive workspace contains sensitive audience capture and conversion modeling datasets. Admin approval is required to unlock full access.
                  </p>
                </div>
                
                <div className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-left flex items-start gap-4">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-black text-gray-700">Workspace Authorization Pending</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed">
                      Please contact your system administrator or wait for approval to unlock your 2026 intelligence pipeline.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <main className={`p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8 text-[#1A1A1A] transition-all duration-300 ${!isApproved ? 'blur-md pointer-events-none select-none filter' : ''}`}>
          {/* Main Key metrics (Stats Grid) */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Platform Search Reach", value: `${totalReachNum.toLocaleString()} Users`, change: "Keyword Scoped", icon: Eye, desc: "Cumulative platform audience looking for your service offerings." },
              { label: "High-Intent Lead Yield", value: Math.round(totalReachNum * 0.005).toString(), change: "Filtered Target Nodes", icon: Zap, desc: "Leads with verifiable custom signifiers and purchase interest." },
              { label: "Conversion Rate Baseline", value: "1% - 3%", change: "Target Estimate", icon: CheckCircle2, desc: "Standard conversion metrics applied to estimated organic search reach." },
              { label: "Monthly Earnings Estimate", value: `$${minEarnings.toLocaleString()} - $${maxEarnings.toLocaleString()}`, change: "At 1%-3% CR", icon: Globe, desc: "Calculated prediction of potential monthly profit yields." }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 bg-gray-50 rounded-xl">
                      <stat.icon className={`w-5 h-5 ${i === 3 ? 'text-primary' : 'text-gray-400'}`} />
                    </div>
                    <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-lg uppercase tracking-wider">{stat.change}</span>
                  </div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">{stat.label}</p>
                  <p className={`text-2xl font-black text-[#111] leading-tight ${i === 3 ? 'text-primary' : ''}`}>{stat.value}</p>
                </div>
                <p className="text-[10px] text-gray-400 mt-4 leading-relaxed font-semibold">{stat.desc}</p>
              </div>
            ))}
          </div>

          {/* Analytics Predictions forecasting & charts */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[420px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-primary">Sales Predictive Analytics</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">
                  <TrendingUp className="w-3 h-3" /> Growth Curve 2026
                </span>
              </div>
              <h3 className="text-xl font-black text-[#111] tracking-tight mb-8">Estimated Projected Monthly Revenue Growth</h3>
            </div>
            
            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockSalesData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97324" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#F97324" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '12px' }}
                    itemStyle={{ color: '#F97324' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#F97324" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  <Line type="monotone" dataKey="leads" stroke="#111" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <span className="text-[10px] text-gray-400 font-bold block mt-4 border-t border-gray-100 pt-4 uppercase tracking-wider text-center">
              Forecast is mathematically generated from a baseline customer pricing of ${servicePricing} USD at standard conversions.
            </span>
          </div>

          {/* Platform Reach Distribution */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 block mb-1">Platform reach parameters</span>
              <h3 className="text-xl font-black text-[#111] tracking-tight mb-6">Audience Platform Capture Ratio</h3>
            </div>

            <div className="h-[200px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height={100}>
                <PieChart>
                  <Pie
                    data={dynamicPlatformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      '#F97324', // Instagram
                      '#111111', // TikTok
                      '#0A66C2', // LinkedIn
                      '#FF0000', // YouTube
                      '#12B76A'  // Twitter
                    ].map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2.5 mt-6 border-t border-gray-50 pt-4">
              {[
                { name: "Instagram", color: "#F97324" },
                { name: "TikTok", color: "#111111" },
                { name: "LinkedIn", color: "#0A66C2" },
                { name: "YouTube", color: "#FF0000" },
                { name: "Twitter", color: "#12B76A" }
              ].map((plat, idx) => {
                const reach = getPlatformReach(userKeywords, plat.name);
                return (
                  <div key={plat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: plat.color }} />
                      <span className="text-xs font-bold text-gray-600">{plat.name}</span>
                    </div>
                    <span className="text-xs font-black text-[#111]">
                      {reach} searches ({((reach / totalReachNum) * 100).toFixed(0)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bento Grid Layer for Country Reach & Best times */}
          <div className="lg:col-span-2 bg-[#111] text-white p-8 rounded-[2.5rem] relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16" />
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Country Reach */}
              <div className="space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary">Regional demographics</span>
                  <h4 className="text-lg font-black tracking-tight">Geo-Country Reach Distribution</h4>
                </div>

                <div className="space-y-3.5">
                  {countryReachBreakdown.map((item) => (
                    <div key={item.country} className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-300">
                        <span className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-gray-500" />
                          {item.country}
                        </span>
                        <span>{item.percentage}% ({item.count} searchers)</span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${item.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best Times to Reach Audience */}
              <div className="space-y-6 border-t md:border-t-0 md:border-l border-white/15 pt-6 md:pt-0 md:pl-8">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary font-mono select-none">Temporal metrics</span>
                  <h4 className="text-lg font-black tracking-tight">Best Times For Maximum Engagement</h4>
                </div>

                <div className="space-y-4">
                  {bestTimesToReach.map((time, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 p-3.5 rounded-2xl space-y-1.5 flex flex-col justify-between hover:border-primary/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-gray-400 font-mono flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          Slot #{idx+1}
                        </span>
                        <span className="text-[9px] font-black text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md uppercase">
                          {time.indicator}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">{time.slot}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{time.engagement}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <p className="text-[9px] text-gray-500 font-bold uppercase mt-8 border-t border-white/10 pt-4 text-center">
              Temporal optimization based on historical 2026 cognitive activity models.
            </p>
          </div>

          {/* Audience Engagement - Content Attention Grabbers */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="space-y-1 mb-6">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary">Signifier response metrics</span>
              <h3 className="text-xl font-black text-[#111] tracking-tight">High-Attention Content Promoters</h3>
              <p className="text-xs text-gray-400 font-medium">Content hooks that generated interest on user keywords.</p>
            </div>

            <div className="space-y-4 flex-1">
              {attentionGrabbingContent.map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-50 border border-gray-100 rounded-3xl space-y-1 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-primary bg-orange-50 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-primary" />
                      {item.reach} reach
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-800 leading-relaxed italic mt-1.5">
                    "{item.hook}"
                  </p>
                  <span className="text-[9px] font-black uppercase text-gray-400 block mt-2">
                    Predicted interaction: {item.rate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
        </div>
      ) : (
        /* DISCOVERY HUB (SOCIAL SEARCH ENGINE & LEADS) */
        <main className="p-4 sm:p-8 max-w-7xl mx-auto w-full text-[#1A1A1A] space-y-6 sm:space-y-12">
          {/* Section 1: Dynamic Social Media Search Engine */}
          <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden p-4 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
              <div>
                <h2 className="text-xl font-black text-[#111] tracking-tight flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  Intent Search Engine
                </h2>
                <p className="text-xs text-gray-500 font-medium">Scrape social channels (Instagram, TikTok, LinkedIn, Twitter, YouTube) for buyer signifiers</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black bg-orange-50 text-primary border border-primary/20 px-3 py-1.5 rounded-xl uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                  Premium Full-Fidelity View
                </span>
                <span className="text-[10px] font-black bg-[#111] text-white px-3 py-1.5 rounded-xl uppercase">
                  Workspace Keywords: {userKeywords.slice(0, 3).filter(k => k).join(', ') || "outreach"}
                </span>
              </div>
            </div>

            {/* Locked Content Container */}
            <div className="relative">
              {!isAdmin && (
                <div className="absolute inset-x-0 bottom-0 top-0 z-10 flex flex-col items-center justify-center p-6 bg-white/20 backdrop-blur-[6px] select-none pointer-events-none">
                  <div className="text-center max-w-md mx-auto bg-white border border-orange-100/80 shadow-2xl rounded-[2rem] p-8 flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200 pointer-events-auto">
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center shadow-inner relative animate-pulse">
                      <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-[#111] tracking-tight">Intent Search Engine Secured</h4>
                      <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                        The Intent Search Engine is locked. Non-admin users must wait for system administrator approval. Please contact Pete Mkhize for authorized workspace activation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className={`space-y-6 ${!isAdmin ? 'blur-md pointer-events-none select-none filter' : ''}`}>
                {/* Keyword Search Field */}
                <form onSubmit={handleLocalSearch} className="relative w-full max-w-2xl mx-auto">
                  <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-gray-50 border border-gray-200 rounded-2xl p-2 gap-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all shadow-sm">
                    <div className="flex items-center flex-1">
                      <Search className="w-5 h-5 text-gray-400 ml-3" />
                      <Input 
                        value={innerSearchValue}
                        onChange={(e) => setInnerSearchValue(e.target.value)}
                        placeholder="Enter custom keywords (e.g. 'n8n tools', 'need figma designer')..."
                        className="border-none shadow-none focus-visible:ring-0 text-sm bg-transparent pl-2 pr-2 h-10 w-full font-bold placeholder:font-medium placeholder:text-gray-400"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isLoadingResults || isSearchingTransition} 
                      className="h-10 px-6 rounded-xl bg-primary hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider gap-2 shadow-md shadow-orange-500/20 shrink-0"
                    >
                      {isLoadingResults || isSearchingTransition ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>Run Agents <Zap className="w-3.5 h-3.5 fill-white" /></>
                      )}
                    </Button>
                  </div>
                  <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-3">
                    {activeQuery ? `Currently searching: "${activeQuery}"` : `Default matching workspace keyword: "${userKeywords[0] || 'leads'}"`}
                  </p>
                </form>

                {correctedQuery && (
                  <div className="mt-3 bg-orange-50/50 border border-orange-100 rounded-2xl p-4 text-xs font-bold text-orange-750 max-w-2xl mx-auto text-center flex flex-col sm:flex-row items-center justify-center gap-2 shadow-sm shadow-orange-500/5">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                      <span className="uppercase text-[9px] tracking-widest text-orange-850 font-black">Search Correction</span>
                    </div>
                    <span>
                      We found similar demand for <span className="underline decoration-2 underline-offset-2 text-primary font-black uppercase tracking-wider">"{correctedQuery}"</span> instead of <code className="bg-orange-100/50 px-1.5 py-0.5 rounded font-mono">"{activeQuery}"</code>.
                    </span>
                  </div>
                )}

                {/* Live Search Table View */}
                <div className="border border-gray-100 rounded-[2rem] overflow-hidden bg-gray-50/20 relative">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-100/30 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                          <th className="px-8 py-5">Platform</th>
                          <th className="px-8 py-5">Demand Content & Intent</th>
                          <th className="px-8 py-5">Location</th>
                          <th className="px-8 py-5">Time</th>
                          {isAdmin && <th className="px-8 py-5 text-right whitespace-nowrap">Source Profile</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 bg-white">
                        {filteredResults.length > 0 && !isSearchingTransition ? (
                          filteredResults.slice(0, 30).map((result, idx) => {
                            const isBlurred = idx >= 15;
                            return (
                              <motion.tr 
                                key={result.id} 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.02 }}
                                className={`hover:bg-orange-50/5 transition-colors group ${isBlurred ? "filter blur-[4px] select-none pointer-events-none opacity-40" : ""}`}
                              >
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-2">
                                  <PlatformIcon platform={result.platform} />
                                  <div className="bg-gray-100 border border-gray-200 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg text-gray-400">
                                    {result.platform}
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6 max-w-md">
                                <p className="text-sm font-bold text-[#111] mb-2 line-clamp-2 leading-relaxed">
                                  {result.content}
                                </p>
                                <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" /> {result.views}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Heart className="w-3 h-3" /> {result.likes}
                                  </span>
                                  <div className="flex gap-1">
                                    {result.hashtags && result.hashtags.map(tag => (
                                      <span key={tag} className="text-primary font-bold">{tag}</span>
                                    ))}
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                  <Globe className="w-3.5 h-3.5 text-gray-400" />
                                  {result.location}
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <span className="text-xs font-bold text-gray-400">
                                  {result.time}
                                </span>
                              </td>
                              {isAdmin && (
                                <td className="px-8 py-6 text-right">
                                  {/* Fully Unlocked external URLs for Premium Users */}
                                  <a 
                                    href={result.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center rounded-xl border border-primary/25 bg-orange-50 text-primary hover:bg-primary hover:text-white transition-all gap-2 text-[10px] font-black uppercase px-4 py-2 transform hover:scale-[1.03]"
                                  >
                                    Open Source <ExternalLink className="w-3 h-3" />
                                  </a>
                                </td>
                              )}
                            </motion.tr>
                          ); })
                        ) : (
                          <tr>
                            <td colSpan={isAdmin ? 6 : 5} className="px-8 py-24 text-center">
                              <div className="flex flex-col items-center gap-4">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                <p className="text-gray-400 text-xs font-black uppercase tracking-[0.1em]">AI Crawling Intent Databases...</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {filteredResults.length > 15 && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-32 pb-12 flex flex-col items-center justify-center text-center p-8 z-20 pointer-events-auto">
                      <div className="bg-white border border-orange-100 rounded-[2rem] p-8 max-w-lg shadow-2xl relative">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white font-black px-5 py-2 rounded-full text-[9px] uppercase tracking-widest flex items-center gap-1 shadow-md">
                          <Sparkles className="w-3 h-3 fill-white" /> Core Limit Reached
                        </div>
                        <h3 className="text-base font-black text-gray-950 mb-3 mt-2 leading-snug uppercase tracking-tight">
                          Unlock 15+ More Real-Time Leads
                        </h3>
                        <p className="text-gray-650 text-xs font-bold leading-relaxed mb-6">
                          Subscribe for only <strong className="text-primary font-black text-orange-600">$80 a month</strong> to get unlimited leads or every time someone is looking for your services online.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                          <a 
                            href="https://pay.yoco.com/mergemega?amount=3040" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            referrerPolicy="no-referrer"
                            className="w-full sm:w-auto text-center rounded-xl bg-primary hover:bg-orange-650 text-white px-6 py-3.5 text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2"
                          >
                            Subscribe Now <Zap className="w-3.5 h-3.5 fill-white" />
                          </a>
                          <Link 
                            to="/digital-consulting-pros#payment-section"
                            className="w-full sm:w-auto text-center rounded-xl bg-gray-50 hover:bg-gray-150 text-gray-550 px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border border-gray-200"
                          >
                            See Pricing Setup
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Personal Outreach conversion ledger */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-[#111] tracking-tight">Active Conversion Leads</h2>
                <p className="text-xs text-gray-500 font-medium">Verified demand signals captured by agent crawler nodes</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black bg-orange-50 text-primary border border-primary/20 px-3 py-1.5 rounded-xl uppercase">
                  Scope state: {stateScope}
                </span>
                <span className="text-[10px] font-black bg-[#111] text-white px-3 py-1.5 rounded-xl uppercase">
                  Scope keywords: {userKeywords.slice(0, 3).filter(k => k).join(', ') || "outreach, campaigns, growth"}
                </span>
              </div>
            </div>

            {/* Leads Listing */}
            <div className="relative p-8 animate-in fade-in duration-300">
              {!isAdmin && (
                <div className="absolute inset-x-0 bottom-0 top-0 z-10 flex flex-col items-center justify-center p-6 bg-white/20 backdrop-blur-[6px] select-none rounded-[2.5rem] pointer-events-none">
                  <div className="text-center max-w-md mx-auto bg-white border border-orange-100/80 shadow-2xl rounded-[2rem] p-8 flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200 pointer-events-auto">
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center shadow-inner relative animate-pulse">
                      <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-[#111] tracking-tight">Active Conversion Leads Secured</h4>
                      <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                        Verified demand signals captured by agent crawler nodes are restricted strictly to System Administrators. Please contact Pete Mkhize for authorized workspace credentials.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300 ${!isAdmin ? 'blur-md pointer-events-none select-none filter' : ''}`}>
                {dynamicLeads.map((lead, idx) => (
                  <div key={idx} className="bg-white border border-gray-100 hover:border-primary/40 rounded-[2rem] p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-1.5 w-full bg-orange-50 px-3" />
                    
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-1.5">
                          <div className="bg-primary/10 p-1 rounded-lg">
                            <Zap className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="text-xs font-black text-[#111]">{lead.name}</span>
                        </div>
                        <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                          {lead.match} Match
                        </span>
                      </div>

                      <p className="text-xs font-bold text-gray-700 leading-relaxed mb-4 min-h-[50px]">
                        "{lead.content}"
                      </p>
                    </div>

                    <div className="border-t border-gray-100 pt-4 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 font-bold">{lead.role || "Prospect"}</span>
                        <span className="text-[10px] text-gray-400 font-mono block">{lead.date}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <PlatformIcon platform={lead.platform as any} />
                        <span className="text-[9px] font-black text-gray-400 uppercase font-mono">{lead.platform}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.1em]">
                Signalmerge Node Crawlers execute dynamic updates every 12 hours.
              </span>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchValue, setSearchValue] = useState(query);
  const [liveResults, setLiveResults] = useState<DemandResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [correctedQuery, setCorrectedQuery] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authStep, setAuthStep] = useState<'input' | 'sent' | 'loading'>('input');
  const authStepRef = React.useRef(authStep);
  useEffect(() => {
    authStepRef.current = authStep;
  }, [authStep]);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Initializing Supabase Auth listeners...");
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error("Error getting session:", error);
      if (session) {
        console.log("Session detected:", session.user.email);
        setSession(session);
      }
      setIsAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change event:", event, session?.user?.email);
      setSession(session);
      if (session && event === 'SIGNED_IN') {
        setIsAuthModalOpen(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => {
    setIsAuthModalOpen(true);
    setAuthStep('input');
    setAuthError(null);
    setAuthPassword("");
  };

  const submitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = authEmail.trim().toLowerCase();
    
    console.log("submitAuth triggered with email:", cleanEmail);
    if (!authPassword) {
      setAuthError("Please provide your login password.");
      return;
    }

    setAuthStep('loading');
    setAuthError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: authPassword
      });

      if (error) {
        console.error("Login authentication failure:", error);
        setAuthError(`Authentication failed: ${error.message}`);
        setAuthStep('input');
      } else {
        console.log("Signed in successfully!");
        setIsAuthModalOpen(false);
      }
    } catch (err: any) {
      console.error("Unexpected error during login:", err);
      setAuthError(`An unexpected error occurred: ${err.message || 'Unknown error'}`);
      setAuthStep('input');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    async function fetchLiveResults() {
      if (!query) {
        setLiveResults([]);
        setError(null);
        setCorrectedQuery(null);
        return;
      }
      
      // Save query input to Supabase
      saveSearchQuery(query, session?.user?.email);
      
      setIsLoading(true);
      setError(null);
      setCorrectedQuery(null);
      try {
        const results = await searchSocialMedia(query);
        if (results && (results as any)._rateLimited) {
          setLiveResults(results || []);
          setError("AI Scanner is busy. Showing results from 2026 database.");
          if ((results as any).correctedQuery) {
            setCorrectedQuery((results as any).correctedQuery);
          }
        } else {
          setLiveResults(results);
          if ((results as any).correctedQuery) {
            setCorrectedQuery((results as any).correctedQuery);
          }
        }
      } catch (err: any) {
        console.error("Live search failed:", err);
        setError("AI Scanning is at capacity. Using 2026 discovery database.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchLiveResults();
  }, [query]);

  const databaseResults = useMemo(() => {
    const clientsAsResults: DemandResult[] = mockClients.map(client => {
      let sourceUrl = `https://www.google.com/search?q=${encodeURIComponent(client.name + ' ' + client.handle)}`;
      
      const cleanHandle = client.handle.startsWith('@') ? client.handle.substring(1) : client.handle;
      
      if (client.platform === 'Twitter') {
        sourceUrl = `https://x.com/${cleanHandle}`;
      } else if (client.platform === 'LinkedIn') {
        sourceUrl = `https://www.linkedin.com/in/${cleanHandle}`;
      } else if (client.platform === 'Reddit') {
        sourceUrl = `https://www.reddit.com/${cleanHandle.startsWith('u/') ? cleanHandle : 'u/' + cleanHandle}`;
      } else if (client.platform === 'Instagram') {
        sourceUrl = `https://www.instagram.com/${cleanHandle}`;
      }

      return {
        id: `client-${client.id}`,
        platform: client.platform as any,
        content: client.intent,
        views: `${client.score}% Match`,
        likes: 'Direct Lead',
        hashtags: [],
        location: client.location,
        contactStatus: 'Hot Prospect',
        time: '2026',
        sourceUrl
      };
    });

    return [...tiktokDataset, ...instagramDataset, ...clientsAsResults];
  }, []);

  const allResults = useMemo(() => {
    return [...liveResults, ...databaseResults];
  }, [liveResults, databaseResults]);

  const filteredResults = useMemo(() => {
    const source = allResults;
    const effectiveQuery = correctedQuery || query;

    if (!effectiveQuery) return source.slice(0, 10);
    const lowerQuery = effectiveQuery.toLowerCase();
    const targetCountry = detectQueryCountry(lowerQuery);
    
    // Filter results that match the query
    const matches = source.filter(item => {
      if (targetCountry) {
        const itemLoc = item.location.toLowerCase();
        const itemContent = item.content.toLowerCase();
        let isCountryMatch = false;

        if (targetCountry === "china" && (itemLoc.includes("china") || itemLoc.includes("hong kong") || itemLoc.includes("hongkong") || itemContent.includes("china") || itemContent.includes("chinese"))) isCountryMatch = true;
        else if (targetCountry === "philippines" && (itemLoc.includes("philippines") || itemLoc.includes("manila") || itemLoc.includes("philipines"))) isCountryMatch = true;
        else if (targetCountry === "thailand" && (itemLoc.includes("thailand") || itemLoc.includes("bangkok"))) isCountryMatch = true;
        else if (targetCountry === "vietnam" && (itemLoc.includes("vietnam") || itemLoc.includes("hanoi") || itemLoc.includes("viet nam"))) isCountryMatch = true;
        else if (targetCountry === "hong kong" && (itemLoc.includes("hong kong") || itemLoc.includes("hongkong"))) isCountryMatch = true;
        else if (targetCountry === "singapore" && itemLoc.includes("singapore")) isCountryMatch = true;
        else if (targetCountry === "sweden" && (itemLoc.includes("sweden") || itemLoc.includes("stockholm") || itemLoc.includes("gothenburg") || itemContent.includes("sweden") || itemContent.includes("swedish"))) isCountryMatch = true;
        else if (targetCountry === "switzerland" && (itemLoc.includes("switzerland") || itemLoc.includes("zurich") || itemLoc.includes("geneva") || itemLoc.includes("swiss") || itemContent.includes("switzerland") || itemContent.includes("swiss"))) isCountryMatch = true;
        else if (targetCountry === "italy" && (itemLoc.includes("italy") || itemLoc.includes("milan") || itemLoc.includes("italian") || itemContent.includes("italy") || itemContent.includes("italian"))) isCountryMatch = true;
        else if (targetCountry === "usa" && (itemLoc.includes("usa") || itemLoc.includes("united states") || itemLoc.includes("ny") || itemLoc.includes("ca") || itemLoc.includes("tx") || itemLoc.includes("fl") || itemLoc.includes("wa"))) isCountryMatch = true;
        else if (targetCountry === "uk" && (itemLoc.includes("uk") || itemLoc.includes("united kingdom") || itemLoc.includes("london") || itemLoc.includes("ireland"))) isCountryMatch = true;
        else if (targetCountry === "south africa" && (itemLoc.includes("south africa") || itemLoc.includes("johannesburg") || itemLoc.includes("cape town") || itemLoc.includes("durban") || itemLoc.includes("pretoria") || itemLoc.includes("port elizabeth") || itemLoc.includes("soweto") || itemLoc.includes("sandton") || itemLoc.includes("sa"))) isCountryMatch = true;
        else if (itemLoc.includes(targetCountry)) isCountryMatch = true;

        if (!isCountryMatch) return false;
      }

      return (
        item.content.toLowerCase().includes(lowerQuery) ||
        (item.hashtags && item.hashtags.some(tag => tag.toLowerCase().includes(lowerQuery))) ||
        item.location.toLowerCase().includes(lowerQuery) ||
        item.platform.toLowerCase().includes(lowerQuery) ||
        lowerQuery.split(' ').some(word => word.length > 2 && item.content.toLowerCase().includes(word))
      );
    });

    return matches;
  }, [correctedQuery, query, allResults]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    
    setIsScanning(true);
    setTimeout(() => {
      setSearchParams({ q: searchValue });
      setIsScanning(false);
    }, 3500);
  };

  const [onboardingData, setOnboardingData] = useState({
    email: "",
    password: "",
    companyName: "",
    location: "",
    socials: {
      instagram: "",
      linkedin: "",
      facebook: "",
      tiktok: ""
    },
    customerPhrases: ["", "", "", "", ""],
    customerKeywords: ["", "", "", "", ""],
    usp: "",
    sellingRegion: {
      county: "",
      state: "",
      pricing: 1500,
      integrations: [] as string[]
    }
  });
  const [auditStep, setAuditStepIdx] = useState(0);
  const [auditCompleted, setAuditCompleted] = useState(false);
  const [showBIDashboard, setShowBIDashboard] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  const handleNextStep = (currentStep: number) => {
    setAuditError(null);
    setAuthError(null);
    
    if (currentStep === 0) {
      if (!onboardingData.companyName.trim()) {
        setAuditError("Company Name is required.");
        return;
      }
      if (!onboardingData.location.trim()) {
        setAuditError("Location / Headquarters is required.");
        return;
      }
      setAuditStepIdx(1);
    } else if (currentStep === 1) {
      if (!onboardingData.socials.instagram.trim()) {
        setAuditError("Instagram URL is required. Please provide a link as part of your Social Infrastructure.");
        return;
      }
      if (!onboardingData.socials.linkedin.trim()) {
        setAuditError("LinkedIn URL is required. Please provide a link as part of your Social Infrastructure.");
        return;
      }
      if (!onboardingData.socials.facebook.trim()) {
        setAuditError("Facebook URL is required. Please provide a link as part of your Social Infrastructure.");
        return;
      }
      if (!onboardingData.socials.tiktok.trim()) {
        setAuditError("TikTok URL is required. Please provide a link as part of your Social Infrastructure.");
        return;
      }
      setAuditStepIdx(2);
    } else if (currentStep === 2) {
      if (!onboardingData.usp.trim()) {
        setAuditError("Unique Selling Point (USP) is required.");
        return;
      }
      const unfilledPhraseIndex = onboardingData.customerPhrases.findIndex(p => !p.trim());
      if (unfilledPhraseIndex !== -1) {
        setAuditError(`Please fill in all 5 phrases describing your target. Phrase ${unfilledPhraseIndex + 1} is empty.`);
        return;
      }
      setAuditStepIdx(3);
    } else if (currentStep === 3) {
      const unfilledKeywordIndex = onboardingData.customerKeywords.findIndex(k => !k.trim());
      if (unfilledKeywordIndex !== -1) {
        setAuditError(`Please fill in all 5 core keywords. Keyword ${unfilledKeywordIndex + 1} is empty.`);
        return;
      }
      if (!onboardingData.sellingRegion.pricing || onboardingData.sellingRegion.pricing <= 0) {
        setAuditError("Offer Pricing is required and must be greater than zero.");
        return;
      }
      setAuditStepIdx(4);
    } else if (currentStep === 4) {
      if (!onboardingData.sellingRegion.integrations || onboardingData.sellingRegion.integrations.length === 0) {
        setAuditError("Please select at least one Core System Integration to continue.");
        return;
      }
      setAuditStepIdx(5);
    }
  };

  const handlePrevStep = (prevStep: number) => {
    setAuditError(null);
    setAuthError(null);
    setAuditStepIdx(prevStep);
  };

  useEffect(() => {
    const checkProfile = async () => {
      if (session?.user) {
        setIsProfileLoading(true);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          const isAdminSession = session?.user?.email === 'petemkhize@gmail.com';

          if (data) {
            setUserProfile(data);
            if (data.audit_completed || isAdminSession) {
              console.log("Existing audit or admin master session found, skipping onboarding");
              setOnboardingData(prev => ({
                ...prev,
                companyName: data.company_name || "",
                location: data.location || "",
                socials: data.socials || prev.socials,
                customerPhrases: data.customer_phrases || prev.customerPhrases,
                customerKeywords: data.customer_keywords || prev.customerKeywords,
                usp: data.usp || "",
                sellingRegion: {
                  state: data.selling_region?.state || "",
                  county: data.selling_region?.county || "",
                  pricing: data.selling_region?.pricing || 1500,
                  integrations: data.selling_region?.integrations || []
                }
              }));
              setAuditCompleted(true);
              setShowBIDashboard(true);
            }
          } else if (isAdminSession) {
            console.log("Admin session found but no database profile row exists yet, allowing dashboard access directly.");
            setAuditCompleted(true);
            setShowBIDashboard(true);
          }
        } catch (err) {
          console.error("Error checking profile:", err);
        } finally {
          setIsProfileLoading(false);
        }
      } else {
        setIsProfileLoading(false);
      }
    };
    checkProfile();
  }, [session]);

  const handleAuditSubmit = async () => {
    setAuditError(null);
    setAuthError(null);

    if (!onboardingData.email.trim()) {
      setAuditError("Email Address is required.");
      setAuditStepIdx(5);
      return;
    }
    if (!onboardingData.password.trim()) {
      setAuditError("Secure Password is required.");
      setAuditStepIdx(5);
      return;
    }
    if (onboardingData.password.trim().length < 6) {
      setAuditError("Secure Password must be at least 6 characters.");
      setAuditStepIdx(5);
      return;
    }
    if (!onboardingData.sellingRegion.state.trim()) {
      setAuditError("Sales State is required.");
      setAuditStepIdx(5);
      return;
    }
    if (!onboardingData.sellingRegion.county.trim()) {
      setAuditError("Sales County / Area is required.");
      setAuditStepIdx(5);
      return;
    }
    
    setIsSigningUp(true);
    
    try {
      // 1. Create the Auth account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: onboardingData.email,
        password: onboardingData.password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });

      if (signUpError) {
        setAuthError(`Registration failed: ${signUpError.message}`);
        setIsSigningUp(false);
        return;
      }

      const userId = authData.user?.id;
      if (userId) {
        // 2. Save the discovery audit data immediately to profiles
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email: onboardingData.email,
            company_name: onboardingData.companyName,
            location: onboardingData.location,
            socials: onboardingData.socials,
            customer_phrases: onboardingData.customerPhrases,
            customer_keywords: onboardingData.customerKeywords,
            usp: onboardingData.usp,
            selling_region: onboardingData.sellingRegion,
            audit_completed: true,
            is_approved: false, // Manual approval required
            updated_at: new Date().toISOString(),
          });

        if (upsertError) console.error("Error saving audit profiles:", upsertError);
      }

      // 3. Immediately log the user in to populate session and access the blurred analytics screen
      try {
        await supabase.auth.signInWithPassword({
          email: onboardingData.email,
          password: onboardingData.password
        });
      } catch (logErr) {
        console.warn("Bypassed autologin trigger:", logErr);
      }

      setSignupSuccess(true);
      setAuditCompleted(true);
    } catch (err: any) {
      setAuthError(`An unexpected error occurred: ${err.message}`);
    } finally {
      setIsSigningUp(false);
    }
  };

  const [startedSignup, setStartedSignup] = useState(false);

  const toggleIntegration = (tool: string) => {
    const current = onboardingData.sellingRegion.integrations || [];
    let updated;
    if (current.includes(tool)) {
      updated = current.filter(t => t !== tool);
    } else {
      updated = [...current, tool];
    }
    setOnboardingData({
      ...onboardingData,
      sellingRegion: {
        ...onboardingData.sellingRegion,
        integrations: updated
      }
    });
  };

  if (!session && startedSignup && !auditCompleted) {
    const currentReachTotal = ['Instagram', 'TikTok', 'LinkedIn', 'YouTube', 'Twitter'].reduce(
      (acc, plat) => acc + getPlatformReach(onboardingData.customerKeywords, plat), 0
    );
    const rawMin = Math.round(currentReachTotal * 0.005 * (onboardingData.sellingRegion.pricing || 1500));
    const rawMax = Math.round(currentReachTotal * 0.015 * (onboardingData.sellingRegion.pricing || 1500));
    const minEstEarn = Math.min(rawMin, 8500) || 1200;
    const maxEstEarn = Math.min(rawMax, 20000) || 4500;

    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4 sm:p-6 pb-20">
        <div className="max-w-2xl w-full">
          {/* Progress Header */}
          <div className="mb-6 md:mb-10 w-full flex flex-col gap-4">
            <button 
              onClick={() => {
                setStartedSignup(false);
                setSearchParams({});
              }}
              className="self-start flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-black text-xs uppercase tracking-wider bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-primary" />
              Back to Discovery Hub
            </button>
            <div className="flex items-center gap-3 mt-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
                <Zap className="text-white w-5 h-5 fill-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-[#111] tracking-tight">Customer Audit Process</h1>
                <p className="text-gray-500 font-medium text-xs">Step {auditStep + 1} of 6 • Configure your 2026 intelligence engine</p>
              </div>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${((auditStep) / 5) * 100}%` }}
                className="h-full bg-primary"
              />
            </div>
          </div>

          <motion.div 
            key={auditStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-gray-100 rounded-2xl md:rounded-[2.5rem] p-5 md:p-10 shadow-2xl shadow-orange-500/5 relative overflow-hidden"
          >
            {authError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl select-text">
                <p className="text-xs text-red-600 font-bold">{authError}</p>
              </div>
            )}

            {auditError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl select-text flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block shrink-0" />
                <p className="text-xs text-red-600 font-bold">{auditError}</p>
              </div>
            )}

            {auditStep === 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-black text-[#111]">Business Profile</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Company Name</label>
                    <Input 
                      placeholder="Signalmerge Inc."
                      value={onboardingData.companyName}
                      onChange={e => setOnboardingData({...onboardingData, companyName: e.target.value})}
                      className="h-14 rounded-2xl border-gray-100 bg-gray-50 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Location / Headquarters</label>
                    <Input 
                      placeholder="New York, NY"
                      value={onboardingData.location}
                      onChange={e => setOnboardingData({...onboardingData, location: e.target.value})}
                      className="h-14 rounded-2xl border-gray-100 bg-gray-50 font-bold"
                    />
                  </div>
                </div>

                <Button onClick={() => handleNextStep(0)} className="w-full h-14 bg-primary hover:bg-orange-600 rounded-2xl text-white font-black uppercase tracking-widest">
                  Start Audit <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <p className="text-center text-[10px] font-bold text-gray-400">
                  <button 
                    type="button" 
                    onClick={() => setIsTermsModalOpen(true)}
                    className="hover:text-primary underline cursor-pointer focus:outline-none transition-colors"
                  >
                    Terms and Conditions Apply
                  </button>
                </p>
              </div>
            )}

            {auditStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-black text-[#111]">Social Infrastructure</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      placeholder="Instagram URL"
                      className="pl-12 h-14 rounded-2xl bg-gray-50 border-gray-100"
                      value={onboardingData.socials.instagram}
                      onChange={e => setOnboardingData({...onboardingData, socials: {...onboardingData.socials, instagram: e.target.value}})}
                    />
                  </div>
                  <div className="relative">
                    <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      placeholder="LinkedIn URL"
                      className="pl-12 h-14 rounded-2xl bg-gray-50 border-gray-100"
                      value={onboardingData.socials.linkedin}
                      onChange={e => setOnboardingData({...onboardingData, socials: {...onboardingData.socials, linkedin: e.target.value}})}
                    />
                  </div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      placeholder="Facebook URL"
                      className="pl-12 h-14 rounded-2xl bg-gray-50 border-gray-100"
                      value={onboardingData.socials.facebook}
                      onChange={e => setOnboardingData({...onboardingData, socials: {...onboardingData.socials, facebook: e.target.value}})}
                    />
                  </div>
                  <div className="relative">
                    <Music2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      placeholder="TikTok URL"
                      className="pl-12 h-14 rounded-2xl bg-gray-50 border-gray-100"
                      value={onboardingData.socials.tiktok}
                      onChange={e => setOnboardingData({...onboardingData, socials: {...onboardingData.socials, tiktok: e.target.value}})}
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => handlePrevStep(0)} className="flex-1 h-14 rounded-2xl border-gray-100 font-bold uppercase text-[10px]">Back</Button>
                  <Button onClick={() => handleNextStep(1)} className="flex-[2] h-14 bg-primary hover:bg-orange-600 rounded-2xl text-white font-black uppercase tracking-widest">Next Step</Button>
                </div>
              </div>
            )}

            {auditStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Search className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-black text-[#111]">Customer Profiling</h3>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Unique Selling Point (USP)</label>
                  <Input 
                    placeholder="We provide the fastest AI customer discovery in 2026..."
                    className="h-14 rounded-2xl bg-gray-50 border-gray-100"
                    value={onboardingData.usp}
                    onChange={e => setOnboardingData({...onboardingData, usp: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">5 Phrases describing your target</label>
                  {onboardingData.customerPhrases.map((phrase, i) => (
                    <Input 
                      key={i}
                      placeholder={`Phrase ${i+1}: "looking for...."`}
                      className="h-12 rounded-xl bg-gray-50 border-gray-100 italic font-bold"
                      value={phrase}
                      onChange={e => {
                        const newPhrases = [...onboardingData.customerPhrases];
                        newPhrases[i] = e.target.value;
                        setOnboardingData({...onboardingData, customerPhrases: newPhrases});
                      }}
                    />
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={() => handlePrevStep(1)} className="flex-1 h-14 rounded-2xl border-gray-100 font-bold uppercase text-[10px]">Back</Button>
                  <Button onClick={() => handleNextStep(2)} className="flex-[2] h-14 bg-primary hover:bg-orange-600 rounded-2xl text-white font-black uppercase tracking-widest">Next Step</Button>
                </div>
              </div>
            )}

            {auditStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <X className="w-5 h-5 text-primary rotate-45" />
                  </div>
                  <h3 className="text-lg font-black text-[#111]">Keywords, Pricing & Revenue Reach</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">5 Core Keywords</label>
                    <div className="grid grid-cols-1 gap-2">
                      {onboardingData.customerKeywords.map((kw, i) => (
                        <Input 
                          key={i}
                          placeholder={`Search Keyword ${i+1}`}
                          className="h-11 rounded-xl bg-gray-50 border-gray-100 font-bold"
                          value={kw}
                          onChange={e => {
                            const newKeywords = [...onboardingData.customerKeywords];
                            newKeywords[i] = e.target.value;
                            setOnboardingData({...onboardingData, customerKeywords: newKeywords});
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Offer Pricing ($ USD per Client)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400 text-sm">$</span>
                        <Input 
                          type="number"
                          placeholder="1500"
                          className="pl-8 h-14 rounded-2xl bg-gray-50 border-gray-100 font-bold text-primary text-lg"
                          value={onboardingData.sellingRegion.pricing || ""}
                          onChange={e => setOnboardingData({
                            ...onboardingData,
                            sellingRegion: {
                              ...onboardingData.sellingRegion,
                              pricing: Number(e.target.value) || 0
                            }
                          })}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-gray-400 block ml-1 leading-relaxed">
                        Specify how much you charge to approximate potential earnings.
                      </span>
                    </div>

                    <div className="p-5 bg-gray-50 border border-gray-100 rounded-3xl space-y-4">
                      <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">Estimated Social Search Reach</span>
                      
                      <div className="space-y-2.5">
                        {[
                          { name: "Instagram", icon: Instagram, color: "text-[#E4405F]" },
                          { name: "TikTok", icon: Music2, color: "text-[#111]" },
                          { name: "LinkedIn", icon: Linkedin, color: "text-[#0A66C2]" },
                          { name: "YouTube", icon: Youtube, color: "text-[#FF0000]" },
                          { name: "Twitter", icon: Twitter, color: "text-[#1DA1F2]" }
                        ].map(plat => {
                          const reach = getPlatformReach(onboardingData.customerKeywords, plat.name);
                          const IconComp = plat.icon;
                          return (
                            <div key={plat.name} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <IconComp className={`w-3.5 h-3.5 ${plat.color}`} />
                                <span className="text-xs font-bold text-gray-600">{plat.name}</span>
                              </div>
                              <span className="text-xs font-black text-[#111]">{reach.toLocaleString()} searchers</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="border-t border-gray-200/50 pt-3">
                        <span className="text-[9px] font-black uppercase text-gray-400 block mb-1">Projected Earnings (1%-3% CR)</span>
                        <span className="text-sm font-black text-primary block">
                          ${minEstEarn.toLocaleString()} - ${maxEstEarn.toLocaleString()} <span className="text-[10px] font-medium text-gray-500">USD / mo</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={() => handlePrevStep(2)} className="flex-1 h-14 rounded-2xl border-gray-100 font-bold uppercase text-[10px]">Back</Button>
                  <Button onClick={() => handleNextStep(3)} className="flex-[2] h-14 bg-primary hover:bg-orange-600 rounded-2xl text-white font-black uppercase tracking-widest">Next Step</Button>
                </div>
              </div>
            )}

            {auditStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <X className="w-5 h-5 text-primary rotate-45" />
                  </div>
                  <h3 className="text-lg font-black text-[#111]">Core System Integrations</h3>
                </div>

                <p className="text-xs font-medium text-gray-500 leading-relaxed mb-4">
                  Select the customer lifecycle platforms and SaaS systems you want to automatically integrate with the Signalmerge workflow nodes:
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Calendly', 'Google Calendar', 'Zapier', 'n8n', 'Make', 'Jotform', 'Other'].map(tool => {
                    const isSelected = onboardingData.sellingRegion.integrations?.includes(tool);
                    return (
                      <button
                        key={tool}
                        type="button"
                        onClick={() => toggleIntegration(tool)}
                        className={`p-4 h-16 rounded-2xl border text-xs font-black transition-all flex items-center justify-between text-left ${
                          isSelected
                            ? 'bg-orange-50/50 border-primary text-primary shadow-sm'
                            : 'bg-gray-50/50 border-gray-100 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{tool}</span>
                        {isSelected ? (
                          <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center p-0.5">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 border border-gray-200 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-4 pt-6">
                  <Button variant="outline" onClick={() => handlePrevStep(3)} className="flex-1 h-14 rounded-2xl border-gray-100 font-bold uppercase text-[10px]">Back</Button>
                  <Button onClick={() => handleNextStep(4)} className="flex-[2] h-14 bg-primary hover:bg-orange-600 rounded-2xl text-white font-black uppercase tracking-widest">Next Step</Button>
                </div>
              </div>
            )}

            {auditStep === 5 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-black text-[#111]">Finalize Intelligence Record</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Email Address</label>
                    <Input 
                      type="email"
                      placeholder=""
                      className="h-14 rounded-2xl bg-gray-50 border-gray-100 font-bold"
                      value={onboardingData.email}
                      onChange={e => setOnboardingData({...onboardingData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Secure Password</label>
                    <Input 
                      type="password"
                      placeholder="••••••••"
                      className="h-14 rounded-2xl bg-gray-50 border-gray-100 font-bold"
                      value={onboardingData.password}
                      onChange={e => setOnboardingData({...onboardingData, password: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Sales State</label>
                    <Input 
                      placeholder="California"
                      className="h-14 rounded-2xl bg-gray-50 border-gray-100 font-bold"
                      value={onboardingData.sellingRegion.state}
                      onChange={e => setOnboardingData({...onboardingData, sellingRegion: {...onboardingData.sellingRegion, state: e.target.value}})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Sales County / Area</label>
                    <Input 
                      placeholder="Los Angeles"
                      className="h-14 rounded-2xl bg-gray-50 border-gray-100 font-bold"
                      value={onboardingData.sellingRegion.county}
                      onChange={e => setOnboardingData({...onboardingData, sellingRegion: {...onboardingData.sellingRegion, county: e.target.value}})}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={() => handlePrevStep(4)} className="flex-1 h-14 rounded-2xl border-gray-100 font-bold uppercase text-[10px]">Back</Button>
                  <Button 
                    onClick={handleAuditSubmit} 
                    disabled={isSigningUp}
                    className="flex-[2] h-14 bg-[#111] hover:bg-black rounded-2xl text-white font-black uppercase tracking-widest shadow-xl disabled:opacity-50"
                  >
                    {isSigningUp ? (
                      <>Processing Audit <Loader2 className="w-4 h-4 ml-2 animate-spin" /></>
                    ) : (
                      "Complete Audit & Access Hub"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
        <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
      </div>
    );
  }

  if (isAuthLoading || isProfileLoading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 relative">
            <div className="absolute inset-x-0 bottom-0 h-1 bg-primary rounded-full animate-pulse" />
            <Zap className="w-8 h-8 text-primary fill-primary animate-pulse" />
          </div>
          <h2 className="text-xl font-black text-[#111] mb-2">Syncing Intelligence...</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Re-establishing 2026 Core Connection</p>
        </motion.div>
      </div>
    );
  }

  if (signupSuccess && !session) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <Mail className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-black text-[#111] mb-4">Audit Record Locked.</h2>
          <p className="text-gray-500 font-medium mb-8">
            We've sent a verification link to <span className="text-[#111] font-bold">{onboardingData.email}</span>. Please confirm your email to access your Business Intelligence Dashboard.
          </p>
          <Button onClick={() => window.location.reload()} className="w-full h-14 bg-[#111] rounded-2xl text-white font-black uppercase">
            I've Confirmed my Email
          </Button>
        </div>
      </div>
    );
  }

  const isUserOwner = session?.user?.email === 'petemkhize@gmail.com' || userProfile?.email === 'petemkhize@gmail.com' || userProfile?.role === 'admin';

  if ((auditCompleted || isUserOwner) && session) {
    return <BIDashboard profile={userProfile || { id: session.user.id, email: session.user.email, role: isUserOwner ? 'admin' : 'user' }} handleLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100 px-4 sm:px-8 py-3 sm:py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm group-hover:bg-orange-600 transition-colors">
                  <Zap className="text-white w-5 h-5 fill-white" />
                </div>
                <span className="text-lg font-bold tracking-tight text-[#111]">Signalmerge</span>
              </Link>
              <div className="sm:hidden flex items-center gap-2">
                {!session && (
                  <Button 
                    onClick={() => setIsAuthModalOpen(true)}
                    variant="outline"
                    className="rounded-xl border-gray-200 text-gray-600 font-bold px-3 py-1 text-xs uppercase"
                  >
                    Login
                  </Button>
                )}
              </div>
            </div>
            
            <div className="h-4 w-px bg-orange-100 hidden sm:block" />
            
            <form onSubmit={handleSearch} className="relative w-full max-w-[280px] sm:max-w-none sm:w-80 mx-auto sm:mx-0">
              <div className="relative flex items-center bg-orange-50/30 border border-orange-100 rounded-2xl px-3 py-1 sm:px-4 sm:py-1.5 focus-within:border-primary transition-all shadow-sm shadow-orange-500/5">
                <Input 
                   value={searchValue}
                   onChange={(e) => setSearchValue(e.target.value)}
                   placeholder="Find me customers..."
                   className="border-none shadow-none focus-visible:ring-0 text-xs bg-transparent p-0 h-auto placeholder:text-gray-400 font-bold w-full"
                />
                <Button type="submit" disabled={isLoading} className="ml-2 h-6 sm:h-7 px-2.5 sm:px-3 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-700 text-[9px] sm:text-[10px] font-black uppercase gap-1 shrink-0">
                  {isLoading ? (
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  ) : (
                    <>Agents <Zap className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-orange-700" /></>
                  )}
                </Button>
              </div>
            </form>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
            {!session && (
              <Button 
                onClick={() => setIsAuthModalOpen(true)}
                variant="outline"
                className="rounded-xl border-gray-200 text-gray-600 font-bold px-4 h-9 text-xs uppercase hover:bg-gray-50 hidden sm:inline-flex"
              >
                Login into Workspace
              </Button>
            )}
            {session && (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-black text-[#111] leading-none uppercase">Logged In</span>
                  <span className="text-[9px] font-bold text-gray-400 truncate max-w-[120px]">{session.user.email}</span>
                </div>
                <Button 
                  onClick={handleLogout}
                  variant="outline" 
                  className="rounded-xl border-gray-200 text-gray-600 font-bold px-4 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {/* Dashboard Title */}
            <div className="mb-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-black text-[#111] tracking-tighter">Demand Results</h1>
                    {!session ? (
                      <div className="bg-[#111] text-white font-black px-4 py-1.5 rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-2 shadow-lg">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        Preview Mode
                      </div>
                    ) : (
                      query && (
                        <div className="bg-orange-100 text-primary font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider animate-in fade-in zoom-in">
                          {query}
                        </div>
                      )
                    )}
                  </div>
                  <p className="text-gray-500 font-medium text-sm">
                    {session ? "Comprehensive results for your audited keywords." : ""}
                  </p>
                </div>
                <div className="flex gap-3">
                  {isLoading && (
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary animate-pulse bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Scanning 2026 Database...
                    </div>
                  )}
                  <Button variant="outline" className="rounded-xl border-gray-200 text-gray-600 gap-2 text-xs font-bold px-4">
                    <Globe className="w-3 h-3" /> 2026 Global Scope
                  </Button>
                </div>
              </div>
            </div>

            {correctedQuery && (
              <div className="mb-6 bg-orange-50/50 border border-orange-100 rounded-3xl p-5 text-xs font-bold text-orange-750 max-w-4xl mx-auto text-center flex flex-col sm:flex-row items-center justify-center gap-3 shadow-md shadow-orange-500/5">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <span className="uppercase text-[9px] tracking-widest text-orange-850 font-black">Search Correction</span>
                </div>
                <span>
                  Showing demand signals for <span className="underline decoration-2 underline-offset-2 text-primary font-black uppercase tracking-wider text-sm">"{correctedQuery}"</span> instead of <code className="bg-orange-100/50 px-2 py-0.5 rounded font-mono">"{query}"</code>.
                </span>
              </div>
            )}

            {/* Results Table */}
            <div className="bg-white border border-gray-100 rounded-[2rem] shadow-xl shadow-orange-500/5 overflow-hidden relative">
              {/* Preview Mode Badge */}
              <div className="absolute top-6 right-8 z-10">
                <div className="bg-gray-100 text-gray-500 font-black px-3 py-1 rounded-full text-[9px] uppercase tracking-widest border border-gray-200 shadow-sm">
                  Preview mode
                </div>
              </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/30 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                  <th className="px-8 py-5">Platform</th>
                  <th className="px-8 py-5">Demand Content & Intent</th>
                  <th className="px-8 py-5">Location</th>
                  <th className="px-8 py-5">Time</th>
                  <th className="px-8 py-5 text-right whitespace-nowrap">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredResults.length > 0 && !isScanning ? (
                  filteredResults.slice(0, 30).map((result, idx) => {
                    const isActuallyBlurred = idx >= 15;
                    return (
                      <motion.tr 
                        key={result.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className={`hover:bg-orange-50/10 transition-colors group ${isActuallyBlurred ? "filter blur-[4px] select-none pointer-events-none opacity-40 animate-pulse" : ""}`}
                      >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <PlatformIcon platform={result.platform} />
                          <div className="bg-gray-50 border border-gray-100 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg text-gray-500">
                            {result.platform}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 max-w-md">
                        <p className="text-sm font-bold text-[#111] mb-2 line-clamp-2 leading-relaxed">
                          {result.content}
                        </p>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {result.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" /> {result.likes}
                          </span>
                          <div className="flex gap-1">
                            {result.hashtags && result.hashtags.map(tag => (
                              <span key={tag} className="text-primary">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                          <Globe className="w-3 h-3 text-gray-400" />
                          {result.location}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-bold text-gray-400">
                          {result.time}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex flex-col items-end gap-2">
                          <button 
                            onClick={() => setStartedSignup(true)}
                            disabled={!!session}
                            className={`inline-flex items-center rounded-xl border border-gray-200 gap-2 text-[10px] font-black uppercase px-4 py-2 transition-all transform hover:scale-105 active:scale-95 ${
                              !session 
                                ? 'bg-gray-50 text-gray-400 hover:bg-orange-50 hover:text-primary hover:border-primary' 
                                : 'bg-[#111] text-white border-[#111]'
                            }`}
                          >
                            {session ? "View Discovery" : "Unlock Source"} <ExternalLink className="w-3 h-3" />
                          </button>
                          {!session && (
                            <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">
                              Identity Restricted
                            </span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ); })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-32 text-center">
                       <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col items-center gap-6 justify-center"
                       >
                         {/* High-fidelity orange line loader */}
                         <div className="w-64 h-1.5 bg-orange-50 border border-orange-100/30 rounded-full overflow-hidden relative mx-auto">
                           <motion.div 
                             className="absolute top-0 bottom-0 bg-primary rounded-full animate-progress"
                             initial={{ left: "-45%", width: "45%" }}
                             animate={{ left: "100%", width: ["45%", "35%", "45%"] }}
                             transition={{ 
                               duration: 1.6, 
                               repeat: Infinity, 
                               ease: "easeInOut" 
                             }}
                           />
                         </div>
                         <p className="text-gray-400 text-xs font-black max-w-md mx-auto leading-relaxed uppercase tracking-[0.1em] text-center">
                           Begin audit process to get your own customer search engine built for better results.
                         </p>
                       </motion.div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredResults.length > 15 && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-32 pb-12 flex flex-col items-center justify-center text-center p-8 z-20 pointer-events-auto">
              <div className="bg-white border border-orange-100 rounded-[2rem] p-8 max-w-lg shadow-2xl relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white font-black px-5 py-2 rounded-full text-[9px] uppercase tracking-widest flex items-center gap-1 shadow-md">
                  <Sparkles className="w-3 animate-pulse" /> Core Limit Reached
                </div>
                {!session ? (
                  <>
                    <h3 className="text-base font-black text-gray-950 mb-3 mt-2 leading-snug uppercase tracking-tight">
                      Unlock 15+ More Real-Time Leads
                    </h3>
                    <p className="text-gray-650 text-xs font-bold leading-relaxed mb-6">
                      You've hit our free preview limit. Please <strong>sign up</strong> or <strong>log in</strong> now to unlock all 30 live customer leads and access their identity paths!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                      <button 
                        onClick={() => setStartedSignup(true)}
                        className="w-full sm:w-auto text-center rounded-xl bg-primary hover:bg-orange-650 text-white px-6 py-3.5 text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-orange-500/10 flex items-center justify-center gap-1"
                      >
                        Sign Up Now <Sparkles className="w-4 h-4 fill-white" />
                      </button>
                      <button 
                        onClick={handleLogin}
                        className="w-full sm:w-auto text-center rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border border-gray-200"
                      >
                        Log In
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-base font-black text-gray-950 mb-3 mt-2 leading-snug uppercase tracking-tight">
                      Unlock 15+ More Real-Time Leads
                    </h3>
                    <p className="text-gray-650 text-xs font-bold leading-relaxed mb-6">
                      Subscribe for only <strong className="text-primary font-black text-orange-600">$80 a month</strong> to get unlimited leads or every time someone is looking for your services online.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                      <a 
                        href="https://pay.yoco.com/mergemega?amount=3040" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        referrerPolicy="no-referrer"
                        className="w-full sm:w-auto text-center rounded-xl bg-primary hover:bg-orange-650 text-white px-6 py-3.5 text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2"
                      >
                        Subscribe Now <Zap className="w-3.5 h-3.5 fill-white" />
                      </a>
                      <Link 
                        to="/digital-consulting-pros#payment-section"
                        className="w-full sm:w-auto text-center rounded-xl bg-gray-50 hover:bg-gray-150 text-gray-550 px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border border-gray-200"
                      >
                        See Pricing Setup
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Right Sidebar: Quick Signals & Trending */}
        <aside className="w-full lg:w-80 flex flex-col gap-8">
          <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-xl shadow-orange-500/5">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Trending Signals</h3>
            <div className="flex flex-wrap gap-2">
              {['#saas', '#marketing', '#ai', '#realestate', '#fitness', '#crypto', '#webdesign', '#sales'].map(tag => (
                <button 
                  key={tag}
                  onClick={() => {
                    setSearchValue(tag);
                    setSearchParams({ q: tag });
                  }}
                  className="px-4 py-2 bg-orange-50/50 hover:bg-orange-100 border border-orange-100 rounded-xl text-xs font-bold text-orange-700 transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#111] rounded-[2rem] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/40 transition-all"></div>
            <Zap className="w-8 h-8 text-primary mb-6 fill-primary" />
            <h3 className="text-xl font-black tracking-tight mb-2 text-white">Discovery Mode</h3>
            <p className="text-gray-400 text-xs font-medium leading-relaxed mb-6">
              Looking for a specific niche? Our agents can scrape private communities and forums for high-intent signals.
            </p>
            {!session && (
              <Button 
                onClick={() => setStartedSignup(true)}
                className="w-full bg-primary hover:bg-orange-600 font-bold rounded-xl border-none uppercase text-[10px] tracking-widest py-6 shadow-xl shadow-orange-500/20"
              >
                Get Full Access Audit
              </Button>
            )}
            {session && (
              <Button className="w-full bg-primary hover:bg-orange-600 font-bold rounded-xl border-none">
                Upgrade Engine
              </Button>
            )}
          </div>
        </aside>
      </div>
    </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-8 py-12 border-t border-orange-100 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary fill-primary" />
          <span>Signalmerge Intelligence Engine v4.0</span>
        </div>
        <div className="flex gap-8 items-center">
          <Link to="/about" className="hover:text-primary cursor-pointer transition-colors font-bold text-[10px] uppercase tracking-[0.2em]">
            About
          </Link>
          <span className="text-primary flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> System Online
          </span>
          <button 
            type="button"
            onClick={() => setIsTermsModalOpen(true)}
            className="hover:text-primary cursor-pointer transition-colors focus:outline-none font-bold text-[10px] uppercase tracking-[0.2em]"
          >
            Terms
          </button>
        </div>
      </footer>

      {/* Auth Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex justify-between items-center mb-8">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <Zap className="text-white w-6 h-6 fill-white" />
                  </div>
                  <button 
                    onClick={() => setIsAuthModalOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {authStep === 'input' || authStep === 'loading' ? (
                  <>
                    <h2 className="text-2xl font-black text-[#111] tracking-tight mb-2">Access Intelligence</h2>
                    <p className="text-gray-500 font-medium text-sm mb-8">
                      Sign in using your administrator credentials to manage user workspaces.
                    </p>

                    {!isSupabaseConfigured && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
                        <p className="text-[10px] font-black uppercase text-red-600 mb-1">Configuration Warning</p>
                        <p className="text-xs text-red-700 font-bold leading-tight">
                          Supabase keys not found. Please add <code className="bg-red-100 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-red-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> to your Settings.
                        </p>
                      </div>
                    )}

                    <form onSubmit={submitAuth} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 ml-1">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          <Input 
                            type="email"
                            required
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            placeholder=""
                            className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50 focus:border-primary transition-all font-bold placeholder:font-medium placeholder:text-gray-400"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 ml-1">Security Password</label>
                        <div className="relative">
                          <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          <Input 
                            type="password"
                            required
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            placeholder="••••••••"
                            className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50 focus:border-primary transition-all font-bold placeholder:font-medium placeholder:text-gray-400"
                          />
                        </div>
                      </div>

                      {authError && (
                        <p className="text-xs font-bold text-red-500 ml-1 select-text">{authError}</p>
                      )}

                      <Button 
                        type="submit"
                        disabled={authStep === 'loading'}
                        className="w-full h-14 bg-primary hover:bg-orange-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98]"
                      >
                        {authStep === 'loading' ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>Verify Credentials <ArrowRight className="w-4 h-4 ml-2" /></>
                        )}
                      </Button>
                    </form>

                    <p className="mt-8 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Confidential access strictly monitored.
                    </p>
                  </>
                ) : null}
              </div>
              
              <div className="bg-gray-50 p-6 flex items-center justify-center gap-2 border-t border-gray-100">
                <Globe className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Secure Authentication Gateway</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
    </div>
  );
}
