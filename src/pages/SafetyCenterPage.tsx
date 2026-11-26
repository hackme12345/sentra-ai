import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { SAFETY_TOPICS } from '../data/safetyContent';

export function SafetyCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(SAFETY_TOPICS[0]?.id ?? null);

  const categories = useMemo(
    () => Array.from(new Set(SAFETY_TOPICS.map((topic) => topic.category))),
    []
  );

  const filteredTopics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return SAFETY_TOPICS.filter((topic) => {
      const matchesCategory =
        selectedCategory === 'ALL' || topic.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      const blob = [
        topic.title,
        topic.category,
        topic.summary,
        topic.howItWorks,
        ...topic.redFlags,
        ...topic.verificationChecklist,
        ...topic.reportingGuidance,
      ]
        .join(' ')
        .toLowerCase();
      return blob.includes(q);
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC]">
          Safety Center
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          Practical guides to recognize common digital scams, verify claims independently, and
          report fraud through official channels.
        </p>
      </header>

      {/* Emergency Response Callout */}
      <section className="rounded-xl border border-[#F87171]/35 bg-[#F87171]/8 backdrop-blur-sm p-5 flex items-start gap-3.5">
        <PhoneCall className="w-5 h-5 text-[#F87171] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <h2 className="text-sm sm:text-base font-semibold text-[#F8FAFC]">
            Acted on a scam or shared financial details?
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Immediately contact your bank’s official fraud helpline to freeze cards or accounts,
            change compromised passwords, enable multi-factor authentication, and report the
            incident to your national cybercrime portal (for example, India National Cyber Crime
            Helpline 1930 / cybercrime.gov.in, US reportfraud.ftc.gov, or UK Action Fraud).
          </p>
        </div>
      </section>

      {/* Search & Category Filter Controls */}
      <div className="space-y-4">
        <div className="relative max-w-xl">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scams, red flags, or verification steps..."
            aria-label="Search scams, red flags, or verification steps"
            className="w-full rounded-xl border border-slate-700/90 bg-[#0A1221]/90 pl-10 pr-4 py-2.5 text-sm text-[#F8FAFC] placeholder:text-slate-400 focus:border-[#22D3EE] focus:outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#0A1221]/90 border border-slate-800 w-fit">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            aria-pressed={selectedCategory === 'ALL'}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-[#22D3EE] text-[#050912] font-semibold'
                : 'text-slate-300 hover:text-[#F8FAFC]'
            }`}
          >
            All Topics
          </button>

          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={active}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#22D3EE] text-[#050912] font-semibold'
                    : 'text-slate-300 hover:text-[#F8FAFC]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Educational Topics List */}
      {filteredTopics.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/90 sentra-glass p-8 text-center text-sm text-slate-400">
          No safety guides match your current search filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTopics.map((topic, index) => {
            const isOpen = expandedId === topic.id;
            return (
              <article
                key={topic.id}
                className="rounded-2xl border border-slate-800/90 sentra-glass overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isOpen ? null : topic.id)}
                  aria-expanded={isOpen}
                  className="w-full p-5 sm:p-6 flex items-start justify-between gap-4 text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-400">
                      <span className="font-mono tabular-nums text-[#22D3EE]">0{index + 1}</span>
                      <span aria-hidden="true">·</span>
                      <span>{topic.category}</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-[#F8FAFC]">
                      {topic.title}
                    </h2>
                    <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                      {topic.summary}
                    </p>
                  </div>

                  <span className="mt-1 text-slate-400 shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-5 h-5" aria-hidden="true" />
                    )}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                      className="px-5 sm:px-6 pb-6 pt-3 border-t border-slate-800/80 space-y-6"
                    >
                      <div className="space-y-1.5">
                        <h3 className="text-sm font-semibold text-[#F8FAFC]">
                          How It Typically Works
                        </h3>
                        <p className="text-sm text-slate-300 leading-relaxed">{topic.howItWorks}</p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                          <h3 className="text-sm font-semibold text-[#F87171] flex items-center gap-2">
                            <AlertOctagon className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span>Key Warning Signs</span>
                          </h3>
                          <ul className="space-y-2 text-sm text-slate-300 leading-relaxed">
                            {topic.redFlags.map((flag, idx) => (
                              <li key={`${idx}-${flag}`} className="flex items-start gap-2">
                                <span className="text-[#F87171]" aria-hidden="true">
                                  –
                                </span>
                                <span>{flag}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2.5">
                          <h3 className="text-sm font-semibold text-[#34D399] flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span>Independent Verification Checklist</span>
                          </h3>
                          <ul className="space-y-2 text-sm text-slate-300 leading-relaxed">
                            {topic.verificationChecklist.map((step, idx) => (
                              <li key={`${idx}-${step}`} className="flex items-start gap-2">
                                <span className="text-[#34D399]" aria-hidden="true">
                                  –
                                </span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="rounded-xl bg-[#050912]/90 border border-slate-800 p-4 space-y-2">
                        <h3 className="text-sm font-semibold text-[#22D3EE]">Reporting Guidance</h3>
                        <ul className="space-y-1.5 text-sm text-slate-300 leading-relaxed">
                          {topic.reportingGuidance.map((guide, idx) => (
                            <li key={`${idx}-${guide}`} className="flex items-start gap-2">
                              <span className="text-slate-500" aria-hidden="true">
                                –
                              </span>
                              <span>{guide}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
