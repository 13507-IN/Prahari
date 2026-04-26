"use client";

import React, { useState } from "react";
import { Upload, MapPin, AlertTriangle, Send } from "lucide-react";
import DynamicMapPicker from "@/components/map/DynamicMapPicker";

export default function ReportIssuePage() {
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  const handleLocationSelect = (lat: number, lng: number) => {
    setLocation({ lat, lng });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-swiss-fg text-swiss-bg text-[10px] font-black tracking-widest uppercase">
            02. SUBMISSION
          </span>
          <div className="h-px flex-1 bg-swiss-fg/10" />
        </div>
        <h1 className="text-[6rem] font-black tracking-tighter leading-[0.8] uppercase">
          REPORT<br />ISSUE
        </h1>
      </div>

      {/* Form Container */}
      <div className="border-4 border-swiss-fg bg-swiss-bg">
        {/* Progress Bar */}
        <div className="flex border-b-4 border-swiss-fg bg-swiss-muted">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`flex-1 py-4 text-center text-[10px] font-black tracking-widest uppercase transition-colors border-r-4 last:border-r-0 border-swiss-fg ${
                step === s ? "bg-swiss-red text-swiss-bg" : step > s ? "bg-swiss-fg text-swiss-bg" : "text-swiss-fg/40"
              }`}
            >
              STEP 0{s}
            </div>
          ))}
        </div>

        <div className="p-12 space-y-12">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-swiss-red" />
                    Issue Category
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {["INFRA", "UTILITY", "SAFETY", "HEALTH"].map((cat) => (
                      <button 
                        key={cat}
                        className="px-6 py-8 border-4 border-swiss-fg font-black text-xs tracking-widest uppercase hover:bg-swiss-red hover:text-swiss-bg transition-all"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black tracking-widest uppercase">Description of Event</label>
                  <textarea 
                    className="w-full h-48 p-6 border-4 border-swiss-fg bg-swiss-muted focus:outline-none focus:bg-white focus:border-swiss-red font-bold text-sm tracking-tight transition-all placeholder:text-swiss-fg/20"
                    placeholder="PROVIDE DETAILED DESCRIPTION..."
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="space-y-4">
                <label className="text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-swiss-red" />
                  Location Coordinates
                </label>
                <div className="h-80 bg-swiss-muted border-4 border-swiss-fg swiss-grid-pattern flex items-center justify-center relative overflow-hidden group">
                  <DynamicMapPicker 
                    onLocationSelect={handleLocationSelect}
                    initialLocation={location || undefined}
                  />
                  {!location && (
                    <div className="absolute z-10 pointer-events-none flex flex-col items-center gap-4 bg-swiss-bg/80 p-4 border-4 border-swiss-fg">
                      <p className="text-[10px] font-bold text-swiss-fg uppercase">CLICK ON MAP TO SET PIN</p>
                    </div>
                  )}
                </div>
                <input 
                  type="text" 
                  placeholder="ENTER ADDRESS..."
                  className="w-full p-6 border-4 border-swiss-fg bg-swiss-muted focus:outline-none focus:bg-white focus:border-swiss-red font-bold text-sm tracking-tight transition-all"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="space-y-4">
                <label className="text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
                  <Upload className="w-4 h-4 text-swiss-red" />
                  Evidence Upload
                </label>
                <div className="border-4 border-dashed border-swiss-fg/40 p-16 flex flex-col items-center gap-6 hover:border-swiss-red hover:bg-swiss-red/5 transition-all group cursor-pointer">
                  <div className="w-20 h-20 border-4 border-swiss-fg flex items-center justify-center group-hover:border-swiss-red">
                    <Upload className="w-8 h-8 text-swiss-fg group-hover:text-swiss-red" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black tracking-tighter uppercase mb-2">DRAG AND DROP MEDIA</p>
                    <p className="text-[10px] font-bold text-swiss-fg/40 uppercase">MAX FILE SIZE: 25MB (PNG, JPG, MP4)</p>
                  </div>
                </div>
              </div>

              <div className="p-8 border-4 border-swiss-red bg-swiss-red/5">
                <p className="text-[10px] font-black tracking-widest uppercase text-swiss-red mb-2">NOTICE</p>
                <p className="text-xs font-bold leading-relaxed text-swiss-fg/80">
                  BY SUBMITTING THIS REPORT, YOU CONFIRM THAT THE INFORMATION PROVIDED IS ACCURATE TO THE BEST OF YOUR KNOWLEDGE. FALSE REPORTING MAY LEAD TO SYSTEM RESTRICTIONS.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-12 border-t-4 border-swiss-fg">
            {step > 1 && (
              <button 
                onClick={() => setStep(s => s - 1)}
                className="flex-1 py-6 border-4 border-swiss-fg font-black tracking-widest uppercase hover:bg-swiss-muted transition-colors"
              >
                ← BACK
              </button>
            )}
            <button 
              onClick={() => step < 3 ? setStep(s => s + 1) : null}
              className={`flex-[2] py-6 bg-swiss-fg text-swiss-bg font-black tracking-widest uppercase hover:bg-swiss-red transition-colors flex items-center justify-center gap-3`}
            >
              {step === 3 ? "FINALIZE REPORT" : "CONTINUE"}
              {step === 3 ? <Send className="w-5 h-5" /> : null}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="grid grid-cols-3 gap-8">
        {[
          { label: "01. SECURE", desc: "END-TO-END ENCRYPTED" },
          { label: "02. VERIFIED", desc: "GPS TIMESTAMPED" },
          { label: "03. OPEN", desc: "PUBLIC ACCESSIBILITY" },
        ].map((item, i) => (
          <div key={i} className="border-t-2 border-swiss-fg pt-4">
            <p className="text-[8px] font-black tracking-widest uppercase text-swiss-red">{item.label}</p>
            <p className="text-[10px] font-black tracking-widest uppercase">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
