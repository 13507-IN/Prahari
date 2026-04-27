"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, MapPin, AlertTriangle, Send } from "lucide-react";
import DynamicMapPicker from "@/components/map/DynamicMapPicker";
import { createReport } from "@/lib/api";

interface LocationData {
  lat: number;
  lng: number;
  address?: string;
}

interface FormData {
  category: "infrastructure" | "health" | "safety" | "other" | "environment" | "education" | "social" | "";
  description: string;
  location: LocationData | null;
  images: File[];
}

export default function ReportIssuePage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [title, setTitle] = useState("");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high">("medium");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    category: "",
    description: "",
    location: null,
    images: [],
  });

  const categoryOptions = [
    { label: "INFRA", value: "infrastructure" },
    { label: "HEALTH", value: "health" },
    { label: "SAFETY", value: "safety" },
    { label: "OTHER", value: "other" },
  ] as const;

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    updateFormData({ location: { lat, lng } });
  };

  const canProceedToStep2 = formData.category && formData.description.length >= 10;
  const canProceedToStep3 = formData.location !== null;

  async function handleFinalSubmit() {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await createReport({
        title: title.trim() || `${formData.category.toUpperCase()} issue report`,
        description: formData.description,
        category: formData.category,
        urgency,
        location: address,
        address,
        images: imageUrl ? [imageUrl] : undefined,
      });

      setSuccess("Report submitted successfully.");
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit the report right now"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12 md:pb-0">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-swiss-fg text-swiss-bg text-[10px] font-black tracking-widest uppercase">
            02. SUBMISSION
          </span>
          <div className="h-px flex-1 bg-swiss-fg/10" />
        </div>
        <h1 className="text-5xl md:text-[6rem] font-black tracking-tighter leading-[0.8] uppercase">
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
              className={`flex-1 py-4 text-center text-[10px] font-black tracking-widest uppercase transition-colors border-r-2 last:border-r-0 md:border-r-4 border-swiss-fg ${
                step === s ? "bg-swiss-red text-swiss-bg" : step > s ? "bg-swiss-fg text-swiss-bg" : "text-swiss-fg/40"
              }`}
            >
              {step === s ? `0${s}` : s}
            </div>
          ))}
        </div>

        <div className="p-6 md:p-12 space-y-8 md:space-y-12">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-swiss-red" />
                    Issue Category
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                    {categoryOptions.map((cat) => (
                      <button 
                        key={cat.value}
                        onClick={() => updateFormData({ category: cat.value })}
                        className={`px-4 py-6 md:px-6 md:py-8 border-4 border-swiss-fg font-black text-xs tracking-widest uppercase transition-all ${
                          formData.category === cat.value 
                            ? "bg-swiss-red text-swiss-bg" 
                            : "hover:bg-swiss-red hover:text-swiss-bg"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black tracking-widest uppercase">Short Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="BROKEN ROAD NEAR CENTRAL MARKET"
                    className="w-full p-4 md:p-6 border-4 border-swiss-fg bg-swiss-muted focus:outline-none focus:bg-white focus:border-swiss-red font-bold text-sm tracking-tight transition-all placeholder:text-swiss-fg/20"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black tracking-widest uppercase">Description of Event</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    className="w-full h-32 md:h-48 p-4 md:p-6 border-4 border-swiss-fg bg-swiss-muted focus:outline-none focus:bg-white focus:border-swiss-red font-bold text-sm tracking-tight transition-all placeholder:text-swiss-fg/20"
                    placeholder="PROVIDE DETAILED DESCRIPTION..."
                  />
                  <p className="text-[10px] font-black tracking-widest uppercase text-swiss-fg/40">
                    {formData.description.length} / 500 characters
                  </p>
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
                    initialLocation={formData.location || undefined}
                  />
                  {!formData.location && (
                    <div className="absolute z-10 pointer-events-none flex flex-col items-center gap-4 bg-swiss-bg/80 p-4 border-4 border-swiss-fg">
                      <p className="text-[10px] font-bold text-swiss-fg uppercase">CLICK ON MAP TO SET PIN</p>
                    </div>
                  )}
                </div>
                <input 
                  type="text" 
                  placeholder="ENTER ADDRESS..."
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className="w-full p-4 md:p-6 border-4 border-swiss-fg bg-swiss-muted focus:outline-none focus:bg-white focus:border-swiss-red font-bold text-sm tracking-tight transition-all"
                />
                <div className="space-y-4">
                  <label className="text-[10px] font-black tracking-widest uppercase">Urgency Level</label>
                  <div className="grid grid-cols-3 gap-4">
                    {(["low", "medium", "high"] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setUrgency(level)}
                        className={`border-4 px-4 py-4 text-[10px] font-black uppercase tracking-widest transition-colors ${
                          urgency === level
                            ? "border-swiss-red bg-swiss-red text-swiss-bg"
                            : "border-swiss-fg hover:bg-swiss-muted"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
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
                <div className="border-4 border-dashed border-swiss-fg/40 p-8 md:p-16 flex flex-col items-center gap-6 hover:border-swiss-red hover:bg-swiss-red/5 transition-all group cursor-pointer">
                  <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-swiss-fg flex items-center justify-center group-hover:border-swiss-red">
                    <Upload className="w-6 h-6 md:w-8 md:h-8 text-swiss-fg group-hover:text-swiss-red" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs md:text-sm font-black tracking-tighter uppercase mb-2">DRAG AND DROP MEDIA</p>
                    <p className="text-[8px] md:text-[10px] font-bold text-swiss-fg/40 uppercase">MAX FILE SIZE: 25MB (PNG, JPG, MP4)</p>
                  </div>
                </div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  placeholder="OPTIONAL CLOUDINARY IMAGE URL..."
                  className="w-full p-4 md:p-6 border-4 border-swiss-fg bg-swiss-muted focus:outline-none focus:bg-white focus:border-swiss-red font-bold text-sm tracking-tight transition-all"
                />
              </div>

              <div className="p-6 md:p-8 border-4 border-swiss-red bg-swiss-red/5">
                <p className="text-[10px] font-black tracking-widest uppercase text-swiss-red mb-2">NOTICE</p>
                <p className="text-[10px] md:text-xs font-bold leading-relaxed text-swiss-fg/80">
                  BY SUBMITTING THIS REPORT, YOU CONFIRM THAT THE INFORMATION PROVIDED IS ACCURATE TO THE BEST OF YOUR KNOWLEDGE.
                </p>
              </div>
            </div>
          )}

          {error ? (
            <div className="border-4 border-swiss-red bg-swiss-red/5 p-4 text-[10px] font-black tracking-widest uppercase text-swiss-red">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="border-4 border-swiss-fg bg-swiss-muted p-4 text-[10px] font-black tracking-widest uppercase text-swiss-fg">
              {success}
            </div>
          ) : null}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 md:pt-12 border-t-4 border-swiss-fg">
            {step > 1 && (
              <button 
                onClick={() => setStep(s => s - 1)}
                className="flex-1 py-4 md:py-6 border-4 border-swiss-fg font-black tracking-widest uppercase hover:bg-swiss-muted transition-colors text-sm"
              >
                ← BACK
              </button>
            )}
            <button 
              type="button"
              onClick={() => {
                if (step < 3) {
                  setStep((s) => s + 1);
                  return;
                }

                void handleFinalSubmit();
              }}
              disabled={
                isSubmitting || 
                (step === 1 && !canProceedToStep2) || 
                (step === 2 && !canProceedToStep3)
              }
              className={`flex-[2] py-4 md:py-6 font-black tracking-widest uppercase transition-colors flex items-center justify-center gap-3 text-sm ${
                (step === 1 && !canProceedToStep2) || (step === 2 && !canProceedToStep3)
                  ? "bg-swiss-fg/20 text-swiss-fg/40 cursor-not-allowed"
                  : "bg-swiss-fg text-swiss-bg hover:bg-swiss-red"
              }`}
            >
              {step === 3 ? (isSubmitting ? "SUBMITTING..." : "FINALIZE REPORT") : "CONTINUE"}
              {step === 3 ? <Send className="w-5 h-5" /> : null}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
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
