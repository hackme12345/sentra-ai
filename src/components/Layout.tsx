import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpen,
  Briefcase,
  Image as ImageIcon,
  Info,
  LayoutDashboard,
  Link2,
  Lock,
  Menu,
  MessageSquareWarning,
  Trash2,
  X,
} from 'lucide-react';
import type { PageId } from '../../shared/types';
import { BrandIcon } from './BrandIcon';

interface LayoutProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  onClearSession: () => void;
  clearFeedback: string | null;
  children: ReactNode;
}

interface NavGroup {
  label: string;
  items: Array<{ id: PageId; label: string; icon: typeof LayoutDashboard }>;
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Threat Scanners',
    items: [
      { id: 'message', label: 'Message Scanner', icon: MessageSquareWarning },
      { id: 'url', label: 'URL Scanner', icon: Link2 },
      { id: 'screenshot', label: 'Screenshot Scanner', icon: ImageIcon },
      { id: 'job-offer', label: 'Job Offer Checker', icon: Briefcase },
    ],
  },
  {
    label: 'Resources',
    items: [
      { id: 'safety-center', label: 'Safety Center', icon: BookOpen },
      { id: 'about', label: 'About Sentra AI', icon: Info },
    ],
  },
];

const PAGE_LABELS: Record<PageId, string> = {
  dashboard: 'Dashboard',
  message: 'Message Scanner',
  url: 'URL Scanner',
  screenshot: 'Screenshot Scanner',
  'job-offer': 'Job Offer Checker',
  'safety-center': 'Safety Center',
  about: 'About Sentra AI',
};

export function Layout({
  activePage,
  onNavigate,
  onClearSession,
  clearFeedback,
  children,
}: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelectPage = (page: PageId) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderSidebarContent = (isMobile: boolean) => (
    <div className="flex flex-col h-full">
      {/* Brand Lockup */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/70 shrink-0">
        <button
          type="button"
          onClick={() => handleSelectPage('dashboard')}
          className="flex items-center gap-2.5 text-left cursor-pointer whitespace-nowrap shrink-0 group"
        >
          <BrandIcon className="w-7 h-7 shrink-0 transition-transform duration-150 group-hover:scale-105" />
          <span className="font-display text-lg font-bold tracking-tight text-[#F8FAFC]">
            Sentra AI
          </span>
        </button>

        {isMobile && (
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-[#F8FAFC] hover:bg-slate-800/70 transition-colors cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Grouped Navigation */}
      <nav aria-label="Main Navigation" className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1.5">
            <p className="px-3 text-xs font-medium text-slate-500">{group.label}</p>
            <div className="space-y-1">
              {group.items.map(({ id, label, icon: Icon }) => {
                const isActive = activePage === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSelectPage(id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 text-left cursor-pointer group ${
                      isActive
                        ? 'text-[#22D3EE]'
                        : 'text-slate-300 hover:text-[#F8FAFC] hover:bg-white/[0.035]'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId={isMobile ? 'mobileActiveNavBg' : 'desktopActiveNavBg'}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute inset-0 rounded-lg bg-[#22D3EE]/10 border border-[#22D3EE]/25"
                        aria-hidden="true"
                      />
                    )}
                    <Icon
                      className={`relative z-10 w-4 h-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 ${
                        isActive ? 'text-[#22D3EE]' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="relative z-10 truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Privacy & Session Reset Panel */}
      <div className="p-4 border-t border-slate-800/70 space-y-3 shrink-0 bg-[#070C17]/70">
        <div className="flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed">
          <Lock className="w-3.5 h-3.5 text-[#22D3EE] shrink-0 mt-0.5" aria-hidden="true" />
          <span>No account required · Zero default storage</span>
        </div>

        <button
          type="button"
          onClick={() => {
            onClearSession();
            setMobileMenuOpen(false);
          }}
          className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg border border-slate-800 bg-[#0E1728]/90 text-xs font-medium text-slate-200 hover:border-[#F87171]/50 hover:text-[#F87171] hover:bg-[#F87171]/5 active:scale-[0.98] transition-all duration-150 whitespace-nowrap cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Clear Session Data</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen sentra-canvas-bg text-[#F8FAFC] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-[268px] shrink-0 border-r border-slate-800/70 bg-[#090F1D]/92 backdrop-blur-md sticky top-0 h-screen">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-72 max-w-[85vw] bg-[#090F1D] border-r border-slate-800 h-full shadow-2xl"
            >
              {renderSidebarContent(true)}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Glassmorphic Sticky Top Bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-800/70 bg-[#050912]/80 backdrop-blur-md px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-300 hover:text-[#F8FAFC] hover:bg-slate-800/70 transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-slate-400 hidden sm:inline whitespace-nowrap shrink-0">
                Sentra AI
              </span>
              <span className="text-slate-600 hidden sm:inline" aria-hidden="true">
                /
              </span>
              <span className="font-medium text-[#F8FAFC] truncate">
                {PAGE_LABELS[activePage]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onClearSession}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-800 bg-[#0E1728]/85 text-xs font-medium text-slate-200 hover:border-[#F87171]/55 hover:text-[#F87171] hover:bg-[#F87171]/5 active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Clear Session Data</span>
              <span className="sm:hidden">Clear Data</span>
            </button>
          </div>
        </header>

        {/* Animated Session Cleared Toast */}
        <AnimatePresence>
          {clearFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              role="status"
              aria-live="polite"
              className="mx-4 sm:mx-6 lg:mx-10 mt-4 rounded-xl border border-[#34D399]/30 bg-[#34D399]/10 px-4 py-2.5 text-sm text-[#34D399]"
            >
              {clearFeedback}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Viewport */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-7 sm:py-9">
          {children}
        </main>

        {/* Quiet Footer */}
        <footer className="border-t border-slate-800/60 px-4 sm:px-6 lg:px-10 py-5 text-xs text-slate-400">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span>Sentra AI · Think Before You Trust.</span>
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => handleSelectPage('safety-center')}
                className="hover:text-[#22D3EE] transition-colors cursor-pointer"
              >
                Safety Center
              </button>
              <button
                type="button"
                onClick={() => handleSelectPage('about')}
                className="hover:text-[#22D3EE] transition-colors cursor-pointer"
              >
                About Sentra AI
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
