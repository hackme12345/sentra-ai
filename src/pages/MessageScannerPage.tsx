import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Eye, RotateCcw, Shield, ShieldCheck, Sparkles } from 'lucide-react';
import type { AnalysisResult, DemoHandoff } from '../../shared/types';
import { DASHBOARD_DEMO_SCENARIOS } from '../data/demoExamples';
import { analyzeMessage, ApiClientError } from '../services/api';
import { analyzeSensitiveContent, redactSensitiveData } from '../utils/sensitiveDataDetector';
import { AnalysisResultView } from '../components/AnalysisResultView';
import { ErrorBanner } from '../components/ErrorBanner';
import { PrivacyNotice } from '../components/PrivacyNotice';
import { PrivacyShieldModal } from '../components/PrivacyShieldModal';
import { ScannerLoadingState } from '../components/ScannerLoadingState';

type ChannelType = 'sms' | 'whatsapp' | 'email' | 'social' | 'other';

interface MessageScannerPageProps {
  pendingDemo: DemoHandoff | null;
  onDemoConsumed: () => void;
  resetToken: number;
}

const CHANNELS: Array<{ id: ChannelType; label: string }> = [
  { id: 'sms', label: 'SMS' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'email', label: 'Email' },
  { id: 'social', label: 'Social Media' },
  { id: 'other', label: 'Other' },
];

export function MessageScannerPage({
  pendingDemo,
  onDemoConsumed,
  resetToken,
}: MessageScannerPageProps) {
  const [channel, setChannel] = useState<ChannelType>('sms');
  const [content, setContent] = useState('');
  const [demoMeta, setDemoMeta] = useState<{ isDemo: boolean; label?: string }>({ isDemo: false });
  const [maskedNotice, setMaskedNotice] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const messageDemos = useMemo(
    () => DASHBOARD_DEMO_SCENARIOS.filter((s) => s.handoff.targetPage === 'message'),
    []
  );

  const sensitiveCheck = useMemo(() => analyzeSensitiveContent(content), [content]);

  useEffect(() => {
    if (resetToken > 0) {
      setContent('');
      setChannel('sms');
      setDemoMeta({ isDemo: false });
      setMaskedNotice(false);
      setPrivacyModalOpen(false);
      setResult(null);
      setError(null);
    }
  }, [resetToken]);

  const executeScan = async (
    textToScan: string,
    selectedChannel: ChannelType,
    options?: { isDemo?: boolean; demoLabel?: string; privacyRedacted?: boolean }
  ) => {
    const trimmed = textToScan.trim();
    if (trimmed.length < 5) {
      setError('Please enter at least 5 characters from the suspicious message.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await analyzeMessage({
        content: trimmed,
        channel: selectedChannel,
        privacyRedacted: options?.privacyRedacted,
        isDemoSample: options?.isDemo,
        demoLabel: options?.demoLabel,
      });
      setResult(response);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Unable to complete the analysis right now. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pendingDemo && pendingDemo.targetPage === 'message' && pendingDemo.content) {
      const demoChannel = pendingDemo.channel ?? 'sms';
      setChannel(demoChannel);
      setContent(pendingDemo.content);
      setDemoMeta({ isDemo: true, label: pendingDemo.label });
      setMaskedNotice(false);
      onDemoConsumed();
      if (pendingDemo.autoRun) {
        void executeScan(pendingDemo.content, demoChannel, {
          isDemo: true,
          demoLabel: pendingDemo.label,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingDemo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (trimmed.length < 5) {
      setError('Please enter at least 5 characters from the suspicious message.');
      return;
    }

    // Trigger Privacy Shield pre-flight confirmation whenever sensitive PII is present
    if (sensitiveCheck.hasSensitive && !demoMeta.isDemo) {
      setPrivacyModalOpen(true);
      return;
    }

    void executeScan(content, channel, {
      isDemo: demoMeta.isDemo,
      demoLabel: demoMeta.label,
      privacyRedacted: maskedNotice,
    });
  };

  const handleConfirmPrivacyScan = (redactedText: string, wasRedacted: boolean) => {
    setPrivacyModalOpen(false);
    if (wasRedacted) {
      setContent(redactedText);
      setMaskedNotice(true);
    }
    void executeScan(redactedText, channel, {
      isDemo: demoMeta.isDemo,
      demoLabel: demoMeta.label,
      privacyRedacted: wasRedacted || maskedNotice,
    });
  };

  const handleLoadDemo = (scenario: (typeof messageDemos)[number]) => {
    const demoChannel = scenario.handoff.channel ?? 'sms';
    setChannel(demoChannel);
    setContent(scenario.handoff.content ?? '');
    setDemoMeta({ isDemo: true, label: scenario.handoff.label });
    setMaskedNotice(false);
    setError(null);
    setResult(null);
  };

  const handleMaskSensitive = () => {
    setContent((prev) => redactSensitiveData(prev));
    setMaskedNotice(true);
  };

  const handleReset = () => {
    setContent('');
    setChannel('sms');
    setDemoMeta({ isDemo: false });
    setMaskedNotice(false);
    setPrivacyModalOpen(false);
    setError(null);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC]">
          Message Scanner
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          Analyze suspicious SMS, WhatsApp messages, emails, and social DMs in any language for
          phishing, impersonation, urgency, and advance-payment cues. Results are always provided in
          English.
        </p>
      </header>

      <PrivacyNotice compact />

      {loading ? (
        <ScannerLoadingState customTitle="Inspecting message for phishing and social engineering" />
      ) : result ? (
        <AnalysisResultView result={result} onScanAnother={handleReset} />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800/90 sentra-glass p-6 sm:p-7 space-y-6"
        >
          {/* Demo Examples Bar */}
          <div className="space-y-2">
            <span className="block text-xs font-medium text-slate-400">
              Load a Fictional Demo Message (Fictional Demo Sample)
            </span>
            <div className="flex flex-wrap gap-2">
              {messageDemos.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => handleLoadDemo(demo)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700/80 bg-[#050912]/80 text-xs font-medium text-slate-200 hover:border-[#22D3EE]/70 hover:text-[#22D3EE] active:scale-[0.98] transition-all duration-150 whitespace-nowrap cursor-pointer"
                >
                  {demo.title}
                </button>
              ))}
            </div>
          </div>

          {/* Channel Segmented Selector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#F8FAFC]">Message Channel</label>
            <div className="inline-flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#050912]/90 border border-slate-800">
              {CHANNELS.map((ch) => {
                const active = channel === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setChannel(ch.id)}
                    aria-pressed={active}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-[#22D3EE] text-[#050912] font-semibold'
                        : 'text-slate-300 hover:text-[#F8FAFC]'
                    }`}
                  >
                    {ch.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="message-input" className="text-sm font-medium text-[#F8FAFC]">
                Suspicious Message Content
              </label>
              <span className="text-xs font-mono tabular-nums text-slate-400">
                {content.length.toLocaleString()} / 12,000 characters
              </span>
            </div>

            <textarea
              id="message-input"
              rows={7}
              maxLength={12000}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setDemoMeta({ isDemo: false });
                setMaskedNotice(false);
                if (error) setError(null);
              }}
              placeholder="Paste the suspicious message in any language here — Privacy Shield automatically detects OTPs, phone numbers, emails, card numbers, and IDs before scanning..."
              className="w-full rounded-xl border border-slate-700/90 bg-[#050912]/90 px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#22D3EE] focus:outline-none transition-colors leading-relaxed resize-y"
            />
          </div>

          {/* Privacy Shield Live Detection Banner */}
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
                  onClick={handleMaskSensitive}
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
                void executeScan(content, channel, {
                  isDemo: demoMeta.isDemo,
                  demoLabel: demoMeta.label,
                  privacyRedacted: maskedNotice,
                })
              }
            />
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleReset}
              disabled={!content && !error}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700/90 bg-[#050912]/80 text-sm font-medium text-slate-300 hover:text-[#F8FAFC] hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Reset</span>
            </button>

            <motion.button
              type="submit"
              whileHover={content.trim().length >= 5 ? { y: -1 } : undefined}
              whileTap={content.trim().length >= 5 ? { scale: 0.98 } : undefined}
              transition={{ duration: 0.14 }}
              disabled={content.trim().length < 5}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#22D3EE] text-[#050912] text-sm font-semibold hover:bg-[#38BDF8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>
                {sensitiveCheck.hasSensitive && !demoMeta.isDemo
                  ? 'Review Privacy Shield & Analyze'
                  : 'Analyze Message'}
              </span>
            </motion.button>
          </div>
        </form>
      )}

      <PrivacyShieldModal
        open={privacyModalOpen}
        rawText={content}
        submitLabel="Confirm & Analyze Redacted Message"
        onConfirmRedacted={handleConfirmPrivacyScan}
        onCancel={() => setPrivacyModalOpen(false)}
      />
    </div>
  );
}
