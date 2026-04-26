"use client";

import React from "react";
import MapContainer from "../map/MapContainer";
import { TotalRequests, StatsGrid, RegionCount, TopCountries } from "../map/StatsDisplay";

export function LandingMapSection() {
  return (
    <section className="py-24 bg-swiss-bg border-t-4 border-swiss-fg overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col gap-12">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-swiss-fg text-swiss-bg text-[10px] font-black tracking-widest uppercase">
                  CONNECTED ECOSYSTEM
                </span>
                <div className="h-px w-32 bg-swiss-fg/10" />
              </div>
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.8] uppercase">
                REAL-TIME<br />COORDINATION
              </h2>
            </div>
            <div className="max-w-md">
              <p className="text-[10px] font-black tracking-widest uppercase text-swiss-fg/60 leading-relaxed">
                OUR DISTRIBUTED NETWORK CONTINUOUSLY TRACKS COMMUNITY ISSUES, COORDINATES RESPONSES, AND ENABLES VERIFIED RESOLUTIONS. EVERY DATA POINT REPRESENTS A REPORTED ISSUE, A VOLUNTEER ACTION, OR A CONFIRMED OUTCOME.
              </p>
            </div>
          </div>

          {/* Map & Stats Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-4 border-swiss-fg shadow-[20px_20px_0_0_rgba(255,48,0,0.1)]">
            {/* Map Area */}
            <div className="lg:col-span-8 border-b-4 lg:border-b-0 lg:border-r-4 border-swiss-fg relative bg-swiss-muted swiss-grid-pattern overflow-hidden">
              <div className="p-6 border-b-4 border-swiss-fg bg-swiss-fg text-swiss-bg text-[10px] font-black tracking-widest uppercase flex justify-between items-center">
                <span>LIVE COMMUNITY INTELLIGENCE</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-swiss-red animate-pulse" />
                  <span className="text-swiss-red uppercase tracking-widest">SYSTEM ACTIVE</span>
                </div>
              </div>
              <div className="p-4 md:p-8">
                <MapContainer />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-swiss-bg to-transparent pointer-events-none">
                <RegionCount />
              </div>
            </div>

            {/* Stats Area */}
            <div className="lg:col-span-4 flex flex-col bg-swiss-bg divide-y-4 divide-swiss-fg">
              <div className="flex-1">
                <TopCountries />
              </div>
              <div>
                <TotalRequests />
              </div>
            </div>
          </div>

          {/* Bottom Grid Area */}
          <div className="mt-4">
            <StatsGrid />
          </div>
        </div>
      </div>
    </section>
  );
}
