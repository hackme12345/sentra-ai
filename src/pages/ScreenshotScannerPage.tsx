import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  FlaskConical,
  Image as ImageIcon,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import type { AnalysisResult } from '../../shared/types';
import { generateDemoScamScreenshotFile } from '../data/demoExamples';
import { analyzeScreenshot, ApiClientError } from '../services/api';
import { AnalysisResultView } from '../components/AnalysisResultView';
import { ErrorBanner } from '../components/ErrorBanner';
import { PrivacyNotice } from '../components/PrivacyNotice';
import { ScannerLoadingState } from '../components/ScannerLoadingState';
import { ScreenshotRedactor } from '../components/ScreenshotRedactor';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
type AllowedMime = (typeof ALLOWED_TYPES)[number];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

interface ScreenshotScannerPageProps {
  resetToken: number;
}

export function ScreenshotScannerPage({ resetToken }: ScreenshotScannerPageProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalBase64, setOriginalBase64] = useState<string | null>(null);
  const [redactedBase64, setRedactedBase64] = useState<string | null>(null);
  const [redactedMimeType, setRedactedMimeType] = useState<AllowedMime | null>(null);
  const [maskCount, setMaskCount] = useState(0);
  const [privacyConfirmed, setPrivacyConfirmed] = useState(false);
  const [context, setContext] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [demoMeta, setDemoMeta] = useState<{ isDemo: boolean; label?: string }>({ isDemo: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (resetToken > 0) {
      clearFileState();
      setContext('');
      setError(null);
      setResult(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToken]);

  const clearFileState = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setOriginalBase64(null);
    setRedactedBase64(null);
    setRedactedMimeType(null);
    setMaskCount(0);
    setPrivacyConfirmed(false);
    setDemoMeta({ isDemo: false });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFile = (file: File, isDemo = false, demoLabel?: string) => {
    setError(null);
    setResult(null);

    if (!ALLOWED_TYPES.includes(file.type as AllowedMime)) {
      setError('Unsupported format. Please upload a JPG, PNG, or WEBP image.');
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError('File exceeds the 5 MB upload limit. Please select a smaller screenshot.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      const base64Part = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      if (!base64Part) {
        setError('Could not read the selected image file. Please try another screenshot.');
        return;
      }

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setOriginalBase64(base64Part);
      setRedactedBase64(null);
      setRedactedMimeType(null);
      setMaskCount(0);
      setPrivacyConfirmed(isDemo);
      setDemoMeta({ isDemo, label: demoLabel });
    };
    reader.onerror = () => {
      setError('Failed to read image file locally.');
    };
    reader.readAsDataURL(file);
  };

  const handleRedactedChange = useCallback(
    (nextBase64: string | null, actualMime: AllowedMime, nextMaskCount: number) => {
      setRedactedBase64(nextBase64);
      setRedactedMimeType(nextBase64 ? actualMime : null);
      setMaskCount(nextMaskCount);
      if (nextMaskCount > 0) {
        setPrivacyConfirmed(true);
      }
    },
    []
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file, false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file, false);
    }
  };

  const handleGenerateDemoImage = async () => {
    try {
      const demoFile = await generateDemoScamScreenshotFile();
      setContext('Fictional demo screenshot simulating a UPI cashback refund scam chat.');
      processFile(demoFile, true, 'Fictional Demo: UPI Refund Scam Screenshot');
    } catch {
      setError('Could not generate the demo screenshot in this browser.');
    }
  };

  const activeImageBase64 = redactedBase64 ?? originalBase64;
  const activeMimeType: AllowedMime | null =
    redactedMimeType ?? (selectedFile ? (selectedFile.type as AllowedMime) : null);

  const canAnalyze = Boolean(
    selectedFile && activeImageBase64 && activeMimeType && (privacyConfirmed || maskCount > 0)
  );

  const executeScan = async () => {
    if (!selectedFile || !activeImageBase64 || !activeMimeType) {
      setError('Please upload a JPG, PNG, or WEBP screenshot first.');
      return;
    }

    if (!privacyConfirmed && maskCount === 0) {
      setError('Please confirm you have reviewed or redacted sensitive areas before scanning.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await analyzeScreenshot({
        imageBase64: activeImageBase64,
        mimeType: activeMimeType,
        context: context.trim() || undefined,
        privacyRedacted: maskCount > 0,
        isDemoSample: demoMeta.isDemo,
        demoLabel: demoMeta.label,
      });
      setResult(response);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Unable to complete screenshot analysis. Please retry.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetAll = () => {
    clearFileState();
    setContext('');
    setError(null);
    setResult(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC]">
          Screenshot Scanner
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          Upload a screenshot (JPG, PNG, or WEBP up to 5 MB) in any language, use built-in Privacy
          Shield tools to blackout or blur sensitive details, and inspect visible text with Gemini
          multimodal AI. Results are always provided in English.
        </p>
      </header>

      <PrivacyNotice compact />

      {loading ? (
        <ScannerLoadingState customTitle="Running multimodal Gemini screenshot inspection" />
      ) : result ? (
        <AnalysisResultView result={result} onScanAnother={handleResetAll} />
      ) : (
        <div className="rounded-2xl border border-slate-800/90 sentra-glass p-6 sm:p-7 space-y-6">
          {/* Demo screenshot button */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-400">Fictional Demo Sample</span>
            <button
              type="button"
              onClick={() => void handleGenerateDemoImage()}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-700/80 bg-[#050912]/80 text-xs font-medium text-slate-200 hover:border-[#22D3EE]/70 hover:text-[#22D3EE] active:scale-[0.98] transition-all duration-150 cursor-pointer"
            >
              <FlaskConical className="w-3.5 h-3.5 text-[#22D3EE]" aria-hidden="true" />
              <span>Generate Fictional Demo Screenshot</span>
            </button>
          </div>

          {/* Drag-and-Drop Zone OR Interactive Redaction Studio */}
          {!selectedFile || !previewUrl ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`rounded-xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-150 ${
                isDragging
                  ? 'border-[#22D3EE] bg-[#22D3EE]/8'
                  : 'border-slate-700/90 bg-[#050912]/70 hover:border-slate-500'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="sr-only"
                id="screenshot-file-input"
              />

              <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-xl bg-[#0E1728] border border-slate-800 flex items-center justify-center text-[#22D3EE]">
                  <UploadCloud className="w-6 h-6" aria-hidden="true" />
                </div>
                <p className="text-base font-semibold text-[#F8FAFC]">
                  Drag and drop a screenshot here
                </p>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  JPG, PNG, or WEBP · Maximum 5 MB · Interactive blackout & blur tools open right
                  after upload
                </p>
                <label
                  htmlFor="screenshot-file-input"
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0E1728] border border-slate-700 text-sm font-medium text-[#F8FAFC] hover:border-[#22D3EE] hover:text-[#22D3EE] transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4" aria-hidden="true" />
                  <span>Select Image File</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-[#050912]/80 p-4 sm:p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="block text-xs text-slate-400">
                    Selected Screenshot — Interactive Redaction Canvas
                  </span>
                  <p className="text-sm font-medium text-[#F8FAFC] truncate mt-0.5">
                    {selectedFile.name}{' '}
                    <span className="text-xs font-mono tabular-nums text-slate-400">
                      ({formatFileSize(selectedFile.size)} ·{' '}
                      {selectedFile.type.replace('image/', '').toUpperCase()})
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={clearFileState}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium text-slate-300 hover:border-[#F87171]/60 hover:text-[#F87171] active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Remove Image</span>
                </button>
              </div>

              <ScreenshotRedactor
                imageUrl={previewUrl}
                mimeType={selectedFile.type as AllowedMime}
                onRedactedChange={handleRedactedChange}
              />

              {/* Privacy Confirmation Bar */}
              <div className="rounded-xl border border-slate-800/90 bg-[#08101F]/90 p-3.5 flex items-start gap-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={privacyConfirmed || maskCount > 0}
                  onClick={() => setPrivacyConfirmed((prev) => !prev)}
                  className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors cursor-pointer ${
                    privacyConfirmed || maskCount > 0
                      ? 'bg-[#34D399] border-[#34D399] text-[#050912]'
                      : 'border-slate-600 bg-[#050912]'
                  }`}
                >
                  {(privacyConfirmed || maskCount > 0) && (
                    <Check className="w-3 h-3 stroke-[3]" aria-hidden="true" />
                  )}
                </button>
                <div className="text-xs text-slate-300 leading-relaxed">
                  {maskCount > 0 ? (
                    <span className="text-[#34D399] font-medium flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      Privacy Shield active: {maskCount}{' '}
                      {maskCount === 1 ? 'region' : 'regions'} flattened onto the upload preview.
                      The unredacted areas will not be transmitted.
                    </span>
                  ) : (
                    <span>
                      Confirm before uploading: I have reviewed this screenshot and masked any
                      personal OTPs, passwords, card numbers, or private details (or none are
                      visible).
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Optional Context */}
          <div className="space-y-2">
            <label htmlFor="screenshot-context" className="block text-sm font-medium text-[#F8FAFC]">
              Optional Context{' '}
              <span className="text-xs font-normal text-slate-400">(Optional)</span>
            </label>
            <input
              id="screenshot-context"
              type="text"
              maxLength={1000}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g., Screenshot of a WhatsApp message offering daily payout tasks"
              className="w-full rounded-xl border border-slate-700/90 bg-[#050912]/90 px-4 py-2.5 text-sm text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#22D3EE] focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <ErrorBanner
              message={error}
              onRetry={canAnalyze ? () => void executeScan() : undefined}
            />
          )}

          <div className="flex items-center justify-end pt-3 border-t border-slate-800/80">
            <motion.button
              type="button"
              whileHover={canAnalyze ? { y: -1 } : undefined}
              whileTap={canAnalyze ? { scale: 0.98 } : undefined}
              transition={{ duration: 0.14 }}
              onClick={() => void executeScan()}
              disabled={!canAnalyze}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#22D3EE] text-[#050912] text-sm font-semibold hover:bg-[#38BDF8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>
                {maskCount > 0 ? 'Analyze Redacted Screenshot' : 'Analyze Screenshot'}
              </span>
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
