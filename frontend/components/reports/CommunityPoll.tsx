"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Users, Loader2, ShieldCheck } from "lucide-react";

interface CommunityPollProps {
  reportId: string;
  pollYes: number;
  pollNo: number;
  userVote?: "yes" | "no" | null;
  aiScore?: number;    // 0-100, from CLIP image verification
  aiVerdict?: string; // "Completed" | "Mostly Done" | "Partially Done" | "Not Done"
  aiConfidence?: number;
  onVote: (vote: "yes" | "no") => Promise<void>;
}

export default function CommunityPoll({
  reportId,
  pollYes,
  pollNo,
  userVote,
  aiScore,
  aiVerdict,
  aiConfidence,
  onVote,
}: CommunityPollProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [localVote, setLocalVote] = useState<"yes" | "no" | null>(userVote || null);
  const [localYes, setLocalYes] = useState(pollYes);
  const [localNo, setLocalNo] = useState(pollNo);

  const total = localYes + localNo || 1;
  const yesPercent = Math.round((localYes / total) * 100);
  const noPercent = 100 - yesPercent;

  // Combined verdict: 60% AI + 40% community
  const communityScore = Math.round((localYes / total) * 100);
  const finalScore =
    aiScore !== undefined
      ? Math.round(0.6 * aiScore + 0.4 * communityScore)
      : communityScore;

  const getFinalVerdict = () => {
    if (finalScore >= 80) return { label: "Issue Resolved", color: "text-emerald-400" };
    if (finalScore >= 55) return { label: "Mostly Resolved", color: "text-lime-400" };
    if (finalScore >= 30) return { label: "Partially Resolved", color: "text-amber-400" };
    return { label: "Not Resolved", color: "text-red-400" };
  };

  const handleVote = async (vote: "yes" | "no") => {
    if (isVoting || localVote) return;
    setIsVoting(true);
    try {
      await onVote(vote);
      if (vote === "yes") setLocalYes((v) => v + 1);
      else setLocalNo((v) => v + 1);
      setLocalVote(vote);
    } catch (e) {
      console.error("Vote failed:", e);
    } finally {
      setIsVoting(false);
    }
  };

  const verdict = getFinalVerdict();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">Community Verdict</h3>
        </div>
        <span className="text-xs text-slate-400">{localYes + localNo} votes</span>
      </div>

      {/* AI Analysis Badge */}
      {aiScore !== undefined && (
        <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
          <ShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-indigo-200">AI Image Analysis</p>
            <p className="text-xs text-indigo-400 truncate">
              {aiVerdict} · {aiConfidence ? `${Math.round(aiConfidence * 100)}% confidence` : ""}
            </p>
          </div>
          <div className="text-2xl font-bold text-indigo-300">{aiScore}%</div>
        </div>
      )}

      {/* Progress Bars */}
      <div className="space-y-2">
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>✅ Work Done</span>
            <span>{yesPercent}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${yesPercent}%` }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>❌ Not Done</span>
            <span>{noPercent}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all duration-700"
              style={{ width: `${noPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Final Combined Score */}
      <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
        <span className="text-sm text-slate-300">
          {aiScore !== undefined ? "Combined Score (AI + Community)" : "Community Score"}
        </span>
        <span className={`text-lg font-bold ${verdict.color}`}>
          {verdict.label}
        </span>
      </div>

      {/* Vote Buttons */}
      {!localVote ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleVote("yes")}
            disabled={isVoting}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 active:scale-95 disabled:opacity-50 transition-all font-medium"
          >
            {isVoting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Yes, Fixed!
          </button>
          <button
            onClick={() => handleVote("no")}
            disabled={isVoting}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 active:scale-95 disabled:opacity-50 transition-all font-medium"
          >
            {isVoting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Not Fixed
          </button>
        </div>
      ) : (
        <div
          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium ${
            localVote === "yes"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {localVote === "yes" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          You voted: {localVote === "yes" ? "Work Done!" : "Not Fixed"}
        </div>
      )}
    </div>
  );
}
