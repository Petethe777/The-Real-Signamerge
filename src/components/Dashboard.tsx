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
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DemandResult } from "@/types";
import { tiktokDataset, instagramDataset } from "@/data/datasets";
import { mockClients } from "@/data/mockClients";
import { searchSocialMedia } from "@/services/geminiService";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { AnimatePresence } from "motion/react";

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

const BIDashboard = ({ profile, handleLogout }: { profile: any, handleLogout: () => void }) => {
  const [isAuditing, setIsAuditing] = useState(true);
  const [isAdminView, setIsAdminView] = useState(false);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  useEffect(() => {
    if (profile?.role === 'admin' && isAdminView) {
      fetchProfiles();
    }
  }, [isAdminView, profile]);

  const fetchProfiles = async () => {
    setLoadingProfiles(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setAllProfiles(data);
    setLoadingProfiles(false);
  };

  const approveUser = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: true })
      .eq('id', userId);
    if (!error) fetchProfiles();
  };

  useEffect(() => {
    // Simulate initial loading sequence then show the blur state
    const timer = setTimeout(() => {
      // We keep it "blurred" as requested with the specific message
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const mockSalesData = [
    { name: 'Mon', sales: 4000, leads: 2400 },
    { name: 'Tue', sales: 3000, leads: 1398 },
    { name: 'Wed', sales: 2000, leads: 9800 },
    { name: 'Thu', sales: 2780, leads: 3908 },
    { name: 'Fri', sales: 1890, leads: 4800 },
    { name: 'Sat', sales: 2390, leads: 3800 },
    { name: 'Sun', sales: 3490, leads: 4300 },
  ];

  const mockPlatformData = [
    { name: 'Instagram', value: 400 },
    { name: 'TikTok', value: 300 },
    { name: 'LinkedIn', value: 300 },
    { name: 'Facebook', value: 200 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      {/* Real-time Loader Overlay */}
      {isAuditing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white/40 backdrop-blur-md"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white border border-orange-100 p-12 rounded-[3rem] shadow-2xl max-w-lg w-full text-center"
          >
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <Zap className="w-10 h-10 text-primary fill-primary" />
            </div>
            <h2 className="text-3xl font-black text-[#111] tracking-tight mb-4">Auditing business.</h2>
            <p className="text-gray-500 font-medium mb-8">
              Your custom 2026 intelligence report and sales dashboard will be <span className="text-[#111] font-bold underline decoration-primary decoration-2">ready in the next 12-24 hours.</span>
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400">
                <span>Progress: Engine Calibration</span>
                <span>84%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[84%] rounded-full shadow-[0_0_10px_rgba(249,115,36,0.5)]" />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Dashboard UI (Blurred beneath) */}
      <div className={`flex-1 flex flex-col ${isAuditing ? 'pointer-events-none' : ''}`}>
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-primary fill-primary" />
            <h1 className="text-xl font-black tracking-tight">
              {isAdminView ? "Admin Intelligence Hub" : `${profile?.company_name || "Business"} Dashboard`}
            </h1>
          </div>
          <div className="flex items-center gap-6">
            {profile?.role === 'admin' && (
              <Button 
                onClick={() => setIsAdminView(!isAdminView)}
                className={`rounded-xl font-bold px-4 ${isAdminView ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                {isAdminView ? "Back to Dashboard" : "Manage Users"}
              </Button>
            )}
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black text-gray-400 uppercase">
                {profile?.role === 'admin' ? "System Admin" : "Intelligence Level"}
              </span>
              <span className="text-xs font-bold text-primary">
                {profile?.role === 'admin' ? "FULL ACCESS" : "Enterprise Core 2026"}
              </span>
            </div>
            <Button onClick={handleLogout} variant="outline" className="rounded-xl border-gray-200">Logout</Button>
          </div>
        </header>

        {isAdminView && profile?.role === 'admin' ? (
          <main className="p-8 max-w-7xl mx-auto w-full">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-[#111]">User Approvals</h2>
                  <p className="text-xs text-gray-500 font-medium">Review and authorize analytical workspace access</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase text-gray-400">{allProfiles.length} Total Users</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase">Company / User</th>
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase">Location</th>
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase">Status</th>
                      <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {allProfiles.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-[#111]">{user.company_name || "No Company"}</span>
                            <span className="text-xs text-gray-400 font-medium">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-xs font-bold text-gray-600">{user.location || "N/A"}</span>
                        </td>
                        <td className="px-8 py-6">
                          {user.is_approved ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase">
                              <CheckCircle2 className="w-3 h-3" /> Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase">
                              <Loader2 className="w-3 h-3 animate-spin" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-6 text-right">
                          {!user.is_approved && (
                            <Button 
                              onClick={() => approveUser(user.id)}
                              className="bg-[#111] text-white rounded-xl text-[10px] font-black uppercase tracking-wider px-6"
                            >
                              Confirm Access
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        ) : (
          <main className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
          {/* Stats Grid */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Total Reach", value: "2.4M", change: "+12%", icon: Eye },
              { label: "High-Intent Leads", value: "1,284", change: "+4.5%", icon: Zap },
              { label: "Conversion Rate", value: "3.2%", change: "+0.8%", icon: CheckCircle2 },
              { label: "Active Nodes", value: "48", change: "Stable", icon: Globe }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-gray-50 rounded-xl">
                    <stat.icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">{stat.change}</span>
                </div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-[#111]">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Sales Chart */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm min-h-[400px]">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-8">Sales Velocity / Lead Generation</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockSalesData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97324" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#F97324" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#F97324' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#F97324" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  <Area type="monotone" dataKey="leads" stroke="#111" strokeWidth={2} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution Chart */}
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-8">Platform Dominance</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockPlatformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mockPlatformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 space-y-3">
              {mockPlatformData.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs font-bold text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-[#111]">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Profile Summary */}
          <div className="lg:col-span-3 bg-[#111] rounded-[2rem] p-10 text-white relative overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Selling Region</h4>
                <div className="space-y-1">
                  <p className="text-2xl font-black">{profile?.selling_region?.state || "Unconfigured"}</p>
                  <p className="text-gray-400 font-bold">{profile?.selling_region?.county || "Statewide scope"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Search Signifiers</h4>
                <div className="flex flex-wrap gap-2">
                  {profile?.customer_keywords?.filter((k: any) => k).map((k: string, i: number) => (
                    <span key={i} className="bg-white/10 text-white font-bold px-3 py-1 rounded-lg text-xs">#{k}</span>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">USP Alpha</h4>
                <p className="text-sm font-medium text-gray-300 leading-relaxed italic border-l-2 border-primary pl-4">
                  "{profile?.usp || "Initial audit pending..."}"
                </p>
              </div>
            </div>
          </div>
        </main>
        )}
      </div>
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
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
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
  };

  const submitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("submitAuth triggered with email:", authEmail);
    if (!authEmail || !authEmail.includes('@')) {
      console.log("Auth email is invalid or empty, returning");
      setAuthError("Please enter a valid email address.");
      return;
    }

    setAuthStep('loading');
    setAuthError(null);

    // Safety timeout to prevent stuck loading state
    const timeoutId = setTimeout(() => {
      if (authStepRef.current === 'loading') {
        console.warn("Auth request timed out (15s)");
        setAuthError("Request timed out. Please check your connection and try again.");
        setAuthStep('input');
      }
    }, 15000);

    console.log("Attempting Magic Link sign in for:", authEmail);
    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        email: authEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: window.location.origin,
        }
      });
  
      clearTimeout(timeoutId);

      if (error) {
        console.error("Sign in error from Supabase:", error);
        setAuthError(`Authentication failed: ${error.message}${error.message.includes('400') ? ' - Check if this URL is allowed in your Supabase Redirect URIs.' : ''}`);
        setAuthStep('input');
      } else {
        console.log("Magic link sent successfully");
        setAuthStep('sent');
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("Unexpected error during sign in:", err);
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
        return;
      }
      
      setIsLoading(true);
      setError(null);
      try {
        const results = await searchSocialMedia(query);
        if (results && (results as any)._rateLimited) {
          setLiveResults([]);
          setError("AI Scanner is busy. Showing results from 2026 database.");
        } else {
          setLiveResults(results);
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

    if (!query) return source.slice(0, 10);
    const lowerQuery = query.toLowerCase();
    
    // Filter results that match the query
    const matches = source.filter(item => 
      item.content.toLowerCase().includes(lowerQuery) ||
      (item.hashtags && item.hashtags.some(tag => tag.toLowerCase().includes(lowerQuery))) ||
      item.location.toLowerCase().includes(lowerQuery) ||
      item.platform.toLowerCase().includes(lowerQuery) ||
      lowerQuery.split(' ').some(word => word.length > 2 && item.content.toLowerCase().includes(word))
    );

    return matches;
  }, [query, allResults]);

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
      state: ""
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
          
          if (data) {
            setUserProfile(data);
            if (data.audit_completed) {
              console.log("Existing audit found, skipping onboarding");
              setOnboardingData(prev => ({
                ...prev,
                companyName: data.company_name || "",
                location: data.location || "",
                socials: data.socials || prev.socials,
                customerPhrases: data.customer_phrases || prev.customerPhrases,
                customerKeywords: data.customer_keywords || prev.customerKeywords,
                usp: data.usp || "",
                sellingRegion: data.selling_region || prev.sellingRegion
              }));
              setAuditCompleted(true);
              setShowBIDashboard(true);
            }
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
    if (!onboardingData.email || !onboardingData.password) {
      setAuthError("Email and Password are required to secure your audit.");
      setAuditStepIdx(3); // Go back to final step if missing
      return;
    }
    
    setIsSigningUp(true);
    setAuthError(null);
    
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

      setSignupSuccess(true);
      setAuditCompleted(true);
    } catch (err: any) {
      setAuthError(`An unexpected error occurred: ${err.message}`);
    } finally {
      setIsSigningUp(false);
    }
  };

  // If audit isn't done and they haven't started the signup flow, show the search engine in PREVIEW MODE
  const [startedSignup, setStartedSignup] = useState(false);

  if (!session && startedSignup && !auditCompleted) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 pb-20">
        <div className="max-w-2xl w-full">
          {/* Progress Header */}
          <div className="mb-12 relative">
            <button 
              onClick={() => setStartedSignup(false)}
              className="absolute -top-12 left-0 flex items-center gap-2 text-gray-400 hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Discovery Hub
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Zap className="text-white w-6 h-6 fill-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#111] tracking-tight">Customer Audit Process</h1>
                <p className="text-gray-500 font-medium text-xs">Step {auditStep + 1} of 4 • Configure your 2026 intelligence engine</p>
              </div>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${((auditStep) / 3) * 100}%` }}
                className="h-full bg-primary"
              />
            </div>
          </div>

          <motion.div 
            key={auditStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-2xl shadow-orange-500/5"
          >
            {authError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
                <p className="text-xs text-red-600 font-bold">{authError}</p>
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

                <Button onClick={() => setAuditStepIdx(1)} className="w-full h-14 bg-primary hover:bg-orange-600 rounded-2xl text-white font-black uppercase tracking-widest">
                  Start Audit <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <p className="text-center text-[10px] font-bold text-gray-400">
                  Terms and Conditions Apply
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
                  <Button variant="outline" onClick={() => setAuditStepIdx(0)} className="flex-1 h-14 rounded-2xl border-gray-100 font-bold uppercase text-[10px]">Back</Button>
                  <Button onClick={() => setAuditStepIdx(2)} className="flex-[2] h-14 bg-primary hover:bg-orange-600 rounded-2xl text-white font-black uppercase tracking-widest">Next Step</Button>
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
                      className="h-12 rounded-xl bg-gray-50 border-gray-100 italic"
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
                  <Button variant="outline" onClick={() => setAuditStepIdx(1)} className="flex-1 h-14 rounded-2xl border-gray-100 font-bold uppercase text-[10px]">Back</Button>
                  <Button onClick={() => setAuditStepIdx(3)} className="flex-[2] h-14 bg-primary hover:bg-orange-600 rounded-2xl text-white font-black uppercase tracking-widest">Almost Done</Button>
                </div>
              </div>
            )}

            {auditStep === 3 && (
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
                      placeholder="your@email.com"
                      className="h-14 rounded-2xl bg-gray-50 border-gray-100"
                      value={onboardingData.email}
                      onChange={e => setOnboardingData({...onboardingData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Secure Password</label>
                    <Input 
                      type="password"
                      placeholder="••••••••"
                      className="h-14 rounded-2xl bg-gray-50 border-gray-100"
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
                      className="h-14 rounded-2xl bg-gray-50 border-gray-100"
                      value={onboardingData.sellingRegion.state}
                      onChange={e => setOnboardingData({...onboardingData, sellingRegion: {...onboardingData.sellingRegion, state: e.target.value}})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Sales County</label>
                    <Input 
                      placeholder="Los Angeles"
                      className="h-14 rounded-2xl bg-gray-50 border-gray-100"
                      value={onboardingData.sellingRegion.county}
                      onChange={e => setOnboardingData({...onboardingData, sellingRegion: {...onboardingData.sellingRegion, county: e.target.value}})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">5 Core Keywords</label>
                  <div className="grid grid-cols-2 gap-2">
                    {onboardingData.customerKeywords.map((kw, i) => (
                      <Input 
                        key={i}
                        placeholder={`Keyword ${i+1}`}
                        className="h-12 rounded-xl bg-gray-50 border-gray-100"
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

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={() => setAuditStepIdx(2)} className="flex-1 h-14 rounded-2xl border-gray-100 font-bold uppercase text-[10px]">Back</Button>
                  <Button 
                    onClick={handleAuditSubmit} 
                    disabled={isSigningUp}
                    className="flex-[2] h-14 bg-[#111] hover:bg-black rounded-2xl text-white font-black uppercase tracking-widest shadow-xl disabled:opacity-50"
                  >
                    {isSigningUp ? (
                      <>Processing Audit <Loader2 className="w-4 h-4 ml-2 animate-spin" /></>
                    ) : (
                      "Complete Audit & Verify Email"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  if (isAuthLoading || isProfileLoading || isScanning) {
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

  if (auditCompleted && session) {
    // Role-based access control: Owner bypass or admin role
    const isOwner = session.user.email === 'petemkhize@gmail.com';
    if (!isOwner && userProfile?.role !== 'admin' && !userProfile?.is_approved) {
      return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
             <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-8">
               <ShieldCheck className="w-10 h-10 text-primary" />
             </div>
             <h2 className="text-3xl font-black text-[#111] mb-4">Access Pending.</h2>
             <p className="text-gray-500 font-medium mb-8">
               Your Business Audit is being reviewed. <br/>
               <span className="text-[#111] font-bold">Manual confirmation is required</span> for the Analytical Workspace.
             </p>
             <div className="p-4 bg-gray-50 rounded-2xl mb-8">
               <p className="text-[10px] font-black uppercase text-gray-400">Current Status</p>
               <p className="text-xs font-bold text-orange-600 animate-pulse">AWAITING ADMIN APPROVAL</p>
             </div>
             <Button onClick={handleLogout} variant="outline" className="w-full h-14 rounded-2xl font-black uppercase border-gray-200">
               Logout
             </Button>
          </div>
        </div>
      );
    }
    return <BIDashboard profile={userProfile} handleLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm group-hover:bg-orange-600 transition-colors">
                <Zap className="text-white w-5 h-5 fill-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[#111] hidden md:block">Signalmerge</span>
            </Link>
            
            <div className="h-6 w-px bg-orange-100 hidden md:block" />
            
            <form onSubmit={handleSearch} className="relative w-full max-w-md">
              <div className="relative flex items-center bg-orange-50/30 border border-orange-100 rounded-2xl px-4 py-2 focus-within:border-primary transition-all shadow-sm shadow-orange-500/5">
                <Input 
                   value={searchValue}
                   onChange={(e) => setSearchValue(e.target.value)}
                   placeholder="Find me customers..."
                   className="border-none shadow-none focus-visible:ring-0 text-sm bg-transparent p-0 h-auto placeholder:text-gray-400"
                />
                <Button type="submit" disabled={isLoading} className="ml-2 h-8 px-4 rounded-xl bg-orange-200 hover:bg-orange-300 text-orange-700 text-xs font-bold gap-2">
                  {isLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>Agents <Zap className="w-3 h-3 fill-orange-700" /></>
                  )}
                </Button>
              </div>
            </form>
          </div>

          <div className="flex items-center gap-4">
            {!session && (
              <Button 
                onClick={() => setIsAuthModalOpen(true)}
                variant="outline"
                className="rounded-xl border-gray-200 text-gray-600 font-bold px-6 text-xs uppercase hover:bg-gray-50"
              >
                Login into Workspace
              </Button>
            )}
            {!session && (
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setStartedSignup(true)}
                  className="rounded-xl bg-[#111] hover:bg-black text-white font-bold px-6 shadow-lg shadow-black/10 text-xs uppercase"
                >
                  Start Discovery Audit
                </Button>
                <div className="h-6 w-px bg-gray-200" />
              </div>
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
                  <th className="px-8 py-5">Contact</th>
                  <th className="px-8 py-5">Time</th>
                  <th className="px-8 py-5 text-right whitespace-nowrap">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredResults.length > 0 ? (
                  filteredResults.map((result, idx) => (
                    <motion.tr 
                      key={result.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-orange-50/10 transition-colors group"
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
                        <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50/50 px-3 py-1 rounded-full w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          {result.contactStatus}
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-32 text-center">
                       <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-4"
                       >
                         <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-[2rem] flex items-center justify-center mb-2">
                           <Search className="w-8 h-8 text-gray-200" />
                         </div>
                         <h3 className="text-sm font-black text-[#111] uppercase tracking-[0.2em]">Zero Social Signals</h3>
                         <p className="text-gray-400 text-xs font-bold max-w-xs mx-auto leading-relaxed">
                           No discovery records matched your query in the 2026 social archive. Try adjusting your signals for better intelligence discovery.
                         </p>
                       </motion.div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
        <div className="flex gap-8">
          <span className="text-primary flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> System Online
          </span>
          <span className="hover:text-primary cursor-pointer transition-colors">Privacy</span>
          <span className="hover:text-primary cursor-pointer transition-colors">Terms</span>
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
                      Sign in or create your account to unlock full 2026 discovery capabilities.
                    </p>

                    {!isSupabaseConfigured && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
                        <p className="text-[10px] font-black uppercase text-red-600 mb-1">Configuration Warning</p>
                        <p className="text-xs text-red-700 font-bold leading-tight">
                          Supabase keys not found. Please add <code className="bg-red-100 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-red-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> to your Settings.
                        </p>
                        <p className="text-[10px] text-red-600 mt-2 font-medium">
                          Note: You also need to add your App URL to Supabase's "Redirect URIs".
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
                            placeholder="name@company.com"
                            className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50 focus:border-primary transition-all font-bold placeholder:font-medium placeholder:text-gray-400"
                          />
                        </div>
                      </div>

                      {authError && (
                        <p className="text-xs font-bold text-red-500 ml-1">{authError}</p>
                      )}

                      <Button 
                        type="submit"
                        disabled={authStep === 'loading'}
                        className="w-full h-14 bg-primary hover:bg-orange-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98]"
                      >
                        {authStep === 'loading' ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>
                        )}
                      </Button>
                    </form>

                    <p className="mt-8 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      We'll send a magic link to your inbox.
                    </p>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Mail className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-[#111] tracking-tight mb-2">Check your email</h2>
                    <p className="text-gray-500 font-medium text-sm mb-8">
                      We've sent a magic link to <span className="text-[#111] font-bold">{authEmail}</span>. Click it to log in securely.
                    </p>
                    
                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl mb-8">
                      <p className="text-[10px] text-orange-800 font-bold leading-tight">
                        <span className="uppercase">Tip:</span> If you aren't automatically redirected, try opening the application in a new tab before logging in.
                      </p>
                    </div>

                    <Button 
                      onClick={() => setAuthStep('input')}
                      variant="outline"
                      className="w-full h-14 rounded-2xl border-gray-100 text-[#111] font-black text-xs uppercase tracking-widest hover:bg-gray-50"
                    >
                      Back to Login
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 p-6 flex items-center justify-center gap-2 border-t border-gray-100">
                <Globe className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Secure Authentication Gateway</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
