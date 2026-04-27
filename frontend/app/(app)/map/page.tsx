"use client";

import React, { useEffect, useState } from "react";
import { Filter, Layers, Maximize2, MapPin, ChevronUp, ChevronDown, Loader2, AlertCircle } from "lucide-react";
import { getReports, type Report } from "@/lib/api";

export default function MapViewPage() {
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [urgencyFilter, setUrgencyFilter] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      setIsLoading(true);
      try {
        const result = await getReports({ limit: 100 });
        if (result.data) {
          setReports(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReports();
  }, []);

  const reportsWithCoords = reports.filter((r) => r.latitude && r.longitude);

  const filteredReports = reports.filter((r) => {
    if (categoryFilter && r.category !== categoryFilter) return false;
    if (urgencyFilter && r.urgency !== urgencyFilter) return false;
    return true;
  });

  const activeFilters: Array<{ label: string; clear: () => void }> = [];
  if (categoryFilter) {
    activeFilters.push({
      label: `TYPE: ${categoryFilter.toUpperCase()}`,
      clear: () => setCategoryFilter(null),
    });
  }
  if (urgencyFilter) {
    activeFilters.push({
      label: `URGENCY: ${urgencyFilter.toUpperCase()}`,
      clear: () => setUrgencyFilter(null),
    });
  }

  const highPriorityReports = filteredReports
    .filter((r) => r.urgency === "high" || r.isPriority)
    .slice(0, 10);

  return (
    <div className="md:h-[calc(100vh-160px)] flex flex-col gap-6 md:gap-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-swiss-fg text-swiss-bg text-[10px] font-black tracking-widest uppercase">
              03. SPATIAL DATA
            </span>
            <div className="h-px w-16 md:w-32 bg-swiss-fg/10" />
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.8] uppercase">
            GEOSPATIAL<br />INTELLIGENCE
          </h1>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <button
            onClick={() => {
              setCategoryFilter(null);
              setUrgencyFilter(null);
            }}
            className="flex-1 md:flex-none px-6 md:px-8 py-3 md:py-4 border-4 border-swiss-fg font-black text-[10px] md:text-xs tracking-widest uppercase hover:bg-swiss-red hover:text-swiss-bg transition-all flex items-center justify-center gap-2"
          >
            <Filter className="w-4 h-4" />
            RESET
          </button>
          <div className="flex-1 md:flex-none px-6 md:px-8 py-3 md:py-4 bg-swiss-fg text-swiss-bg font-black text-[10px] md:text-xs tracking-widest uppercase flex items-center justify-center gap-2">
            <Layers className="w-4 h-4" />
            {reportsWithCoords.length} GEO
          </div>
        </div>
      </div>

      {/* Main Map Interface */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 md:gap-8 min-h-[500px] md:min-h-0 relative">
        {/* Sidebar Controls - Drawer on mobile, Sidebar on desktop */}
        <div 
          className={`fixed inset-x-0 bottom-0 z-40 bg-swiss-bg border-t-4 border-swiss-fg md:relative md:inset-auto md:z-0 md:border-t-0 md:w-80 lg:w-96 flex flex-col gap-6 md:gap-8 transition-transform duration-300 transform ${
            isControlsOpen ? "translate-y-0" : "translate-y-[calc(100%-60px)] md:translate-y-0"
          }`}
        >
          {/* Mobile Header Toggle */}
          <button 
            onClick={() => setIsControlsOpen(!isControlsOpen)}
            className="md:hidden w-full h-14 border-b-4 border-swiss-fg flex items-center justify-between px-6 bg-swiss-fg text-swiss-bg font-black tracking-widest uppercase text-[10px]"
          >
            <span>MAP INTELLIGENCE PANEL</span>
            {isControlsOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>

          <div className="flex-1 flex flex-col gap-6 p-6 md:p-0 md:pr-4 overflow-y-auto">
            {/* Active Filters */}
            <div className="border-4 border-swiss-fg p-6 md:p-8 bg-swiss-muted swiss-grid-pattern shrink-0">
              <p className="text-[10px] font-black tracking-widest uppercase mb-4">ACTIVE FILTERS</p>
              <div className="space-y-3">
                {activeFilters.length === 0 ? (
                  <p className="text-[10px] font-bold text-swiss-fg/40 uppercase">NO FILTERS ACTIVE</p>
                ) : (
                  activeFilters.map((f, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b-2 border-swiss-fg/10 text-[10px] font-bold uppercase">
                      <span>{f.label}</span>
                      <button onClick={f.clear} className="text-swiss-red underline">REMOVE</button>
                    </div>
                  ))
                )}
              </div>
              {/* Quick Category Filters */}
              <div className="mt-4 flex flex-wrap gap-2">
                {["infrastructure", "health", "safety", "environment"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                    className={`px-2 py-1 text-[8px] font-black tracking-widest uppercase border-2 border-swiss-fg transition-colors ${
                      categoryFilter === cat ? "bg-swiss-fg text-swiss-bg" : "hover:bg-swiss-fg/10"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {/* Quick Urgency Filters */}
              <div className="mt-2 flex flex-wrap gap-2">
                {["high", "medium", "low"].map((u) => (
                  <button
                    key={u}
                    onClick={() => setUrgencyFilter(urgencyFilter === u ? null : u)}
                    className={`px-2 py-1 text-[8px] font-black tracking-widest uppercase border-2 border-swiss-fg transition-colors ${
                      urgencyFilter === u ? "bg-swiss-red text-swiss-bg" : "hover:bg-swiss-red/10"
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            {/* Report List */}
            <div className="flex-1 border-4 border-swiss-fg bg-swiss-bg overflow-hidden flex flex-col min-h-[300px]">
              <div className="p-4 border-b-4 border-swiss-fg bg-swiss-fg text-swiss-bg text-[10px] font-black tracking-widest uppercase">
                {highPriorityReports.length > 0
                  ? `HIGH PRIORITY (${highPriorityReports.length})`
                  : `ALL REPORTS (${filteredReports.length})`}
              </div>
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-swiss-fg/40" />
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="flex items-center justify-center p-8">
                    <AlertCircle className="w-5 h-5 text-swiss-fg/20 mr-2" />
                    <span className="text-[10px] font-bold text-swiss-fg/40">NO REPORTS FOUND</span>
                  </div>
                ) : (
                  (highPriorityReports.length > 0 ? highPriorityReports : filteredReports.slice(0, 10)).map((report) => (
                    <div key={report.id} className="p-4 md:p-6 border-b-2 border-swiss-fg/10 hover:bg-swiss-red/5 transition-all group cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-black tracking-widest ${
                          report.urgency === "high" ? "text-swiss-red" : "text-swiss-fg/40"
                        }`}>
                          {report.urgency.toUpperCase()} PRIORITY
                        </span>
                        <span className="text-[8px] font-bold text-swiss-fg/40">#{report.id.substring(0, 8)}</span>
                      </div>
                      <h4 className="text-xs md:text-sm font-black tracking-tighter uppercase leading-tight mb-2">{report.title}</h4>
                      <div className="flex items-center gap-2 text-[8px] font-black text-swiss-fg/60">
                        <MapPin className="w-3 h-3" />
                        {report.latitude && report.longitude
                          ? `${report.latitude.toFixed(4)}° N, ${report.longitude.toFixed(4)}° E`
                          : report.location}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 border-4 border-swiss-fg bg-swiss-muted relative overflow-hidden group shadow-[12px_12px_0_0_rgba(0,0,0,0.05)] md:shadow-[20px_20px_0_0_rgba(0,0,0,0.05)] mb-14 md:mb-0">
          <div className="absolute inset-0 swiss-grid-pattern opacity-40" />
          <div className="absolute inset-0 swiss-dots opacity-20" />
          
          {/* Render report markers positioned by coordinates */}
          {reportsWithCoords.map((report) => {
            // Simple positioning: map lat/lng to percentage
            // India-centric: lat 8-37, lng 68-97
            const latMin = 8, latMax = 37, lngMin = 68, lngMax = 97;
            const top = Math.max(5, Math.min(90, ((latMax - (report.latitude || 20)) / (latMax - latMin)) * 100));
            const left = Math.max(5, Math.min(90, (((report.longitude || 77) - lngMin) / (lngMax - lngMin)) * 100));

            const isHigh = report.urgency === "high";
            return (
              <div
                key={report.id}
                className={`absolute cursor-pointer group/marker z-10 ${isHigh ? "animate-pulse" : ""}`}
                style={{ top: `${top}%`, left: `${left}%` }}
              >
                <div className={`w-4 h-4 md:w-6 md:h-6 border-2 md:border-4 ${
                  isHigh ? "bg-swiss-red border-swiss-fg" : "bg-swiss-fg border-swiss-bg"
                }`} />
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-swiss-fg text-swiss-bg text-[7px] md:text-[8px] font-black px-2 py-1 whitespace-nowrap opacity-0 group-hover/marker:opacity-100 transition-opacity z-20">
                  {report.title}
                </div>
              </div>
            );
          })}

          {/* Fallback message */}
          {!isLoading && reportsWithCoords.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <MapPin className="w-12 h-12 text-swiss-fg/10 mx-auto mb-4" />
                <p className="text-[10px] font-black tracking-widest uppercase text-swiss-fg/30">NO GEO-TAGGED REPORTS</p>
                <p className="text-[8px] font-bold text-swiss-fg/20 mt-1">REPORTS WITH COORDINATES WILL APPEAR AS MARKERS</p>
              </div>
            </div>
          )}

          {/* Map Controls */}
          <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 flex flex-col gap-2 z-20">
            <button className="w-10 h-10 md:w-12 md:h-12 bg-swiss-bg border-4 border-swiss-fg flex items-center justify-center hover:bg-swiss-red hover:text-swiss-bg transition-colors">
              <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <div className="flex flex-col border-4 border-swiss-fg overflow-hidden">
              <button className="w-10 h-10 md:w-12 md:h-12 bg-swiss-bg flex items-center justify-center hover:bg-swiss-muted border-b-2 border-swiss-fg font-black text-lg">+</button>
              <button className="w-10 h-10 md:w-12 md:h-12 bg-swiss-bg flex items-center justify-center hover:bg-swiss-muted font-black text-lg">-</button>
            </div>
          </div>

          {/* Map Coordinates Overlay */}
          <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 p-3 md:p-4 bg-swiss-fg text-swiss-bg text-[8px] md:text-[10px] font-black tracking-widest uppercase flex flex-col gap-1 z-20">
            <span>TOTAL REPORTS: {filteredReports.length}</span>
            <span>GEO-TAGGED: {reportsWithCoords.length}</span>
            <span className="text-swiss-red">HIGH PRIORITY: {filteredReports.filter(r => r.urgency === "high").length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
