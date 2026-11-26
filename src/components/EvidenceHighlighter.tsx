import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FileSearch, Info, MousePointerClick, ShieldAlert } from 'lucide-react';
import type { HighlightedPhrase, IndicatorSeverity } from '../../shared/types';

interface EvidenceHighlighterProps {
  sourceText: string;
  phrases: HighlightedPhrase[];
  title?: string;
  subtitle?: string;
  privacyRedacted?: boolean;
}

interface TextSegment {
  text: string;
  highlight?: HighlightedPhrase;
}

const SEVERITY_HIGHLIGHT_CLASSES: Record<
  IndicatorSeverity,
  { idle: string; selected: string; badgeText: string; label: string }
> = {
  high: {
    idle: 'bg-[#F87171]/16 text-[#FECACA] border-b-2 border-[#F87171]/80 hover:bg-[#F87171]/28',
    selected: 'bg-[#F87171]/32 text-[#F8FAFC] border-b-2 border-[#F87171] ring-1 ring-[#F87171]/60',
    badgeText: 'text-[#F87171]',
    label: 'High-risk phrase',
  },
  medium: {
    idle: 'bg-[#FBBF24]/15 text-[#FEF08A] border-b-2 border-[#FBBF24]/80 hover:bg-[#FBBF24]/26',
    selected: 'bg-[#FBBF24]/30 text-[#F8FAFC] border-b-2 border-[#FBBF24] ring-1 ring-[#FBBF24]/60',
    badgeText: 'text-[#FBBF24]',
    label: 'Moderate-risk phrase',
  },
  low: {
    idle: 'bg-[#22D3EE]/14 text-[#CFFAFE] border-b-2 border-[#22D3EE]/75 hover:bg-[#22D3EE]/24',
    selected: 'bg-[#22D3EE]/28 text-[#F8FAFC] border-b-2 border-[#22D3EE] ring-1 ring-[#22D3EE]/60',
    badgeText: 'text-[#22D3EE]',
    label: 'Notable cue',
  },
};

const CATEGORY_LABELS: Record<HighlightedPhrase['category'], string> = {
  urgency: 'Urgency & Time Pressure',
  financial_manipulation: 'Financial Manipulation',
  impersonation: 'Impersonation & Spoofing',
  credential_harvesting: 'Credential Harvesting',
  deceptive_promises: 'Deceptive Promises',
  other: 'Suspicious Indicator',
};

/**
 * Splits submitted sourceText into non-overlapping literal text and verified highlight spans.
 * Guarantees only exact substrings actually present in sourceText are highlighted.
 */
function buildVerifiedSegments(
  sourceText: string,
  phrases: HighlightedPhrase[]
): { segments: TextSegment[]; matchedPhrases: HighlightedPhrase[] } {
  if (!sourceText || phrases.length === 0) {
    return { segments: [{ text: sourceText }], matchedPhrases: [] };
  }

  const lowerSource = sourceText.toLowerCase();

  // Locate actual non-overlapping character spans in sourceText (prefer longer spans first)
  const sortedCandidates = [...phrases].sort((a, b) => b.phrase.length - a.phrase.length);
  const occupied: Array<{ start: number; end: number; item: HighlightedPhrase }> = [];

  for (const item of sortedCandidates) {
    const clean = item.phrase.trim();
    if (clean.length < 2) continue;
    const needle = clean.toLowerCase();

    let searchFrom = 0;
    while (searchFrom < lowerSource.length) {
      const idx = lowerSource.indexOf(needle, searchFrom);
      if (idx === -1) break;
      const end = idx + clean.length;

      const overlaps = occupied.some((span) => idx < span.end && end > span.start);
      if (!overlaps) {
        occupied.push({ start: idx, end, item });
        // Highlight first grounded occurrence per unique phrase to avoid visual noise
        break;
      }
      searchFrom = idx + 1;
    }
  }

  if (occupied.length === 0) {
    return { segments: [{ text: sourceText }], matchedPhrases: [] };
  }

  occupied.sort((a, b) => a.start - b.start);

  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const span of occupied) {
    if (span.start > cursor) {
      segments.push({ text: sourceText.slice(cursor, span.start) });
    }
    segments.push({
      text: sourceText.slice(span.start, span.end),
      highlight: span.item,
    });
    cursor = span.end;
  }

  if (cursor < sourceText.length) {
    segments.push({ text: sourceText.slice(cursor) });
  }

  return {
    segments,
    matchedPhrases: occupied.map((o) => o.item),
  };
}

export function EvidenceHighlighter({
  sourceText,
  phrases,
  title = 'Evidence Intelligence — Interactive Transcript',
  subtitle = 'Suspicious phrases verified directly inside your submitted content. Click any highlight to inspect why it was flagged.',
  privacyRedacted = false,
}: EvidenceHighlighterProps) {
  const { segments, matchedPhrases } = useMemo(
    () => buildVerifiedSegments(sourceText, phrases),
    [sourceText, phrases]
  );

  const [selectedId, setSelectedId] = useState<string | null>(
    matchedPhrases[0]?.id ?? null
  );

  const activeHighlight =
    matchedPhrases.find((p) => p.id === selectedId) ?? matchedPhrases[0] ?? null;

  return (
    <section className="rounded-2xl border border-slate-800/90 sentra-glass p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-[#22D3EE] shrink-0" aria-hidden="true" />
            <span>{title}</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs shrink-0">
          {privacyRedacted && (
            <span className="font-mono text-[#34D399]">Privacy Shield Redacted</span>
          )}
          <span className="font-mono tabular-nums text-slate-400">
            {matchedPhrases.length}{' '}
            {matchedPhrases.length === 1 ? 'verified highlight' : 'verified highlights'}
          </span>
        </div>
      </div>

      {/* Annotated Submitted Text Box */}
      <div className="rounded-xl border border-slate-800 bg-[#050912]/92 p-4 sm:p-5 text-sm sm:text-[15px] text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
        {segments.map((seg, idx) => {
          if (!seg.highlight) {
            return <span key={`plain-${idx}`}>{seg.text}</span>;
          }

          const hl = seg.highlight;
          const isSelected = activeHighlight?.id === hl.id;
          const style = SEVERITY_HIGHLIGHT_CLASSES[hl.severity];

          return (
            <button
              key={`hl-${hl.id}-${idx}`}
              type="button"
              onClick={() => setSelectedId(hl.id)}
              aria-pressed={isSelected}
              className={`inline text-left rounded px-1 py-0.5 mx-0.5 transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#22D3EE] ${
                isSelected ? style.selected : style.idle
              }`}
            >
              {seg.text}
            </button>
          );
        })}
      </div>

      {/* Active Highlight Inspector Panel */}
      {matchedPhrases.length > 0 && activeHighlight ? (
        <div className="space-y-3">
          {/* Quick Phrase Switcher Strip */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 mr-1">
              <MousePointerClick className="w-3.5 h-3.5 text-[#22D3EE]" aria-hidden="true" />
              <span>Select phrase:</span>
            </span>
            {matchedPhrases.map((item, idx) => {
              const isSelected = activeHighlight.id === item.id;
              return (
                <button
                  key={`${item.id}-${idx}`}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  aria-pressed={isSelected}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors cursor-pointer max-w-[220px] truncate ${
                    isSelected
                      ? 'border-[#22D3EE]/60 bg-[#22D3EE]/12 text-[#F8FAFC]'
                      : 'border-slate-800 bg-[#080F1D] text-slate-300 hover:border-slate-600'
                  }`}
                >
                  “{item.phrase}”
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeHighlight.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-xl border border-slate-800/90 bg-[#08101F]/95 p-4 sm:p-5 space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <ShieldAlert
                    className={`w-4 h-4 shrink-0 ${SEVERITY_HIGHLIGHT_CLASSES[activeHighlight.severity].badgeText}`}
                    aria-hidden="true"
                  />
                  <span
                    className={`font-semibold ${SEVERITY_HIGHLIGHT_CLASSES[activeHighlight.severity].badgeText}`}
                  >
                    {SEVERITY_HIGHLIGHT_CLASSES[activeHighlight.severity].label}
                  </span>
                  <span className="text-slate-600" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-slate-300 font-medium">
                    {CATEGORY_LABELS[activeHighlight.category]}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-slate-400">
                  Verified verbatim match
                </span>
              </div>

              <p className="font-mono text-xs sm:text-sm text-[#F8FAFC] bg-[#050912] border border-slate-800/80 rounded-lg px-3 py-2 break-words">
                “{activeHighlight.phrase}”
              </p>

              <p className="text-sm text-slate-300 leading-relaxed">
                {activeHighlight.explanation}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-400">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            No specific high-risk phrases were verified verbatim inside this text. Always confirm
            important requests independently even when no suspicious wording stands out.
          </span>
        </div>
      )}
    </section>
  );
}
