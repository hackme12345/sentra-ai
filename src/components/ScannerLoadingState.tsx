import { useEffect, useId, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { BrandIcon } from './BrandIcon';

interface ScannerLoadingStateProps {
  customTitle?: string;
}

const LOADING_STEPS = [
  'Isolating untrusted input boundaries and sanitizing payload',
  'Inspecting impersonation, urgency, and financial demand signals with Gemini AI',
  'Computing transparent 4-factor heuristic rubric and validating response schema',
];

export function ScannerLoadingState({ customTitle }: ScannerLoadingStateProps) {
  const uid = useId();
  const sweepGradId = `${uid}-sweep`;
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer1 = window.setTimeout(() => setActiveStep(1), 950);
    const timer2 = window.setTimeout(() => setActiveStep(2), 2300);
    return () => {
      window.clearTimeout(timer1);
      window.clearTimeout(timer2);
    };
  }, []);

  return (
    <div role="status" aria-live="polite" className="space-y-6">
      {/* Animated Security Scanning Visualization */}
      <section className="rounded-2xl border border-slate-800/90 sentra-glass p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-center gap-7">
          {/* Precision Radar / Shield Sweep */}
          <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
            <svg
              viewBox="0 0 128 128"
              className="w-32 h-32"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id={sweepGradId} x1="50%" y1="0%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Concentric rings */}
              <circle cx="64" cy="64" r="58" fill="rgba(5, 9, 18, 0.65)" stroke="#1E293B" strokeWidth="1" />
              <circle cx="64" cy="64" r="42" fill="none" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 4" />
              <circle cx="64" cy="64" r="26" fill="none" stroke="#1E293B" strokeWidth="1" />

              {/* Subtle crosshairs */}
              <line x1="64" y1="8" x2="64" y2="120" stroke="#1E293B" strokeOpacity="0.55" strokeWidth="1" />
              <line x1="8" y1="64" x2="120" y2="64" stroke="#1E293B" strokeOpacity="0.55" strokeWidth="1" />

              {/* Rotating electric-cyan radar sector */}
              <g className="sentra-radar-sweep">
                <path
                  d="M64 64 L64 6 A58 58 0 0 1 114.2 35 Z"
                  fill={`url(#${sweepGradId})`}
                />
                <line
                  x1="64"
                  y1="64"
                  x2="64"
                  y2="6"
                  stroke="#22D3EE"
                  strokeOpacity="0.75"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </g>
            </svg>

            {/* Centered Brand Shield */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-11 h-11 rounded-xl bg-[#050912]/90 border border-[#22D3EE]/30 flex items-center justify-center shadow-lg">
                <BrandIcon className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Real-time Analysis Pipeline Steps */}
          <div className="flex-1 w-full space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <Loader2 className="w-4 h-4 text-[#22D3EE] animate-spin shrink-0" aria-hidden="true" />
                <h3 className="text-base sm:text-lg font-semibold text-[#F8FAFC]">
                  {customTitle || 'Running live Gemini security inspection'}
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Processing in memory · Zero default storage · Results always generated in English
              </p>
            </div>

            <ol className="space-y-2.5 pt-3 border-t border-slate-800/80">
              {LOADING_STEPS.map((stepText, idx) => {
                const done = idx < activeStep;
                const current = idx === activeStep;
                return (
                  <li key={stepText} className="flex items-center gap-3 text-sm">
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-xs font-mono tabular-nums border transition-colors ${
                        done
                          ? 'bg-[#34D399]/15 border-[#34D399]/40 text-[#34D399]'
                          : current
                            ? 'bg-[#22D3EE]/15 border-[#22D3EE]/45 text-[#22D3EE]'
                            : 'bg-[#050912] border-slate-800 text-slate-500'
                      }`}
                    >
                      {done ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : idx + 1}
                    </span>
                    <span
                      className={
                        done
                          ? 'text-slate-300'
                          : current
                            ? 'text-[#F8FAFC] font-medium'
                            : 'text-slate-500'
                      }
                    >
                      {stepText}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* Structural Report Loading Skeletons (matches AnalysisResultView geometry) */}
      <section
        aria-hidden="true"
        className="rounded-2xl border border-slate-800/70 bg-[#0B1322]/75 p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
          <div className="w-44 h-44 rounded-full sentra-skeleton shrink-0" />
          <div className="flex-1 w-full space-y-4">
            <div className="h-3.5 w-48 rounded sentra-skeleton" />
            <div className="h-6 w-64 rounded sentra-skeleton" />
            <div className="space-y-2.5 pt-1">
              <div className="h-3.5 w-full rounded sentra-skeleton" />
              <div className="h-3.5 w-11/12 rounded sentra-skeleton" />
              <div className="h-3.5 w-4/5 rounded sentra-skeleton" />
            </div>
            <div className="flex flex-wrap gap-3 pt-3">
              <div className="h-10 w-32 rounded-lg sentra-skeleton" />
              <div className="h-10 w-40 rounded-lg sentra-skeleton" />
              <div className="h-10 w-36 rounded-lg sentra-skeleton" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-800/70">
          {[0, 1, 2, 3].map((slot) => (
            <div key={slot} className="space-y-2">
              <div className="flex justify-between gap-4">
                <div className="h-3.5 w-40 rounded sentra-skeleton" />
                <div className="h-3.5 w-12 rounded sentra-skeleton" />
              </div>
              <div className="h-1.5 w-full rounded-full sentra-skeleton" />
              <div className="h-3 w-5/6 rounded sentra-skeleton" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
