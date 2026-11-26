import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Eye, RotateCcw, Shield, ShieldCheck, Sparkles } from 'lucide-react';
import type { AnalysisResult, DemoHandoff } from '../../shared/types';
import { DEMO_JOB_OFFERS } from '../data/demoExamples';
import { analyzeJobOffer, ApiClientError } from '../services/api';
import { analyzeSensitiveContent, redactSensitiveData } from '../utils/sensitiveDataDetector';
import { AnalysisResultView } from '../components/AnalysisResultView';
import { ErrorBanner } from '../components/ErrorBanner';
import { PrivacyNotice } from '../components/PrivacyNotice';
import { PrivacyShieldModal } from '../components/PrivacyShieldModal';
import { ScannerLoadingState } from '../components/ScannerLoadingState';

interface JobOfferCheckerPageProps {
  pendingDemo: DemoHandoff | null;
  onDemoConsumed: () => void;
  resetToken: number;
}

export function JobOfferCheckerPage({
  pendingDemo,
  onDemoConsumed,
  resetToken,
}: JobOfferCheckerPageProps) {
  const [content, setContent] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [salaryClaimed, setSalaryClaimed] = useState('');
  const [feeRequested, setFeeRequested] = useState('');
  const [recruiterContact, setRecruiterContact] = useState('');
  const [demoMeta, setDemoMeta] = useState<{ isDemo: boolean; label?: string }>({ isDemo: false });
  const [maskedNotice, setMaskedNotice] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const sensitiveCheck = useMemo(() => analyzeSensitiveContent(content), [content]);

  useEffect(() => {
    if (resetToken > 0) {
      handleReset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToken]);

  const executeScan = async (params: {
    content: string;
    companyName?: string;
    salaryClaimed?: string;
    feeRequested?: string;
    recruiterContact?: string;
    privacyRedacted?: boolean;
    isDemo?: boolean;
    demoLabel?: string;
  }) => {
    const trimmed = params.content.trim();
    if (trimmed.length < 10) {
      setError('Please paste at least 10 characters from the job offer or recruitment message.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await analyzeJobOffer({
        content: trimmed,
        companyName: params.companyName?.trim() || undefined,
        salaryClaimed: params.salaryClaimed?.trim() || undefined,
        feeRequested: params.feeRequested?.trim() || undefined,
        recruiterContact: params.recruiterContact?.trim() || undefined,
        privacyRedacted: params.privacyRedacted,
        isDemoSample: params.isDemo,
        demoLabel: params.demoLabel,
      });
      setResult(response);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Unable to complete job offer analysis right now. Please retry.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pendingDemo && pendingDemo.targetPage === 'job-offer' && pendingDemo.content) {
      setContent(pendingDemo.content);
      setCompanyName(pendingDemo.companyName ?? '');
      setSalaryClaimed(pendingDemo.salaryClaimed ?? '');
      setFeeRequested(pendingDemo.feeRequested ?? '');
      setRecruiterContact(pendingDemo.recruiterContact ?? '');
      setDemoMeta({ isDemo: true, label: pendingDemo.label });
      setMaskedNotice(false);
      onDemoConsumed();
      if (pendingDemo.autoRun) {
        void executeScan({
          content: pendingDemo.content,
          companyName: pendingDemo.companyName,
          salaryClaimed: pendingDemo.salaryClaimed,
          feeRequested: pendingDemo.feeRequested,
          recruiterContact: pendingDemo.recruiterContact,
          isDemo: true,
          demoLabel: pendingDemo.label,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingDemo]);

  const handleLoadDemo = (demo: (typeof DEMO_JOB_OFFERS)[number]) => {
    setContent(demo.content);
    setCompanyName(demo.companyName);
    setSalaryClaimed(demo.salaryClaimed);
    setFeeRequested(demo.feeRequested);
    setRecruiterContact(demo.recruiterContact);
    setDemoMeta({ isDemo: true, label: `Fictional Demo: ${demo.label}` });
    setMaskedNotice(false);
    setError(null);
    setResult(null);
  };

  const handleReset = () => {
    setContent('');
    setCompanyName('');
    setSalaryClaimed('');
    setFeeRequested('');
    setRecruiterContact('');
    setDemoMeta({ isDemo: false });
    setMaskedNotice(false);
    setPrivacyModalOpen(false);
    setError(null);
    setResult(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length < 10) {
      setError('Please paste at least 10 characters from the job offer or recruitment message.');
      return;
    }

    if (sensitiveCheck.hasSensitive && !demoMeta.isDemo) {
      setPrivacyModalOpen(true);
      return;
    }

    void executeScan({
      content,
      companyName,
      salaryClaimed,
      feeRequested,
      recruiterContact,
      privacyRedacted: maskedNotice,
      isDemo: demoMeta.isDemo,
      demoLabel: demoMeta.label,
    });
  };

  const handleConfirmPrivacyScan = (redactedText: string, wasRedacted: boolean) => {
    setPrivacyModalOpen(false);
    if (wasRedacted) {
      setContent(redactedText);
      setMaskedNotice(true);
    }
    void executeScan({
      content: redactedText,
      companyName,
      salaryClaimed,
      feeRequested,
      recruiterContact,
      privacyRedacted: wasRedacted || maskedNotice,
      isDemo: demoMeta.isDemo,
      demoLabel: demoMeta.label,
    });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC]">
          Job Offer Checker
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          Inspect recruitment messages and job offers in any language for advance-fee demands,
          unrealistic compensation, recruiter impersonation, and misleading employment terms.
          Results are always provided in English.
        </p>
      </header>

      <PrivacyNotice compact />

      {loading ? (
        <ScannerLoadingState customTitle="Evaluating recruitment message for employment fraud cues" />
      ) : result ? (
        <AnalysisResultView result={result} onScanAnother={handleReset} />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800/90 sentra-glass p-6 sm:p-7 space-y-6"
        >
          {/* Demo Presets */}
          <div className="space-y-2">
            <span className="block text-xs font-medium text-slate-400">
              Load a Fictional Demo Job Offer (Fictional Demo Sample)
            </span>
            <div className="flex flex-wrap gap-2">
              {DEMO_JOB_OFFERS.map((demo) => (
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

          {/* Optional structured context fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="job-company" className="block text-xs font-medium text-slate-300">
                Claimed Company Name <span className="text-slate-500">(Optional)</span>
              </label>
              <input
                id="job-company"
                type="text"
                maxLength={150}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Apex Global Solutions"
                className="w-full rounded-xl border border-slate-700/90 bg-[#050912]/90 px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#22D3EE] focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="job-salary" className="block text-xs font-medium text-slate-300">
                Promised Salary / Pay <span className="text-slate-500">(Optional)</span>
              </label>
              <input
                id="job-salary"
                type="text"
                maxLength={150}
                value={salaryClaimed}
                onChange={(e) => setSalaryClaimed(e.target.value)}
                placeholder="e.g., ₹5,000 per day for 1 hour"
                className="w-full rounded-xl border border-slate-700/90 bg-[#050912]/90 px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#22D3EE] focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="job-fee" className="block text-xs font-medium text-slate-300">
                Any Fee or Deposit Requested? <span className="text-slate-500">(Optional)</span>
              </label>
              <input
                id="job-fee"
                type="text"
                maxLength={150}
                value={feeRequested}
                onChange={(e) => setFeeRequested(e.target.value)}
                placeholder="e.g., ₹1,499 registration fee via UPI"
                className="w-full rounded-xl border border-slate-700/90 bg-[#050912]/90 px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#22D3EE] focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="job-recruiter" className="block text-xs font-medium text-slate-300">
                Recruiter Email or Contact Channel{' '}
                <span className="text-slate-500">(Optional)</span>
              </label>
              <input
                id="job-recruiter"
                type="text"
                maxLength={200}
                value={recruiterContact}
                onChange={(e) => setRecruiterContact(e.target.value)}
                placeholder="e.g., hr.hiring2026@gmail.com or Telegram only"
                className="w-full rounded-xl border border-slate-700/90 bg-[#050912]/90 px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#22D3EE] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Main Offer Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="job-content" className="text-sm font-medium text-[#F8FAFC]">
                Recruitment Message or Job Offer Text
              </label>
              <span className="text-xs font-mono tabular-nums text-slate-400">
                {content.length.toLocaleString()} / 12,000 characters
              </span>
            </div>

            <textarea
              id="job-content"
              rows={7}
              maxLength={12000}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setDemoMeta({ isDemo: false });
                setMaskedNotice(false);
                if (error) setError(null);
              }}
              placeholder="Paste the full job offer, recruiter message, or interview invitation in any language here..."
              className="w-full rounded-xl border border-slate-700/90 bg-[#050912]/90 px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#22D3EE] focus:outline-none transition-colors leading-relaxed resize-y"
            />
          </div>

          {sensitiveCheck.hasSensitive && (
            <div className="rounded-xl border border-[#FBBF24]/40 bg-[#FBBF24]/10 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle
                  className="w-4 h-4 text-[#FBBF24] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="text-xs sm:text-sm space-y-0.5">
                  <p className="font-medium text-[#F8FAFC]">
                    Privacy Shield detected {sensitiveCheck.items.length}{' '}
                    {sensitiveCheck.items.length === 1 ? 'sensitive item' : 'sensitive items'}
                  </p>
                  <p className="text-slate-300">
                    Detected locally: {sensitiveCheck.matches.join(', ')}. Review the redacted
                    preview before sending to Gemini AI.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setPrivacyModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#050912] border border-[#22D3EE]/50 text-xs font-semibold text-[#22D3EE] hover:bg-[#22D3EE]/12 active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Redacted Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setContent((prev) => redactSensitiveData(prev));
                    setMaskedNotice(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#050912] border border-[#FBBF24]/50 text-xs font-semibold text-[#FBBF24] hover:bg-[#FBBF24]/15 active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Redact All Now</span>
                </button>
              </div>
            </div>
          )}

          {maskedNotice && (
            <p className="text-xs text-[#34D399] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>
                Privacy Shield redacted sensitive details locally. Only masked placeholders will be
                analyzed.
              </span>
            </p>
          )}

          {error && (
            <ErrorBanner
              message={error}
              onRetry={() =>
                void executeScan({
                  content,
                  companyName,
                  salaryClaimed,
                  feeRequested,
                  recruiterContact,
                  privacyRedacted: maskedNotice,
                  isDemo: demoMeta.isDemo,
                  demoLabel: demoMeta.label,
                })
              }
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleReset}
              disabled={
                !content && !companyName && !salaryClaimed && !feeRequested && !recruiterContact
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700/90 bg-[#050912]/80 text-sm font-medium text-slate-300 hover:text-[#F8FAFC] hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Reset</span>
            </button>

            <motion.button
              type="submit"
              whileHover={content.trim().length >= 10 ? { y: -1 } : undefined}
              whileTap={content.trim().length >= 10 ? { scale: 0.98 } : undefined}
              transition={{ duration: 0.14 }}
              disabled={content.trim().length < 10}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#22D3EE] text-[#050912] text-sm font-semibold hover:bg-[#38BDF8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>
                {sensitiveCheck.hasSensitive && !demoMeta.isDemo
                  ? 'Review Privacy Shield & Check'
                  : 'Check Job Offer'}
              </span>
            </motion.button>
          </div>
        </form>
      )}

      <PrivacyShieldModal
        open={privacyModalOpen}
        rawText={content}
        submitLabel="Confirm & Check Redacted Offer"
        onConfirmRedacted={handleConfirmPrivacyScan}
        onCancel={() => setPrivacyModalOpen(false)}
      />
    </div>
  );
}
