import { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import AboutPage from "@/app/about/page";
import Dashboard from "@/components/Dashboard";
import PricingPage from "@/components/PricingPage";
import { TermsModal } from "@/components/TermsModal";
import { supabase } from "@/lib/supabase";
import { SignupGateModal, SIGNUP_KEY } from "@/components/SignupGateModal";
import DigitalConsultingAudit from "@/components/DigitalConsultingAudit";
import ConnectClaude from "@/components/ConnectClaude";
import Consulting from "@/components/Consulting";
import ReviewDirectoryPage from "@/app/about/reviews/page";
import LandingPage from "@/components/landing/LandingPage";

function HomePage() {
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isGateOpen, setIsGateOpen] = useState(false);
  // The demo query the visitor was looking at when they clicked "Get started" (empty for plain sign up)
  const [pendingQuery, setPendingQuery] = useState("");
  const navigate = useNavigate();

  // A logged-in Supabase user is already signed up — never show them the gate
  useEffect(() => {
    try {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) { try { localStorage.setItem(SIGNUP_KEY, "1"); } catch {} }
      });
    } catch {}
  }, []);
  const hasSignedUp = () => { try { return localStorage.getItem(SIGNUP_KEY) === "1"; } catch { return false; } };

  const openDashboard = (query: string) => {
    navigate(query ? `/dashboard?q=${encodeURIComponent(query)}` : "/dashboard");
  };

  const startSignup = (query = "") => {
    if (hasSignedUp()) { openDashboard(query); return; }
    setPendingQuery(query);
    setIsGateOpen(true);
  };

  return (
    <>
      <LandingPage
        onHome={() => navigate("/")}
        onSignUp={() => startSignup()}
        onContactSales={() => navigate("/pricing")}
        onGetStarted={({ segment, query }) => {
          // "Find local businesses" has always gone to the review directory
          if (segment === "businesses") { navigate("/reviews"); return; }
          startSignup(query);
        }}
        logo={
          <>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
              <Zap className="h-5 w-5 fill-white text-white" />
            </span>
            <span>Signalmerge</span>
          </>
        }
        navExtra={
          <Link to="/connect-claude">
            <Button className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-orange-100">
              Connect with Claude
            </Button>
          </Link>
        }
        footerLinks={
          <>
            <Link to="/about">About</Link>
            <Link to="/consulting">Consulting</Link>
            <Link to="/connect-claude">Connect with Claude</Link>
            <button type="button" onClick={() => setIsTermsModalOpen(true)}>
              Terms
            </button>
          </>
        }
      />

      <SignupGateModal
        isOpen={isGateOpen}
        firstSearch={pendingQuery}
        onOpenTerms={() => setIsTermsModalOpen(true)}
        onComplete={() => {
          setIsGateOpen(false);
          openDashboard(pendingQuery);
        }}
      />
      <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/digital-consulting-pros" element={<DigitalConsultingAudit />} />
        <Route path="/connect-claude" element={<ConnectClaude />} />
        <Route path="/consulting" element={<Consulting />} />
        <Route path="/reviews" element={<ReviewDirectoryPage />} />
      </Routes>
    </Router>
  );
}
