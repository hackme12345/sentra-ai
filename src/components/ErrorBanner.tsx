import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-[#F87171]/35 bg-[#F87171]/10 backdrop-blur-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#F87171] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-[#F8FAFC] leading-relaxed">{message}</p>
        </div>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#0E1728] border border-slate-700 text-sm font-medium text-[#F8FAFC] hover:border-[#22D3EE] hover:text-[#22D3EE] active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          <span>Retry Analysis</span>
        </button>
      )}
    </div>
  );
}
