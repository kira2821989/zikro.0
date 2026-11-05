import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Lock, ShieldCheck, Zap } from 'lucide-react';
import { WatermarkSettings } from '../types';

interface WatermarkOverlayProps {
  settings: WatermarkSettings;
  clientName: string;
  isUnlocked: boolean;
  currentTime: number;
  duration: number;
}

export const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({
  settings,
  clientName,
  isUnlocked,
  currentTime,
  duration
}) => {
  // If payment is confirmed, show no watermark or a temporary clean unlocked badge
  const [showCelebration, setShowCelebration] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Position state for bouncing box mode
  const [pos, setPos] = useState({ x: 15, y: 25, vx: 0.35, vy: 0.28 });

  useEffect(() => {
    if (isUnlocked) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isUnlocked]);

  // Bouncing box animation frame for bouncing mode
  useEffect(() => {
    if (isUnlocked || settings.speed !== 'bouncing') return;

    let animId: number;
    const speedMult = 1.0;

    const animate = () => {
      setPos(prev => {
        let newX = prev.x + prev.vx * speedMult;
        let newY = prev.y + prev.vy * speedMult;
        let newVx = prev.vx;
        let newVy = prev.vy;

        // Bounce off edges (keep within 5% - 70%)
        if (newX <= 5) {
          newX = 5;
          newVx = Math.abs(prev.vx);
        } else if (newX >= 65) {
          newX = 65;
          newVx = -Math.abs(prev.vx);
        }

        if (newY <= 8) {
          newY = 8;
          newVy = Math.abs(prev.vy);
        } else if (newY >= 75) {
          newY = 75;
          newVy = -Math.abs(prev.vy);
        }

        return { x: newX, y: newY, vx: newVx, vy: newVy };
      });

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isUnlocked, settings.speed]);

  const formatSec = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${m}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  if (isUnlocked) {
    if (!showCelebration) return null;
    return (
      <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center bg-emerald-950/20 backdrop-blur-[2px] transition-all duration-700 animate-in fade-in zoom-in-95">
        <div className="bg-emerald-600/90 text-white px-5 py-3 rounded-2xl shadow-2xl shadow-emerald-500/40 border border-emerald-400/50 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-200 animate-bounce" />
          <div>
            <div className="font-bold text-sm tracking-wide flex items-center gap-1.5">
              <span>WATERMARK REMOVED</span>
              <span className="text-[10px] bg-emerald-400/30 px-1.5 py-0.5 rounded font-mono">100% UNLOCKED</span>
            </div>
            <div className="text-xs text-emerald-100">Original Clean Master File Ready for Download</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20 flex flex-col justify-between"
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* 1. Header Anti-Rip Metadata Bar */}
      <div className="w-full bg-gradient-to-b from-black/80 via-black/40 to-transparent p-3 flex items-center justify-between text-[11px] font-mono text-amber-300/90 tracking-wider">
        <div className="flex items-center gap-2 drop-shadow-md">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="bg-red-950/80 border border-red-500/50 text-red-200 px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase">
            Protected Preview
          </span>
          <span className="hidden sm:inline text-neutral-300">
            {settings.showClientTag ? `Preview for: ${clientName}` : 'EditLock Anti-Rip Engine'}
          </span>
        </div>

        {settings.showTimecode && (
          <div className="bg-black/60 backdrop-blur-sm border border-neutral-700/60 px-2.5 py-0.5 rounded text-amber-400 font-mono text-xs font-semibold shadow">
            TC {formatSec(currentTime)} / {formatSec(duration || 0)}
          </div>
        )}
      </div>

      {/* 2. Style-Specific Watermark Layer */}

      {/* Mode A: Screen Tile (Dense repetitive diagonal grid) */}
      {settings.style === 'screen-tile' && (
        <div 
          className="absolute inset-0 grid grid-cols-2 sm:grid-cols-3 gap-6 p-4 opacity-40 place-items-center"
          style={{ opacity: settings.opacity }}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <div 
              key={i} 
              className="text-center transform -rotate-25 border border-dashed border-red-500/40 p-2 rounded-lg bg-black/40 backdrop-blur-[1px]"
            >
              <div className="text-red-400 font-extrabold text-xs sm:text-sm tracking-widest uppercase">
                {settings.text}
              </div>
              <div className="text-[10px] text-neutral-300 font-mono mt-0.5">
                NO REPOSTING • PAY TO UNLOCK
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mode B: Bouncing Box (DVD Screensaver Physics - defeat AI object erasers) */}
      {settings.speed === 'bouncing' && settings.style !== 'screen-tile' && (
        <div 
          className="absolute transition-transform duration-75 ease-linear"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            opacity: settings.opacity
          }}
        >
          <div className="bg-neutral-950/85 border-2 border-amber-500/80 shadow-2xl shadow-amber-500/30 p-3 sm:p-4 rounded-xl backdrop-blur-md max-w-[280px] sm:max-w-xs transform -rotate-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1 font-bold text-xs uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{settings.text}</span>
            </div>
            <div className="text-[11px] text-neutral-200 font-medium">
              Pay via UPI to get clean 4K export without watermark
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-neutral-800 text-[10px] text-amber-300/80 font-mono flex items-center justify-between">
              <span>FOR: {clientName}</span>
              <span className="text-emerald-400 font-semibold">INSTANT UNLOCK</span>
            </div>
          </div>
        </div>
      )}

      {/* Mode C: Smooth Floating Diagonal Banner (Default) */}
      {settings.speed !== 'bouncing' && settings.style !== 'screen-tile' && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: settings.opacity }}
        >
          <div className="animate-watermark-float transform p-4 sm:p-6 bg-gradient-to-r from-red-950/85 via-neutral-950/90 to-amber-950/85 border-2 border-red-500/70 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.35)] backdrop-blur-sm text-center max-w-[90%] sm:max-w-md">
            <div className="flex items-center justify-center gap-2 text-red-400 mb-1 font-extrabold text-sm sm:text-base tracking-widest uppercase">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
              <span className="truncate">{settings.text}</span>
            </div>
            <p className="text-xs text-neutral-300 font-medium">
              Unapproved Client Preview. Direct posting to Instagram/YouTube is strictly prohibited.
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-300 text-[11px] font-mono">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>UPI Payment Removes This Instantly</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Subtle Anti-Crop Watermark Strip at Bottom */}
      <div className="w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 text-center">
        <span className="text-[10px] font-mono text-neutral-400 tracking-wider">
          PROTECTED BY EDITLOCK • DO NOT UPLOAD BEFORE SETTLING INVOICE
        </span>
      </div>
    </div>
  );
};
