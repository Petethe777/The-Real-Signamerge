import React, { useState, useEffect } from "react";
import { 
  Zap, Copy, Check, ArrowLeft, Globe, 
  Play, Code, FileText, Sparkles, CheckCircle2, ShieldCheck,
  ExternalLink, ArrowRight, Terminal, RefreshCw, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";

export default function ConnectClaude() {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline">("checking");
  
  // Interactive Simulator state
  const [selectedTool, setSelectedTool] = useState<"search_leads" | "get_search_logs" | "verify_audit" | "checkout_subscription" | "confirm_subscription">("search_leads");
  const [simQuery, setSimQuery] = useState("Sweden clothing manufacturer");
  const [simEmail, setSimEmail] = useState("digitalconsultingpros@gmail.com");
  const [simPassword, setSimPassword] = useState("MaltaSecure2026!");
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  useEffect(() => {
    // Ping server health to check status
    fetch("/api/health")
      .then((res) => {
        if (res.ok) setServerStatus("online");
        else setServerStatus("offline");
      })
      .catch(() => setServerStatus("offline"));
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const runSimulation = async () => {
    setSimulating(true);
    setSimResult(null);

    try {
      if (selectedTool === "search_leads") {
        const response = await fetch(`/api/search?q=${encodeURIComponent(simQuery)}`);
        const data = await response.json();
        setSimResult(data);
      } else if (selectedTool === "get_search_logs") {
        // Mock get recent logs structure
        setSimResult([
          { query: "Sweden clothing manufacturer", timestamp: "2026-07-14T03:14:22Z" },
          { query: "Switzerland watches importer", timestamp: "2026-07-14T02:44:10Z" },
          { query: "Sourcing broker in Shenzhen", timestamp: "2026-07-14T01:05:59Z" }
        ]);
      } else if (selectedTool === "checkout_subscription") {
        const response = await fetch("/api/payments/create-yoco-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: simEmail, amount: 80 })
        });
        const data = await response.json();
        setSimResult(data);
      } else if (selectedTool === "confirm_subscription") {
        const response = await fetch("/api/auth/confirm-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: simEmail })
        });
        const data = await response.json();
        setSimResult(data);
      } else if (selectedTool === "verify_audit") {
        // Mock auth verify
        if (simEmail === "digitalconsultingpros@gmail.com" && simPassword === "MaltaSecure2026!") {
          setSimResult({
            success: true,
            user: {
              email: "digitalconsultingpros@gmail.com",
              company: "Digital Consulting Pros",
              approved: true,
              role: "admin"
            }
          });
        } else {
          setSimResult({
            success: false,
            error: "Authentication failed: Invalid credentials."
          });
        }
      }
    } catch (err: any) {
      setSimResult({ error: err.message || "Failed to query simulation endpoint." });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] font-sans selection:bg-orange-100 selection:text-orange-600">
      {/* Top Banner / Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100 px-4 sm:px-12 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 text-xs sm:text-sm font-black uppercase text-gray-500 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Signalmerge
          </Link>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">MCP Status:</span>
            {serverStatus === "checking" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-[10px] font-black uppercase">
                <RefreshCw className="w-3 h-3 animate-spin" /> Verifying Server
              </span>
            )}
            {serverStatus === "online" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase">
                <CheckCircle2 className="w-3.5 h-3.5 fill-green-50 text-green-600" /> Server Online (Ready)
              </span>
            )}
            {serverStatus === "offline" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase">
                <AlertCircle className="w-3.5 h-3.5 text-red-600" /> Connection Alert
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* Main Guide Layout */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12 sm:space-y-16">
        {/* Intro Hero */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 text-primary px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider shadow-sm shadow-orange-500/5">
            <Zap className="w-4 h-4 fill-primary" /> Model Context Protocol (MCP) Integration
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#111] tracking-tight leading-tight">
            Connect Signalmerge Directly to Claude
          </h1>
          <p className="text-gray-500 font-medium text-sm sm:text-lg leading-relaxed">
            MCP is an open standard that allows Claude to securely connect to our live 2026 global trade database. 
            Give Claude the superpower to hunt customer leads, read high-intent trade signals, and compile premium audits directly in your chat interface.
          </p>
        </section>

        {/* Dynamic Link Display Card */}
        <Card className="border-orange-100 shadow-xl shadow-orange-500/5 bg-gradient-to-br from-white to-orange-50/20 overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem]">
          <CardContent className="p-6 sm:p-12 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 sm:gap-8">
            <div className="space-y-3 max-w-lg">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Your Connection Endpoint</span>
              <h2 className="text-lg sm:text-xl font-black text-[#111] tracking-tight">Production Connector URL</h2>
              <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                Configure your custom connector in Claude. This URL establishes a real-time Server-Sent Events (SSE) stream allowing Claude to call Signalmerge's lead retrieval tools.
              </p>
            </div>
            
            <div className="flex flex-col gap-3 w-full lg:w-auto shrink-0 justify-center">
              {/* Production Connector URL */}
              <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center bg-orange-50/20 border border-orange-200 p-2 rounded-xl sm:rounded-2xl gap-2 shadow-sm">
                <div className="px-3 py-2 bg-white text-[11px] sm:text-xs text-gray-700 rounded-lg sm:rounded-xl font-mono truncate max-w-full sm:max-w-[280px] flex flex-col text-left">
                  <span className="text-[8px] font-black text-orange-600 uppercase">Production Connector URL</span>
                  <span className="font-bold">https://the-real-signamerge.onrender.com/sse</span>
                </div>
                <Button 
                  onClick={() => handleCopy("https://the-real-signamerge.onrender.com/sse", "pre_url")}
                  className="bg-primary hover:bg-orange-600 text-white font-bold rounded-lg sm:rounded-xl px-4 py-3 sm:py-5 text-xs uppercase shrink-0 gap-1.5 w-full sm:w-auto justify-center"
                >
                  {copiedText === "pre_url" ? (
                    <><Check className="w-3.5 h-3.5" /> Copied!</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> Copy URL</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clear Engine Capability Banner */}
        <section className="bg-orange-50/40 border border-orange-100/60 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="w-5 h-5 fill-primary text-white" />
            <h3 className="text-sm font-black uppercase tracking-wider">Powered by the Signalmerge Engine</h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-650 font-semibold leading-relaxed">
            Please note: All query and data discovery operations are run directly by the custom-built, proprietary <strong className="text-primary font-bold">Signalmerge Engine</strong>, rather than standard web index search tools.
            When Claude connects to Signalmerge, it doesn't just execute basic searches. It utilizes a highly tuned enterprise agent cluster that scans multi-source trade registries, parses direct intent from platforms like LinkedIn and Reddit, and performs deep validation on global trade records.
          </p>
        </section>

        {/* Setup Guide */}
        <section className="space-y-8">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-xl sm:text-2xl font-black text-[#111] tracking-tight">How to Connect to Claude.ai</h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium px-4">
              Integrate Signalmerge directly on the Claude.ai web platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left side steps */}
            <div className="md:col-span-7 space-y-4 sm:space-y-6">
              {/* Info banner for free connector options */}
              <div className="bg-green-50/70 border border-green-200/60 p-4 rounded-xl flex items-start gap-3 text-xs text-green-900 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-green-950 mb-0.5">💡 Support for Free Accounts on Claude.ai</span>
                  Anthropic now allows users on the <strong className="text-green-950">Free Plan</strong> to use Custom Connectors (limited to one custom connector)! This means you can add and use the Signalmerge Custom Connector completely free of charge.
                </div>
              </div>

              {/* Warning about Desktop App */}
              <div className="bg-amber-50/70 border border-amber-200/60 p-4 rounded-xl flex items-start gap-3 text-xs text-amber-900 font-semibold">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-amber-950 mb-0.5">⚠️ Supported on Claude.ai Website Only</span>
                  This Custom Connector is strictly optimized for the <strong className="text-amber-950">Claude.ai website</strong>. It is not supported as a local MCP server configuration on the Claude Desktop application. Please only install it via the Claude.ai website settings.
                </div>
              </div>

              <div className="bg-white border border-gray-100 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center font-black text-xs text-primary shrink-0">1</div>
                  <h3 className="font-black text-sm sm:text-base text-[#111] uppercase tracking-tight">Open Settings</h3>
                </div>
                <p className="text-xs text-gray-500 font-medium leading-relaxed pl-10">
                  Sign in to your account at <strong className="text-[#111]">Claude.ai</strong>. Click your profile picture/icon in the bottom-left corner of the screen, and select <strong className="text-primary font-bold">Settings</strong> from the menu.
                </p>
              </div>

              <div className="bg-white border border-gray-100 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center font-black text-xs text-primary shrink-0">2</div>
                  <h3 className="font-black text-sm sm:text-base text-[#111] uppercase tracking-tight">Add Custom Connector</h3>
                </div>
                <p className="text-xs text-gray-500 font-medium leading-relaxed pl-10">
                  Navigate to the <strong className="text-[#111]">Connectors</strong> tab on the left sidebar. Click the <strong className="text-primary font-black">Add custom connector</strong> button, select <strong className="font-black">SSE (Server-Sent Events)</strong> as the Transport type, and enter the connection details:
                </p>
                <div className="pl-0 sm:pl-10 space-y-3">
                  <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1.5 sm:gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs font-semibold text-gray-600">
                    <div className="sm:col-span-1 text-gray-400 font-bold uppercase text-[9px] tracking-wider self-center">Connector Name:</div>
                    <div className="sm:col-span-2 font-black text-gray-800">Signalmerge</div>
                  </div>
                  <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1.5 sm:gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs font-semibold text-gray-600">
                    <div className="sm:col-span-1 text-gray-400 font-bold uppercase text-[9px] tracking-wider self-center">Connection Type:</div>
                    <div className="sm:col-span-2 font-black text-gray-800">SSE (Server-Sent Events)</div>
                  </div>
                  <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1.5 sm:gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs font-semibold text-gray-600">
                    <div className="sm:col-span-1 text-gray-400 font-bold uppercase text-[9px] tracking-wider self-center font-mono">SSE URL:</div>
                    <div className="sm:col-span-2 flex justify-between items-center gap-2">
                      <code className="text-gray-800 font-bold truncate max-w-[180px] text-[10px] sm:text-xs">https://the-real-signamerge.onrender.com/sse</code>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleCopy("https://the-real-signamerge.onrender.com/sse", "sse_native_url")}>
                        {copiedText === "sse_native_url" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1.5 sm:gap-2 bg-orange-50 border border-orange-150 rounded-xl p-3 text-xs font-semibold text-orange-950">
                    <div className="sm:col-span-1 text-orange-600 font-bold uppercase text-[9px] tracking-wider self-center">Authentication:</div>
                    <div className="sm:col-span-2 font-black">
                      <span className="text-orange-900 block font-black">Choose either OAuth 2.0 (Recommended) OR None</span>
                      <p className="font-medium text-[11px] text-orange-850 mt-1.5 leading-relaxed">
                        🔒 <strong className="font-extrabold text-orange-950">Option A: OAuth 2.0 (Premium Sign-In)</strong> - Select OAuth 2.0 in Claude's prompt. It will securely redirect you to our hosted auth page to verify your Signalmerge credentials, automatically unlocking high-intent source links on all search results natively!
                      </p>
                      <p className="font-medium text-[11px] text-orange-850 mt-1.5 leading-relaxed">
                        🌍 <strong className="font-extrabold text-orange-950">Option B: None (No Auth)</strong> - If your Claude account blocks dynamic registration, select 'None'. You can still connect instantly and manually unlock source links by passing your Signalmerge email/password arguments in the prompt.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-100 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center font-black text-xs text-primary shrink-0">3</div>
                  <h3 className="font-black text-sm sm:text-base text-[#111] uppercase tracking-tight">Start Conversing with the tools</h3>
                </div>
                <p className="text-xs text-gray-500 font-medium leading-relaxed pl-10">
                  Click <strong className="font-black">Enable</strong> or <strong className="font-black">Add Connector</strong>. Once approved, the Claude website will natively communicate with our secure SSE backend endpoint. You and your team can immediately query the leads registry by asking Claude: <em className="text-primary font-bold">"Use Signalmerge to find high-intent trade leads in Sweden"</em>.
                </p>
              </div>
            </div>

            {/* Right side help illustration */}
            <div className="md:col-span-5 space-y-6 w-full">
              <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-sm text-center space-y-6">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-black text-[#111] uppercase tracking-tight text-sm">Why Custom Connectors Are Best</h4>
                  <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                    Custom connectors integrate Anthropic's secure servers directly with our live SSE streaming APIs. This means you can use the tool on any device, completely on the web, with no extensions, downloads, or local setups required!
                  </p>
                </div>
                
                <div className="border-t border-gray-150 pt-6 flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-left">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-[11px] font-bold text-gray-600 font-sans">Natively Supported on Claude.ai website</span>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-[11px] font-bold text-gray-600 font-sans">Now Available for Free Claude Accounts</span>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-[11px] font-bold text-gray-600 font-sans">Zero downloads or browser extensions required</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* API / Tool Documentation */}
        <section className="space-y-6">
          <div className="space-y-2 text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Technical Reference</span>
            <h2 className="text-xl sm:text-2xl font-black text-[#111] tracking-tight">Available MCP Tools Documentation</h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">When connected, Claude gets access to these specific capabilities inside your chat sessions:</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="px-6 sm:px-8 py-4 sm:py-5">Tool Name</th>
                    <th className="px-6 sm:px-8 py-4 sm:py-5">Description</th>
                    <th className="px-6 sm:px-8 py-4 sm:py-5">Arguments / Parameters</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <tr>
                    <td className="px-6 sm:px-8 py-5 sm:py-6 font-mono text-xs font-black text-primary">search_leads</td>
                    <td className="px-6 sm:px-8 py-5 sm:py-6 text-xs text-gray-600 font-semibold leading-relaxed space-y-2">
                      <p>Scrapes, filters, and searches social media platforms (Reddit, TikTok, X, LinkedIn) grounded with the <strong className="text-primary font-bold">Signalmerge Engine</strong> for active 2026 leads.</p>
                      <p className="text-[11px] text-orange-650 bg-orange-50/50 p-2.5 rounded-lg border border-orange-100/40">
                        🔒 <strong className="font-bold text-orange-700">Source Links Restriction:</strong> By default, lead source URLs are restricted. To unlock active direct source links on Claude, you must supply your registered premium Signalmerge subscription credentials in the optional parameters.
                      </p>
                    </td>
                    <td className="px-6 sm:px-8 py-5 sm:py-6 text-xs font-mono text-gray-500 space-y-1">
                      <div>{"{"}</div>
                      <div className="pl-4">query: "string" <span className="text-[10px] text-gray-400 font-sans font-bold">(required)</span>,</div>
                      <div className="pl-4">email?: "string" <span className="text-[10px] text-gray-400 font-sans font-bold">(optional)</span>,</div>
                      <div className="pl-4">password?: "string" <span className="text-[10px] text-gray-400 font-sans font-bold">(optional)</span></div>
                      <div>{"}"}</div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 sm:px-8 py-5 sm:py-6 font-mono text-xs font-black text-primary">get_search_logs</td>
                    <td className="px-6 sm:px-8 py-5 sm:py-6 text-xs text-gray-600 font-semibold leading-relaxed">
                      Retrieves a chronological log of high-intent search requests made across the workspace processed by the <strong className="text-primary font-bold">Signalmerge Engine</strong>.
                    </td>
                    <td className="px-6 sm:px-8 py-5 sm:py-6 text-xs font-mono text-gray-500">
                      {"{}"}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 sm:px-8 py-5 sm:py-6 font-mono text-xs font-black text-primary">verify_audit</td>
                    <td className="px-6 sm:px-8 py-5 sm:py-6 text-xs text-gray-600 font-semibold leading-relaxed">
                      Verifies the company's enterprise status on the Digital Consulting Pros registry connected with the <strong className="text-primary font-bold">Signalmerge Engine</strong>.
                    </td>
                    <td className="px-6 sm:px-8 py-5 sm:py-6 text-xs font-mono text-gray-500">
                      {"{ email: \"string\", password: \"string\" }"}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 sm:px-8 py-5 sm:py-6 font-mono text-xs font-black text-primary">checkout_subscription</td>
                    <td className="px-6 sm:px-8 py-5 sm:py-6 text-xs text-gray-600 font-semibold leading-relaxed">
                      Generates an official Yoco $80 USD subscription checkout link directly in Claude chat so users can pay and activate their workspace.
                    </td>
                    <td className="px-6 sm:px-8 py-5 sm:py-6 text-xs font-mono text-gray-500">
                      {"{ email: \"string\" }"}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 sm:px-8 py-5 sm:py-6 font-mono text-xs font-black text-primary">confirm_subscription</td>
                    <td className="px-6 sm:px-8 py-5 sm:py-6 text-xs text-gray-600 font-semibold leading-relaxed">
                      Confirms or verifies that a user has paid the $80 subscription fee and immediately unlocks restricted source links across Signalmerge and Claude MCP.
                    </td>
                    <td className="px-6 sm:px-8 py-5 sm:py-6 text-xs font-mono text-gray-500">
                      {"{ email: \"string\" }"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Interactive Tool Playground / Sandbox */}
        <section className="bg-white border border-gray-100 rounded-[1.5rem] sm:rounded-[3rem] p-6 sm:p-12 shadow-xl shadow-orange-500/5 space-y-6 sm:space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-100 pb-6 sm:pb-8">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 bg-orange-50 text-primary font-black px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">
                <Code className="w-3.5 h-3.5" /> Interactive sandbox
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#111] tracking-tight">MCP Tool Simulator</h2>
              <p className="text-xs text-gray-500 font-semibold">Test the tool calls yourself in real time and see exactly what format Claude receives.</p>
            </div>

            {/* Select Tool - Grid layout on mobile, flex on desktop */}
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2 w-full lg:w-auto">
              {[
                { id: "search_leads", label: "search_leads" },
                { id: "get_search_logs", label: "get_search_logs" },
                { id: "verify_audit", label: "verify_audit" },
                { id: "checkout_subscription", label: "checkout_subscription" },
                { id: "confirm_subscription", label: "confirm_subscription" }
              ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    setSelectedTool(tool.id as any);
                    setSimResult(null);
                  }}
                  className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all border text-center w-full sm:w-auto ${
                    selectedTool === tool.id
                      ? "bg-primary border-primary text-white shadow-md shadow-orange-500/10"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tool.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
            {/* Input Form Column */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
              <div className="space-y-5">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Configure Input Parameters</h4>
                
                {selectedTool === "search_leads" && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Query Keywords (Signalmerge Engine)</label>
                    <Input 
                      value={simQuery} 
                      onChange={(e) => setSimQuery(e.target.value)} 
                      placeholder="e.g. Sweden clothing broker"
                      className="rounded-xl border-orange-100 focus-visible:ring-0 focus-visible:border-primary text-xs font-bold"
                    />
                    <span className="block text-[9px] text-orange-600 font-bold">Processed securely by the custom Signalmerge Engine.</span>
                  </div>
                )}

                {selectedTool === "verify_audit" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Email Address</label>
                      <Input 
                        value={simEmail} 
                        onChange={(e) => setSimEmail(e.target.value)} 
                        placeholder="digitalconsultingpros@gmail.com"
                        className="rounded-xl border-orange-100 focus-visible:ring-0 focus-visible:border-primary text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Password</label>
                      <Input 
                        type="password"
                        value={simPassword} 
                        onChange={(e) => setSimPassword(e.target.value)} 
                        placeholder="MaltaSecure2026!"
                        className="rounded-xl border-orange-100 focus-visible:ring-0 focus-visible:border-primary text-xs font-bold"
                      />
                    </div>
                  </div>
                )}

                {selectedTool === "get_search_logs" && (
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150 text-center">
                    <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                      No arguments required. It queries all historical queries executed in this environment through the Signalmerge Engine.
                    </p>
                  </div>
                )}
              </div>

              <Button 
                onClick={runSimulation}
                disabled={simulating}
                className="w-full bg-primary hover:bg-orange-650 text-white font-black rounded-xl py-4 sm:py-5 uppercase text-xs tracking-wider shadow-lg shadow-orange-500/10 mt-6 gap-2"
              >
                {simulating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Simulating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white text-white" /> Run Tool Simulation
                  </>
                )}
              </Button>
            </div>

            {/* Output Code Result Column */}
            <div className="lg:col-span-7 bg-[#111] rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 text-white min-h-[300px] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-primary" /> Tool Output Payload
                  </span>
                  {simResult && (
                    <Button 
                      onClick={() => handleCopy(JSON.stringify(simResult, null, 2), "payload")}
                      variant="ghost" 
                      className="text-gray-400 hover:text-white hover:bg-white/5 h-7 rounded-lg text-[9px] font-black uppercase px-2 py-1"
                    >
                      {copiedText === "payload" ? "Copied" : "Copy Response"}
                    </Button>
                  )}
                </div>

                <div className="font-mono text-xs text-gray-350 overflow-y-auto max-h-[250px] leading-relaxed select-all">
                  {simulating ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                      <p className="text-xs text-gray-400 font-medium animate-pulse">Request sent to Signalmerge Engine. Scanning trade nodes...</p>
                    </div>
                  ) : simResult ? (
                    <pre>{JSON.stringify(simResult, null, 2)}</pre>
                  ) : (
                    <div className="py-12 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
                      <Code className="w-8 h-8 text-gray-650" />
                      <p className="text-xs font-semibold uppercase tracking-wider">Ready to Execute</p>
                      <p className="text-[10px] text-gray-600 max-w-xs leading-relaxed mx-auto">
                        Configure parameters on the left and click "Run Tool Simulation" to view output from the Signalmerge Engine.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 text-[9px] font-bold text-gray-500 uppercase tracking-widest flex flex-col sm:flex-row justify-between items-center gap-2">
                <span>Protocol version: 2026.04</span>
                <span className="text-primary flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Live Signalmerge Engine active</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Elegant minimalist Footer */}
      <footer className="max-w-6xl mx-auto px-6 sm:px-12 py-12 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-24">
        <div>© 2026 Signalmerge MCP Ecosystem</div>
        <div className="flex gap-6 items-center">
          <a href="https://signalmerge.co.za" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Official Website</a>
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <Link to="/about" className="hover:text-primary transition-colors">About</Link>
          <Link to="/consulting" className="hover:text-primary transition-colors text-primary font-black">Consulting</Link>
        </div>
      </footer>
    </div>
  );
}
