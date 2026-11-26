import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  FileDown,
  Info,
  Lock,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import type { AnalysisResult, IndicatorSeverity } from '../../shared/types';
import { downloadSecurityPdfReport } from '../utils/pdfReportGenerator';
import { downloadTextReport, formatAnalysisReportText } from '../utils/reportFormatter';
import { EvidenceHighlighter } from './EvidenceHighlighter';
import { RiskGauge } from './RiskGauge';
import { ScamAttackBreakdown } from './ScamAttackBreakdown';
import { SmartActionPlan } from './SmartActionPlan';

interface AnalysisResultViewProps {
  result: AnalysisResult;
  onScanAnother: () => void;
}

const SEVERITY_TEXT_COLOR: Record<IndicatorSeverity, string> = {
  high: 'text-[#F87171]',
  medium: 'text-[#FBBF24]',
  low: 'text-[#22D3EE]',
};

const SEVERITY_LABELS: Record<IndicatorSeverity, string> = {
  low: 'Low signal',
  medium: 'Moderate signal',
  high: 'Strong signal',
};

export function AnalysisResultView({ result, onScanAnother }: AnalysisResultViewProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    result.warningSigns.forEach((ws, idx) => {
      initial[`${ws.id}-${idx}`] = idx < 2;
    });
    return initial;
  });

  const [copied, setCopied] = useState(false);
  const [pdfDownloadedRef, setPdfDownloadedRef] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const toggleCard = (key: string) => {
    setExpandedIds((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyReport = async () => {
    const text = formatAnalysisReportText(result);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    }
  };

  const handleDownloadPdf = () => {
    try {
      setPdfError(null);
      const { reportReference } = downloadSecurityPdfReport(result);
      setPdfDownloadedRef(reportReference);
      window.setTimeout(() => setPdfDownloadedRef(null), 3500);
    } catch {
      setPdfError('Could not generate the PDF report in this browser. Please try downloading the .txt report.');
    }
  };

  const handleDownload = () => {
    downloadTextReport(result);
  };

  // Determine grounded text for Evidence Intelligence highlighting
  const highlightSourceText =
    result.scanType === 'screenshot'
      ? result.extractedTextPreview
      : result.scanType === 'url'
        ? result.structuralUrlAnalysis?.defangedUrl ?? result.submittedText
        : result.submittedText;

  const highlightHeading =
    result.scanType === 'screenshot'
      ? 'Evidence Intelligence — Extracted Screenshot Text'
      : result.scanType === 'url'
        ? 'Evidence Intelligence — Defanged URL Inspection'
        : 'Evidence Intelligence — Submitted Content Analysis';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
      aria-live="polite"
    >
      {/* Demo sample or Privacy Shield status notices */}
      {result.isDemoSample && (
        <div className="rounded-xl border border-[#6366F1]/35 bg-[#6366F1]/10 px-4 py-3 text-sm text-slate-200 flex items-center gap-2.5">
          <Info className="w-4 h-4 text-[#22D3EE] shrink-0" aria-hidden="true" />
          <span>
            Fictional Demo Sample — Analyzed live via Gemini AI
            {result.demoLabel ? ` — ${result.demoLabel}` : ''}
          </span>
        </div>
      )}

      {result.privacyRedacted && (
        <div className="rounded-xl border border-[#34D399]/30 bg-[#34D399]/8 px-4 py-3 text-xs sm:text-sm text-slate-200 flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-[#34D399] shrink-0" aria-hidden="true" />
          <span>
            Privacy Shield Active — Sensitive details were redacted locally in your browser before
            analysis, and no submitted data is stored by default.
          </span>
        </div>
      )}

      {/* Top Overview Panel: Risk Gauge + Summary + Actions */}
      <section className="rounded-2xl border border-slate-800/90 sentra-glass p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
          <div className="w-full lg:w-64 shrink-0 flex flex-col items-center lg:border-r lg:border-slate-800/80 lg:pr-8">
            <RiskGauge score={result.heuristicRiskIndex} riskLevel={result.riskLevel} />
          </div>

          <div className="flex-1 min-w-0 space-y-5 w-full">
            <div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                <span>Potential Category</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#22D3EE] font-medium">{result.potentialScamCategory}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {new Date(result.analyzedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <h2 className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight text-[#F8FAFC]">
                Analysis Summary
              </h2>
              <p className="mt-2.5 text-sm sm:text-base text-slate-200 leading-relaxed">
                {result.summary}
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-2.5 pt-4 border-t border-slate-800/80">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#22D3EE] text-[#050912] text-sm font-semibold hover:bg-[#38BDF8] active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {pdfDownloadedRef ? (
                    <>
                      <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>PDF Downloaded</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Download PDF Report</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#050912]/80 border border-slate-700/90 text-sm font-medium text-[#F8FAFC] hover:border-[#22D3EE] hover:text-[#22D3EE] active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-[#34D399]" aria-hidden="true" />
                      <span className="text-[#34D399]">Report Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" aria-hidden="true" />
                      <span>Copy Report</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#050912]/80 border border-slate-700/90 text-sm font-medium text-[#F8FAFC] hover:border-[#22D3EE] hover:text-[#22D3EE] active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span>Download (.txt)</span>
                </button>

                <button
                  type="button"
                  onClick={onScanAnother}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#050912]/80 border border-slate-700/90 text-sm font-medium text-slate-200 hover:border-slate-500 hover:text-[#F8FAFC] active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  <span>Scan Another Item</span>
                </button>
              </div>

              {pdfDownloadedRef && (
                <p className="text-xs text-[#34D399] flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>
                    Saved A4 PDF assessment (<span className="font-mono">{pdfDownloadedRef}</span>)
                    — original unredacted content excluded by default.
                  </span>
                </p>
              )}

              {pdfError && (
                <p className="text-xs text-[#F87171]" role="alert">
                  {pdfError}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Low Risk / Uncertainty Disclosure */}
      <section className="rounded-xl border border-slate-800/80 bg-[#0A1221]/85 p-5 space-y-2">
        <h3 className="text-sm font-semibold text-[#F8FAFC] flex items-center gap-2">
          <Info className="w-4 h-4 text-[#22D3EE] shrink-0" aria-hidden="true" />
          <span>Uncertainty & Safety Disclosure</span>
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">{result.uncertaintyNotice}</p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Important: A Low-risk assessment does not prove this content is safe or authentic. Always
          verify financial, account, or employment requests through official channels.
        </p>
      </section>

      {/* Evidence Intelligence: Interactive Inline Phrase Highlighter */}
      {highlightSourceText && (
        <EvidenceHighlighter
          sourceText={highlightSourceText}
          phrases={result.highlightedPhrases}
          title={highlightHeading}
          privacyRedacted={result.privacyRedacted}
        />
      )}

      {/* Scam Attack Breakdown: 5 Interactive Visual Cards */}
      <ScamAttackBreakdown techniques={result.attackBreakdown} />

      {/* Optional Structural URL Analysis section */}
      {result.structuralUrlAnalysis && (
        <section className="rounded-2xl border border-slate-800/90 sentra-glass p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-[#F8FAFC]">
              Local URL Structural Breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Structural analysis inspects only the URL text itself. It does not visit the website
              or check live threat/reputation databases.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#050912]/90 border border-slate-800">
            <span className="block text-xs text-slate-400 mb-1">
              Defanged (Non-Clickable)
            </span>
            <code className="text-xs sm:text-sm font-mono text-[#22D3EE] break-all select-all">
              {result.structuralUrlAnalysis.defangedUrl}
            </code>
          </div>

          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm pt-1">
            <div>
              <dt className="text-xs text-slate-400">Scheme</dt>
              <dd className="font-mono text-[#F8FAFC] mt-0.5">
                {result.structuralUrlAnalysis.scheme}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Hostname</dt>
              <dd className="font-mono text-[#F8FAFC] mt-0.5 break-all">
                {result.structuralUrlAnalysis.hostname || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Subdomains</dt>
              <dd className="font-mono tabular-nums text-[#F8FAFC] mt-0.5">
                {result.structuralUrlAnalysis.subdomainCount}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Query Parameters</dt>
              <dd className="font-mono tabular-nums text-[#F8FAFC] mt-0.5">
                {result.structuralUrlAnalysis.queryParamCount}
              </dd>
            </div>
          </dl>

          {result.structuralUrlAnalysis.structuralNotes.length > 0 && (
            <ul className="space-y-1.5 border-t border-slate-800/80 pt-4 text-sm text-slate-300">
              {result.structuralUrlAnalysis.structuralNotes.map((note, idx) => (
                <li key={`${idx}-${note}`} className="flex items-start gap-2.5">
                  <span className="text-[#22D3EE]" aria-hidden="true">
                    –
                  </span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Expandable Evidence Cards */}
      <section className="rounded-2xl border border-slate-800/90 sentra-glass p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#22D3EE] shrink-0" aria-hidden="true" />
            <span>Detected Warning Signs & Evidence</span>
          </h3>
          <span className="text-xs font-mono tabular-nums text-slate-400">
            {result.warningSigns.length} {result.warningSigns.length === 1 ? 'signal' : 'signals'}
          </span>
        </div>

        {result.warningSigns.length === 0 ? (
          <p className="text-sm text-slate-300 py-2">
            No strong scam warning signs were detected in the submitted content.
          </p>
        ) : (
          <div className="divide-y divide-slate-800/80 border-t border-slate-800/80">
            {result.warningSigns.map((ws, idx) => {
              const cardKey = `${ws.id}-${idx}`;
              const isOpen = Boolean(expandedIds[cardKey]);

              return (
                <div key={cardKey} className="py-4 first:pt-4 last:pb-0">
                  <button
                    type="button"
                    onClick={() => toggleCard(cardKey)}
                    aria-expanded={isOpen}
                    className="w-full flex items-start justify-between gap-4 text-left group cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-x-2 text-xs">
                        <span className={`font-semibold ${SEVERITY_TEXT_COLOR[ws.severity]}`}>
                          {SEVERITY_LABELS[ws.severity]}
                        </span>
                        <span className="text-slate-600" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-slate-400 font-mono tabular-nums">
                          #{String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <h4 className="text-base font-medium text-[#F8FAFC] group-hover:text-[#22D3EE] transition-colors">
                        {ws.title}
                      </h4>
                    </div>

                    <span className="mt-1 text-slate-400 group-hover:text-[#F8FAFC] shrink-0 transition-transform duration-150">
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="w-5 h-5" aria-hidden="true" />
                      )}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-3 space-y-3 pl-0 sm:pl-1"
                      >
                        <div className="rounded-xl bg-[#050912]/90 border border-slate-800 p-3.5">
                          <span className="block text-xs text-slate-400 mb-1">
                            Evidence from Submitted Content
                          </span>
                          <p className="font-mono text-xs sm:text-sm text-slate-200 break-words">
                            “{ws.evidence}”
                          </p>
                        </div>

                        <div>
                          <span className="block text-xs text-slate-400 mb-1">
                            Why This Matters
                          </span>
                          <p className="text-sm text-slate-300 leading-relaxed">{ws.explanation}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Transparent Scoring Rubric Breakdown */}
      <section className="rounded-2xl border border-slate-800/90 sentra-glass p-6 space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-[#F8FAFC]">Transparent Scoring Rubric</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            How the 0–100 heuristic index was computed from four observed dimensions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {result.rubricBreakdown.map((item, idx) => {
            const pct = Math.min(100, Math.round((item.score / item.maxScore) * 100));
            const barColor =
              pct >= 65
                ? 'from-[#EF4444] to-[#FB7185]'
                : pct >= 35
                  ? 'from-[#F59E0B] to-[#FBBF24]'
                  : 'from-[#10B981] to-[#22D3EE]';

            return (
              <div key={`${idx}-${item.factor}`} className="space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-[#F8FAFC]">{item.factor}</span>
                  <span className="font-mono tabular-nums text-xs text-slate-300 shrink-0">
                    {item.score} / {item.maxScore}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#050912] border border-slate-800/80 overflow-hidden">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: pct / 100 }}
                    transition={{ duration: 0.45, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    style={{ transformOrigin: 'left' }}
                    className={`h-full w-full rounded-full bg-gradient-to-r ${barColor}`}
                  />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.rationale}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Smart Action Plan: Immediate Safety, Verification, Reporting, Recovery */}
      <SmartActionPlan actionPlan={result.actionPlan} riskLevel={result.riskLevel} />

      {/* Missing Information */}
      {result.missingInformation.length > 0 && (
        <section className="rounded-2xl border border-slate-800/90 sentra-glass p-6 space-y-3">
          <h3 className="text-base font-semibold text-[#F8FAFC]">
            Missing Information & Verification Gaps
          </h3>
          <ul className="space-y-2 text-sm text-slate-300 leading-relaxed">
            {result.missingInformation.map((item, idx) => (
              <li key={`${idx}-${item}`} className="flex items-start gap-2.5">
                <span className="text-slate-500 mt-0.5" aria-hidden="true">
                  –
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </motion.div>
  );
}
