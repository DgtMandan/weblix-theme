import { AnnouncementPopup } from './AnnouncementPopup.jsx';
import { AIAgentWidget } from './AIAgentWidget.jsx';
import { Footer } from './Footer.jsx';
import { Navbar } from './Navbar.jsx';
import { ScrollToTop } from './ScrollToTop.jsx';
import { MotionPage } from '../common/MotionPage.jsx';
import { usePageAnalytics } from '../../hooks/useAnalytics.js';

export function AppLayout({ children }) {
  usePageAnalytics();
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main><MotionPage>{children}</MotionPage></main>
      <AnnouncementPopup />
      <AIAgentWidget />
      <Footer />
    </>
  );
}
