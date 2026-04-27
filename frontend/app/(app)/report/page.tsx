"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, MapPin, AlertTriangle, Send, Users, Building2, Check } from "lucide-react";
import DynamicMapPicker from "@/components/map/DynamicMapPicker";
import { createReport, getGovtUsers, getNgoUsers } from "@/lib/api";
import type { CreateReportPayload } from "@/lib/api";

interface LocationData {
  lat: number;
  lng: number;
  address?: string;
}

interface Recipient {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface FormData {
  category: "infrastructure" | "health" | "safety" | "other" | "environment" | "education" | "social" | "";
  description: string;
  location: LocationData | null;
  images: File[];
  uploadedImageUrl: string | null;
}

export default function ReportIssuePage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [title, setTitle] = useState("");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high">("medium");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    category: "",
    description: "",
    location: null,
    images: [],
    uploadedImageUrl: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleLocationChange = (location: LocationData) => {
    updateFormData({ location });
  };

  const canProceedToStep2 = formData.category && formData.description.length >= 10;
  const canProceedToStep3 = formData.location !== null;
  
  const [govtUsers, setGovtUsers] = useState<Recipient[]>([]);
  const [ngoUsers, setNgoUsers] = useState<Recipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);

  useEffect(() => {
    async function loadRecipients() {
      setIsLoadingRecipients(true);
      try {
        const govtData = await getGovtUsers();
        const ngoData = await getNgoUsers();
        if (govtData?.data) setGovtUsers(govtData.data);
        if (ngoData?.data) setNgoUsers(ngoData.data);
      } catch (err) {
        console.error("Failed to load recipients:", err);
      } finally {
        setIsLoadingRecipients(false);
      }
    }
    loadRecipients();
  }, []);

  const toggleRecipient = (id: string) => {
    setSelectedRecipients(prev => 
      prev.includes(id) 
        ? prev.filter(r => r !== id)
        : [...prev, id]
    );
  };

  const categoryOptions = [
    { label: "INFRA", value: "infrastructure" },
    { label: "HEALTH", value: "health" },
    { label: "SAFETY", value: "safety" },
    { label: "OTHER", value: "other" },
  ] as const;

  async function handleFinalSubmit() {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const locationData = formData.location;
      const locationString = locationData?.address || address || `${locationData?.lat}, ${locationData?.lng}`;
      
      const imageUrls: string[] = [];
      if (formData.images.length > 0) {
        for (const file of formData.images) {
          const reader = new FileReader();
          const dataUrl = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          imageUrls.push(dataUrl);
        }
      }

      await createReport({
        title: title.trim() || `${formData.category.toUpperCase()} issue report`,
        description: formData.description,
        category: formData.category as CreateReportPayload["category"],
        urgency,
        location: locationString,
        address: locationString,
        latitude: locationData?.lat,
        longitude: locationData?.lng,
        images: imageUrls.length > 0 ? imageUrls : undefined,
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
                    onLocationSelect={(lat, lng) => updateFormData({ location: { lat, lng } })}
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
                  <Users className="w-4 h-4 text-swiss-red" />
                  Notify Recipients
                </label>
                <p className="text-[10px] font-bold text-swiss-fg/60">
                  Select government bodies and NGOs to notify about this issue
                </p>
                
                {isLoadingRecipients ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-4 border-swiss-fg/30 border-t-swiss-fg rounded-full animate-spin mx-auto" />
                  </div>
                ) : (
                  <>
                    {govtUsers.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-swiss-fg/60">
                          <Building2 className="w-4 h-4" />
                          Government Bodies ({govtUsers.length})
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {govtUsers.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => toggleRecipient(user.id)}
                              className={`p-4 border-4 text-left transition-colors ${
                                selectedRecipients.includes(user.id)
                                  ? "border-swiss-red bg-swiss-red/10"
                                  : "border-swiss-fg hover:border-swiss-red"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-black tracking-widest uppercase">{user.name}</p>
                                  <p className="text-[10px] text-swiss-fg/60">{user.email}</p>
                                </div>
                                {selectedRecipients.includes(user.id) && (
                                  <div className="w-6 h-6 bg-swiss-red rounded-full flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {ngoUsers.length > 0 && (
                      <div className="space-y-3 pt-4">
                        <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-swiss-fg/60">
                          <Users className="w-4 h-4" />
                          NGOs ({ngoUsers.length})
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {ngoUsers.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => toggleRecipient(user.id)}
                              className={`p-4 border-4 text-left transition-colors ${
                                selectedRecipients.includes(user.id)
                                  ? "border-swiss-red bg-swiss-red/10"
                                  : "border-swiss-fg hover:border-swiss-red"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-black tracking-widest uppercase">{user.name}</p>
                                  <p className="text-[10px] text-swiss-fg/60">{user.email}</p>
                                </div>
                                {selectedRecipients.includes(user.id) && (
                                  <div className="w-6 h-6 bg-swiss-red rounded-full flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {govtUsers.length === 0 && ngoUsers.length === 0 && (
                      <p className="text-[10px] font-bold text-swiss-fg/40 text-center p-4">
                        No recipients available
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
                  <Upload className="w-4 h-4 text-swiss-red" />
                  Evidence Upload
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData(prev => ({ ...prev, images: [...prev.images, file] }));
                    }
                  }}
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-4 border-dashed border-swiss-fg/40 p-8 md:p-16 flex flex-col items-center gap-6 hover:border-swiss-red hover:bg-swiss-red/5 transition-all group cursor-pointer"
                >
                  {formData.images.length > 0 ? (
                    <div className="flex flex-wrap gap-4 justify-center">
                      {formData.images.map((file, i) => (
                        <div key={i} className="relative">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={file.name}
                            className="w-24 h-24 object-cover border-4 border-swiss-fg"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData(prev => ({
                                ...prev,
                                images: prev.images.filter((_, idx) => idx !== i)
                              }));
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-swiss-red text-white rounded-full text-xs font-black"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-swiss-fg flex items-center justify-center group-hover:border-swiss-red">
                        <Upload className="w-6 h-6 md:w-8 md:h-8 text-swiss-fg group-hover:text-swiss-red" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs md:text-sm font-black tracking-tighter uppercase mb-2">DRAG AND DROP MEDIA</p>
                        <p className="text-[8px] md:text-[10px] font-bold text-swiss-fg/40 uppercase">MAX FILE SIZE: 25MB (PNG, JPG, MP4)</p>
                      </div>
                    </>
                  )}
                </div>
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
