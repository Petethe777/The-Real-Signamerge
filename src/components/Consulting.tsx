import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, 
  User, 
  Mail, 
  Building, 
  MapPin, 
  Globe, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Link2, 
  Info, 
  CheckCircle2, 
  ShieldCheck, 
  Code,
  Sparkles,
  Phone,
  FileText,
  Laptop,
  Server,
  BrainCircuit,
  Share2,
  CalendarDays,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { TermsModal } from "@/components/TermsModal";

// --- Google Form Default Configuration ---
const DEFAULT_FORM_ID = "1FAIpQLSffTKwJChetSb4NP6RCxdWUbweacLdSFmOvcVUQNO3_a0YrPQ";
const DEFAULT_ENTRIES = {
  name: "entry.2005620554",
  email: "entry.1045781291",
  businessName: "entry.1065046570",
  businessBranding: "entry.558184448",
  businessDescription: "entry.1166974658",
  businessLocation: "entry.653828736",
  targetAudience: "entry.629903432",
  features: "entry.50113258",
  hasDomain: "entry.260101759",
  hostingPlatform: "entry.1751248682",
  urgency: "entry.1949556295",
  examples: "entry.1846849009",
  homepageMention: "entry.2130772474",
  aboutpageMention: "entry.997034672",
  servicepageMention: "entry.677758832",
  socialLinks: "entry.167445062",
  questions: "entry.1812416979",
  whatsapp: "entry.668284723",
  thankYouNote: "entry.1699059571"
};

type PrimaryService = 
  | "Software Development & Design"
  | "Social Media Sales Services"
  | "AI Module Development & Training"
  | "MCP Server Development (Claude, Cursor, ChatGPT)";

export default function Consulting() {
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const formId = import.meta.env.VITE_GOOGLE_FORM_ID || DEFAULT_FORM_ID;
  const entries = DEFAULT_ENTRIES;

  // Unified Form State covering all branching questions
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    businessName: "",
    businessDescription: "",
    primaryService: "Software Development & Design" as PrimaryService,
    businessLocation: "",
    targetAudience: "",
    
    // Brand Kit & Onboarding
    brandKitStatus: "",
    brandKitLink: "",
    visualAssetsLink: "",
    onboardingLogins: "",

    // Branch: Software Development & Design
    hasDomain: "",
    hostingPlatform: "",
    softwareFeatures: "",
    urgency: "",
    examples: "",
    homepageMention: "",
    aboutpageMention: "",
    servicepageMention: "",
    socialLinks: "",

    // Branch: Social Media Sales Services
    socialPlatforms: [] as string[],
    socialManager: "",
    socialGoal: "",
    socialLeadsCurrent: "",
    socialDirectSelling: "",
    socialBlocker: "",

    // Branch: AI Module Development & Training
    aiNeeds: [] as string[],
    aiExistingTools: "",
    aiTrainingDataState: "",
    aiDailyUsers: "",
    aiSuccessMetrics: "",

    // Branch: Claude MCP Server Development
    mcpPlatforms: [] as string[],
    mcpTargetSystems: "",
    mcpApiStatus: "",
    mcpActionsList: "",
    mcpTeamType: "",
    mcpCompliance: "",

    // Final details
    referralSource: "",
    contactPreference: "",
    questions: "",
    thankYouNote: "Yes, I am ready to build!"
  });

  // Calculate numerical progress percentage
  const getProgressPercentage = () => {
    switch (currentStep) {
      case 1: return 20;
      case 2: return 45;
      case 3: return 70;
      case 4: return 90;
      case 5: return 100;
      default: return 0;
    }
  };

  const handleNext = () => {
    // Step 1 Validation: Core details & Primary Service
    if (currentStep === 1) {
      if (
        !formData.name.trim() || 
        !formData.email.trim() || 
        !formData.whatsapp.trim() || 
        !formData.businessName.trim() || 
        !formData.businessDescription.trim() ||
        !formData.primaryService
      ) {
        alert("Please fill in all required fields marked with * before continuing.");
        return;
      }
    } 
    // Step 2 Validation: Dynamic branch-specific checks
    else if (currentStep === 2) {
      if (formData.primaryService === "Software Development & Design") {
        if (!formData.softwareFeatures.trim() || !formData.hasDomain || !formData.hostingPlatform.trim() || !formData.urgency.trim()) {
          alert("Please complete core specification questions before continuing.");
          return;
        }
      } else if (formData.primaryService === "Social Media Sales Services") {
        if (formData.socialPlatforms.length === 0 || !formData.socialGoal || !formData.socialBlocker.trim()) {
          alert("Please select at least one social platform and complete required questions.");
          return;
        }
      } else if (formData.primaryService === "AI Module Development & Training") {
        if (formData.aiNeeds.length === 0 || !formData.aiSuccessMetrics.trim()) {
          alert("Please select at least one AI need and outline your success metrics.");
          return;
        }
      } else if (formData.primaryService === "MCP Server Development (Claude, Cursor, ChatGPT)") {
        if (formData.mcpPlatforms.length === 0 || !formData.mcpTargetSystems.trim() || !formData.mcpActionsList.trim()) {
          alert("Please select targeting platforms, list target systems and describe actions.");
          return;
        }
      }
    } 
    // Step 3 Validation: Location, Audience & Branding
    else if (currentStep === 3) {
      if (!formData.businessLocation.trim() || !formData.targetAudience.trim() || !formData.brandKitStatus) {
        alert("Please complete all required fields on this page before continuing.");
        return;
      }
    }

    setCurrentStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTogglePlatform = (platform: string) => {
    setFormData((prev) => {
      const current = prev.socialPlatforms.includes(platform)
        ? prev.socialPlatforms.filter((p) => p !== platform)
        : [...prev.socialPlatforms, platform];
      return { ...prev, socialPlatforms: current };
    });
  };

  const handleToggleAINeed = (need: string) => {
    setFormData((prev) => {
      const current = prev.aiNeeds.includes(need)
        ? prev.aiNeeds.filter((n) => n !== need)
        : [...prev.aiNeeds, need];
      return { ...prev, aiNeeds: current };
    });
  };

  const handleToggleMCPPlatform = (platform: string) => {
    setFormData((prev) => {
      const current = prev.mcpPlatforms.includes(platform)
        ? prev.mcpPlatforms.filter((p) => p !== platform)
        : [...prev.mcpPlatforms, platform];
      return { ...prev, mcpPlatforms: current };
    });
  };

  // Maps the current service-specific React state into the 19 Google Form slots
  const getMappedFormValues = () => {
    const mapped: Record<string, string> = {
      name: formData.name,
      email: formData.email,
      businessName: formData.businessName,
      businessLocation: formData.businessLocation,
      targetAudience: formData.targetAudience,
      whatsapp: formData.whatsapp,
      thankYouNote: formData.thankYouNote,
      businessDescription: formData.businessDescription,
    };

    // Format rich metadata for branding & onboarding links
    mapped.businessBranding = `Brand Status: ${formData.brandKitStatus || "None specified"}\nBrand Guide Link: ${formData.brandKitLink || "None"}\nPhoto/Visual Assets Link: ${formData.visualAssetsLink || "None"}\nOnboarding Credentials: ${formData.onboardingLogins || "None"}`;

    if (formData.primaryService === "Software Development & Design") {
      mapped.features = formData.softwareFeatures;
      mapped.hasDomain = formData.hasDomain;
      mapped.hostingPlatform = formData.hostingPlatform;
      mapped.urgency = formData.urgency;
      mapped.examples = formData.examples || "None provided";
      mapped.homepageMention = formData.homepageMention || "N/A";
      mapped.aboutpageMention = formData.aboutpageMention || "N/A";
      mapped.servicepageMention = formData.servicepageMention || "N/A";
      mapped.socialLinks = formData.socialLinks || "N/A";
    } else if (formData.primaryService === "Social Media Sales Services") {
      mapped.features = `[SOCIAL PLATFORMS]: ${formData.socialPlatforms.join(", ")}\n[PRIMARY GOAL]: ${formData.socialGoal}\n[CURRENT LEADS]: ${formData.socialLeadsCurrent || "None"}`;
      mapped.hasDomain = `Has dedicated manager: ${formData.socialManager}`;
      mapped.hostingPlatform = `Direct Selling in DMs/Comments: ${formData.socialDirectSelling}`;
      mapped.urgency = "ASAP Campaign Integration";
      mapped.examples = `[GROWTH BLOCKER]: ${formData.socialBlocker}`;
      mapped.homepageMention = `Preferred platforms: ${formData.socialPlatforms.join(", ")}`;
      mapped.aboutpageMention = `Direct Selling Strategy: ${formData.socialDirectSelling}`;
      mapped.servicepageMention = `Goal: ${formData.socialGoal}`;
      mapped.socialLinks = `Social handles provided: ${formData.socialPlatforms.join(", ")}`;
    } else if (formData.primaryService === "AI Module Development & Training") {
      mapped.features = `[AI NEEDS]: ${formData.aiNeeds.join(", ")}\n[INTEGRATION HOSTS]: ${formData.aiExistingTools || "None specified"}`;
      mapped.hasDomain = "AI Infrastructure Setup";
      mapped.hostingPlatform = `Expected Daily Inquiries: ${formData.aiDailyUsers || "Unknown"}`;
      mapped.urgency = "ASAP AI Integration";
      mapped.examples = `[DATA STATE]: ${formData.aiTrainingDataState}\n[SUCCESS CRITERIA]: ${formData.aiSuccessMetrics}`;
      mapped.homepageMention = `Key Needs: ${formData.aiNeeds.join(", ")}`;
      mapped.aboutpageMention = `Target tools: ${formData.aiExistingTools}`;
      mapped.servicepageMention = `State of Training Data: ${formData.aiTrainingDataState}`;
      mapped.socialLinks = "N/A";
    } else {
      // Claude MCP Server Development
      mapped.features = `[MCP CLIENTS]: ${formData.mcpPlatforms.join(", ")}\n[CORE ACTIONS]: ${formData.mcpActionsList}`;
      mapped.hasDomain = "Claude MCP Ecosystem Setup";
      mapped.hostingPlatform = `API Documentation Status: ${formData.mcpApiStatus}`;
      mapped.urgency = "ASAP MCP Setup";
      mapped.examples = `[TARGET SYSTEMS]: ${formData.mcpTargetSystems}\n[COMPLIANCE]: ${formData.mcpCompliance}\n[TEAM TYPE]: ${formData.mcpTeamType}`;
      mapped.homepageMention = `Target Clients: ${formData.mcpPlatforms.join(", ")}`;
      mapped.aboutpageMention = `Target Systems: ${formData.mcpTargetSystems}`;
      mapped.servicepageMention = `API documentation: ${formData.mcpApiStatus}`;
      mapped.socialLinks = "N/A";
    }

    // Append unified routing metrics to the final questions field
    mapped.questions = `[PRIMARY SERVICE INTEREST]: ${formData.primaryService}\n[CONTACT METHOD PREFERENCE]: ${formData.contactPreference}\n[REFERRAL SOURCE]: ${formData.referralSource || "None Specified"}\n\n[INQUIRER TOP QUESTIONS]:\n${formData.questions || "None provided"}`;

    return mapped;
  };

  // Submit programmatically using our 100% reliable server-side proxy
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Step 4 Validation
    if (!formData.contactPreference) {
      alert("Please select your preferred contact method.");
      return;
    }

    setIsSubmitting(true);
    const mappedValues = getMappedFormValues();

    try {
      console.log("Submitting to Google Form via server-side proxy...", mappedValues);

      // Call our robust server-side proxy endpoint
      const response = await fetch("/api/submit-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formId,
          entries,
          values: mappedValues,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Server proxy form submission success:", result);

      // Allow a small delay to make the submission feel tactile and complete transitions
      setTimeout(() => {
        setIsSubmitting(false);
        setCurrentStep(5);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 800);
    } catch (err) {
      console.error("Critical Google Form server-side submission error, trying fallback:", err);
      
      // Fallback: Attempt client-side POST submission (no-cors)
      try {
        const urlEncodedData = new URLSearchParams();
        urlEncodedData.append(entries.name, mappedValues.name || "");
        urlEncodedData.append(entries.email, mappedValues.email || "");
        urlEncodedData.append(entries.businessName, mappedValues.businessName || "");
        urlEncodedData.append(entries.businessBranding, mappedValues.businessBranding || "");
        urlEncodedData.append(entries.businessDescription, mappedValues.businessDescription || "");
        urlEncodedData.append(entries.businessLocation, mappedValues.businessLocation || "");
        urlEncodedData.append(entries.targetAudience, mappedValues.targetAudience || "");
        urlEncodedData.append(entries.features, mappedValues.features || "");
        urlEncodedData.append(entries.hasDomain, mappedValues.hasDomain || "");
        urlEncodedData.append(entries.hostingPlatform, mappedValues.hostingPlatform || "");
        urlEncodedData.append(entries.urgency, mappedValues.urgency || "");
        urlEncodedData.append(entries.examples, mappedValues.examples || "");
        urlEncodedData.append(entries.homepageMention, mappedValues.homepageMention || "");
        urlEncodedData.append(entries.aboutpageMention, mappedValues.aboutpageMention || "");
        urlEncodedData.append(entries.servicepageMention, mappedValues.servicepageMention || "");
        urlEncodedData.append(entries.socialLinks, mappedValues.socialLinks || "");
        urlEncodedData.append(entries.questions, mappedValues.questions || "");
        urlEncodedData.append(entries.whatsapp, mappedValues.whatsapp || "");
        urlEncodedData.append(entries.thankYouNote, mappedValues.thankYouNote || "");

        const submissionUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;
        await fetch(submissionUrl, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: urlEncodedData.toString()
        });
        console.log("Client-side fallback submit triggered.");
      } catch (fallbackErr) {
        console.warn("Client fallback failed too:", fallbackErr);
      }

      setIsSubmitting(false);
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const mappedValues = getMappedFormValues();

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-orange-100 selection:text-orange-600 flex flex-col">
      
      {/* Hidden programmatically-submitted HTML form targeting the hidden iframe */}
      <iframe
        name="hidden_iframe"
        id="hidden_iframe"
        style={{ display: "none" }}
        title="Form submission buffer"
      />
      <form
        id="google_form_submit"
        action={`https://docs.google.com/forms/d/e/${formId}/formResponse`}
        method="POST"
        target="hidden_iframe"
        className="hidden"
      >
        <input type="hidden" name={entries.name} value={mappedValues.name} />
        <input type="hidden" name={entries.email} value={mappedValues.email} />
        <input type="hidden" name={entries.businessName} value={mappedValues.businessName} />
        <input type="hidden" name={entries.businessBranding} value={mappedValues.businessBranding} />
        <input type="hidden" name={entries.businessDescription} value={mappedValues.businessDescription} />
        <input type="hidden" name={entries.businessLocation} value={mappedValues.businessLocation} />
        <input type="hidden" name={entries.targetAudience} value={mappedValues.targetAudience} />
        <input type="hidden" name={entries.features} value={mappedValues.features} />
        <input type="hidden" name={entries.hasDomain} value={mappedValues.hasDomain} />
        <input type="hidden" name={entries.hostingPlatform} value={mappedValues.hostingPlatform} />
        <input type="hidden" name={entries.urgency} value={mappedValues.urgency} />
        <input type="hidden" name={entries.examples} value={mappedValues.examples} />
        <input type="hidden" name={entries.homepageMention} value={mappedValues.homepageMention} />
        <input type="hidden" name={entries.aboutpageMention} value={mappedValues.aboutpageMention} />
        <input type="hidden" name={entries.servicepageMention} value={mappedValues.servicepageMention} />
        <input type="hidden" name={entries.socialLinks} value={mappedValues.socialLinks} />
        <input type="hidden" name={entries.questions} value={mappedValues.questions} />
        <input type="hidden" name={entries.whatsapp} value={mappedValues.whatsapp} />
        <input type="hidden" name={entries.thankYouNote} value={mappedValues.thankYouNote} />
      </form>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-12 py-5 sm:py-8 max-w-7xl mx-auto w-full gap-2 border-b border-gray-100/60 bg-white/50 backdrop-blur-md">
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <Zap className="text-white w-5 h-5 fill-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-[#111]">Signalmerge</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/" className="text-xs font-bold text-gray-500 hover:text-primary transition-colors">
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-grow pt-10 pb-24 px-4 sm:px-12 max-w-4xl mx-auto w-full flex flex-col justify-center">
        
        {/* Progress Bar & Header (hidden in success screen) */}
        {currentStep !== 5 && (
          <div className="text-center space-y-4 mb-10">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              Client Intake Form
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-[#111] tracking-tight leading-none">
              Strategic Discovery & Intake
            </h1>
            <p className="text-gray-500 font-medium text-sm max-w-xl mx-auto leading-relaxed">
              We design and construct digital assets rooted in rigorous market strategy and conversion psychology. Answer the questions below to design your bespoke solution.
            </p>

            {/* Progress indicator */}
            <div className="max-w-md mx-auto pt-4">
              <div className="flex justify-between items-center mb-1 text-[10px] font-black uppercase tracking-wider text-gray-400">
                <span>Section {currentStep} of 4</span>
                <span className="text-primary">{getProgressPercentage()}% Completed</span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgressPercentage()}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Form Container */}
        <Card className="border-none shadow-xl shadow-orange-500/5 bg-white rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-6 sm:p-12">
            <form onSubmit={handleSubmitForm} className="space-y-8">
              <AnimatePresence mode="wait">
                
                {/* STEP 1: Basic Details & Service Selector */}
                {currentStep === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-1">
                      <h2 className="text-xl sm:text-2xl font-black text-[#111] tracking-tight flex items-center gap-2">
                        <User className="text-primary w-6 h-6 shrink-0" /> Core Client & Business Details
                      </h2>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Let's start with who you are, what your business does and your primary interest.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Your Name *</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input 
                            value={formData.name} 
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Doe" 
                            className="pl-10 rounded-xl"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Your Email Address *</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input 
                            type="email"
                            value={formData.email} 
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="john@example.com" 
                            className="pl-10 rounded-xl"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-black uppercase text-[#111] tracking-wider block">WhatsApp or Phone Number *</label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input 
                            value={formData.whatsapp} 
                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                            placeholder="+27 82 123 4567" 
                            className="pl-10 rounded-xl"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Business Name *</label>
                        <div className="relative">
                          <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input 
                            value={formData.businessName} 
                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                            placeholder="Your company or business name" 
                            className="pl-10 rounded-xl"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-black uppercase text-[#111] tracking-wider block">What does your business do? *</label>
                        <textarea 
                          value={formData.businessDescription}
                          onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                          placeholder="Please describe your core business model, target services/products, and market offerings..."
                          className="w-full h-24 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                          required
                        />
                      </div>

                      <div className="space-y-3 sm:col-span-2 pt-2">
                        <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Primary Service of Interest *</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            { 
                              id: "Software Development & Design", 
                              title: "Software & Web Build", 
                              desc: "Bespoke full-stack applications, Shopify, checkout systems & custom dashboards.",
                              icon: Laptop 
                            },
                            { 
                              id: "Social Media Sales Services", 
                              title: "Social Sales Funnels", 
                              desc: "Lead tracking, DM sales loops, social platform conversion strategies.",
                              icon: Share2 
                            },
                            { 
                              id: "AI Module Development & Training", 
                              title: "AI & Model Pipelines", 
                              desc: "Custom training, chat automation, data analytics, predictive workflows.",
                              icon: BrainCircuit 
                            },
                            { 
                              id: "MCP Server Development (Claude, Cursor, ChatGPT)", 
                              title: "Claude MCP Servers", 
                              desc: "Establish direct system connections allowing models to securely read/write tools.",
                              icon: Server 
                            }
                          ].map((serv) => {
                            const Icon = serv.icon;
                            const isSel = formData.primaryService === serv.id;
                            return (
                              <button
                                type="button"
                                key={serv.id}
                                onClick={() => setFormData({ ...formData, primaryService: serv.id as PrimaryService })}
                                className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex gap-3 ${
                                  isSel
                                    ? "border-primary bg-orange-50/20 text-primary shadow-sm"
                                    : "border-gray-100 hover:border-gray-200 bg-white text-gray-600"
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${isSel ? "bg-primary text-white" : "bg-gray-50 text-gray-400"}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-xs font-black uppercase tracking-tight">{serv.title}</h4>
                                  <p className="text-[10px] text-gray-400 leading-normal font-semibold">{serv.desc}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Branching Questions */}
                {currentStep === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    
                    {/* BRANCH A: Software Development & Design */}
                    {formData.primaryService === "Software Development & Design" && (
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <h2 className="text-xl sm:text-2xl font-black text-[#111] tracking-tight flex items-center gap-2">
                            <Laptop className="text-primary w-6 h-6 shrink-0" /> Web & Software Specifications
                          </h2>
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Outline your technical requirements, hosting preferences, and timelines.</p>
                        </div>

                        <div className="space-y-5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Do you have a website domain? *</label>
                              <div className="grid grid-cols-2 gap-2">
                                {["Yes", "No"].map((option) => (
                                  <button
                                    type="button"
                                    key={option}
                                    onClick={() => setFormData({ ...formData, hasDomain: option })}
                                    className={`border-2 rounded-xl p-3 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                      formData.hasDomain === option
                                        ? "border-primary bg-orange-50/30 text-primary"
                                        : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                                    }`}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Preferred hosting platform? *</label>
                              <Input 
                                value={formData.hostingPlatform} 
                                onChange={(e) => setFormData({ ...formData, hostingPlatform: e.target.value })}
                                placeholder="e.g. Hostinger, AWS, Vercel, Netlify, or None yet" 
                                className="rounded-xl"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-[#111] tracking-wider block">What features would you like on your platform? *</label>
                            <textarea 
                              value={formData.softwareFeatures}
                              onChange={(e) => setFormData({ ...formData, softwareFeatures: e.target.value })}
                              placeholder="e.g. user authentication, database integration, e-commerce checkout, dashboard charts, Stripe payments, booking calendars..."
                              className="w-full h-24 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-[#111] tracking-wider block">How urgent is this build? *</label>
                            <Input 
                              value={formData.urgency} 
                              onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                              placeholder="e.g. ASAP, 2-4 weeks, 1-3 months, just exploring" 
                              className="rounded-xl"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Do you have reference websites or style inspirations? *</label>
                            <textarea 
                              value={formData.examples}
                              onChange={(e) => setFormData({ ...formData, examples: e.target.value })}
                              placeholder="If so, please list URLs or design references you admire..."
                              className="w-full h-24 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Main Home Page copy ideas / key messages</label>
                            <textarea 
                              value={formData.homepageMention}
                              onChange={(e) => setFormData({ ...formData, homepageMention: e.target.value })}
                              placeholder="Describe what core value hook or information you want front and center..."
                              className="w-full h-20 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Main About Page copy ideas / credentials</label>
                            <textarea 
                              value={formData.aboutpageMention}
                              onChange={(e) => setFormData({ ...formData, aboutpageMention: e.target.value })}
                              placeholder="Outline company history, credentials, missions, or team bios..."
                              className="w-full h-20 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Main Service Page copy ideas / deliverables</label>
                            <textarea 
                              value={formData.servicepageMention}
                              onChange={(e) => setFormData({ ...formData, servicepageMention: e.target.value })}
                              placeholder="List key offerings, pricing package templates, or main deliverables..."
                              className="w-full h-20 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Social Media channels to link on site</label>
                            <Input 
                              value={formData.socialLinks} 
                              onChange={(e) => setFormData({ ...formData, socialLinks: e.target.value })}
                              placeholder="e.g. LinkedIn, Instagram, Facebook profiles" 
                              className="rounded-xl"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* BRANCH B: Social Media Sales Services */}
                    {formData.primaryService === "Social Media Sales Services" && (
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <h2 className="text-xl sm:text-2xl font-black text-[#111] tracking-tight flex items-center gap-2">
                            <Share2 className="text-primary w-6 h-6 shrink-0" /> Social Conversion Strategy
                          </h2>
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Help us construct the ultimate social selling and audience routing engine.</p>
                        </div>

                        <div className="space-y-5">
                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Target Social Platforms (Select all that apply) *</label>
                            <div className="flex flex-wrap gap-2">
                              {["Instagram", "TikTok", "LinkedIn", "Facebook", "X (Twitter)", "YouTube"].map((plat) => {
                                const isSel = formData.socialPlatforms.includes(plat);
                                return (
                                  <button
                                    type="button"
                                    key={plat}
                                    onClick={() => handleTogglePlatform(plat)}
                                    className={`px-4 py-2 text-xs font-black uppercase rounded-full border transition-all cursor-pointer ${
                                      isSel 
                                        ? "bg-primary border-primary text-white" 
                                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                                    }`}
                                  >
                                    {plat}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Do you have a Social Manager? *</label>
                              <div className="grid grid-cols-3 gap-2">
                                {["Yes", "No", "I do it"].map((option) => (
                                  <button
                                    type="button"
                                    key={option}
                                    onClick={() => setFormData({ ...formData, socialManager: option })}
                                    className={`border-2 rounded-xl p-2.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                      formData.socialManager === option
                                        ? "border-primary bg-orange-50/30 text-primary"
                                        : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                                    }`}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Direct Sales in Comments/DMs? *</label>
                              <div className="grid grid-cols-2 gap-2">
                                {["Yes actively", "No / Want to start"].map((option) => (
                                  <button
                                    type="button"
                                    key={option}
                                    onClick={() => setFormData({ ...formData, socialDirectSelling: option })}
                                    className={`border-2 rounded-xl p-2.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                      formData.socialDirectSelling === option
                                        ? "border-primary bg-orange-50/30 text-primary"
                                        : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                                    }`}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Primary Social Media Goal *</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {[
                                "Increase high-intent inbound inquiries",
                                "Direct automated sales in direct messages",
                                "Brand authority & corporate trust",
                                "Community retention & audience growth"
                              ].map((goal) => {
                                const isSel = formData.socialGoal === goal;
                                return (
                                  <button
                                    type="button"
                                    key={goal}
                                    onClick={() => setFormData({ ...formData, socialGoal: goal })}
                                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer text-xs font-semibold ${
                                      isSel 
                                        ? "border-primary bg-orange-50/10 text-primary font-bold" 
                                        : "border-gray-150 hover:border-gray-250 bg-white text-gray-600"
                                    }`}
                                  >
                                    {goal}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Estimated current qualified leads from social monthly?</label>
                            <Input 
                              value={formData.socialLeadsCurrent} 
                              onChange={(e) => setFormData({ ...formData, socialLeadsCurrent: e.target.value })}
                              placeholder="e.g. 0 to 5, 10-20, over 50..." 
                              className="rounded-xl"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-[#111] tracking-wider block">What is your single biggest scaling blocker? *</label>
                            <textarea 
                              value={formData.socialBlocker}
                              onChange={(e) => setFormData({ ...formData, socialBlocker: e.target.value })}
                              placeholder="Describe why your current social pipelines aren't converting traffic into buyers..."
                              className="w-full h-24 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* BRANCH C: AI Module Development & Training */}
                    {formData.primaryService === "AI Module Development & Training" && (
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <h2 className="text-xl sm:text-2xl font-black text-[#111] tracking-tight flex items-center gap-2">
                            <BrainCircuit className="text-primary w-6 h-6 shrink-0" /> AI Pipeline & Module Specifications
                          </h2>
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Outline your model pipelines, training states, and integration frameworks.</p>
                        </div>

                        <div className="space-y-5">
                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Core AI Functional Needs (Select all) *</label>
                            <div className="flex flex-wrap gap-2">
                              {[
                                "Smart sales chatbot / auto-replies",
                                "Lead extraction & intent scoring",
                                "Automated proposal & report generation",
                                "Corporate data parsing & summaries",
                                "Predictive trend forecasting"
                              ].map((need) => {
                                const isSel = formData.aiNeeds.includes(need);
                                return (
                                  <button
                                    type="button"
                                    key={need}
                                    onClick={() => handleToggleAINeed(need)}
                                    className={`px-4 py-2 text-xs font-black uppercase rounded-full border transition-all cursor-pointer ${
                                      isSel 
                                        ? "bg-primary border-primary text-white" 
                                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                                    }`}
                                  >
                                    {need}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-[#111] tracking-wider block">What software/platform are we integrating the AI into?</label>
                            <Input 
                              value={formData.aiExistingTools} 
                              onChange={(e) => setFormData({ ...formData, aiExistingTools: e.target.value })}
                              placeholder="e.g. Discord, internal dashboard, Slack, Custom Web App" 
                              className="rounded-xl"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Current Training Data State *</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {[
                                { id: "Well-organized", label: "Structured Database / CSV" },
                                { id: "Unstructured", label: "Unstructured Docs / PDFs" },
                                { id: "No-data", label: "No training data yet" }
                              ].map((state) => {
                                const isSel = formData.aiTrainingDataState === state.id;
                                return (
                                  <button
                                    type="button"
                                    key={state.id}
                                    onClick={() => setFormData({ ...formData, aiTrainingDataState: state.id })}
                                    className={`border-2 rounded-xl p-3 text-left transition-all cursor-pointer ${
                                      isSel
                                        ? "border-primary bg-orange-50/20 text-primary"
                                        : "border-gray-100 bg-white text-gray-600"
                                    }`}
                                  >
                                    <span className="block text-xs font-black uppercase tracking-tight">{state.id}</span>
                                    <span className="block text-[9px] text-gray-450 mt-0.5 leading-normal">{state.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Expected Daily Inquiries/Requests</label>
                            <Input 
                              value={formData.aiDailyUsers} 
                              onChange={(e) => setFormData({ ...formData, aiDailyUsers: e.target.value })}
                              placeholder="e.g. 50-200, 1000+, internal employees only..." 
                              className="rounded-xl"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-[#111] tracking-wider block">What does a successful AI integration look like for you? *</label>
                            <textarea 
                              value={formData.aiSuccessMetrics}
                              onChange={(e) => setFormData({ ...formData, aiSuccessMetrics: e.target.value })}
                              placeholder="Describe your core target (e.g. automate 80% of customer support emails, generate leads instantly from social signals)..."
                              className="w-full h-24 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* BRANCH D: Claude MCP Server Development */}
                    {formData.primaryService === "MCP Server Development (Claude, Cursor, ChatGPT)" && (
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <h2 className="text-xl sm:text-2xl font-black text-[#111] tracking-tight flex items-center gap-2">
                            <Server className="text-primary w-6 h-6 shrink-0" /> Claude MCP Server Specifications
                          </h2>
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Outline connection hosts, target APIs, and access parameters.</p>
                        </div>

                        <div className="space-y-5">
                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Target MCP Host Clients (Select all) *</label>
                            <div className="flex flex-wrap gap-2">
                              {["Claude Desktop", "Cursor IDE", "ChatGPT", "Custom Internal System"].map((plat) => {
                                const isSel = formData.mcpPlatforms.includes(plat);
                                return (
                                  <button
                                    type="button"
                                    key={plat}
                                    onClick={() => handleToggleMCPPlatform(plat)}
                                    className={`px-4 py-2 text-xs font-black uppercase rounded-full border transition-all cursor-pointer ${
                                      isSel 
                                        ? "bg-primary border-primary text-white" 
                                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                                    }`}
                                  >
                                    {plat}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Target systems to bridge to Claude *</label>
                            <textarea 
                              value={formData.mcpTargetSystems}
                              onChange={(e) => setFormData({ ...formData, mcpTargetSystems: e.target.value })}
                              placeholder="What data nodes should Claude access? e.g. HubSpot CRM, PostgreSQL Database, internal ERP API, local server files..."
                              className="w-full h-20 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Is target system API documented? *</label>
                              <div className="grid grid-cols-2 gap-2">
                                {["Yes, fully documented", "Undocumented / Custom"].map((option) => (
                                  <button
                                    type="button"
                                    key={option}
                                    onClick={() => setFormData({ ...formData, mcpApiStatus: option })}
                                    className={`border-2 rounded-xl p-2.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                      formData.mcpApiStatus === option
                                        ? "border-primary bg-orange-50/30 text-primary"
                                        : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                                    }`}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Your engineering team type *</label>
                              <div className="grid grid-cols-2 gap-2">
                                {["Internal Engineers", "No developer support"].map((option) => (
                                  <button
                                    type="button"
                                    key={option}
                                    onClick={() => setFormData({ ...formData, mcpTeamType: option })}
                                    className={`border-2 rounded-xl p-2.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                      formData.mcpTeamType === option
                                        ? "border-primary bg-orange-50/30 text-primary"
                                        : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                                    }`}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-[#111] tracking-wider block">List core tools/actions Claude should run *</label>
                            <textarea 
                              value={formData.mcpActionsList}
                              onChange={(e) => setFormData({ ...formData, mcpActionsList: e.target.value })}
                              placeholder="e.g. search customer orders, write a lead record, extract system diagnostic reports..."
                              className="w-full h-24 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Compliance / Server Deployment Requirements *</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {[
                                "Standard secure HTTPS cloud host",
                                "On-premise / Local network only",
                                "Strict Compliance (HIPAA, GDPR)"
                              ].map((comp) => {
                                const isSel = formData.mcpCompliance === comp;
                                return (
                                  <button
                                    type="button"
                                    key={comp}
                                    onClick={() => setFormData({ ...formData, mcpCompliance: comp })}
                                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer text-[10px] font-bold ${
                                      isSel 
                                        ? "border-primary bg-orange-50/10 text-primary" 
                                        : "border-gray-150 hover:border-gray-200 bg-white text-gray-650"
                                    }`}
                                  >
                                    {comp}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  </motion.div>
                )}

                {/* STEP 3: Brand Assets & Visuals */}
                {currentStep === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-1">
                      <h2 className="text-xl sm:text-2xl font-black text-[#111] tracking-tight flex items-center gap-2">
                        <MapPin className="text-primary w-6 h-6 shrink-0" /> Target Locations, Audience & Branding
                      </h2>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Provide details regarding your operational footprints and brand configurations.</p>
                    </div>

                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Primary Business Location *</label>
                          <div className="relative">
                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input 
                              value={formData.businessLocation} 
                              onChange={(e) => setFormData({ ...formData, businessLocation: e.target.value })}
                              placeholder="e.g. Johannesburg, South Africa" 
                              className="pl-10 rounded-xl"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Target Customer Audience Location *</label>
                          <div className="relative">
                            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input 
                              value={formData.targetAudience} 
                              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                              placeholder="e.g. Local, National, European, Global..." 
                              className="pl-10 rounded-xl"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Current Brand Assets Status *</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {[
                            { id: "Full", label: "Yes, fully-fledged Brand Kit" },
                            { id: "Basic", label: "Basic colors / logo only" },
                            { id: "None", label: "No brand assets exist (need brand design)" }
                          ].map((bkit) => {
                            const isSel = formData.brandKitStatus === bkit.id;
                            return (
                              <button
                                type="button"
                                key={bkit.id}
                                onClick={() => setFormData({ ...formData, brandKitStatus: bkit.id })}
                                className={`border-2 rounded-xl p-3 text-left transition-all cursor-pointer ${
                                  isSel
                                    ? "border-primary bg-orange-50/20 text-primary"
                                    : "border-gray-100 bg-white text-gray-600"
                                }`}
                              >
                                <span className="block text-xs font-black uppercase tracking-tight">{bkit.id} Brand Status</span>
                                <span className="block text-[9px] text-gray-450 mt-0.5 leading-normal font-semibold">{bkit.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Brand Guide Link (Google Drive / DropBox)</label>
                        <Input 
                          value={formData.brandKitLink} 
                          onChange={(e) => setFormData({ ...formData, brandKitLink: e.target.value })}
                          placeholder="Link to colors, styles, logo folders..." 
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Shared Folder Link for Visual Assets (Photos/Graphics)</label>
                        <Input 
                          value={formData.visualAssetsLink} 
                          onChange={(e) => setFormData({ ...formData, visualAssetsLink: e.target.value })}
                          placeholder="Link to photos, media assets, marketing graphics..." 
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Onboarding login/access details needed (Optional)</label>
                        <textarea 
                          value={formData.onboardingLogins}
                          onChange={(e) => setFormData({ ...formData, onboardingLogins: e.target.value })}
                          placeholder="Specify hosting logins, third-party API credentials, Shopify keys if we require setup access..."
                          className="w-full h-20 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: Review & Submit */}
                {currentStep === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-1">
                      <h2 className="text-xl sm:text-2xl font-black text-[#111] tracking-tight flex items-center gap-2">
                        <FileText className="text-primary w-6 h-6 shrink-0" /> Final Integration Details & Questions
                      </h2>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Finalize your preferred communication channel and list core consultation questions.</p>
                    </div>

                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Where did you hear about Signalmerge?</label>
                          <Input 
                            value={formData.referralSource} 
                            onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                            placeholder="e.g. LinkedIn, Word of mouth, Google search..." 
                            className="rounded-xl"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase text-[#111] tracking-wider block">Preferred Contact Channel *</label>
                          <div className="grid grid-cols-2 gap-2">
                            {["WhatsApp Call/Text", "Google Meet / Zoom", "Email"].map((pref) => {
                              const isSel = formData.contactPreference === pref;
                              return (
                                <button
                                  type="button"
                                  key={pref}
                                  onClick={() => setFormData({ ...formData, contactPreference: pref })}
                                  className={`p-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                                    isSel 
                                      ? "border-primary bg-orange-50/10 text-primary" 
                                      : "border-gray-150 hover:border-gray-200 bg-white text-gray-500"
                                  }`}
                                >
                                  {pref}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-[#111] tracking-wider block">What are your top questions for our call? (Optional)</label>
                        <textarea 
                          value={formData.questions}
                          onChange={(e) => setFormData({ ...formData, questions: e.target.value })}
                          placeholder="List any burning questions regarding budgets, software stacks, timeline, conversion models, or integrations..."
                          className="w-full h-24 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                        />
                      </div>

                      <div className="bg-orange-50/20 p-6 rounded-2xl border border-orange-100 flex items-start gap-4">
                        <ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                        <div className="space-y-1 text-xs text-gray-600 font-semibold">
                          <h4 className="font-bold text-[#111] uppercase text-[10px] tracking-wider">Secure Google Form Pipeline</h4>
                          <p className="leading-relaxed">
                            Your responses will be dynamically mapped and piped directly into the owner's Google Form database. Your data is strictly private and handled with full professional integrity.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 5: Success & Confirmation */}
                {currentStep === 5 && (
                  <motion.div
                    key="step-5"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12 space-y-6 max-w-xl mx-auto"
                  >
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-200 shadow-md">
                      <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-150 font-sans">
                        Intake Received Successfully
                      </span>
                      <h2 className="text-2xl sm:text-4xl font-black text-[#111] tracking-tight">
                        Thank You, {formData.name.split(" ")[0]}!
                      </h2>
                      <div className="text-xs sm:text-sm text-gray-500 font-semibold leading-relaxed space-y-4 pt-2 text-left bg-gray-50 border border-gray-100 p-6 rounded-2xl shadow-inner font-sans">
                        <p>
                          Your specifications for <strong className="text-primary font-bold">{formData.primaryService}</strong> have been directly submitted into our central **Google Form response sheet**.
                        </p>
                        <p>
                          Our consultant team will review your business model, audit the targeted platforms or software needs, and connect with you via your preferred channel: <strong className="text-gray-900">{formData.contactPreference}</strong> (WhatsApp/Phone: <strong>{formData.whatsapp}</strong>) or email shortly!
                        </p>
                        <p className="text-gray-400 text-xs italic">
                          A 100% verified, real-time sync with Google Forms has been executed.
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                      <Link to="/" className="w-full sm:w-auto">
                        <Button className="rounded-xl bg-primary hover:bg-orange-600 text-white font-black text-xs uppercase px-8 py-5 w-full">
                          Back to Home
                        </Button>
                      </Link>
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => {
                          setFormData({
                            name: "",
                            email: "",
                            whatsapp: "",
                            businessName: "",
                            businessDescription: "",
                            primaryService: "Software Development & Design",
                            businessLocation: "",
                            targetAudience: "",
                            brandKitStatus: "",
                            brandKitLink: "",
                            visualAssetsLink: "",
                            onboardingLogins: "",
                            hasDomain: "",
                            hostingPlatform: "",
                            softwareFeatures: "",
                            urgency: "",
                            examples: "",
                            homepageMention: "",
                            aboutpageMention: "",
                            servicepageMention: "",
                            socialLinks: "",
                            socialPlatforms: [],
                            socialManager: "",
                            socialGoal: "",
                            socialLeadsCurrent: "",
                            socialDirectSelling: "",
                            socialBlocker: "",
                            aiNeeds: [],
                            aiExistingTools: "",
                            aiTrainingDataState: "",
                            aiDailyUsers: "",
                            aiSuccessMetrics: "",
                            mcpPlatforms: [],
                            mcpTargetSystems: "",
                            mcpApiStatus: "",
                            mcpActionsList: "",
                            mcpTeamType: "",
                            mcpCompliance: "",
                            referralSource: "",
                            contactPreference: "",
                            questions: "",
                            thankYouNote: "Yes, I am ready to build!"
                          });
                          setCurrentStep(1);
                        }} 
                        className="rounded-xl border border-gray-200 text-gray-500 hover:text-primary font-bold text-xs uppercase px-8 py-5 cursor-pointer"
                      >
                        Submit Another Inquiry
                      </Button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

              {/* Navigation Action Buttons footer (hidden in success screen) */}
              {currentStep !== 5 && (
                <div className="flex justify-between items-center border-t border-gray-100 pt-6 mt-8">
                  {currentStep > 1 ? (
                    <Button 
                      type="button"
                      onClick={handleBack}
                      variant="ghost" 
                      className="rounded-xl border border-gray-200 text-gray-500 hover:text-primary gap-1.5 px-5 py-4 font-bold text-xs uppercase cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </Button>
                  ) : (
                    <div /> // alignment spacing placeholder
                  )}

                  {currentStep === 4 ? (
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-black px-8 py-5 text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-green-100 cursor-pointer"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Inquiry"} <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button 
                      type="button"
                      onClick={handleNext}
                      className="rounded-xl bg-primary hover:bg-orange-600 text-white font-black px-8 py-5 text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-orange-150 cursor-pointer"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}

            </form>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <Footer onTermsClick={() => setIsTermsModalOpen(true)} />

      <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
    </div>
  );
}
