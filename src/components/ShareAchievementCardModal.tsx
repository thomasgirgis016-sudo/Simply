import React, { useRef, useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  Award,
  Sparkles,
  ExternalLink,
  Calendar,
  FileText
} from 'lucide-react';
import { SimplyLogo } from './SimplyLogo';

export interface ShareCardData {
  title: string;
  subtitle: string;
  paperCode: string;
  scoreText: string;
  percentage: number;
  gradeText?: string;
  metricLabel1?: string;
  metricValue1?: string;
  metricLabel2?: string;
  metricValue2?: string;
  studentName?: string;
  examDate?: string;
}

interface ShareAchievementCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShareCardData;
}

export const ShareAchievementCardModal: React.FC<ShareAchievementCardModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const shareUrl = 'https://simply-dusky.vercel.app';
  const whatsappShareText = `🎯 I scored ${data.scoreText}${data.gradeText ? ` (Grade ${data.gradeText})` : ''} on ${data.paperCode} using Simply IGCSE! Verified against official mark scheme criteria: ${shareUrl}`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(whatsappShareText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownloadPng = () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Hi-DPI Canvas Dimensions (1200x630 Social Share standard)
      canvas.width = 1200;
      canvas.height = 630;

      // 1. Background Canvas
      ctx.fillStyle = '#111113';
      ctx.fillRect(0, 0, 1200, 630);

      // Subtle Outer Framing
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, 1140, 570);

      // Header Background
      ctx.fillStyle = '#18181b';
      ctx.fillRect(32, 32, 1136, 110);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(32, 142, 1136, 2);

      // Logo / Brand
      ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('SIMPLY', 70, 96);
      ctx.fillStyle = '#FF5B37';
      ctx.fillText('IGCSE', 215, 96);

      // Category / Series Pill
      ctx.font = '500 20px monospace';
      ctx.fillStyle = '#a1a1a6';
      ctx.fillText('CAMBRIDGE & EDEXCEL EXAM ARCHIVE', 720, 96);

      // Main Card Body
      ctx.fillStyle = '#141416';
      ctx.fillRect(60, 175, 1080, 385);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.strokeRect(60, 175, 1080, 385);

      // Title & Paper Code
      ctx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(data.title, 100, 235);

      ctx.font = '600 22px monospace';
      ctx.fillStyle = '#FF5B37';
      ctx.fillText(data.paperCode, 100, 275);

      // Score / Grade Section
      ctx.fillStyle = '#18181b';
      ctx.fillRect(100, 310, 480, 210);
      ctx.strokeRect(100, 310, 480, 210);

      ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#a1a1a6';
      ctx.fillText('CANDIDATE RESULT', 130, 355);

      ctx.font = 'bold 54px monospace';
      ctx.fillStyle = '#4cc38a';
      ctx.fillText(data.scoreText, 130, 425);

      ctx.font = '600 24px monospace';
      ctx.fillStyle = '#ededed';
      ctx.fillText(`Accuracy: ${data.percentage}%`, 130, 475);

      // Grade or Secondary Metrics
      ctx.fillStyle = '#18181b';
      ctx.fillRect(620, 310, 480, 210);
      ctx.strokeRect(620, 310, 480, 210);

      ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#a1a1a6';
      ctx.fillText(data.metricLabel1 || 'OFFICIAL BENCHMARK', 650, 355);

      ctx.font = 'bold 64px monospace';
      ctx.fillStyle = '#FF5B37';
      ctx.fillText(data.gradeText ? `Grade ${data.gradeText}` : (data.metricValue1 || 'A* Standard'), 650, 435);

      ctx.font = '500 18px monospace';
      ctx.fillStyle = '#85858b';
      ctx.fillText(data.metricLabel2 && data.metricValue2 ? `${data.metricLabel2}: ${data.metricValue2}` : 'Verified Mark Scheme Breakdown', 650, 480);

      // Footer Watermark
      ctx.font = '500 18px monospace';
      ctx.fillStyle = '#85858b';
      ctx.fillText('simply-dusky.vercel.app • Verified Cambridge Past Papers', 390, 595);

      // Generate Download Link
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Simply_IGCSE_${data.paperCode.replace(/[^a-zA-Z0-9]/g, '_')}_Result.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.warn('Canvas export fallback:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#18181b] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden text-left">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] bg-[#141416]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF5B37]/10 border border-[#FF5B37]/30 flex items-center justify-center text-[#FF5B37]">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Share Achievement Card</div>
              <div className="text-[11px] text-zinc-400">Share your exam score to WhatsApp or Instagram Stories</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-[#222225] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Achievement Card Preview */}
        <div className="p-5 sm:p-6 space-y-5">
          <div
            ref={cardRef}
            className="rounded-xl border border-white/[0.08] bg-[#111113] p-5 sm:p-6 space-y-4 shadow-xl"
          >
            {/* Top Bar of Card */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <SimplyLogo size="sm" />
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-medium bg-[#141416] border border-white/[0.08] text-zinc-400">
                <Award className="w-3 h-3 text-[#FF5B37]" />
                <span>OFFICIAL CAMBRIDGE BENCHMARK</span>
              </div>
            </div>

            {/* Title & Paper */}
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white tracking-tight">{data.title}</h3>
              <div className="text-xs font-mono font-medium text-[#FF5B37]">{data.paperCode}</div>
              <div className="text-[11px] text-zinc-400">{data.subtitle}</div>
            </div>

            {/* Score & Grade Display */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-lg bg-[#18181b] border border-white/[0.08] p-3.5 space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">Candidate Score</span>
                <div className="text-2xl font-bold font-mono text-[#4cc38a] tabular-nums">{data.scoreText}</div>
                <div className="text-[11px] font-mono text-zinc-300 tabular-nums">Accuracy: {data.percentage}%</div>
              </div>

              <div className="rounded-lg bg-[#18181b] border border-white/[0.08] p-3.5 space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
                  {data.metricLabel1 || 'Awarded Grade'}
                </span>
                <div className="text-2xl font-bold font-mono text-[#FF5B37] tabular-nums">
                  {data.gradeText ? `Grade ${data.gradeText}` : (data.metricValue1 || 'A* Tier')}
                </div>
                <div className="text-[11px] font-mono text-zinc-400">
                  {data.metricLabel2 && data.metricValue2 ? `${data.metricLabel2}: ${data.metricValue2}` : 'Mark Scheme Verified'}
                </div>
              </div>
            </div>

            {/* Watermark Footer */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>simply-dusky.vercel.app</span>
              <span>Cambridge &amp; Edexcel IGCSE</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={handleDownloadPng}
              disabled={isDownloading}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-lg bg-[#FF5B37] hover:bg-[#ff6c4b] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Generating PNG...' : 'Download Card PNG'}</span>
            </button>

            <button
              onClick={handleCopyText}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-lg bg-[#222225] hover:bg-[#28282c] border border-white/[0.08] text-zinc-200 font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {copiedText ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-zinc-400" />
                  <span>Copy WhatsApp Text</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
