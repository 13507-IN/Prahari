"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, AlertCircle, Image as ImageIcon } from "lucide-react";
import { getReports, getReportVerifications, submitVerification, type Report, type Verification } from "@/lib/api";

export default function VerificationPage() {
  const [completedReports, setCompletedReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [remark, setRemark] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchCompletedReports();
  }, []);

  async function fetchCompletedReports() {
    setIsLoading(true);
    try {
      const result = await getReports({ limit: 50 });
      if (result.data) {
        // Show completed reports that need community verification
        const completed = result.data.filter(
          (r) => r.status === "completed" || r.status === "verified"
        );
        setCompletedReports(completed);
        if (completed.length > 0 && !selectedReport) {
          setSelectedReport(completed[0]);
          loadVerifications(completed[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadVerifications(reportId: string) {
    try {
      const result = await getReportVerifications(reportId);
      if (result.data) {
        setVerifications(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch verifications:", err);
    }
  }

  function selectReport(report: Report) {
    setSelectedReport(report);
    setRemark("");
    setFeedback(null);
    loadVerifications(report.id);
  }

  async function handleVote(vote: "approved" | "rejected") {
    if (!selectedReport) return;
    setIsSubmitting(true);
    setFeedback(null);

    try {
      await submitVerification({
        reportId: selectedReport.id,
        vote,
        comment: remark || undefined,
      });
      setFeedback({
        type: "success",
        message: vote === "approved" ? "Resolution approved!" : "Issue reopened for review.",
      });
      setRemark("");
      await loadVerifications(selectedReport.id);
      await fetchCompletedReports();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to submit vote",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function timeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  const approvedCount = verifications.filter((v) => v.vote === "approved").length;
  const rejectedCount = verifications.filter((v) => v.vote === "rejected").length;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-swiss-red text-swiss-bg text-[10px] font-black tracking-widest uppercase">
            06. QUALITY ASSURANCE
          </span>
          <div className="h-px flex-1 bg-swiss-fg/10" />
        </div>
        <h1 className="text-5xl md:text-[7rem] font-black tracking-tighter leading-[0.8] uppercase">
          VERIFY<br />RESULTS
        </h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-16">
          <Loader2 className="w-8 h-8 animate-spin text-swiss-fg/40" />
        </div>
      ) : completedReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 border-4 border-swiss-fg text-center">
          <AlertCircle className="w-8 h-8 text-swiss-fg/20 mb-4" />
          <p className="text-[10px] font-black tracking-widest uppercase text-swiss-fg/40">NO REPORTS AWAITING VERIFICATION</p>
          <p className="text-[10px] font-bold text-swiss-fg/30 mt-2">COMPLETED REPORTS WILL APPEAR HERE FOR COMMUNITY REVIEW</p>
        </div>
      ) : (
        /* Main Verification Interface */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Pending List */}
          <div className="lg:col-span-4 border-4 border-swiss-fg flex flex-col bg-swiss-bg">
            <div className="p-6 border-b-4 border-swiss-fg bg-swiss-fg text-swiss-bg text-[10px] font-black tracking-widest uppercase">
              WAITING QUEUE ({completedReports.length.toString().padStart(2, "0")})
            </div>
            <div className="flex-1 overflow-y-auto max-h-[600px]">
              {completedReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => selectReport(report)}
                  className={`p-8 border-b-4 border-swiss-fg last:border-b-0 cursor-pointer transition-all hover:bg-swiss-red group ${
                    selectedReport?.id === report.id ? "bg-swiss-muted" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`text-[10px] font-black tracking-widest uppercase group-hover:text-swiss-bg ${
                        selectedReport?.id === report.id ? "text-swiss-red" : "text-swiss-fg/40"
                      }`}
                    >
                      {selectedReport?.id === report.id ? "SELECTED" : report.id.substring(0, 8)}
                    </span>
                    <span className="text-[8px] font-bold text-swiss-fg/40 group-hover:text-swiss-bg/40">
                      {timeAgo(report.createdAt)}
                    </span>
                  </div>
                  <h4 className="text-xl font-black tracking-tighter uppercase leading-tight group-hover:text-swiss-bg mb-4">
                    {report.title}
                  </h4>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black tracking-widest uppercase text-swiss-fg/60 group-hover:text-swiss-bg/60">
                      LOCATION: {report.location}
                    </p>
                    <p className="text-[8px] font-black tracking-widest uppercase text-swiss-red group-hover:text-swiss-bg">
                      STATUS: {report.status.replace(/_/g, " ").toUpperCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed View */}
          <div className="lg:col-span-8 space-y-12">
            {selectedReport && (
              <>
                {/* Report Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-4 border-swiss-fg relative group">
                    <div className="p-4 border-b-4 border-swiss-fg bg-swiss-muted text-[10px] font-black tracking-widest uppercase">
                      REPORT DETAILS
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <p className="text-[8px] font-black tracking-widest text-swiss-fg/40 uppercase mb-1">CATEGORY</p>
                        <p className="text-sm font-black uppercase">{selectedReport.category}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black tracking-widest text-swiss-fg/40 uppercase mb-1">DESCRIPTION</p>
                        <p className="text-xs font-bold leading-relaxed">{selectedReport.description}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black tracking-widest text-swiss-fg/40 uppercase mb-1">URGENCY</p>
                        <p className="text-sm font-black uppercase">{selectedReport.urgency}</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-4 border-swiss-fg relative group">
                    <div className="p-4 border-b-4 border-swiss-fg bg-swiss-muted text-[10px] font-black tracking-widest uppercase">
                      EVIDENCE ({selectedReport.images?.length || 0})
                    </div>
                    <div className="h-64 bg-swiss-muted flex items-center justify-center swiss-grid-pattern">
                      {selectedReport.images && selectedReport.images.length > 0 ? (
                        <img src={selectedReport.images[0]} alt="Evidence" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-swiss-fg/20" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Voting Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-4 border-swiss-fg p-6 text-center">
                    <p className="text-[8px] font-black tracking-widest text-swiss-fg/40 uppercase mb-2">APPROVED</p>
                    <p className="text-4xl font-black text-green-600">{approvedCount}</p>
                  </div>
                  <div className="border-4 border-swiss-fg p-6 text-center">
                    <p className="text-[8px] font-black tracking-widest text-swiss-fg/40 uppercase mb-2">REJECTED</p>
                    <p className="text-4xl font-black text-swiss-red">{rejectedCount}</p>
                  </div>
                </div>

                {/* Verification Actions */}
                <div className="border-4 border-swiss-fg p-12 bg-swiss-bg relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 swiss-dots opacity-20 pointer-events-none" />
                  
                  <div className="max-w-2xl space-y-8 relative z-10">
                    <h3 className="text-4xl font-black tracking-tighter uppercase">VERDICT</h3>

                    {feedback && (
                      <div className={`p-4 border-l-4 ${feedback.type === "success" ? "border-green-500 bg-green-50" : "border-swiss-red bg-red-50"}`}>
                        <p className="text-[10px] font-black tracking-widest uppercase">
                          {feedback.message}
                        </p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <label className="text-[10px] font-black tracking-widest uppercase">REMARKS (OPTIONAL)</label>
                      <textarea
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        className="w-full h-32 p-6 border-4 border-swiss-fg bg-swiss-muted focus:outline-none focus:bg-white focus:border-swiss-red font-bold text-sm tracking-tight transition-all"
                        placeholder="ADD ANY ADDITIONAL OBSERVATIONS..."
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        disabled={isSubmitting}
                        onClick={() => handleVote("approved")}
                        className="flex-1 py-6 bg-swiss-fg text-swiss-bg font-black tracking-widest uppercase hover:bg-green-600 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        {isSubmitting ? "SUBMITTING…" : "APPROVE RESOLUTION"}
                      </button>
                      <button
                        disabled={isSubmitting}
                        onClick={() => handleVote("rejected")}
                        className="flex-1 py-6 border-4 border-swiss-fg font-black tracking-widest uppercase hover:bg-swiss-red hover:text-swiss-bg hover:border-swiss-red transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        <XCircle className="w-5 h-5" />
                        {isSubmitting ? "SUBMITTING…" : "REJECT & REOPEN"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Verification Timeline */}
                {verifications.length > 0 && (
                  <div className="border-4 border-swiss-fg p-8 bg-swiss-muted swiss-grid-pattern">
                    <p className="text-[10px] font-black tracking-widest uppercase mb-8">VERIFICATION LOG ({verifications.length})</p>
                    <div className="space-y-8">
                      {verifications.map((v) => (
                        <div key={v.id} className="flex gap-8 items-start">
                          <span className="text-[8px] font-black tracking-widest text-swiss-fg/40 pt-1 shrink-0">
                            {new Date(v.createdAt).toLocaleString()}
                          </span>
                          <div className="flex-1 pb-4 border-b-2 border-swiss-fg/10">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-2 h-2 ${v.vote === "approved" ? "bg-green-500" : "bg-swiss-red"}`} />
                              <p className="text-[10px] font-black tracking-widest uppercase">
                                {v.vote === "approved" ? "APPROVED" : "REJECTED"}
                              </p>
                            </div>
                            {v.comment && (
                              <p className="text-[10px] font-bold text-swiss-fg/60 mt-1">{v.comment}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
