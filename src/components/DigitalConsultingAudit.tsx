import React, { useState, useEffect } from "react";
import {
  Zap, Clock, ShieldCheck, ExternalLink, Lock,
  AlertTriangle, ArrowRight, Search, CheckCircle, RefreshCw,
  TrendingUp, Users, ArrowUpRight, BarChart2, MessageSquare,
  Laptop, Compass, Sparkles, Filter, Globe, Info, Heart, ArrowLeft,
  Key
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { TermsModal } from "@/components/TermsModal";
import { searchSocialMedia } from "@/services/searchService";
import type { DemandResult } from "@/types";

// NOTE: the old hardcoded `rawLeadsData` fallback array (20 fictional leads,
// e.g. "Sweden / Gothenburg", "1h ago") has been intentionally removed.
// Live search results now come exclusively from Exa via /api/search —
// there is no fake/reference dataset backing this UI anymore.

const PLATFORM_OPTIONS = ["All", "LinkedIn", "Instagram", "Facebook", "Reddit", "TikTok", "Twitter", "YouTube"];

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
  const [currentPassword, setCurrentPassword] = useState<string>("");
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
  const [leadsList, setLeadsList] = useState<DemandResult[]>([]);
  const [hasSearchedOnce, setHasSearchedOnce] = useState<boolean>(false);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeLeft = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  // ---------------------------------------------------------------------
  // Session bootstrap — there is no /api/profile or session-check route on
  // the server, so the app persists the user object returned by
  // /api/auth/custom-login / custom-signup to localStorage and restores it
  // here on mount. This matches your real, working signup/login endpoints.
  // ---------------------------------------------------------------------
  useEffect(() => {
    try {
      const saved = localStorage.getItem("signalmerge_user");
      if (saved) {
        const user = JSON.parse(saved);
        if (user?.email) {
          setIsAuthenticated(true);
          setCurrentUserEmail(user.email);
          setHasPaid80(!!user.hasPaid80);
          setHasPaid20(!!user.hasPaid20);
          setLeadsUsedToday(user.leadsUsedToday ?? 0);
        }
      }
    } catch (err) {
      console.warn("[Session] Failed to restore saved session:", err);
    } finally {
      setSessionLoading(false);
    }
  }, []);

  const persistUser = (user: { email: string; hasPaid80: boolean; hasPaid20: boolean; leadsUsedToday: number }) => {
    localStorage.setItem("signalmerge_user", JSON.stringify(user));
    setIsAuthenticated(true);
    setCurrentUserEmail(user.email);
    setHasPaid80(!!user.hasPaid80);
    setHasPaid20(!!user.hasPaid20);
    setLeadsUsedToday(user.leadsUsedToday ?? 0);
  };

  // ---------------------------------------------------------------------
  // Live lead search — calls the real /api/search endpoint via
  // searchSocialMedia(). This is grounded directly in your existing
  // server.ts contract and searchService.ts implementation.
  // ---------------------------------------------------------------------
  const performLeadsSearch = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsSearchingLeads(true);
    setSearchLeadsError(null);
    setHasSearchedOnce(true);

    try {
      const results = await searchSocialMedia(trimmed, currentUserEmail);
      setLeadsList(results as DemandResult[]);
    } catch (error: any) {
      setSearchLeadsError(
        error?.message || "Something went wrong while searching. Please try again."
      );
      setLeadsList([]);
    } finally {
      setIsSearchingLeads(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLeadsSearch(searchQuery);
  };

  const filteredLeads =
    selectedPlatform === "All"
      ? leadsList
      : leadsList.filter((lead) => lead.platform === selectedPlatform);

  const visibleLeads = filteredLeads.slice(0, visibleLimit);

  // ---------------------------------------------------------------------
  // Auth handlers — call the real, existing /api/auth/custom-login and
  // /api/auth/custom-signup routes in server.ts. These already create the
  // matching profiles row server-side via getOrCreateProfile(); nothing
  // about that flow is changed here.
  // ---------------------------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSubmitting(true);
    try {
      const res = await fetch("/api/auth/custom-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!data.success) {
        setLoginError(data.message || "Invalid email or password.");
        return;
      }
      persistUser(data.user);
    } catch (err: any) {
      setLoginError(err?.message || "Login failed. Please try again.");
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (signupPassword !== signupConfirmPassword) {
      setSignupError("Passwords do not match.");
      return;
    }

    setSignupSubmitting(true);
    try {
      const res = await fetch("/api/auth/custom-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupEmail, password: signupPassword }),
      });
      const data = await res.json();
      if (!data.success) {
        setSignupError(data.message || "Signup failed. Please try again.");
        return;
      }
      persistUser(data.user);
    } catch (err: any) {
      setSignupError(err?.message || "Signup failed. Please try again.");
    } finally {
      setSignupSubmitting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError(null);
    setPasswordChangeSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordChangeError("Passwords do not match.");
      return;
    }

    setPasswordChanging(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUserEmail,
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setPasswordChangeError(data.message || "Could not update password.");
        return;
      }
      setPasswordChangeSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordChangeError(err?.message || "Could not update password.");
    } finally {
      setPasswordChanging(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("signalmerge_user");
    setIsAuthenticated(false);
    setCurrentUserEmail("");
    setHasPaid80(false);
    setHasPaid20(false);
    setLeadsList([]);
  };

  // ---------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md rounded-2xl border border-border">
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">Signalmerge</span>
            </div>

            <div className="flex gap-2 mb-6">
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-lg ${authMode === "login" ? "bg-secondary" : "text-muted-foreground"}`}
                onClick={() => setAuthMode("login")}
                type="button"
              >
                Log in
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-lg ${authMode === "signup" ? "bg-secondary" : "text-muted-foreground"}`}
                onClick={() => setAuthMode("signup")}
                type="button"
              >
                Sign up
              </button>
            </div>

            {authMode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-3">
                <Input
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                {loginError && <p className="text-sm text-red-600">{loginError}</p>}
                <Button type="submit" className="w-full" disabled={loginSubmitting}>
                  {loginSubmitting ? "Logging in..." : "Log in"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-3">
                <Input
                  type="email"
                  placeholder="Email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  required
                />
                {signupError && <p className="text-sm text-red-600">{signupError}</p>}
                <Button type="submit" className="w-full" disabled={signupSubmitting}>
                  {signupSubmitting ? "Creating account..." : "Sign up"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold">Signalmerge</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">{currentUserEmail}</span>
          <button className="text-muted-foreground hover:text-foreground" onClick={() => setIsChangePasswordOpen(true)}>
            <Key className="w-4 h-4" />
          </button>
          <Button variant="outline" onClick={handleLogout}>Log out</Button>
        </div>
      </div>

      {/* Countdown / offer banner */}
      {!hasPaid80 && (
        <div className="bg-secondary/60 border-b border-border px-6 py-2 text-sm flex items-center justify-between">
          <span className="text-muted-foreground">Free search offer expires in {formatTimeLeft(timeLeft)}</span>
          <Link to="/pricing" className="text-primary font-medium">Upgrade →</Link>
        </div>
      )}

      {/* Search bar */}
      <div className="px-6 py-6 border-b border-border">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-2xl">
          <Input
            type="text"
            placeholder="e.g. looking for a website developer"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="border border-border rounded-lg px-3 text-sm bg-card"
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
          >
            {PLATFORM_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <Button type="submit" disabled={isSearchingLeads}>
            {isSearchingLeads ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </form>
      </div>

      {/* Results */}
      <div className="px-6 py-6">
        {searchLeadsError ? (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertTriangle className="w-4 h-4" />
            {searchLeadsError}
          </div>
        ) : visibleLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <RefreshCw className={`w-5 h-5 mb-3 text-muted-foreground ${isSearchingLeads ? "animate-spin" : ""}`} />
            <p className="text-muted-foreground text-sm">Still searching. This may take time</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl">
            {visibleLeads.map((lead) => (
              <Card key={lead.id} className="rounded-xl border border-border">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
                      {lead.platform}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">{lead.time}</span>
                  </div>
                  <p className="text-sm text-foreground/90 mb-3">{lead.content}</p>
                  <a
                    href={lead.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary"
                  >
                    View source <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Password change modal */}
      <AnimatePresence>
        {isChangePasswordOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          >
            <Card className="w-full max-w-sm rounded-2xl">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Change password</h3>
                <form onSubmit={handlePasswordChange} className="space-y-3">
                  <Input
                    type="password"
                    placeholder="Current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {passwordChangeError && <p className="text-sm text-red-600">{passwordChangeError}</p>}
                  {passwordChangeSuccess && <p className="text-sm text-green-600">{passwordChangeSuccess}</p>}
                  <div className="flex gap-2">
                    <Button type="submit" disabled={passwordChanging} className="flex-1">
                      {passwordChanging ? "Saving..." : "Save"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsChangePasswordOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
    </div>
  );
}
