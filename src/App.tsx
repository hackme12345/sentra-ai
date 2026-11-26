import { useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import type { DemoHandoff, PageId } from '../shared/types';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { MessageScannerPage } from './pages/MessageScannerPage';
import { UrlScannerPage } from './pages/UrlScannerPage';
import { ScreenshotScannerPage } from './pages/ScreenshotScannerPage';
import { JobOfferCheckerPage } from './pages/JobOfferCheckerPage';
import { SafetyCenterPage } from './pages/SafetyCenterPage';
import { AboutPage } from './pages/AboutPage';

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [pendingDemo, setPendingDemo] = useState<DemoHandoff | null>(null);
  const [resetToken, setResetToken] = useState(0);
  const [clearFeedback, setClearFeedback] = useState<string | null>(null);

  const handleLaunchDemo = (handoff: DemoHandoff) => {
    setPendingDemo(handoff);
    setActivePage(handoff.targetPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearSession = () => {
    setPendingDemo(null);
    setResetToken((prev) => prev + 1);
    setClearFeedback('All session inputs and results have been cleared.');
    window.setTimeout(() => {
      setClearFeedback(null);
    }, 3500);
  };

  return (
    <MotionConfig reducedMotion="user">
      <Layout
        activePage={activePage}
        onNavigate={setActivePage}
        onClearSession={handleClearSession}
        clearFeedback={clearFeedback}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            {activePage === 'dashboard' && (
              <DashboardPage
                onNavigate={setActivePage}
                onLaunchDemo={handleLaunchDemo}
              />
            )}

            {activePage === 'message' && (
              <MessageScannerPage
                pendingDemo={pendingDemo}
                onDemoConsumed={() => setPendingDemo(null)}
                resetToken={resetToken}
              />
            )}

            {activePage === 'url' && (
              <UrlScannerPage
                pendingDemo={pendingDemo}
                onDemoConsumed={() => setPendingDemo(null)}
                resetToken={resetToken}
              />
            )}

            {activePage === 'screenshot' && (
              <ScreenshotScannerPage resetToken={resetToken} />
            )}

            {activePage === 'job-offer' && (
              <JobOfferCheckerPage
                pendingDemo={pendingDemo}
                onDemoConsumed={() => setPendingDemo(null)}
                resetToken={resetToken}
              />
            )}

            {activePage === 'safety-center' && <SafetyCenterPage />}

            {activePage === 'about' && <AboutPage />}
          </motion.div>
        </AnimatePresence>
      </Layout>
    </MotionConfig>
  );
}
