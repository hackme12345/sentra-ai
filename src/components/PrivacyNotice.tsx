import { Lock } from 'lucide-react';

interface PrivacyNoticeProps {
  compact?: boolean;
}

export function PrivacyNotice({ compact = false }: PrivacyNoticeProps) {
  return (
    <section
      aria-label="Privacy & Redaction Notice"
      className={`rounded-xl border border-slate-800/90 bg-[#0A1221]/85 backdrop-blur-sm ${
        compact ? 'p-4' : 'p-5'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-[#22D3EE]/10 border border-[#22D3EE]/20 flex items-center justify-center shrink-0 mt-0.5">
          <Lock className="w-3.5 h-3.5 text-[#22D3EE]" aria-hidden="true" />
        </div>
        <div className="space-y-1 text-sm leading-relaxed">
          <h3 className="font-medium text-[#F8FAFC] text-sm">Privacy Shield Active</h3>
          <p className="text-slate-300 text-xs sm:text-sm">
            Sentra AI scans locally in your browser for OTPs, PINs, cards, phones, emails, UPI
            handles, and IDs—and provides manual blackout/blur redaction for screenshots—before
            anything leaves your device.
          </p>
          <p className="text-slate-400 text-xs">
            Confirmed content is sent securely through our server to Google Gemini AI strictly for
            real-time analysis. Sentra AI never stores your messages, URLs, screenshots, or scan
            history by default.
          </p>
        </div>
      </div>
    </section>
  );
}
