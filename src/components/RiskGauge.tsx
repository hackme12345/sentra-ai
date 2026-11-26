import { useEffect, useId, useState } from 'react';
import { AlertOctagon, AlertTriangle, HelpCircle, ShieldCheck } from 'lucide-react';
import type { RiskLevel } from '../../shared/types';

interface RiskGaugeProps {
  score: number;
  riskLevel: RiskLevel;
}

const RISK_LABELS: Record<RiskLevel, string> = {
  Low: 'Low Risk',
  Medium: 'Medium Risk',
  High: 'High Risk',
  Inconclusive: 'Inconclusive',
};

const RISK_STYLES: Record<
  RiskLevel,
  {
    gradStart: string;
    gradEnd: string;
    dotColor: string;
    glowColor: string;
    text: string;
    bgSubtle: string;
    Icon: typeof ShieldCheck;
  }
> = {
  Low: {
    gradStart: '#10B981',
    gradEnd: '#22D3EE',
    dotColor: '#34D399',
    glowColor: 'rgba(52, 211, 153, 0.35)',
    text: 'text-[#34D399]',
    bgSubtle: 'bg-[#34D399]/10 border-[#34D399]/30',
    Icon: ShieldCheck,
  },
  Medium: {
    gradStart: '#F59E0B',
    gradEnd: '#FDE047',
    dotColor: '#FBBF24',
    glowColor: 'rgba(251, 191, 36, 0.32)',
    text: 'text-[#FBBF24]',
    bgSubtle: 'bg-[#FBBF24]/10 border-[#FBBF24]/30',
    Icon: AlertTriangle,
  },
  High: {
    gradStart: '#EF4444',
    gradEnd: '#FB7185',
    dotColor: '#F87171',
    glowColor: 'rgba(248, 113, 113, 0.38)',
    text: 'text-[#F87171]',
    bgSubtle: 'bg-[#F87171]/10 border-[#F87171]/30',
    Icon: AlertOctagon,
  },
  Inconclusive: {
    gradStart: '#64748B',
    gradEnd: '#94A3B8',
    dotColor: '#94A3B8',
    glowColor: 'rgba(148, 163, 184, 0.25)',
    text: 'text-slate-300',
    bgSubtle: 'bg-slate-400/10 border-slate-600/40',
    Icon: HelpCircle,
  },
};

const TICK_ANGLES = Array.from({ length: 24 }, (_, idx) => idx * 15);

export function RiskGauge({ score, riskLevel }: RiskGaugeProps) {
  const uid = useId();
  const arcGradId = `${uid}-arc`;
  const glowFilterId = `${uid}-glow`;

  const safeNumber = Number.isFinite(score) ? score : 0;
  const clamped = Math.max(0, Math.min(100, Math.round(safeNumber)));
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setDisplayScore(clamped);
      return;
    }

    let rafId = 0;
    const duration = 760;
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * clamped));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [clamped]);

  const size = 176;
  const center = size / 2;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const activeRatio = riskLevel === 'Inconclusive' ? 0.25 : displayScore / 100;
  const strokeOffset = circumference - activeRatio * circumference;

  // Compute endpoint dot coordinates along the -90deg rotated circle
  const angleRad = (activeRatio * 360 - 90) * (Math.PI / 180);
  const tipX = center + radius * Math.cos(angleRad);
  const tipY = center + radius * Math.sin(angleRad);

  const { gradStart, gradEnd, dotColor, glowColor, text, bgSubtle, Icon } =
    RISK_STYLES[riskLevel];
  const label = RISK_LABELS[riskLevel];

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative w-44 h-44 flex items-center justify-center">
        {/* Soft ambient radial halo behind gauge */}
        <div
          className="absolute inset-5 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
            opacity: 0.45,
          }}
          aria-hidden="true"
        />

        <svg
          className="w-44 h-44"
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`Heuristic Risk Index: ${clamped} out of 100, ${label}`}
        >
          <defs>
            <linearGradient id={arcGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradStart} />
              <stop offset="100%" stopColor={gradEnd} />
            </linearGradient>
            <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer precision calibration ticks */}
          <g stroke="#334155" strokeOpacity="0.65" strokeLinecap="round">
            {TICK_ANGLES.map((deg) => {
              const rad = ((deg - 90) * Math.PI) / 180;
              const isMajor = deg % 90 === 0;
              const r1 = isMajor ? 77 : 79;
              const r2 = 83;
              return (
                <line
                  key={deg}
                  x1={center + r1 * Math.cos(rad)}
                  y1={center + r1 * Math.sin(rad)}
                  x2={center + r2 * Math.cos(rad)}
                  y2={center + r2 * Math.sin(rad)}
                  strokeWidth={isMajor ? 1.5 : 1}
                />
              );
            })}
          </g>

          {/* Inner subtle hairline ring */}
          <circle
            cx={center}
            cy={center}
            r={52}
            fill="rgba(5, 9, 18, 0.55)"
            stroke="rgba(148, 163, 184, 0.1)"
            strokeWidth="1"
          />

          {/* Track circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#172236"
            strokeWidth="10"
          />

          {/* Active gradient arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#${arcGradId})`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            transform={`rotate(-90 ${center} ${center})`}
            filter={`url(#${glowFilterId})`}
            style={{ transition: 'stroke-dashoffset 120ms ease-out' }}
          />

          {/* Tip indicator dot */}
          {activeRatio > 0.02 && (
            <circle
              cx={tipX}
              cy={tipY}
              r="4.2"
              fill="#F8FAFC"
              stroke={dotColor}
              strokeWidth="2.5"
            />
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display tabular-nums text-4xl font-bold tracking-tight text-[#F8FAFC] leading-none">
            {riskLevel === 'Inconclusive' ? '—' : displayScore}
          </span>
          <span className="text-xs text-slate-400 mt-1.5 font-mono tabular-nums">/ 100</span>
        </div>
      </div>

      <div
        className={`mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-sm font-semibold ${bgSubtle} ${text}`}
      >
        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>{label}</span>
      </div>

      <p className="mt-2.5 text-xs font-medium text-slate-200">Heuristic Risk Index</p>
      <p className="mt-0.5 text-[11px] text-slate-400 max-w-[220px] leading-snug">
        Evidence-based 0–100 rubric score (not a statistical probability)
      </p>
    </div>
  );
}
