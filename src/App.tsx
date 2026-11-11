import { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import AboutPage from "@/app/about/page";
import Dashboard from "@/components/Dashboard";
import PricingPage from "@/components/PricingPage";
import { TermsModal } from "@/components/TermsModal";
import { supabase } from "@/lib/supabase";
import { SIGNUP_KEY } from "@/components/SignupGateModal";
import DigitalConsultingAudit from "@/components/DigitalConsultingAudit";
import ConnectClaude from "@/components/ConnectClaude";
import Consulting from "@/components/Consulting";
import ReviewDirectoryPage from "@/app/about/reviews/page";
import LandingPage from "@/components/landing/LandingPage";
import ContactSalesPage, { ThankYouPage } from "@/components/account/ContactSalesPage";
import LoginPage from "@/components/account/LoginPage";

function HomePage() {
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Keep the older "signed up" flag in step with a real Supabase session (other pages may still read it)
  useEffect(() => {
    try {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) { try { localStorage.setItem(SIGNUP_KEY, "1"); } catch {} }
      });
    } catch {}
  }, []);

  return (
    <>
      <LandingPage
        onHome={() => navigate("/")}
        // Both buttons always open the contact sales page, where the real account is created
        onSignUp={() => navigate("/contact-sales")}
        onContactSales={() => navigate("/contact-sales")}
        onGetStarted={async ({ segment, query, salespersonId, quantity }) => {
          // "Find local businesses" has always gone to the review directory
          if (segment === "businesses") { navigate("/reviews"); return; }
          // Only a real Supabase session counts as signed in (not a saved browser flag)
          let signedIn = false;
          try {
            const { data } = await supabase.auth.getSession();
            signedIn = !!data.session;
          } catch {}
          if (signedIn) { navigate(`/dashboard?q=${encodeURIComponent(query)}`); return; }
          // Carry the demo choices over so the form can start from them
          navigate("/contact-sales", { state: { demo: { query, salespersonId, quantity } } });
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
          <>
            <Link to="/login" className="mr-3 text-sm font-semibold text-[#6b6560] hover:text-[#1b1816]">
              Log in
            </Link>
            <Link to="/connect-claude">
              <Button className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-orange-100">
                Connect with Claude
              </Button>
            </Link>
          </>
        }
        footerLinks={
          <>
            <Link to="/about">About</Link>
            <Link to="/consulting">Consulting</Link>
            <Link to="/connect-claude">Connect with Claude</Link>
            <Link to="/login">Log in</Link>
            <button type="button" onClick={() => setIsTermsModalOpen(true)}>
              Terms
            </button>
          </>
        }
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
        <Route path="/contact-sales" element={<ContactSalesPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/login" element={<LoginPage />} />
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
