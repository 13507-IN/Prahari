"use client";

import React, { useEffect, useState } from "react";
import { Search, Filter, CheckSquare, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { getReports, createGovernmentAction, type Report } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";

export default function GovernmentPanel() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setIsLoading(true);
    try {
      const result = await getReports({ limit: 50 });
      if (result.data) {
        setReports(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAccept(reportId: string) {
    setActioningId(reportId);
    try {
      await createGovernmentAction({
        reportId,
        department: user?.name || "Government",
        actionType: "accept",
        remarks: "Issue accepted for resolution",
      });
      await fetchReports();
    } catch (err) {
      console.error("Failed to accept report:", err);
    } finally {
      setActioningId(null);
    }
  }

  async function handleMarkInProgress(reportId: string) {
    setActioningId(reportId);
    try {
      await createGovernmentAction({
        reportId,
        department: user?.name || "Government",
        actionType: "in_progress",
        remarks: "Work in progress",
      });
      await fetchReports();
    } catch (err) {
      console.error("Failed to update report:", err);
    } finally {
      setActioningId(null);
    }
  }

  async function handleMarkCompleted(reportId: string) {
    setActioningId(reportId);
    try {
      await createGovernmentAction({
        reportId,
        department: user?.name || "Government",
        actionType: "completed",
        remarks: "Issue resolved",
      });
      await fetchReports();
    } catch (err) {
      console.error("Failed to complete report:", err);
    } finally {
      setActioningId(null);
    }
  }

  const filteredReports = reports.filter((r) =>
    searchQuery
      ? r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const pendingCount = reports.filter((r) => r.status === "pending").length;
  const activeCount = reports.filter(
    (r) => r.status === "assigned" || r.status === "in_progress"
  ).length;

  function priorityLabel(urgency: string): string {
    return urgency === "high" ? "CRITICAL" : urgency === "medium" ? "MEDIUM" : "LOW";
  }

  function statusLabel(status: string): string {
    return status.replace(/_/g, " ").toUpperCase();
  }

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col gap-6 md:gap-4">
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-swiss-fg text-swiss-bg text-[10px] font-black tracking-widest uppercase">
            05. AUTHORITY CONTROL
          </span>
          <div className="h-px flex-1 bg-swiss-fg/10" />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <h1 className="text-5xl md:text-[7rem] font-black tracking-tighter leading-[0.8] uppercase">
            GOVERN<br className="hidden md:block" />MENT
          </h1>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex-1 md:w-24 p-4 border-4 border-swiss-fg bg-swiss-muted text-center">
              <p className="text-[8px] font-black tracking-widest uppercase">ACTIVE NODES</p>
              <p className="text-xl md:text-2xl font-black">{isLoading ? "…" : activeCount}</p>
            </div>
            <div className="flex-1 md:w-32 p-4 border-4 border-swiss-fg bg-swiss-red text-swiss-bg text-center">
              <p className="text-[8px] font-black tracking-widest uppercase truncate">PENDING APPROVAL</p>
              <p className="text-xl md:text-2xl font-black">{isLoading ? "…" : pendingCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-swiss-fg/40" />
          <input 
            type="text" 
            placeholder="FILTER SYSTEM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-6 py-5 md:py-6 border-4 border-swiss-fg bg-swiss-bg text-sm font-bold tracking-tight focus:outline-none focus:border-swiss-red transition-all"
          />
        </div>
        <div className="flex gap-4">
          <button 
            onClick={fetchReports}
            className="flex-1 lg:flex-none lg:px-12 py-5 md:py-6 border-4 border-swiss-fg font-black tracking-widest uppercase hover:bg-swiss-fg hover:text-swiss-bg transition-all flex items-center justify-center gap-3 text-xs md:text-sm"
          >
            <Filter className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">REFRESH</span>
          </button>
        </div>
      </div>

      {/* Management Table */}
      <div className="border-4 border-swiss-fg bg-swiss-bg overflow-hidden shadow-[8px_8px_0_0_rgba(255,48,0,0.1)] md:shadow-[16px_16px_0_0_rgba(255,48,0,0.1)]">
        <div className="p-6 md:p-8 border-b-4 border-swiss-fg bg-swiss-muted flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 swiss-diagonal">
          <p className="text-[10px] font-black tracking-widest uppercase">DEPARTMENTAL TASKS ({filteredReports.length})</p>
          <div className="flex gap-4 md:gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-swiss-red" />
              <span className="text-[10px] font-black uppercase tracking-widest">URGENT</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-swiss-fg" />
              <span className="text-[10px] font-black uppercase tracking-widest">STANDARD</span>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-16">
            <Loader2 className="w-8 h-8 animate-spin text-swiss-fg/40" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <AlertCircle className="w-8 h-8 text-swiss-fg/20 mb-4" />
            <p className="text-[10px] font-black tracking-widest uppercase text-swiss-fg/40">NO REPORTS FOUND</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-4 border-swiss-fg text-[10px] font-black tracking-widest uppercase">
                    <th className="px-8 py-6">ISSUE</th>
                    <th className="px-8 py-6">PRIORITY</th>
                    <th className="px-8 py-6">LOCATION</th>
                    <th className="px-8 py-6">STATUS</th>
                    <th className="px-8 py-6 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y-4 divide-swiss-fg">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="group hover:bg-swiss-red/5 transition-colors text-xs">
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <p className="text-[8px] font-black tracking-widest text-swiss-fg/40 uppercase">{report.id.substring(0, 8)}</p>
                          <h4 className="font-black uppercase truncate max-w-[200px]">{report.title}</h4>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-2 py-1 text-[8px] font-black tracking-widest uppercase border-2 border-swiss-fg ${report.urgency === 'high' ? 'bg-swiss-red text-swiss-bg' : ''}`}>
                          {priorityLabel(report.urgency)}
                        </span>
                      </td>
                      <td className="px-8 py-6 uppercase font-bold tracking-tight truncate max-w-[150px]">{report.location}</td>
                      <td className="px-8 py-6">
                        <div className="inline-block border-2 border-swiss-fg px-3 py-1 font-black text-[10px] tracking-widest uppercase">{statusLabel(report.status)}</div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex gap-2 justify-end">
                          {report.status === "pending" && (
                            <button
                              disabled={actioningId === report.id}
                              onClick={() => handleAccept(report.id)}
                              className="px-3 py-1 text-[8px] font-black tracking-widest bg-swiss-fg text-swiss-bg hover:bg-swiss-red transition-colors disabled:opacity-50"
                            >
                              {actioningId === report.id ? "…" : "ACCEPT"}
                            </button>
                          )}
                          {report.status === "assigned" && (
                            <button
                              disabled={actioningId === report.id}
                              onClick={() => handleMarkInProgress(report.id)}
                              className="px-3 py-1 text-[8px] font-black tracking-widest bg-swiss-fg text-swiss-bg hover:bg-swiss-red transition-colors disabled:opacity-50"
                            >
                              {actioningId === report.id ? "…" : "START WORK"}
                            </button>
                          )}
                          {report.status === "in_progress" && (
                            <button
                              disabled={actioningId === report.id}
                              onClick={() => handleMarkCompleted(report.id)}
                              className="px-3 py-1 text-[8px] font-black tracking-widest bg-swiss-red text-swiss-bg hover:bg-swiss-fg transition-colors disabled:opacity-50"
                            >
                              {actioningId === report.id ? "…" : "MARK DONE"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden divide-y-4 border-swiss-fg">
              {filteredReports.map((report) => (
                <div key={report.id} className="p-6 space-y-4 bg-swiss-bg hover:bg-swiss-muted transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[8px] font-black text-swiss-fg/40 uppercase mb-1">{report.id.substring(0, 8)}</p>
                      <h4 className="text-sm font-black uppercase tracking-tighter leading-tight">{report.title}</h4>
                    </div>
                    <span className={`px-2 py-0.5 text-[8px] font-black tracking-widest uppercase border-2 border-swiss-fg ${report.urgency === 'high' ? 'bg-swiss-red text-swiss-bg' : ''}`}>
                      {priorityLabel(report.urgency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[8px] font-black tracking-widest uppercase text-swiss-red mb-1">LOCATION</p>
                      <p className="text-[10px] font-bold uppercase">{report.location}</p>
                    </div>
                    <div className="border-2 border-swiss-fg px-2 py-1 font-black text-[8px] tracking-widest uppercase">
                      {statusLabel(report.status)}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    {report.status === "pending" && (
                      <button
                        disabled={actioningId === report.id}
                        onClick={() => handleAccept(report.id)}
                        className="flex-1 py-2 text-[8px] font-black tracking-widest bg-swiss-fg text-swiss-bg hover:bg-swiss-red transition-colors disabled:opacity-50"
                      >
                        {actioningId === report.id ? "…" : "ACCEPT"}
                      </button>
                    )}
                    {report.status === "assigned" && (
                      <button
                        disabled={actioningId === report.id}
                        onClick={() => handleMarkInProgress(report.id)}
                        className="flex-1 py-2 text-[8px] font-black tracking-widest bg-swiss-fg text-swiss-bg hover:bg-swiss-red transition-colors disabled:opacity-50"
                      >
                        {actioningId === report.id ? "…" : "START WORK"}
                      </button>
                    )}
                    {report.status === "in_progress" && (
                      <button
                        disabled={actioningId === report.id}
                        onClick={() => handleMarkCompleted(report.id)}
                        className="flex-1 py-2 text-[8px] font-black tracking-widest bg-swiss-red text-swiss-bg hover:bg-swiss-fg transition-colors disabled:opacity-50"
                      >
                        {actioningId === report.id ? "…" : "MARK DONE"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 pb-12">
        <div className="border-4 border-swiss-fg p-8 md:p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 swiss-grid-pattern opacity-40 group-hover:bg-swiss-red/5 transition-colors" />
          <h3 className="text-2xl md:text-3xl font-black tracking-tighter uppercase mb-6">COMPLIANCE METRICS</h3>
          <div className="space-y-4">
            {[
              { label: "TOTAL REPORTS", val: reports.length.toString() },
              { label: "PENDING", val: pendingCount.toString() },
              { label: "IN PROGRESS", val: activeCount.toString() },
            ].map((m, i) => (
              <div key={i} className="flex justify-between items-end border-b-2 border-swiss-fg/10 pb-2">
                <span className="text-[10px] font-black tracking-widest uppercase text-swiss-fg/40">{m.label}</span>
                <span className="text-lg md:text-xl font-black tracking-tighter uppercase">{isLoading ? "…" : m.val}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-4 border-swiss-fg p-8 md:p-12 bg-swiss-muted swiss-dots">
          <h3 className="text-2xl md:text-3xl font-black tracking-tighter uppercase mb-6">SYSTEM UPDATES</h3>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-swiss-red bg-white">
              <p className="text-[8px] font-black tracking-widest text-swiss-red uppercase mb-1">NOTICE</p>
              <p className="text-[10px] font-bold uppercase leading-tight">ALL ACTIONS ARE LOGGED AND AUDITABLE</p>
            </div>
            <div className="p-4 border-l-4 border-swiss-fg bg-white">
              <p className="text-[8px] font-black tracking-widest text-swiss-fg/40 uppercase mb-1">INFO</p>
              <p className="text-[10px] font-bold uppercase leading-tight">COMMUNITY VERIFICATION REQUIRED AFTER COMPLETION</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
