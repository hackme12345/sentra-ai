import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Lock, ShieldCheck, X } from 'lucide-react';
import {
  SENSITIVE_CATEGORIES,
  analyzeSensitiveContent,
  applySelectiveRedaction,
  type SensitiveCategory,
} from '../utils/sensitiveDataDetector';

interface PrivacyShieldModalProps {
  open: boolean;
  rawText: string;
  submitLabel?: string;
  onConfirmRedacted: (redactedText: string, wasRedacted: boolean) => void;
  onCancel: () => void;
}

export function PrivacyShieldModal({
  open,
  rawText,
  submitLabel = 'Confirm & Scan Redacted Version',
  onConfirmRedacted,
  onCancel,
}: PrivacyShieldModalProps) {
  const analysis = useMemo(() => analyzeSensitiveContent(rawText), [rawText]);
  const [selectedCategories, setSelectedCategories] = useState<SensitiveCategory[]>(
    analysis.categoriesFound
  );

  useEffect(() => {
    if (open) {
      setSelectedCategories(analysis.categoriesFound);
    }
  }, [open, analysis.categoriesFound]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  const preview = useMemo(
    () => applySelectiveRedaction(rawText, selectedCategories),
    [rawText, selectedCategories]
  );

  const toggleCategory = (cat: SensitiveCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((item) => item !== cat) : [...prev, cat]
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-shield-modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Modal Surface */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl border border-slate-700/90 bg-[#0A1221] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800/90 flex items-start justify-between gap-4 bg-[#070D19]">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#22D3EE]/12 border border-[#22D3EE]/30 flex items-center justify-center text-[#22D3EE] shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h2
                    id="privacy-shield-modal-title"
                    className="text-lg font-semibold text-[#F8FAFC]"
                  >
                    Privacy Shield — Pre-Scan Redaction Review
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Potentially sensitive details were detected locally in your browser. Confirm the
                    redacted preview below before sending text to Gemini AI.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onCancel}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#F8FAFC] hover:bg-slate-800/70 transition-colors cursor-pointer shrink-0"
                aria-label="Close Privacy Shield dialog"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Selective Category Toggles */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-300">
                    Detected Sensitive Categories (Click to Toggle Redaction)
                  </span>
                  <span className="text-xs font-mono tabular-nums text-[#22D3EE]">
                    {preview.redactedCount} of {analysis.items.length} masked
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {analysis.categoriesFound.map((cat) => {
                    const info = SENSITIVE_CATEGORIES[cat];
                    const count = analysis.countsByCategory[cat] ?? 0;
                    const active = selectedCategories.includes(cat);

                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        aria-pressed={active}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                          active
                            ? 'border-[#22D3EE]/50 bg-[#22D3EE]/8'
                            : 'border-slate-800 bg-[#050912]/70 hover:border-slate-700'
                        }`}
                      >
                        <span
                          className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors ${
                            active
                              ? 'bg-[#22D3EE] border-[#22D3EE] text-[#050912]'
                              : 'border-slate-600 bg-transparent'
                          }`}
                        >
                          {active && <Check className="w-3 h-3 stroke-[3]" aria-hidden="true" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-[#F8FAFC] truncate">
                              {info.label}
                            </span>
                            <span className="text-[11px] font-mono tabular-nums text-slate-400 shrink-0">
                              ×{count}
                            </span>
                          </div>
                          <span className="block text-[11px] font-mono text-slate-400 mt-0.5">
                            {info.token}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Exact Redacted Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-300">
                    Exact Payload Preview Sent to Gemini AI
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-[#34D399]">
                    <Lock className="w-3 h-3" aria-hidden="true" />
                    Zero default storage
                  </span>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#050912] p-4 max-h-56 overflow-y-auto text-sm text-slate-200 leading-relaxed whitespace-pre-wrap break-words font-sans">
                  {preview.segments.map((seg, idx) =>
                    seg.redacted ? (
                      <mark
                        key={`${idx}-${seg.text}`}
                        className="rounded px-1.5 py-0.5 mx-0.5 bg-[#34D399]/18 border border-[#34D399]/40 text-[#34D399] font-mono text-xs"
                      >
                        {seg.text}
                      </mark>
                    ) : (
                      <span key={`${idx}-plain`}>{seg.text}</span>
                    )
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Tip: If a suspicious email address or UPI ID belongs to the sender rather than
                  you, you can uncheck that category above while keeping your own personal details
                  masked.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-800/90 bg-[#070D19] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-lg border border-slate-700/90 bg-[#050912] text-sm font-medium text-slate-300 hover:text-[#F8FAFC] hover:border-slate-500 transition-colors cursor-pointer"
              >
                Edit Draft
              </button>

              <div className="flex flex-wrap items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => onConfirmRedacted(rawText, false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-[#F8FAFC] hover:border-slate-500 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Scan Without Redaction
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onConfirmRedacted(preview.redactedText, preview.redactedCount > 0)
                  }
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#22D3EE] text-[#050912] text-sm font-semibold hover:bg-[#38BDF8] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>
                    {preview.redactedCount > 0 ? submitLabel : 'Confirm & Proceed to Scan'}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
