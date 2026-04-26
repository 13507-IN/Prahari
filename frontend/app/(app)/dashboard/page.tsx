"use client";

import React from "react";
import { ArrowUpRight, AlertCircle, CheckCircle2, Clock, Users, Globe } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import MapContainer from "@/components/map/MapContainer";
import { TopCountries, RegionCount } from "@/components/map/StatsDisplay";

const stats = [
  { label: "01. TOTAL REPORTS", value: "1,248", change: "+12%", icon: AlertCircle, color: "bg-swiss-fg" },
  { label: "02. PENDING ISSUES", value: "432", change: "+5%", icon: Clock, color: "bg-swiss-red" },
  { label: "03. RESOLVED CASES", value: "786", change: "+24%", icon: CheckCircle2, color: "bg-swiss-fg" },
  { label: "04. ACTIVE VOLUNTEERS", value: "156", change: "+8%", icon: Users, color: "bg-swiss-fg" },
];

const recentActivity = [
  { id: "AC-482", type: "ISSUE REPORTED", user: "John Doe", time: "2m ago", status: "PENDING", category: "INFRASTRUCTURE" },
  { id: "AC-481", type: "STATUS UPDATED", user: "City Council", time: "15m ago", status: "IN PROGRESS", category: "UTILITY" },
  { id: "AC-480", type: "ISSUE RESOLVED", user: "Volunteer-04", time: "1h ago", status: "RESOLVED", category: "ENVIRONMENT" },
  { id: "AC-479", type: "NEW ASSIGNMENT", user: "NGO-Alpha", time: "3h ago", status: "ASSIGNED", category: "SOCIAL" },
];

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-swiss-red text-swiss-bg text-[10px] font-black tracking-widest uppercase">
            {user?.firstName ? `WELCOME, ${user.firstName.toUpperCase()}` : "LIVE SYSTEM"}
          </span>
          <div className="h-px flex-1 bg-swiss-fg/10" />
        </div>
        <h1 className="text-6xl md:text-[8rem] font-black tracking-tighter leading-[0.8] uppercase">
          DASH<br />BOARD
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-4 border-swiss-fg">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className={`p-6 md:p-8 border-swiss-fg ${i % 2 === 0 ? "sm:border-r-4" : ""} ${i < 2 ? "lg:border-r-4 border-b-4 lg:border-b-0" : "border-b-4 sm:border-b-0 lg:border-b-0"} ${i === 2 ? "lg:border-r-4" : ""} group hover:bg-swiss-red transition-colors duration-150`}
          >
            <p className="text-[10px] font-black tracking-widest uppercase mb-4 md:mb-8 group-hover:text-swiss-bg">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter group-hover:text-swiss-bg">{stat.value}</h2>
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-swiss-red group-hover:text-swiss-bg flex items-center gap-1">
                  {stat.change} <ArrowUpRight className="w-3 h-3" />
                </span>
                <stat.icon className="w-5 h-5 md:w-6 md:h-6 mt-2 text-swiss-fg group-hover:text-swiss-bg" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Section: Trends & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        {/* Trend Chart Placeholder */}
        <div className="lg:col-span-8 border-4 border-swiss-fg p-6 md:p-12 bg-swiss-muted swiss-grid-pattern relative overflow-hidden group">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 md:mb-12">
            <div>
              <p className="text-[10px] font-black tracking-widest uppercase mb-2">05. ISSUE TRENDS</p>
              <h3 className="text-2xl md:text-4xl font-black tracking-tighter uppercase">REPORTING VELOCITY</h3>
            </div>
            <div className="flex gap-2">
              {['7D', '30D', '90D'].map((t) => (
                <button key={t} className="px-3 py-1 md:px-4 md:py-2 border-2 border-swiss-fg text-[10px] font-black tracking-widest hover:bg-swiss-fg hover:text-swiss-bg transition-colors">
                  {t}
                </button>
              ))}
            </div>
          </div>
          
          {/* Mock Chart Visualization */}
          <div className="h-48 md:h-64 flex items-end gap-1 md:gap-2">
            {[40, 70, 45, 90, 65, 80, 50, 85, 40, 75, 95, 60].map((h, i) => (
              <div 
                key={i} 
                className="flex-1 bg-swiss-fg transition-all duration-500 hover:bg-swiss-red relative group/bar"
                style={{ height: `${h}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-swiss-fg text-swiss-bg text-[8px] px-1 py-0.5 opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                  {h}%
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t-2 border-swiss-fg/20 flex justify-between text-[8px] font-black tracking-widest uppercase text-swiss-fg/40">
            <span>JAN</span>
            <span>MAR</span>
            <span>MAY</span>
            <span>JUL</span>
            <span>SEP</span>
            <span>NOV</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <button className="flex-1 border-4 border-swiss-fg p-6 md:p-8 flex flex-col justify-between hover:bg-swiss-red group transition-colors text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-swiss-fg/5 -rotate-12 translate-x-8 -translate-y-8 swiss-diagonal group-hover:bg-swiss-bg/10" />
            <p className="text-[10px] font-black tracking-widest uppercase mb-4 group-hover:text-swiss-bg">06. ACTION</p>
            <h3 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-[0.9] group-hover:text-swiss-bg">
              NEW ISSUE<br />REPORT
            </h3>
            <ArrowUpRight className="w-8 h-8 self-end group-hover:text-swiss-bg" />
          </button>
          <button className="flex-1 border-4 border-swiss-fg p-6 md:p-8 flex flex-col justify-between hover:bg-swiss-fg group transition-colors text-left">
            <p className="text-[10px] font-black tracking-widest uppercase mb-4 group-hover:text-swiss-muted">07. ACTION</p>
            <h3 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-[0.9] group-hover:text-swiss-bg">
              VIEW DATA<br />MAP
            </h3>
            <ArrowUpRight className="w-8 h-8 self-end group-hover:text-swiss-bg" />
          </button>
        </div>
      </div>

      {/* Live Operations Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-4 border-swiss-fg">
        <div className="lg:col-span-8 border-b-4 lg:border-b-0 lg:border-r-4 border-swiss-fg bg-swiss-muted swiss-grid-pattern overflow-hidden min-h-[500px] relative">
          <div className="p-4 border-b-4 border-swiss-fg bg-swiss-fg text-swiss-bg text-[10px] font-black tracking-widest uppercase flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>LIVE OPERATIONS GRID</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-swiss-red animate-pulse" />
              <span className="text-swiss-red">UPLINK ACTIVE</span>
            </div>
          </div>
          <div className="p-4 md:p-8">
            <MapContainer />
          </div>
          <div className="absolute bottom-6 left-6">
            <RegionCount />
          </div>
        </div>
        <div className="lg:col-span-4 bg-swiss-bg">
          <TopCountries />
        </div>
      </div>

      {/* Bottom Section: Recent Activity Table */}
      <div className="border-4 border-swiss-fg overflow-hidden bg-swiss-bg">
        <div className="p-6 md:p-8 border-b-4 border-swiss-fg flex justify-between items-center bg-swiss-muted swiss-dots">
          <p className="text-[10px] font-black tracking-widest uppercase">08. RECENT ACTIVITY LOG</p>
          <button className="text-[10px] font-black tracking-widest uppercase hover:text-swiss-red border-b-2 border-transparent hover:border-swiss-red transition-all">
            VIEW ALL LOGS →
          </button>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-4 border-swiss-fg bg-swiss-fg text-swiss-bg text-[10px] font-black tracking-widest uppercase">
                <th className="px-8 py-4">ID</th>
                <th className="px-8 py-4">TYPE</th>
                <th className="px-8 py-4">USER</th>
                <th className="px-8 py-4">CATEGORY</th>
                <th className="px-8 py-4">STATUS</th>
                <th className="px-8 py-4 text-right">TIME</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-swiss-fg/10">
              {recentActivity.map((activity, i) => (
                <tr key={i} className="hover:bg-swiss-muted transition-colors group">
                  <td className="px-8 py-6 font-black text-xs">{activity.id}</td>
                  <td className="px-8 py-6 text-[10px] font-black tracking-widest uppercase">{activity.type}</td>
                  <td className="px-8 py-6 text-xs font-bold">{activity.user}</td>
                  <td className="px-8 py-6">
                    <span className="px-2 py-1 border border-swiss-fg text-[8px] font-black tracking-widest">
                      {activity.category}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 ${activity.status === 'RESOLVED' ? 'bg-green-500' : activity.status === 'PENDING' ? 'bg-swiss-red' : 'bg-yellow-500'}`} />
                      <span className="text-[10px] font-black tracking-widest">{activity.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right text-[10px] font-bold text-swiss-fg/40">{activity.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden divide-y-4 border-swiss-fg">
          {recentActivity.map((activity, i) => (
            <div key={i} className="p-6 space-y-4 bg-swiss-bg hover:bg-swiss-muted transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[8px] font-black text-swiss-red uppercase mb-1">{activity.id}</p>
                  <p className="text-sm font-black uppercase tracking-tight">{activity.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 ${activity.status === 'RESOLVED' ? 'bg-green-500' : activity.status === 'PENDING' ? 'bg-swiss-red' : 'bg-yellow-500'}`} />
                  <span className="text-[8px] font-black tracking-widest">{activity.status}</span>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold text-swiss-fg/60 uppercase mb-1">{activity.user}</p>
                  <span className="px-2 py-0.5 border border-swiss-fg text-[8px] font-black tracking-widest">
                    {activity.category}
                  </span>
                </div>
                <p className="text-[8px] font-bold text-swiss-fg/40 uppercase">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
