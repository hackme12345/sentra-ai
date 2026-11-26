import { Cpu, Info, Lock, Scale, ShieldCheck } from 'lucide-react';
import { BrandIcon } from '../components/BrandIcon';

const ARCHITECTURE_POINTS = [
  'Frontend: React, TypeScript, Tailwind CSS, accessible responsive layout, and lightweight animations.',
  'Secure Server Proxy: Express backend keeps the Google Gemini API key strictly on the server, validates all payloads with Zod, enforces magic-byte image checks (5 MB cap), and applies sliding-window rate limits.',
  'AI Analysis Engine: Powered by Google Gemini multimodal structured output with strict prompt-injection isolation—treating every submitted text, URL, and screenshot strictly as untrusted data.',
  'Static URL Structural Parser: Performs deterministic local URL breakdown (scheme, subdomains, Punycode, IP host, shorteners, parameters) without ever opening or fetching submitted websites.',
];

const PRIVACY_POINTS = [
  'No account registration or login required for scanning.',
  'Zero retention by default: submitted messages, URLs, screenshots, and reports are processed in memory and not saved to any database or disk.',
  'Pre-submission redaction reminders and a built-in client-side sensitive-digit masking helper encourage users to strip OTPs and card numbers before scanning.',
  'External AI disclosure is surfaced clearly on every scanner, paired with a one-click Clear Session Data control.',
];

const RESPONSIBLE_AI_POINTS = [
  'Evidence over black-box verdicts: every warning sign cites specific text or structural cues observed directly in the submission.',
  'Honest uncertainty: when context is incomplete or an image is unreadable, Sentra AI reports Inconclusive and lists missing information rather than guessing.',
  'No fabricated reputation data: Sentra AI never invents WHOIS dates, blacklist statuses, or live website scans it did not perform.',
  'Any-language input analysis: suspicious messages or screenshots submitted in any language are analyzed accurately, with clear, consistent English reports.',
];

const RUBRIC_BANDS = [
  {
    range: '0 – 29',
    level: 'Low Risk',
    meaning:
      'Few or no scam indicators observed in the submitted content. Does NOT prove safety; verify critical requests independently.',
  },
  {
    range: '30 – 64',
    level: 'Medium Risk',
    meaning:
      'Notable warning signs or unverified claims detected. Pause and independently verify through official channels before responding.',
  },
  {
    range: '65 – 100',
    level: 'High Risk',
    meaning:
      'Multiple strong scam or phishing indicators present. Do not click links, share credentials, or send money.',
  },
  {
    range: 'N/A',
    level: 'Inconclusive',
    meaning:
      'Submitted content is too brief, ambiguous, or unreadable to evaluate reliably. Gather official verification before trusting.',
  },
];

const LIMITATIONS_POINTS = [
  'The 0–100 Heuristic Risk Index is an educational rubric score based on observed cues—not a statistically validated probability.',
  'A Low-risk score never guarantees legitimacy; sophisticated or targeted scams may contain few textual red flags.',
  'URL scanning is structural and linguistic only; it does not check live site content, SSL certificates, or real-time threat intelligence feeds.',
  'AI models can occasionally misinterpret cultural idioms, legitimate informal messages, or heavily cropped screenshots. Human verification remains essential.',
];

export function AboutPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <BrandIcon className="w-8 h-8 shrink-0" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC]">
            About Sentra AI
          </h1>
        </div>
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          An explainable, privacy-first digital safety assistant built to help everyday users pause,
          inspect evidence, and verify before acting.
        </p>
      </header>

      {/* Mission */}
      <section className="rounded-2xl border border-slate-800/90 sentra-glass p-6 sm:p-8 space-y-3">
        <h2 className="text-xl font-semibold text-[#F8FAFC]">Mission: Think Before You Trust</h2>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-4xl">
          Modern digital scams succeed by exploiting speed, emotion, and trust. Sentra AI equips
          users with immediate, structured second opinions on suspicious messages, URLs,
          screenshots, and job offers—turning vague suspicion into clear, explainable English
          evidence and practical verification steps, regardless of the language the suspicious item
          was written in.
        </p>
      </section>

      {/* Architecture + Privacy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-slate-800/90 sentra-glass p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#22D3EE] shrink-0" aria-hidden="true" />
            <span>Technology & Architecture</span>
          </h2>
          <ul className="space-y-3 text-sm text-slate-300 leading-relaxed">
            {ARCHITECTURE_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2.5">
                <span className="text-[#22D3EE]" aria-hidden="true">
                  –
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-800/90 sentra-glass p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#34D399] shrink-0" aria-hidden="true" />
            <span>Privacy-First Design</span>
          </h2>
          <ul className="space-y-3 text-sm text-slate-300 leading-relaxed">
            {PRIVACY_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2.5">
                <span className="text-[#34D399]" aria-hidden="true">
                  –
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Transparent Scoring Rubric Table */}
      <section className="rounded-2xl border border-slate-800/90 sentra-glass p-6 sm:p-8 space-y-5">
        <div className="space-y-2">
          <h2 className="text-lg sm:text-xl font-semibold text-[#F8FAFC] flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#22D3EE] shrink-0" aria-hidden="true" />
            <span>Transparent Heuristic Scoring Rubric</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Each analysis evaluates four equally weighted dimensions (0–25 points each, totaling
            0–100): (1) Impersonation & Identity Signals, (2) Urgency & Psychological Manipulation,
            (3) Financial, Credential, or Action Demands, and (4) Technical, Structural, or Context
            Anomalies.
          </p>
        </div>

        <div className="overflow-x-auto border-t border-slate-800">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400">
                <th className="py-3 pr-4 font-medium">Index Range</th>
                <th className="py-3 pr-4 font-medium">Classification</th>
                <th className="py-3 font-medium">Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {RUBRIC_BANDS.map((band) => (
                <tr key={band.level} className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-3.5 pr-4 font-mono tabular-nums text-[#22D3EE] whitespace-nowrap">
                    {band.range}
                  </td>
                  <td className="py-3.5 pr-4 font-medium text-[#F8FAFC] whitespace-nowrap">
                    {band.level}
                  </td>
                  <td className="py-3.5 text-slate-300 leading-relaxed">{band.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Responsible AI + Limitations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-slate-800/90 sentra-glass p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#6366F1] shrink-0" aria-hidden="true" />
            <span>Responsible AI Principles</span>
          </h2>
          <ul className="space-y-3 text-sm text-slate-300 leading-relaxed">
            {RESPONSIBLE_AI_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2.5">
                <span className="text-[#6366F1]" aria-hidden="true">
                  –
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-800/90 sentra-glass p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2">
            <Info className="w-5 h-5 text-[#FBBF24] shrink-0" aria-hidden="true" />
            <span>Known Limitations</span>
          </h2>
          <ul className="space-y-3 text-sm text-slate-300 leading-relaxed">
            {LIMITATIONS_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2.5">
                <span className="text-[#FBBF24]" aria-hidden="true">
                  –
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
