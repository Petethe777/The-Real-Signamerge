import React, { useState, useEffect } from "react";
import { 
  Zap, Copy, Check, ArrowLeft, Laptop, Globe, Server, 
  Play, Code, FileText, Sparkles, CheckCircle2, ShieldCheck,
  ExternalLink, ArrowRight, Terminal, RefreshCw, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";

export default function ConnectClaude() {
  const [activeTab, setActiveTab] = useState<"desktop" | "web">("desktop");
  const [serverUrl, setServerUrl] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline">("checking");
  
  // Interactive Simulator state
  const [selectedTool, setSelectedTool] = useState<"search_leads" | "get_search_logs" | "verify_audit">("search_leads");
  const [simQuery, setSimQuery] = useState("Sweden clothing manufacturer");
  const [simEmail, setSimEmail] = useState("digitalconsultingpros@gmail.com");
  const [simPassword, setSimPassword] = useState("MaltaSecure2026!");
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  useEffect(() => {
    // Determine dynamic server SSE URL
    const origin = window.location.origin;
    setServerUrl(`${origin}/sse`);

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

  const desktopConfigText = `{
  "mcpServers": {
    "signalmerge-discovery": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/inspector",
        "${serverUrl}"
      ]
    }
  }
}`;

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
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Your Connection Endpoints</span>
              <h2 className="text-lg sm:text-xl font-black text-[#111] tracking-tight">Personalized Connection URLs</h2>
              <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                Configure your MCP client with either the production domain or your dynamic dev URL. Both establish a real-time Server-Sent Events (SSE) stream allowing Claude to call Signalmerge's lead retrieval tools.
              </p>
            </div>
            
            <div className="flex flex-col gap-3 w-full lg:w-auto shrink-0">
              {/* Production URL */}
              <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center bg-white border border-orange-100/80 p-2 rounded-xl sm:rounded-2xl gap-2 shadow-sm">
                <div className="px-3 py-2 bg-gray-50 text-[11px] sm:text-xs text-gray-700 rounded-lg sm:rounded-xl font-mono truncate max-w-full sm:max-w-[280px] flex flex-col text-left">
                  <span className="text-[8px] font-black text-primary uppercase">Production Endpoint</span>
                  <span className="font-bold">https://signalmerge.co.za/sse</span>
                </div>
                <Button 
                  onClick={() => handleCopy("https://signalmerge.co.za/sse", "prod_url")}
                  className="bg-primary hover:bg-orange-600 text-white font-bold rounded-lg sm:rounded-xl px-4 py-3 sm:py-5 text-xs uppercase shrink-0 gap-1.5 w-full sm:w-auto justify-center"
                >
                  {copiedText === "prod_url" ? (
                    <><Check className="w-3.5 h-3.5" /> Copied!</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> Copy URL</>
                  )}
                </Button>
              </div>

              {/* Development URL */}
              <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center bg-white border border-orange-100/80 p-2 rounded-xl sm:rounded-2xl gap-2 shadow-sm">
                <div className="px-3 py-2 bg-gray-50 text-[11px] sm:text-xs text-gray-700 rounded-lg sm:rounded-xl font-mono truncate max-w-full sm:max-w-[280px] flex flex-col text-left">
                  <span className="text-[8px] font-black text-gray-400 uppercase">Active Sandbox Dev URL</span>
                  <span className="font-bold">{serverUrl || "https://signalmerge.co.za/sse"}</span>
                </div>
                <Button 
                  onClick={() => handleCopy(serverUrl, "url")}
                  className="bg-primary hover:bg-orange-600 text-white font-bold rounded-lg sm:rounded-xl px-4 py-3 sm:py-5 text-xs uppercase shrink-0 gap-1.5 w-full sm:w-auto justify-center"
                >
                  {copiedText === "url" ? (
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

        {/* Setup Options Toggles (Desktop vs Web) */}
        <section className="space-y-8">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-xl sm:text-2xl font-black text-[#111] tracking-tight">Choose Your Setup Method</h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium px-4">Select whether you want to connect Claude on your desktop or directly on the Claude website.</p>
            
            {/* Responsive Interactive Switch */}
            <div className="grid grid-cols-2 sm:flex bg-gray-100 p-1 rounded-xl sm:rounded-2xl border border-gray-200/50 mt-2 w-full sm:w-auto max-w-sm sm:max-w-none">
              <button
                onClick={() => setActiveTab("desktop")}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === "desktop"
                    ? "bg-white text-primary shadow-md"
                    : "text-gray-500 hover:text-[#111]"
                }`}
              >
                <Laptop className="w-3.5 h-3.5" /> Claude Desktop
              </button>
              <button
                onClick={() => setActiveTab("web")}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === "web"
                    ? "bg-white text-primary shadow-md"
                    : "text-gray-500 hover:text-[#111]"
                }`}
              >
                <Globe className="w-3.5 h-3.5" /> Claude.ai
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "desktop" ? (
              <motion.div
                key="desktop-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start"
              >
                {/* Left side steps */}
                <div className="md:col-span-7 space-y-4 sm:space-y-6">
                  <div className="bg-white border border-gray-100 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center font-black text-xs text-primary shrink-0">1</div>
                      <h3 className="font-black text-sm sm:text-base text-[#111] uppercase tracking-tight">Open configuration folder</h3>
                    </div>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed pl-10">
                      Navigate to the directory where Claude Desktop looks for servers. Copy the path matching your operating system:
                    </p>
                    <div className="pl-0 sm:pl-10 space-y-3">
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs flex justify-between items-center gap-2">
                        <div className="space-y-1 min-w-0 flex-1">
                          <span className="text-[8px] font-black uppercase text-gray-400">Windows File Path</span>
                          <code className="block font-mono text-gray-700 select-all break-all text-[10px] sm:text-xs">%APPDATA%\\Claude\\claude_desktop_config.json</code>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 text-gray-400 hover:text-primary shrink-0" onClick={() => handleCopy("%APPDATA%\\Claude\\claude_desktop_config.json", "win_path")}>
                          {copiedText === "win_path" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                      </div>

                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs flex justify-between items-center gap-2">
                        <div className="space-y-1 min-w-0 flex-1">
                          <span className="text-[8px] font-black uppercase text-gray-400">Mac File Path</span>
                          <code className="block font-mono text-gray-700 select-all break-all text-[10px] sm:text-xs">~/Library/Application Support/Claude/claude_desktop_config.json</code>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 text-gray-400 hover:text-primary shrink-0" onClick={() => handleCopy("~/Library/Application Support/Claude/claude_desktop_config.json", "mac_path")}>
                          {copiedText === "mac_path" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center font-black text-xs text-primary shrink-0">2</div>
                      <h3 className="font-black text-sm sm:text-base text-[#111] uppercase tracking-tight">Paste the Configuration</h3>
                    </div>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed pl-10">
                      Open the file with any simple text editor (like Notepad or TextEdit) and paste the exact JSON block shown on the right. 
                      This tells Claude Desktop to establish a secure link to your Signalmerge workspace.
                    </p>
                  </div>

                  <div className="bg-white border border-gray-100 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center font-black text-xs text-primary shrink-0">3</div>
                      <h3 className="font-black text-sm sm:text-base text-[#111] uppercase tracking-tight">Relaunch Claude App</h3>
                    </div>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed pl-10">
                      Quit Claude Desktop completely and open it again. You will see a new <strong>Hammer Icon <Sparkles className="inline w-3.5 h-3.5 text-primary ml-0.5" /></strong> appear in your chat bar representing our trade discovery tools!
                    </p>
                  </div>
                </div>

                {/* Right side config block */}
                <div className="md:col-span-5 space-y-4 w-full">
                  <div className="bg-[#111] text-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-lg relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-primary" /> config JSON
                      </span>
                      <Button 
                        onClick={() => handleCopy(desktopConfigText, "config")}
                        variant="secondary"
                        className="bg-white/10 hover:bg-white/20 text-white border-none rounded-xl text-[10px] font-bold px-3 py-1 uppercase"
                      >
                        {copiedText === "config" ? (
                          <><Check className="w-3 h-3 text-green-400" /> Copied</>
                        ) : (
                          <><Copy className="w-3 h-3" /> Copy</>
                        )}
                      </Button>
                    </div>
                    <pre className="font-mono text-[10px] sm:text-xs text-gray-300 overflow-x-auto whitespace-pre leading-relaxed p-2 bg-black/40 rounded-xl">
                      {desktopConfigText}
                    </pre>
                  </div>

                  <div className="bg-orange-50/50 border border-orange-100/60 p-5 rounded-[1.5rem] sm:rounded-[2rem] text-xs font-semibold text-gray-650 leading-relaxed space-y-2">
                    <p className="font-black text-primary uppercase text-[9px] tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-primary" /> Developer Note:
                    </p>
                    <p>
                      We use the official <code>@modelcontextprotocol/inspector</code> package which ships natively with Node.js to bridge local Claude commands securely to our sandboxed Cloud environment. No extra global npm packages are required.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="web-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start"
              >
                {/* Left side steps */}
                <div className="md:col-span-7 space-y-4 sm:space-y-6">
                  <div className="bg-white border border-gray-100 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center font-black text-xs text-primary shrink-0">1</div>
                      <h3 className="font-black text-sm sm:text-base text-[#111] uppercase tracking-tight">Install a browser extension</h3>
                    </div>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed pl-10">
                      Since browser sandboxes prevent websites from direct access to custom endpoints, you need a simple connector extension. 
                      We recommend the lightweight and highly rated <strong>MCP Client</strong>.
                    </p>
                    <div className="pl-10 pt-2">
                      <a 
                        href="https://chromewebstore.google.com/search/MCP%20Client" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        referrerPolicy="no-referrer"
                        className="inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-xl bg-gray-100 hover:bg-gray-255 text-gray-700 hover:text-[#111] px-5 py-3 text-xs font-black uppercase tracking-wider transition-all border border-gray-200"
                      >
                        Search Chrome Web Store <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center font-black text-xs text-primary shrink-0">2</div>
                      <h3 className="font-black text-sm sm:text-base text-[#111] uppercase tracking-tight">Add Your Server Connection</h3>
                    </div>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed pl-10">
                      Click the extension's icon in your browser toolbar, select <strong>Add Server</strong>, and fill in these values:
                    </p>
                    <div className="pl-0 sm:pl-10 space-y-3">
                      <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1.5 sm:gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs font-semibold text-gray-600">
                        <div className="sm:col-span-1 text-gray-400 font-bold uppercase text-[9px] tracking-wider self-center">Server Name:</div>
                        <div className="sm:col-span-2 font-black text-gray-800">Signalmerge</div>
                      </div>
                      <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1.5 sm:gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs font-semibold text-gray-600">
                        <div className="sm:col-span-1 text-gray-400 font-bold uppercase text-[9px] tracking-wider self-center">Connection Type:</div>
                        <div className="sm:col-span-2 font-black text-gray-800">SSE (Server-Sent Events)</div>
                      </div>
                      <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1.5 sm:gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs font-semibold text-gray-600">
                        <div className="sm:col-span-1 text-gray-400 font-bold uppercase text-[9px] tracking-wider self-center font-mono">SSE URL:</div>
                        <div className="sm:col-span-2 flex justify-between items-center gap-2">
                          <code className="text-gray-800 font-bold truncate max-w-[180px] text-[10px] sm:text-xs">{serverUrl}</code>
                          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleCopy(serverUrl, "sse_web")}>
                            {copiedText === "sse_web" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center font-black text-xs text-primary shrink-0">3</div>
                      <h3 className="font-black text-sm sm:text-base text-[#111] uppercase tracking-tight">Open Claude.ai & Converse</h3>
                    </div>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed pl-10">
                      Open Claude's website in a new tab. The extension automatically embeds our custom search tools. 
                      You can ask Claude: <em className="text-primary font-bold">"Use Signalmerge to search for high-intent shoe buyer leads in Sweden"</em> and it will execute the scraping live!
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
                      <h4 className="font-black text-[#111] uppercase tracking-tight text-sm">How Website Integration Works</h4>
                      <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                        The browser extension bridges the gap by listening to Claude's responses and calling our cloud search APIs securely inside the webpage interface. No command-line scripting required!
                      </p>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-6 flex flex-col gap-3">
                      <div className="flex items-center gap-3 text-left">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        <span className="text-[11px] font-bold text-gray-600 font-sans">Works on Chrome, Brave, and Edge</span>
                      </div>
                      <div className="flex items-center gap-3 text-left">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        <span className="text-[11px] font-bold text-gray-600 font-sans">Zero Command Line or Terminal Required</span>
                      </div>
                      <div className="flex items-center gap-3 text-left">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        <span className="text-[11px] font-bold text-gray-600 font-sans">Connect in less than 2 minutes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
                    <td className="px-6 sm:px-8 py-5 sm:py-6 text-xs text-gray-600 font-semibold leading-relaxed">
                      Scrapes, filters, and searches social media platforms (Reddit, TikTok, X, LinkedIn) grounded with the <strong className="text-primary font-bold">Signalmerge Engine</strong> for active 2026 leads.
                    </td>
                    <td className="px-6 sm:px-8 py-5 sm:py-6 text-xs font-mono text-gray-500">
                      {"{ query: \"string\" }"}
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
                { id: "verify_audit", label: "verify_audit" }
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
        </div>
      </footer>
    </div>
  );
}
