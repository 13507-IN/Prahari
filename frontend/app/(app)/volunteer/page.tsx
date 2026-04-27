"use client";

import React, { useEffect, useState } from "react";
import { Users, Target, Zap, MapPin, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { getReports, type Report } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";

export default function VolunteerPage() {
  const { user } = useAuth();
  const [availableTasks, setAvailableTasks] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      setIsLoading(true);
      try {
        // Fetch pending and assigned reports as available tasks
        const result = await getReports({ limit: 20 });
        if (result.data) {
          const openTasks = result.data.filter(
            (r) => r.status === "pending" || r.status === "assigned"
          );
          setAvailableTasks(openTasks);
        }
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTasks();
  }, []);

  function urgencyPoints(urgency: string): string {
    if (urgency === "high") return "+50 XP";
    if (urgency === "medium") return "+30 XP";
    return "+20 XP";
  }

  function skillFromCategory(category: string): string {
    const map: Record<string, string> = {
      infrastructure: "ENGINEERING",
      health: "MEDICAL",
      safety: "SAFETY",
      environment: "ENVIRONMENT",
      education: "EDUCATION",
      social: "SOCIAL",
      other: "GENERAL",
    };
    return map[category] || "GENERAL";
  }

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col gap-6 md:gap-4">
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-swiss-red text-swiss-bg text-[10px] font-black tracking-widest uppercase">
            04. COMMUNITY ACTION
          </span>
          <div className="h-px flex-1 bg-swiss-fg/10" />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <h1 className="text-5xl md:text-[7rem] font-black tracking-tighter leading-[0.8] uppercase">
            VOLUNTEER<br />NETWORK
          </h1>
          <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto border-4 md:border-0 border-swiss-fg p-6 md:p-0 bg-swiss-muted md:bg-transparent">
            <p className="text-[10px] font-black tracking-widest uppercase">AVAILABLE TASKS</p>
            <div className="flex items-center gap-4">
              <span className="text-5xl md:text-6xl font-black tracking-tighter">
                {isLoading ? "…" : availableTasks.length}
              </span>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-swiss-fg text-swiss-bg flex items-center justify-center border-2 border-swiss-red">
                <Target className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats / Badges Marquee */}
      <div className="border-y-4 border-swiss-fg py-4 md:py-6 overflow-hidden bg-swiss-muted swiss-diagonal">
        <div className="flex gap-16 animate-marquee whitespace-nowrap">
          {[1, 2].map((m) => (
            <div key={m} className="flex gap-16 items-center">
              {["TOP CONTRIBUTOR", "24H RESPONSE GOLD", "COMMUNITY HERO", "EXPERT SURVEYOR"].map((badge) => (
                <div key={badge} className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-swiss-red rotate-45" />
                  <span className="text-[10px] font-black tracking-widest uppercase">{badge}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Task Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center p-16">
          <Loader2 className="w-8 h-8 animate-spin text-swiss-fg/40" />
        </div>
      ) : availableTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 border-4 border-swiss-fg text-center">
          <AlertCircle className="w-8 h-8 text-swiss-fg/20 mb-4" />
          <p className="text-[10px] font-black tracking-widest uppercase text-swiss-fg/40">NO TASKS AVAILABLE</p>
          <p className="text-[10px] font-bold text-swiss-fg/30 mt-2">CHECK BACK LATER FOR NEW COMMUNITY ISSUES</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {availableTasks.map((task) => (
            <div key={task.id} className="border-4 border-swiss-fg p-6 md:p-8 flex flex-col justify-between hover:bg-swiss-fg group transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className={`px-2 py-1 text-[8px] font-black tracking-widest uppercase border-2 border-swiss-fg group-hover:border-swiss-bg group-hover:text-swiss-bg ${task.urgency === 'high' ? 'bg-swiss-red group-hover:bg-swiss-red' : ''}`}>
                  {task.urgency.toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-4 md:space-y-6">
                <p className="text-[10px] font-black tracking-widest uppercase text-swiss-fg/40 group-hover:text-swiss-bg/40">{task.id.substring(0, 8)}</p>
                <h3 className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-tight group-hover:text-swiss-bg">
                  {task.title}
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase group-hover:text-swiss-muted">
                    <MapPin className="w-4 h-4" />
                    {task.location}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase group-hover:text-swiss-muted">
                    <Zap className="w-4 h-4 text-swiss-red" />
                    {urgencyPoints(task.urgency)}
                  </div>
                </div>
              </div>

              <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t-2 border-swiss-fg/10 group-hover:border-swiss-bg/20 flex justify-between items-center">
                <span className="text-[10px] font-black tracking-widest uppercase text-swiss-fg/60 group-hover:text-swiss-muted">{skillFromCategory(task.category)}</span>
                <button className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase group-hover:text-swiss-red transition-colors">
                  VIEW <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Banner */}
      <div className="border-4 border-swiss-fg p-8 md:p-12 bg-swiss-fg text-swiss-bg flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="absolute inset-0 swiss-dots opacity-10 pointer-events-none" />
        <div className="relative z-10 text-center lg:text-left">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-[0.9] mb-4">
            WANT TO DO<br className="hidden md:block" /> MORE?
          </h2>
          <p className="text-[10px] md:text-xs font-bold text-swiss-bg/60 tracking-widest uppercase">CONNECT WITH LOCAL NGOs TO LEAD YOUR OWN PROJECT</p>
        </div>
        <button className="w-full lg:w-auto relative z-10 px-8 py-4 md:px-12 md:py-6 bg-swiss-red text-swiss-bg font-black tracking-widest uppercase hover:scale-105 transition-transform flex items-center justify-center gap-4">
          CONTACT PARTNERS <Users className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
