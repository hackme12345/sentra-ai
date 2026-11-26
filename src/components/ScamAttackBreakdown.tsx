import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Banknote,
  ClockAlert,
  Gift,
  KeyRound,
  Layers,
  ShieldCheck,
  UserX,
} from 'lucide-react';
import type { AttackTechnique, AttackTechniqueId } from '../../shared/types';

interface ScamAttackBreakdownProps {
  techniques: AttackTechnique[];
}

const TECHNIQUE_ICONS: Record<AttackTechniqueId, typeof ClockAlert> = {
  urgency: ClockAlert,
  financial_manipulation: Banknote,
  impersonation: UserX,
  credential_harvesting: KeyRound,
  deceptive_promises: Gift,
};

const SEVERITY_META: Record<
  AttackTechnique['severity'],
  { statusText: string; textColor: string; activeBorder: string; accentBg: string }
> = {
  high: {
    statusText: 'High Signal',
    textColor: 'text-[#F87171]',
    activeBorder: 'border-[#F87171]/60 bg-[#F87171]/10',
    accentBg: 'bg-[#F87171]/12 text-[#F87171] border-[#F87171]/30',
  },
  medium: {
    statusText: 'Moderate Signal',
    textColor: 'text-[#FBBF24]',
    activeBorder: 'border-[#FBBF24]/55 bg-[#FBBF24]/10',
    accentBg: 'bg-[#FBBF24]/12 text-[#FBBF24] border-[#FBBF24]/30',
  },
  low: {
    statusText: 'Mild Signal',
    textColor: 'text-[#22D3EE]',
    activeBorder: 'border-[#22D3EE]/55 bg-[#22D3EE]/10',
    accentBg: 'bg-[#22D3EE]/12 text-[#22D3EE] border-[#22D3EE]/30',
  },
  none: {
    statusText: 'Not Observed',
    textColor: 'text-slate-400',
    activeBorder: 'border-slate-700 bg-slate-800/40',
    accentBg: 'bg-slate-800/70 text-slate-400 border-slate-700/80',
  },
};

export function ScamAttackBreakdown({ techniques }: ScamAttackBreakdownProps) {
  const firstDetected = techniques.find((t) => t.detected)?.technique ?? techniques[0]?.technique;
  const [selectedId, setSelectedId] = useState<AttackTechniqueId | undefined>(firstDetected);

  if (techniques.length === 0) return null;

  const detectedCount = techniques.filter((t) => t.detected).length;
  const activeTechnique =
    techniques.find((t) => t.technique === selectedId) ?? techniques[0];

  return (
    <section className="rounded-2xl border border-slate-800/90 sentra-glass p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#22D3EE] shrink-0" aria-hidden="true" />
            <span>Scam Attack Breakdown</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Select any attack technique below to inspect evidence-based reasoning.
          </p>
        </div>

        <span className="text-xs font-mono tabular-nums text-slate-300 shrink-0">
          {detectedCount} of {techniques.length} tactics detected
        </span>
      </div>

      {/* 5 Interactive Technique Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {techniques.map((item) => {
          const Icon = TECHNIQUE_ICONS[item.technique];
          const meta = SEVERITY_META[item.detected ? item.severity : 'none'];
          const isSelected = activeTechnique.technique === item.technique;

          return (
            <motion.button
              key={item.technique}
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985 }}
              transition={{ duration: 0.14 }}
              onClick={() => setSelectedId(item.technique)}
              aria-pressed={isSelected}
              className={`rounded-xl border p-4 text-left flex flex-col justify-between gap-3 transition-colors duration-150 cursor-pointer ${
                isSelected
                  ? meta.activeBorder
                  : item.detected
                    ? 'border-slate-700/90 bg-[#08101F]/90 hover:border-slate-600'
                    : 'border-slate-800/80 bg-[#050912]/65 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${meta.accentBg}`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </div>
                <span className={`text-[11px] font-semibold ${meta.textColor}`}>
                  {meta.statusText}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#F8FAFC] leading-snug">
                  {item.label}
                </p>
                <p className="text-[11px] font-mono tabular-nums text-slate-400">
                  {item.detected
                    ? `${item.evidence.length} ${item.evidence.length === 1 ? 'citation' : 'citations'}`
                    : 'No cues found'}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Evidence-Based Reasoning Panel for Selected Technique */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTechnique.technique}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl border border-slate-800 bg-[#060C18]/95 p-5 space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-base font-semibold text-[#F8FAFC] flex items-center gap-2">
              {(() => {
                const SelectedIcon = TECHNIQUE_ICONS[activeTechnique.technique];
                return (
                  <SelectedIcon
                    className={`w-4 h-4 shrink-0 ${
                      SEVERITY_META[activeTechnique.detected ? activeTechnique.severity : 'none']
                        .textColor
                    }`}
                    aria-hidden="true"
                  />
                );
              })()}
              <span>{activeTechnique.label}</span>
            </h4>
            <span
              className={`text-xs font-semibold ${
                SEVERITY_META[activeTechnique.detected ? activeTechnique.severity : 'none']
                  .textColor
              }`}
            >
              {activeTechnique.detected
                ? `Detected · ${SEVERITY_META[activeTechnique.severity].statusText}`
                : 'Not Observed in Submission'}
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">{activeTechnique.reasoning}</p>

          {activeTechnique.detected && activeTechnique.evidence.length > 0 ? (
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="block text-xs font-medium text-slate-400">
                Observed Evidence Supporting This Assessment
              </span>
              <ul className="space-y-1.5">
                {activeTechnique.evidence.map((snippet, idx) => (
                  <li
                    key={`${activeTechnique.technique}-ev-${idx}`}
                    className="rounded-lg bg-[#050912] border border-slate-800/90 px-3 py-2 font-mono text-xs sm:text-sm text-slate-200 break-words"
                  >
                    “{snippet}”
                  </li>
                ))}
              </ul>
            </div>
          ) : !activeTechnique.detected ? (
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-[#34D399] shrink-0" aria-hidden="true" />
              <span>
                No direct indicators of {activeTechnique.label.toLowerCase()} were identified in the
                submitted item.
              </span>
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
