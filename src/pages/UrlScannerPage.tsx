import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Eye, Link2, RotateCcw, Shield, ShieldAlert, Sparkles } from 'lucide-react';
import type { AnalysisResult, DemoHandoff } from '../../shared/types';
import { inspectUrlStructure } from '../../shared/urlInspector';
import { DEMO_URLS } from '../data/demoExamples';
import { analyzeUrl, ApiClientError } from '../services/api';
import { analyzeSensitiveContent } from '../utils/sensitiveDataDetector';
import { AnalysisResultView } from '../components/AnalysisResultView';
import { ErrorBanner } from '../components/ErrorBanner';
import { PrivacyNotice } from '../components/PrivacyNotice';
import { PrivacyShieldModal } from '../components/PrivacyShieldModal';
import { ScannerLoadingState } from '../components/ScannerLoadingState';

interface UrlScannerPageProps {
  pendingDemo: DemoHandoff | null;
  onDemoConsumed: () => void;
  resetToken: number;
}

export function UrlScannerPage({
  pendingDemo,
  onDemoConsumed,
  resetToken,
}: UrlScannerPageProps) {
  const [urlInput, setUrlInput] = useState('');
  const [context, setContext] = useState('');
  const [demoMeta, setDemoMeta] = useState<{ isDemo: boolean; label?: string }>({ isDemo: false });
  const [maskedNotice, setMaskedNotice] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const localPreview = useMemo(() => {
    if (urlInput.trim().length < 4) return null;
    return inspectUrlStructure(urlInput);
  }, [urlInput]);

  const contextSensitive = useMemo(() => analyzeSensitiveContent(context), [context]);

  useEffect(() => {
    if (resetToken > 0) {
      setUrlInput('');
      setContext('');
      setDemoMeta({ isDemo: false });
      setMaskedNotice(false);
      setPrivacyModalOpen(false);
      setError(null);
      setResult(null);
    }
  }, [resetToken]);

  const executeScan = async (
    targetUrl: string,
    targetContext: string,
    options?: { isDemo?: boolean; demoLabel?: string; privacyRedacted?: boolean }
  ) => {
    const trimmed = targetUrl.trim();
    if (trimmed.length < 4) {
      setError('Please enter a valid URL to inspect structurally.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await analyzeUrl({
        url: trimmed,
        context: targetContext.trim() || undefined,
        privacyRedacted: options?.privacyRedacted,
        isDemoSample: options?.isDemo,
        demoLabel: options?.demoLabel,
      });
      setResult(response);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Unable to complete URL analysis right now. Please retry.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pendingDemo && pendingDemo.targetPage === 'url' && pendingDemo.url) {
      setUrlInput(pendingDemo.url);
      setContext(pendingDemo.content ?? '');
      setDemoMeta({ isDemo: true, label: pendingDemo.label });
      setMaskedNotice(false);
      onDemoConsumed();
      if (pendingDemo.autoRun) {
        void executeScan(pendingDemo.url, pendingDemo.content ?? '', {
          isDemo: true,
          demoLabel: pendingDemo.label,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingDemo]);

  const handleLoadDemo = (demo: (typeof DEMO_URLS)[number]) => {
    setUrlInput(demo.url);
    setContext(demo.context);
    setDemoMeta({ isDemo: true, label: `Fictional Demo: ${demo.label}` });
    setMaskedNotice(false);
    setError(null);
    setResult(null);
  };

  const handleReset = () => {
    setUrlInput('');
    setContext('');
    setDemoMeta({ isDemo: false });
    setMaskedNotice(false);
    setPrivacyModalOpen(false);
    setError(null);
    setResult(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim().length < 4) {
      setError('Please enter a valid URL to inspect structurally.');
      return;
    }

    if (contextSensitive.hasSensitive && !demoMeta.isDemo) {
      setPrivacyModalOpen(true);
      return;
    }

    void executeScan(urlInput, context, {
      isDemo: demoMeta.isDemo,
      demoLabel: demoMeta.label,
      privacyRedacted: maskedNotice,
    });
  };

  const handleConfirmPrivacyScan = (redactedContext: string, wasRedacted: boolean) => {
    setPrivacyModalOpen(false);
    if (wasRedacted) {
      setContext(redactedContext);
      setMaskedNotice(true);
    }
    void executeScan(urlInput, redactedContext, {
      isDemo: demoMeta.isDemo,
      demoLabel: demoMeta.label,
      privacyRedacted: wasRedacted || maskedNotice,
    });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC]">
          URL Scanner
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          Inspect suspicious URLs structurally without opening or fetching the site. Sentra AI
          clearly separates structural URL signals from live reputation checks.
        </p>
      </header>

      {/* Safe static inspection notice */}
      <div className="rounded-xl border border-[#22D3EE]/30 bg-[#22D3EE]/8 backdrop-blur-sm p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-[#22D3EE] shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          Safe Static Inspection: Sentra AI never visits, resolves, or executes submitted URLs, and
          never renders them as clickable links. Structural inspection is not a live website
          reputation check.
        </p>
      </div>

      <PrivacyNotice compact />

      {loading ? (
        <ScannerLoadingState customTitle="Running static URL structure and impersonation analysis" />
      ) : result ? (
        <AnalysisResultView result={result} onScanAnother={handleReset} />
      ) : (
        <div className="space-y-6">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-800/90 sentra-glass p-6 sm:p-7 space-y-6"
          >
            {/* Demo URLs */}
            <div className="space-y-2">
              <span className="block text-xs font-medium text-slate-400">
                Load a Fictional Demo URL (Fictional Demo Sample)
              </span>
              <div className="flex flex-wrap gap-2">
                {DEMO_URLS.map((demo) => (
                  <button
                    key={demo.label}
                    type="button"
                    onClick={() => handleLoadDemo(demo)}
                    className="px-3 py-1.5 rounded-lg border border-slate-700/80 bg-[#050912]/80 text-xs font-medium text-slate-200 hover:border-[#22D3EE]/70 hover:text-[#22D3EE] active:scale-[0.98] transition-all duration-150 whitespace-nowrap cursor-pointer"
                  >
                    {demo.label}
                  </button>
                ))}
              </div>
            </div>

            {/* URL Input */}
            <div className="space-y-2">
              <label htmlFor="url-input" className="block text-sm font-medium text-[#F8FAFC]">
                Suspicious URL (Rendered Inert)
              </label>
              <div className="relative">
                <Link2
                  className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="url-input"
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={2048}
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setDemoMeta({ isDemo: false });
                    if (error) setError(null);
                  }}
                  placeholder="e.g., https://secure-kyc-update.example-verify.xyz/login?id=8931"
                  className="w-full rounded-xl border border-slate-700/90 bg-[#050912]/90 pl-10 pr-4 py-3 font-mono text-sm text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#22D3EE] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Optional Context */}
            <div className="space-y-2">
              <label htmlFor="url-context" className="block text-sm font-medium text-[#F8FAFC]">
                Where did you receive this URL?{' '}
                <span className="text-xs font-normal text-slate-400">(Optional)</span>
              </label>
              <input
                id="url-context"
                type="text"
                maxLength={1000}
                value={context}
                onChange={(e) => {
                  setContext(e.target.value);
                  setMaskedNotice(false);
                }}
                placeholder="e.g., Sent via SMS claiming my bank account will be suspended today"
                className="w-full rounded-xl border border-slate-700/90 bg-[#050912]/90 px-4 py-2.5 text-sm text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#22D3EE] focus:outline-none transition-colors"
              />
            </div>

            {contextSensitive.hasSensitive && (
              <div className="rounded-xl border border-[#FBBF24]/40 bg-[#FBBF24]/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle
                    className="w-4 h-4 text-[#FBBF24] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="text-xs sm:text-sm space-y-0.5">
                    <p className="font-medium text-[#F8FAFC]">
                      Privacy Shield detected sensitive details in your context note
                    </p>
                    <p className="text-slate-300">
                      Detected locally: {contextSensitive.matches.join(', ')}.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPrivacyModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#050912] border border-[#22D3EE]/50 text-xs font-semibold text-[#22D3EE] hover:bg-[#22D3EE]/12 transition-all whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Redacted Preview</span>
                </button>
              </div>
            )}

            {maskedNotice && (
              <p className="text-xs text-[#34D399] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Sensitive details in your context note were redacted locally.</span>
              </p>
            )}

            {error && (
              <ErrorBanner
                message={error}
                onRetry={() =>
                  void executeScan(urlInput, context, {
                    isDemo: demoMeta.isDemo,
                    demoLabel: demoMeta.label,
                    privacyRedacted: maskedNotice,
                  })
                }
              />
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleReset}
                disabled={!urlInput && !context && !error}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700/90 bg-[#050912]/80 text-sm font-medium text-slate-300 hover:text-[#F8FAFC] hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>Reset</span>
              </button>

              <motion.button
                type="submit"
                whileHover={urlInput.trim().length >= 4 ? { y: -1 } : undefined}
                whileTap={urlInput.trim().length >= 4 ? { scale: 0.98 } : undefined}
                transition={{ duration: 0.14 }}
                disabled={urlInput.trim().length < 4}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#22D3EE] text-[#050912] text-sm font-semibold hover:bg-[#38BDF8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
              >
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>Inspect URL Structure</span>
              </motion.button>
            </div>
          </form>

          {/* Instant Local Structural Pre-Inspection (Zero Network Calls) */}
          {localPreview && (
            <section className="rounded-2xl border border-slate-800/90 sentra-glass p-6 space-y-4">
              <div>
                <h2 className="text-base font-semibold text-[#F8FAFC]">
                  Local Structural Pre-Inspection
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Parsed locally in your browser without making any network request.
                </p>
              </div>

              <div className="rounded-xl bg-[#050912]/90 border border-slate-800 p-3.5">
                <span className="block text-xs text-slate-400 mb-1">
                  Defanged (Non-Clickable)
                </span>
                <code className="text-xs sm:text-sm font-mono text-[#22D3EE] break-all">
                  {localPreview.defangedUrl}
                </code>
              </div>

              <dl className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-slate-400">Scheme</dt>
                  <dd className="font-mono text-[#F8FAFC] mt-0.5">{localPreview.scheme}</dd>
                </div>
                <div className="col-span-2 sm:col-span-2">
                  <dt className="text-xs text-slate-400">Hostname</dt>
                  <dd className="font-mono text-[#F8FAFC] mt-0.5 break-all">
                    {localPreview.hostname || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">TLD</dt>
                  <dd className="font-mono text-[#F8FAFC] mt-0.5">
                    {localPreview.tld ? `.${localPreview.tld}` : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Subdomains</dt>
                  <dd className="font-mono tabular-nums text-[#F8FAFC] mt-0.5">
                    {localPreview.subdomainCount}
                  </dd>
                </div>
              </dl>

              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <h3 className="text-xs font-medium text-slate-400">
                  Local Structural Observations
                </h3>
                <ul className="space-y-1.5 text-sm text-slate-300">
                  {localPreview.structuralNotes.map((note, idx) => (
                    <li key={`${idx}-${note}`} className="flex items-start gap-2">
                      <span className="text-[#22D3EE]" aria-hidden="true">
                        –
                      </span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
        </div>
      )}

      <PrivacyShieldModal
        open={privacyModalOpen}
        rawText={context}
        submitLabel="Confirm & Inspect URL"
        onConfirmRedacted={handleConfirmPrivacyScan}
        onCancel={() => setPrivacyModalOpen(false)}
      />
    </div>
  );
}
