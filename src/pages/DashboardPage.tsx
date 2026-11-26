import { motion } from 'motion/react';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  FlaskConical,
  Image as ImageIcon,
  Info,
  Link2,
  MessageSquareWarning,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import type { DemoHandoff, PageId } from '../../shared/types';
import { DASHBOARD_DEMO_SCENARIOS } from '../data/demoExamples';
import { BrandIcon } from '../components/BrandIcon';

interface DashboardPageProps {
  onNavigate: (page: PageId) => void;
  onLaunchDemo: (handoff: DemoHandoff) => void;
}

const SCANNER_CARDS: Array<{
  id: PageId;
  icon: typeof MessageSquareWarning;
  title: string;
  desc: string;
  checks: string;
}> = [
  {
    id: 'message',
    icon: MessageSquareWarning,
    title: 'Message Scanner',
    desc: 'Paste SMS, WhatsApp texts, emails, or DMs in any language to detect phishing, impersonation, urgency, and payment traps.',
    checks: 'Phishing · Impersonation · Urgency · Credential Requests',
  },
  {
    id: 'url',
    icon: Link2,
    title: 'URL Scanner',
    desc: 'Inspect suspicious web addresses safely without visiting them. Evaluates domain structure, spoofing cues, and parameters.',
    checks: 'Structure Only · Lookalike Domains · Punycode · Shorteners',
  },
  {
    id: 'screenshot',
    icon: ImageIcon,
    title: 'Screenshot Scanner',
    desc: 'Upload JPG, PNG, or WEBP screenshots (up to 5 MB) for Gemini multimodal text and visual scam inspection.',
    checks: 'Multimodal Vision · Visible Text · Fake Notices · UPI Traps',
  },
  {
    id: 'job-offer',
    icon: Briefcase,
    title: 'Job Offer Checker',
    desc: 'Evaluate recruitment messages for upfront fees, unrealistic pay, unverified recruiters, and fake company claims.',
    checks: 'Upfront Fees · Unrealistic Pay · Off-Platform Pressure',
  },
];

const RUBRIC_PILLARS = [
  { index: '01', name: 'Impersonation & Identity Signals', weight: '0–25 pts' },
  { index: '02', name: 'Urgency & Psychological Pressure', weight: '0–25 pts' },
  { index: '03', name: 'Financial or Credential Demand', weight: '0–25 pts' },
  { index: '04', name: 'Technical & Structural Anomalies', weight: '0–25 pts' },
];

const SAFETY_TIPS = [
  {
    title: 'Never share an OTP or UPI PIN to receive money',
    body: 'Legitimate refunds, prizes, and salary payouts never require entering a UPI PIN, scanning a collect QR code, or sharing a one-time passcode.',
  },
  {
    title: 'Verify via an independent channel',
    body: 'Ignore phone numbers and links inside a suspicious alert. Open your bank’s official app or type the official domain manually.',
  },
  {
    title: 'Pause when pressured by a countdown',
    body: 'Phrases like "account blocked in 2 hours" or "last 3 slots remaining" are engineered to bypass careful verification.',
  },
  {
    title: 'Real employers do not charge registration fees',
    body: 'Be wary of part-time task jobs or interviews requiring security deposits, kit charges, or Telegram-only onboarding.',
  },
];

const WHAT_IT_DOES = [
  'Linguistic manipulation, urgency, authority impersonation, and credential or payment traps across SMS, WhatsApp, email, and social posts—including messages written in any language, with clear English reports.',
  'Structural URL inspection (homoglyphs, Punycode, misleading subdomains, IP hosts, shorteners, and suspicious parameters) without visiting the destination.',
  'Multimodal screenshot review of visible chat bubbles, fake receipts, UPI prompts, and deceptive layouts using Gemini vision.',
  'Recruitment fraud patterns including upfront fees, unrealistic salary claims, and unverified personal recruiter contacts.',
];

const BOUNDARIES = [
  'The Heuristic Risk Index (0–100) reflects observed rubric signals—it is not a statistically validated probability of fraud.',
  'A Low-risk result never proves a message, URL, or offer is safe or legitimate.',
  'URL scanning checks structure and wording only; it does not perform live website reputation lookups, malware execution, or WHOIS verification.',
  'Always verify banking, delivery, or hiring claims directly through official apps, websites, or phone numbers you look up independently.',
];

export function DashboardPage({ onNavigate, onLaunchDemo }: DashboardPageProps) {
  return (
    <div className="space-y-12">
      {/* Architectural Split Hero */}
      <section className="rounded-2xl border border-slate-800/90 sentra-hero-surface p-6 sm:p-9 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Primary Editorial Hero Column */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-sm font-medium text-[#22D3EE]">
                <BrandIcon className="w-7 h-7 shrink-0" />
                <span>Sentra AI</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-[-0.025em] text-[#F8FAFC] leading-[1.12]">
                Think Before You Trust.
              </h1>

              <p className="text-base text-slate-300 leading-relaxed max-w-xl">
                Inspect suspicious messages, URLs, screenshots, and job offers with Google Gemini
                AI. Surface verbatim evidence, review a transparent 0–100 heuristic rubric, and get
                practical English verification steps before you act.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.14 }}
                onClick={() => onNavigate('message')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#22D3EE] text-[#050912] text-sm font-semibold hover:bg-[#38BDF8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Scan a Message</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.14 }}
                onClick={() => onNavigate('safety-center')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-700/90 bg-[#050912]/70 text-sm font-medium text-[#F8FAFC] hover:border-[#22D3EE]/70 hover:text-[#22D3EE] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Explore Safety Center</span>
              </motion.button>
            </div>
          </div>

          {/* Transparent Rubric Framework Overview (Zero Fabricated Metrics) */}
          <div className="lg:col-span-5 rounded-xl border border-slate-800/90 bg-[#070D19]/85 p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-[#22D3EE]">
                <Scale className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Explainable Scoring Architecture</span>
              </div>
              <h2 className="text-base font-semibold text-[#F8FAFC]">
                4-Dimension Heuristic Rubric
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every scan evaluates four equal criteria totaling 0–100, citing direct evidence from
                your submission.
              </p>
            </div>

            <div className="divide-y divide-slate-800/80 border-t border-slate-800/80">
              {RUBRIC_PILLARS.map((pillar) => (
                <div
                  key={pillar.index}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono tabular-nums text-xs text-slate-500 shrink-0">
                      {pillar.index}
                    </span>
                    <span className="text-slate-200 truncate">{pillar.name}</span>
                  </div>
                  <span className="font-mono tabular-nums text-xs text-[#22D3EE] whitespace-nowrap shrink-0">
                    {pillar.weight}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Four Primary Scanner Modules */}
      <section aria-labelledby="modules-heading" className="space-y-5">
        <div>
          <h2 id="modules-heading" className="text-2xl font-semibold tracking-tight text-[#F8FAFC]">
            Scanner Modules
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Choose the analysis tool that matches the suspicious item you received.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SCANNER_CARDS.map(({ id, icon: Icon, title, desc, checks }) => (
            <motion.button
              key={id}
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => onNavigate(id)}
              className="group text-left rounded-2xl border border-slate-800/90 sentra-glass p-6 hover:border-[#22D3EE]/50 transition-colors duration-150 flex flex-col justify-between gap-5 cursor-pointer"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#050912]/90 border border-slate-800 flex items-center justify-center text-[#22D3EE] group-hover:border-[#22D3EE]/45 transition-colors">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <ArrowRight
                    className="w-4 h-4 text-slate-500 group-hover:text-[#22D3EE] group-hover:translate-x-1 transition-all duration-150"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#F8FAFC] group-hover:text-[#22D3EE] transition-colors">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">{desc}</p>
                </div>
              </div>

              <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs text-slate-400">
                <span className="truncate">{checks}</span>
                <span className="text-[#22D3EE] font-medium whitespace-nowrap shrink-0">
                  Open Scanner
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Interactive Sample Analysis — Hackathon Demo Mode */}
      <section
        aria-labelledby="demo-heading"
        className="rounded-2xl border border-slate-800/90 sentra-glass p-6 sm:p-8 space-y-6"
      >
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-medium text-[#22D3EE]">
            <FlaskConical className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Fictional Demo Sample</span>
          </div>
          <h2 id="demo-heading" className="text-2xl font-semibold tracking-tight text-[#F8FAFC]">
            Interactive Hackathon Demo Mode
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Load a clearly labeled fictional example and run it through the live Gemini analysis
            engine to see structured evidence and scoring in action.
          </p>
        </div>

        <p className="text-xs text-slate-400">
          All examples below are fictional scenarios created solely for testing and demonstration.
        </p>

        <div className="divide-y divide-slate-800/80 border-t border-slate-800/80">
          {DASHBOARD_DEMO_SCENARIOS.map((scenario) => (
            <div
              key={scenario.id}
              className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.015] -mx-3 px-3 rounded-xl transition-colors"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-400">
                  <span className="text-[#22D3EE] font-medium">{scenario.tag}</span>
                  <span aria-hidden="true">·</span>
                  <span>{scenario.expectedCue}</span>
                </div>
                <h3 className="text-base font-medium text-[#F8FAFC]">{scenario.title}</h3>
                <p className="text-sm text-slate-400">{scenario.shortDesc}</p>
              </div>

              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.14 }}
                onClick={() => onLaunchDemo(scenario.handoff)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-700/90 bg-[#050912]/80 text-sm font-medium text-[#F8FAFC] hover:border-[#22D3EE] hover:text-[#22D3EE] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Open & Analyze Sample</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </motion.button>
            </div>
          ))}
        </div>
      </section>

      {/* Practical Digital Safety Tips */}
      <section aria-labelledby="tips-heading" className="space-y-5">
        <div>
          <h2 id="tips-heading" className="text-2xl font-semibold tracking-tight text-[#F8FAFC]">
            Practical Digital Safety Habits
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Core verification habits that protect against social engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SAFETY_TIPS.map((tip, idx) => (
            <article
              key={tip.title}
              className="rounded-2xl border border-slate-800/90 sentra-glass p-6 space-y-2"
            >
              <div className="text-xs font-mono tabular-nums text-[#22D3EE]">0{idx + 1}</div>
              <h3 className="text-base font-semibold text-[#F8FAFC]">{tip.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{tip.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Transparent Capabilities & Honest Boundaries */}
      <section aria-labelledby="capabilities-heading" className="space-y-5">
        <div>
          <h2
            id="capabilities-heading"
            className="text-2xl font-semibold tracking-tight text-[#F8FAFC]"
          >
            Capabilities & Honest Boundaries
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Sentra AI is designed for transparency—clear about what it analyzes and what requires
            independent verification.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-slate-800/90 sentra-glass p-6 space-y-4">
            <h3 className="text-base font-semibold text-[#F8FAFC] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#34D399] shrink-0" aria-hidden="true" />
              <span>What Sentra AI Analyzes</span>
            </h3>
            <ul className="space-y-3 text-sm text-slate-300 leading-relaxed">
              {WHAT_IT_DOES.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2
                    className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-800/90 sentra-glass p-6 space-y-4">
            <h3 className="text-base font-semibold text-[#F8FAFC] flex items-center gap-2">
              <Info className="w-5 h-5 text-[#FBBF24] shrink-0" aria-hidden="true" />
              <span>Important Limitations</span>
            </h3>
            <ul className="space-y-3 text-sm text-slate-300 leading-relaxed">
              {BOUNDARIES.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="text-slate-500 mt-0.5 shrink-0" aria-hidden="true">
                    –
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
