import React, { useState } from "react";
import { searchDataset } from "../data/customerSearchDataset";
import { 
  Globe, 
  MapPin, 
  Search, 
  Sparkles, 
  Hash, 
  Compass, 
  ShoppingBag, 
  Layers,
  ChevronRight,
  Database
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DatasetViewer() {
  const [activeSection, setActiveSection] = useState<"countries" | "products" | "phrases" | "platforms">("countries");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCountries = searchDataset.countries.filter(c => 
    c.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cities.some(city => city.name.toLowerCase().includes(searchTerm.toLowerCase()) || city.zip.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredPhrases = searchDataset.search_phrases.filter(p =>
    p.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDigitalProducts = searchDataset.products.digital.filter(p =>
    p.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredPhysicalProducts = searchDataset.products.physical.filter(p =>
    p.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPlatforms = searchDataset.social_platforms.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.focus.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-4 sm:p-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-wider mb-1">
            <Database className="w-3.5 h-3.5" />
            <span>Underlying Engine Config</span>
          </div>
          <h2 className="text-2xl font-black text-[#111] tracking-tight">
            Signalmerge Global Dataset
          </h2>
          <p className="text-gray-500 font-medium text-xs">
            {searchDataset.meta.description} (v{searchDataset.meta.version})
          </p>
        </div>
        
        {/* Search filter input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search datasets..."
            className="pl-11 h-11 rounded-2xl border-gray-100 bg-gray-50/50 font-bold text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Dataset Sidebar tabs */}
        <div className="space-y-2 lg:col-span-1">
          {[
            { id: "countries", label: "Countries & Postcodes", icon: Globe, count: searchDataset.countries.length },
            { id: "products", label: "Offer Products", icon: ShoppingBag, count: searchDataset.products.digital.length + searchDataset.products.physical.length },
            { id: "phrases", label: "Search Phrases", icon: Search, count: searchDataset.search_phrases.length },
            { id: "platforms", label: "Social Platforms", icon: Compass, count: searchDataset.social_platforms.length }
          ].map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveSection(sec.id as any);
                  setSearchTerm("");
                }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl text-left transition-all ${
                  isActive
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/10 font-bold"
                    : "bg-gray-50 hover:bg-gray-100/80 text-gray-600 font-semibold"
                }`}
              >
                <div className="flex items-center gap-3 text-xs">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{sec.label}</span>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                  isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  {sec.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dataset Details Content Area */}
        <div className="lg:col-span-3 min-h-[350px] border border-gray-50 bg-gray-50/30 rounded-3xl p-6 sm:p-8 relative">
          
          {activeSection === "countries" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-sm font-black text-[#111] uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  Target Country Coverage
                </h3>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Showing {filteredCountries.length} countries
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredCountries.map((c) => (
                  <div key={c.country} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3 hover:border-orange-200 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-orange-50 text-primary text-xs font-black rounded-lg flex items-center justify-center">
                          {c.iso2}
                        </div>
                        <span className="text-sm font-black text-[#111]">{c.country}</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                        {c.cities.length} postcodes mapped
                      </span>
                    </div>

                    <div className="border-t border-gray-50 pt-3">
                      <span className="text-[9px] font-black uppercase text-gray-400 block mb-2 tracking-wider">
                        Configured Cities & ZipCodes
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto pr-1">
                        {c.cities.map((city, idx) => (
                          <div key={idx} className="bg-gray-50 border border-gray-200/50 rounded-lg px-2 py-1 text-[10px] flex items-center gap-1 font-mono">
                            <MapPin className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                            <span className="font-bold text-gray-600">{city.name}</span>
                            <span className="text-primary font-black">({city.zip})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredCountries.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    No country matches found.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === "products" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-sm font-black text-[#111] uppercase tracking-wider flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                  Recognized Offer Products
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Digital Products */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span className="text-xs font-black uppercase text-[#111] tracking-wider">Digital Offerings</span>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-2 max-h-[350px] overflow-y-auto">
                    {filteredDigitalProducts.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-orange-50/20 transition-colors text-xs font-bold text-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 bg-gray-50 rounded-lg flex items-center justify-center text-[10px] text-primary font-bold">
                            {idx + 1}
                          </span>
                          <span>{p}</span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                      </div>
                    ))}
                    {filteredDigitalProducts.length === 0 && (
                      <div className="text-center py-6 text-gray-400 text-xs font-bold uppercase tracking-wider">
                        No matches found.
                      </div>
                    )}
                  </div>
                </div>

                {/* Physical Products */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span className="text-xs font-black uppercase text-[#111] tracking-wider">Physical Products</span>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-2 max-h-[350px] overflow-y-auto">
                    {filteredPhysicalProducts.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-orange-50/20 transition-colors text-xs font-bold text-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 bg-gray-50 rounded-lg flex items-center justify-center text-[10px] text-gray-550 font-bold">
                            {idx + 1}
                          </span>
                          <span>{p}</span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                      </div>
                    ))}
                    {filteredPhysicalProducts.length === 0 && (
                      <div className="text-center py-6 text-gray-400 text-xs font-bold uppercase tracking-wider">
                        No matches found.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "phrases" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-sm font-black text-[#111] uppercase tracking-wider flex items-center gap-2">
                  <Search className="w-4 h-4 text-primary" />
                  Target Buyer Search Intent Phrases
                </h3>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Showing {filteredPhrases.length} phrases
                </span>
              </div>

              <div className="bg-white border border-gray-100 rounded-3xl p-5 space-y-2 max-h-[380px] overflow-y-auto">
                {filteredPhrases.map((phrase, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl hover:bg-orange-50/10 border-b border-gray-50/80 last:border-0 flex items-start gap-4">
                    <div className="bg-orange-100/40 p-2 rounded-lg text-primary shrink-0 font-black text-[10px] font-mono leading-none">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#111] leading-relaxed">
                        "{phrase}"
                      </p>
                      <span className="text-[8px] font-black uppercase text-gray-300 tracking-wider block mt-1">
                        High Intent Lead Signature
                      </span>
                    </div>
                  </div>
                ))}
                {filteredPhrases.length === 0 && (
                  <div className="text-center py-12 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    No matching high-intent search phrases.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === "platforms" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-sm font-black text-[#111] uppercase tracking-wider flex items-center gap-2">
                  <Compass className="w-4 h-4 text-primary" />
                  Active Crawling Social Platforms Map
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                {filteredPlatforms.map((plat) => (
                  <div key={plat.name} className="bg-white border border-gray-100 p-5 rounded-2xl flex flex-col justify-between hover:border-orange-200 transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-black text-[#111]">{plat.name}</span>
                        <span className="bg-gray-100 text-[9px] font-black text-gray-500 px-2 py-0.5 rounded uppercase tracking-wider">
                          {plat.type}
                        </span>
                      </div>
                      <a 
                        href={plat.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 mb-4 truncate font-mono"
                      >
                        {plat.url}
                      </a>
                    </div>

                    <div className="border-t border-gray-50 pt-3">
                      <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest block mb-2">
                        Platform Topic Focus
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {plat.focus.map(f => (
                          <span key={f} className="text-[9px] font-black bg-orange-50/50 text-orange-700 border border-orange-100 rounded-lg px-2 py-0.5">
                            #{f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredPlatforms.length === 0 && (
                  <div className="text-center py-12 text-gray-400 text-xs font-bold uppercase tracking-wider col-span-2">
                    No platform matches found.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
