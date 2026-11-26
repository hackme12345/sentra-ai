import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CheckCircle2,
  Flag,
  LifeBuoy,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import type { RiskLevel, SmartActionPlan as SmartActionPlanType } from '../../shared/types';

interface SmartActionPlanProps {
  actionPlan: SmartActionPlanType;
  riskLevel: RiskLevel;
}

type PlanTabId = 'immediate' | 'verify' | 'report' | 'recovery';

const TABS: Array<{
  id: PlanTabId;
  label: string;
  shortLabel: string;
  icon: typeof ShieldCheck;
  accentText: string;
  description: string;
}> = [
  {
    id: 'immediate',
    label: 'Immediate Safety',
    shortLabel: 'Immediate',
    icon: ShieldCheck,
    accentText: 'text-[#34D399]',
    description: 'Take these protective steps immediately before replying or clicking anything.',
  },
  {
    id: 'verify',
    label: 'Independent Verification',
    shortLabel: 'Verify',
    icon: UserCheck,
    accentText: 'text-[#22D3EE]',
    description: 'Confirm legitimacy only through official channels you look up independently.',
  },
  {
    id: 'report',
    label: 'Fraud Reporting',
    shortLabel: 'Report',
    icon: Flag,
    accentText: 'text-[#FBBF24]',
    description: 'Report suspected phishing or fraud to help protect yourself and other targets.',
  },
  {
    id: 'recovery',
    label: 'Already Shared Money or Info?',
    shortLabel: 'Recovery',
    icon: LifeBuoy,
    accentText: 'text-[#F87171]',
    description:
      'Follow these containment and recovery steps right away if you paid, clicked, or shared credentials.',
  },
];

export function SmartActionPlan({ actionPlan, riskLevel }: SmartActionPlanProps) {
  const [activeTab, setActiveTab] = useState<PlanTabId>('immediate');
  const [showAll, setShowAll] = useState(false);

  const itemsByTab: Record<PlanTabId, string[]> = {
    immediate: actionPlan.immediateActions,
    verify: actionPlan.verificationSteps,
    report: actionPlan.reportingGuidance,
    recovery: actionPlan.recoverySteps,
  };

  const currentTabMeta = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  const renderChecklist = (tabId: PlanTabId) => {
    const meta = TABS.find((t) => t.id === tabId) ?? TABS[0];
    const items = itemsByTab[tabId];

    return (
      <ol className="space-y-3 text-sm text-slate-200 leading-relaxed">
        {items.map((step, idx) => (
          <li
            key={`${tabId}-${idx}-${step}`}
            className="flex items-start gap-3 rounded-xl bg-[#050912]/80 border border-slate-800/80 px-4 py-3"
          >
            <span
              className={`font-mono tabular-nums text-xs font-semibold mt-0.5 shrink-0 ${meta.accentText}`}
            >
              {String(idx + 1).padStart(2, '0')}.
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    );
  };

  return (
    <section className="rounded-2xl border border-slate-800/90 sentra-glass p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#34D399] shrink-0" aria-hidden="true" />
            <span>Smart Action Plan</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Tailored safety recommendations, independent verification, fraud reporting, and rapid
            recovery guidance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAll((prev) => !prev)}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg border border-slate-700/90 bg-[#050912]/80 text-xs font-medium text-slate-300 hover:border-[#22D3EE]/70 hover:text-[#22D3EE] transition-colors whitespace-nowrap cursor-pointer"
        >
          {showAll ? 'Switch to Tabbed View' : 'View All 4 Sections'}
        </button>
      </div>

      {!showAll ? (
        <>
          {/* Segmented Tab Bar */}
          <div
            role="tablist"
            aria-label="Smart Action Plan categories"
            className="grid grid-cols-2 lg:grid-cols-4 gap-2 p-1.5 rounded-xl bg-[#050912]/90 border border-slate-800"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? 'text-[#F8FAFC]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="smartActionActiveTab"
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0 rounded-lg bg-[#121E33] border border-slate-700/90"
                      aria-hidden="true"
                    />
                  )}
                  <Icon
                    className={`relative z-10 w-4 h-4 shrink-0 ${active ? tab.accentText : 'text-slate-500'}`}
                    aria-hidden="true"
                  />
                  <span className="relative z-10 truncate hidden sm:inline">{tab.label}</span>
                  <span className="relative z-10 truncate sm:hidden">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              role="tabpanel"
              className="space-y-3"
            >
              <p className="text-xs sm:text-sm text-slate-300">{currentTabMeta.description}</p>
              {renderChecklist(activeTab)}
            </motion.div>
          </AnimatePresence>

          {/* Direct Recovery Callout Prompt on Medium/High Risk if not already on Recovery tab */}
          {activeTab !== 'recovery' && (riskLevel === 'High' || riskLevel === 'Medium') && (
            <div className="rounded-xl border border-[#F87171]/30 bg-[#F87171]/8 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                <LifeBuoy className="w-4 h-4 text-[#F87171] shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Already sent money, clicked a link, or shared an OTP or personal ID?
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('recovery')}
                className="px-3.5 py-1.5 rounded-lg bg-[#050912] border border-[#F87171]/50 text-xs font-semibold text-[#F87171] hover:bg-[#F87171]/15 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Open Recovery Steps
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <div key={tab.id} className="space-y-3">
                <h4 className="text-sm font-semibold text-[#F8FAFC] flex items-center gap-2">
                  <Icon className={`w-4 h-4 shrink-0 ${tab.accentText}`} aria-hidden="true" />
                  <span>{tab.label}</span>
                </h4>
                {renderChecklist(tab.id)}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
