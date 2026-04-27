"use client";

import { useState } from "react";
import { Upload, CheckCircle2, AlertTriangle, Loader2, Image as ImageIcon, Bot } from "lucide-react";

interface CompletionVerificationProps {
  reportId: string;
  beforeImageUrl?: string;
  isAuthority: boolean; // true if user is NGO or Govt
  onSubmitAfterImage: (file: File) => Promise<{
    completion_score: number;
    verdict: string;
    is_fake_image: boolean;
    confidence: number;
  }>;
  existingResult?: {
    completion_score: number;
    verdict: string;
    is_fake_image: boolean;
    confidence: number;
    after_image_url?: string;
  };
}

export default function CompletionVerification({
  reportId,
  beforeImageUrl,
  isAuthority,
  onSubmitAfterImage,
  existingResult,
}: CompletionVerificationProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(existingResult?.after_image_url || null);
  const [result, setResult] = useState(existingResult || null);

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 55) return "text-lime-400";
    if (score >= 30) return "text-amber-400";
    return "text-red-400";
  };

  const scoreBarColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 55) return "bg-lime-500";
    if (score >= 30) return "bg-amber-500";
    return "bg-red-500";
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const analysisResult = await onSubmitAfterImage(file);
      setResult(analysisResult);
    } catch (e) {
      console.error("Upload failed:", e);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Bot className="w-5 h-5 text-purple-400" />
        <h3 className="font-semibold text-white">AI Work Verification</h3>
      </div>

      {/* Before / After comparison */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <p className="text-xs text-slate-400 font-medium">BEFORE</p>
          <div className="h-32 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
            {beforeImageUrl ? (
              <img src={beforeImageUrl} alt="Before" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-8 h-8 text-slate-600" />
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs text-slate-400 font-medium">AFTER</p>
          {preview ? (
            <div className="h-32 rounded-xl overflow-hidden bg-white/5 border border-white/10 relative">
              <img src={preview} alt="After" className="w-full h-full object-cover" />
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
          ) : (
            <div
              className={`h-32 rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer ${
                dragging
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-white/20 hover:border-purple-500/50 hover:bg-purple-500/5"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById(`after-file-${reportId}`)?.click()}
            >
              <Upload className="w-5 h-5 text-slate-400" />
              <span className="text-xs text-slate-500">
                {isAuthority ? "Upload proof" : "Awaiting proof"}
              </span>
              {isAuthority && (
                <input
                  id={`after-file-${reportId}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Analysis Result */}
      {result && (
        <div className="space-y-4">
          {result.is_fake_image && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">AI detected this image may not be authentic</p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">AI Completion Score</span>
              <span className={`text-2xl font-bold ${scoreColor(result.completion_score)}`}>
                {result.completion_score}%
              </span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${scoreBarColor(result.completion_score)}`}
                style={{ width: `${result.completion_score}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
            <div>
              <p className="text-xs text-slate-400">AI Verdict</p>
              <p className={`text-lg font-semibold ${scoreColor(result.completion_score)}`}>
                {result.verdict}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Confidence</p>
              <p className="text-sm font-medium text-white">
                {Math.round(result.confidence * 100)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {!result && !uploading && (
        <p className="text-center text-xs text-slate-500">
          Once the authority uploads a proof image, AI will automatically analyze whether the work was completed.
        </p>
      )}
    </div>
  );
}
