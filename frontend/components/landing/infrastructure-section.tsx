"use client";

import { useEffect, useState, useRef } from "react";

const locations = [
  { city: "Urban Zone A", region: "High Density", latency: "Verified" },
  { city: "Rural Cluster B", region: "Active Monitoring", latency: "Connected" },
  { city: "Semi-Urban C", region: "Field Data", latency: "Verified" },
  { city: "Industrial Zone D", region: "NGO Liaison", latency: "Connected" },
  { city: "Coastal Region E", region: "Emergency Ops", latency: "Verified" },
  { city: "Highland Zone F", region: "Volunteer Ops", latency: "Connected" },
];

export function InfrastructureSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeLocation, setActiveLocation] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLocation((prev) => (prev + 1) % locations.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden bg-swiss-muted border-y-4 border-swiss-fg">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6 uppercase tracking-widest">
              <span className="w-8 h-px bg-foreground/30" />
              Infrastructure
            </span>
            <h2 className="text-4xl lg:text-7xl font-display tracking-tight mb-8">
              Built for
              <br />
              real-world impact.
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-12">
              Designed to operate across regions, enabling seamless coordination between multiple stakeholders with minimal delay and maximum visibility.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-4xl lg:text-6xl font-display mb-2">99.9%</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Uptime Guarantee</div>
              </div>
              <div>
                <div className="text-4xl lg:text-6xl font-display mb-2">&lt;1s</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Response Dispatch</div>
              </div>
            </div>
          </div>

          {/* Right: Location list */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <div className="border-4 border-swiss-fg bg-swiss-bg shadow-[16px_16px_0_0_rgba(0,0,0,0.05)]">
              {/* Header */}
              <div className="px-6 py-4 border-b-4 border-swiss-fg flex items-center justify-between bg-swiss-fg text-swiss-bg">
                <span className="text-sm font-mono uppercase tracking-widest font-black">Regional Nodes</span>
                <span className="flex items-center gap-2 text-xs font-mono font-black text-swiss-red">
                  <div className="w-2 h-2 rounded-0 bg-swiss-red animate-pulse" />
                  SYSTEM ACTIVE
                </span>
              </div>

              {/* Locations */}
              <div className="divide-y-2 divide-swiss-fg/10">
                {locations.map((location, index) => (
                  <div
                    key={location.city}
                    className={`px-6 py-5 flex items-center justify-between transition-all duration-300 ${
                      activeLocation === index ? "bg-swiss-red/5" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span 
                        className={`w-2 h-2 transition-colors duration-300 ${
                          activeLocation === index ? "bg-swiss-red" : "bg-swiss-fg/20"
                        }`}
                      />
                      <div>
                        <div className="font-black text-xs uppercase tracking-widest">{location.city}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold">{location.region}</div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] font-black text-swiss-red uppercase">{location.latency}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
