import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import AboutPage from "@/app/about/page";
import Dashboard from "@/components/Dashboard";
import { TermsModal } from "@/components/TermsModal";
import DigitalConsultingAudit from "@/components/DigitalConsultingAudit";
import ConnectClaude from "@/components/ConnectClaude";
import Consulting from "@/components/Consulting";

const testimonials = [
  { name: "Chris B.", role: "Freelancer", text: "Went from struggling to find clients to having a waitlist. Unreal results.", initials: "CB" },
  { name: "Sarah J.", role: "Agency Owner", text: "The AI insights are scary accurate. Found 5 high-ticket leads in 10 minutes.", initials: "SJ" },
  { name: "Mike R.", role: "SaaS Founder", text: "Signalmerge is the secret weapon we've been looking for. Revenue is up 40%.", initials: "MR" },
  { name: "Elena K.", role: "Consultant", text: "Finally, a search engine that actually understands intent. 3 clicks and I'm done.", initials: "EK" },
  { name: "David L.", role: "Sales Lead", text: "Our outbound team is now 3x more efficient. The data quality is top-tier.", initials: "DL" },
  { name: "Anna W.", role: "E-com Owner", text: "Found my ideal customer profile in seconds. Best investment this year.", initials: "AW" },
  { name: "James P.", role: "Growth Hacker", text: "The real-time tracking is a game changer. I know exactly when to reach out.", initials: "JP" },
  { name: "Linda M.", role: "Marketer", text: "Clean, fast, and powerful. Signalmerge just works.", initials: "LM" },
  { name: "Tom H.", role: "Startup CEO", text: "We closed our biggest deal yet thanks to a signal we found here.", initials: "TH" },
  { name: "Rachel G.", role: "Business Dev", text: "I've tried every tool out there. This is the only one that delivers.", initials: "RG" },
  { name: "Kevin S.", role: "Account Exec", text: "The interface is so intuitive. My workflow is now seamless.", initials: "KS" },
  { name: "Sophie T.", role: "Entrepreneur", text: "Signalmerge saved me hours of manual prospecting every week.", initials: "ST" },
  { name: "Brian C.", role: "VP of Sales", text: "Scalable, reliable, and incredibly effective for our enterprise needs.", initials: "BC" },
  { name: "Maria F.", role: "Content Creator", text: "Found brand partners I didn't even know were looking for me.", initials: "MF" },
  { name: "John D.", role: "Real Estate", text: "The local intent signals are perfect for my niche. Highly recommend.", initials: "JD" },
  { name: "Emma B.", role: "Recruiter", text: "Finding talent and clients in one place. The AI is brilliant.", initials: "EB" },
  { name: "Robert N.", role: "Investor", text: "I use it to track market trends and high-growth companies. Essential.", initials: "RN" },
  { name: "Chloe V.", role: "Designer", text: "The minimalist design makes it a joy to use every day.", initials: "CV" },
  { name: "Alex M.", role: "App Developer", text: "Integrated the data into our CRM. The export feature is flawless.", initials: "AM" },
  { name: "Jessica R.", role: "PR Specialist", text: "Found the right journalists and outlets in record time.", initials: "JR" },
  { name: "Mark T.", role: "Coach", text: "My calendar is now fully booked. Signalmerge is a lifesaver.", initials: "MT" }
];

function HomePage() {
  const [searchValue, setSearchValue] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const navigate = useNavigate();

  const phrases = [
    <>
      Make <span className="text-primary">more</span> money
    </>,
    <>
      Grow your <span className="text-primary">revenue</span>
    </>
  ];

  useEffect(() => {
    const phraseTimer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 2000);
    
    const testimonialTimer = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => {
      clearInterval(phraseTimer);
      clearInterval(testimonialTimer);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/dashboard?q=${encodeURIComponent(searchValue)}`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-sans selection:bg-orange-100 selection:text-orange-600">
      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-12 py-5 sm:py-8 max-w-7xl mx-auto gap-2">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <Zap className="text-white w-5 h-5 fill-white" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-[#111]">Signalmerge</span>
        </div>

        <div>
          <Link to="/connect-claude">
            <Button className="rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-primary font-black text-[10px] sm:text-xs uppercase px-3.5 py-3 sm:px-5 sm:py-5 transition-all shadow-sm">
              Connect with Claude
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-24 pb-24 px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Search Section */}
        <div className="w-full max-w-3xl mb-8 flex flex-col items-center">
          {/* Animated Phrases */}
          <div className="h-8 mb-4 overflow-hidden relative w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={phraseIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="text-[#111] font-bold text-lg uppercase tracking-[0.2em]"
              >
                {phrases[phraseIndex]}
              </motion.div>
            </AnimatePresence>
          </div>

          <form onSubmit={handleSearch} className="relative group w-full px-4 sm:px-0">
            <div className="relative flex items-center bg-white border-2 border-orange-100 rounded-2xl p-1.5 md:p-2 shadow-xl shadow-orange-500/5 focus-within:border-primary transition-all duration-300">
              <Input 
                type="text"
                placeholder="Find me customers..."
                className="border-none shadow-none focus-visible:ring-0 text-sm md:text-lg h-auto py-3.5 md:py-7 px-3 md:px-8 bg-transparent placeholder:text-[#9CA3AF] flex-grow"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <Button type="submit" className="rounded-xl bg-primary hover:bg-orange-700 text-white px-4 md:px-10 h-auto py-3 md:py-7 text-xs md:text-base font-bold gap-1 md:gap-2 transition-all shadow-lg shadow-orange-200 shrink-0">
                Agents <Zap className="w-3.5 h-3.5 md:w-5 md:h-5 fill-white" />
              </Button>
            </div>
          </form>
          <p className="mt-4 text-[11px] md:text-xs font-bold text-gray-400 text-center">
            1 free search, 3 real leads — no signup required. No payment until you choose to buy a 150-lead pack.
          </p>
        </div>

        {/* Features List - Horizontal */}
        <div className="flex flex-wrap justify-center gap-8 mb-20 text-[10px] font-black tracking-[0.2em] text-[#9CA3AF] uppercase">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            <span>Real-time tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            <span>AI-driven insights</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            <span>3 Clicks to export</span>
          </div>
        </div>

        {/* Testimonial Slider - Smaller and Centered */}
        <div className="w-full max-w-lg mx-auto">
          <h2 className="text-[10px] font-black tracking-[0.3em] text-[#9CA3AF] uppercase mb-6">User Feedback</h2>
          <div className="relative h-32">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <Card className="border-none shadow-lg shadow-orange-500/5 rounded-2xl bg-white p-4 h-full flex flex-col justify-center">
                  <div className="flex gap-4 items-center">
                    <Avatar className="w-8 h-8 rounded-lg shadow-sm">
                      <AvatarFallback className="bg-orange-50 text-primary text-[10px] font-black rounded-lg">
                        {testimonials[testimonialIndex].initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left">
                      <div className="flex gap-0.5 mb-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-2 h-2 fill-primary text-primary" />
                        ))}
                      </div>
                      <p className="text-[#4B5563] text-xs font-medium leading-tight italic line-clamp-2">
                        "{testimonials[testimonialIndex].text}"
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <p className="text-[10px] font-black text-[#111]">{testimonials[testimonialIndex].name}</p>
                        <span className="w-0.5 h-0.5 bg-gray-300 rounded-full" />
                        <p className="text-[9px] text-[#9CA3AF] font-bold">{testimonials[testimonialIndex].role}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Progress Indicators */}
          <div className="flex justify-center gap-1 mt-6">
            {testimonials.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === testimonialIndex ? "w-4 bg-primary" : "w-1 bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-12 py-8 mt-auto border-t border-[#E5E7EB] flex justify-between items-center text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider">
        <div>© 2026 Signalmerge</div>
        <div className="flex gap-6 items-center">
          <Link to="/about" className="hover:text-primary transition-colors uppercase">
            About
          </Link>
          <Link to="/consulting" className="hover:text-primary transition-colors uppercase font-bold text-primary">
            Consulting
          </Link>
          <button 
            type="button" 
            onClick={() => setIsTermsModalOpen(true)}
            className="hover:text-primary cursor-pointer transition-colors focus:outline-none uppercase"
          >
            Terms
          </button>
          <span>Support</span>
        </div>
      </footer>

      <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/digital-consulting-pros" element={<DigitalConsultingAudit />} />
        <Route path="/connect-claude" element={<ConnectClaude />} />
        <Route path="/consulting" element={<Consulting />} />
      </Routes>
    </Router>
  );
}
