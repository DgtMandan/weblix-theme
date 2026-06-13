import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout.jsx';
import { ProtectedRoute } from './components/layout/ProtectedRoute.jsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx';
import { AnalyticsDashboard } from './pages/admin/AnalyticsDashboard.jsx';
import { AdminOrders } from './pages/admin/AdminOrders.jsx';
import { AdminSettings } from './pages/admin/AdminSettings.jsx';
import { AdminUsers } from './pages/admin/AdminUsers.jsx';
import { GoogleTrends } from './pages/admin/GoogleTrends.jsx';
import { ManageCoupons } from './pages/admin/ManageCoupons.jsx';
import { ManageAnnouncements } from './pages/admin/ManageAnnouncements.jsx';
import { ManageBlogs } from './pages/admin/ManageBlogs.jsx';
import { ManageLeads } from './pages/admin/ManageLeads.jsx';
import { ManageProducts } from './pages/admin/ManageProducts.jsx';
import { ManageTemplates } from './pages/admin/ManageTemplates.jsx';
import { ScheduledPosts } from './pages/admin/ScheduledPosts.jsx';
import { TrendSettings } from './pages/admin/TrendSettings.jsx';
import { ForgotPassword } from './pages/auth/ForgotPassword.jsx';
import { Login } from './pages/auth/Login.jsx';
import { OAuthSuccess } from './pages/auth/OAuthSuccess.jsx';
import { ResetPassword } from './pages/auth/ResetPassword.jsx';
import { Signup } from './pages/auth/Signup.jsx';
import { Blog } from './pages/Blog.jsx';
import { BlogDetails } from './pages/BlogDetails.jsx';
import { Checkout } from './pages/Checkout.jsx';
import { Contact } from './pages/Contact.jsx';
import { FAQ } from './pages/FAQ.jsx';
import { About } from './pages/About.jsx';
import { AIAgent } from './pages/AIAgent.jsx';
import { Home } from './pages/Home.jsx';
import { NotFound } from './pages/NotFound.jsx';
import { Pricing } from './pages/Pricing.jsx';
import { ProductDetails } from './pages/ProductDetails.jsx';
import { PrivacyPolicy } from './pages/PrivacyPolicy.jsx';
import { RequestCustomWebsite } from './pages/RequestCustomWebsite.jsx';
import { Search } from './pages/Search.jsx';
import { StaticPage } from './pages/StaticPage.jsx';
import { TemplateDetails } from './pages/TemplateDetails.jsx';
import { Templates } from './pages/Templates.jsx';
import { TermsConditions } from './pages/TermsConditions.jsx';
import { Dashboard } from './pages/dashboard/Dashboard.jsx';

function Public({ children }) {
  return <AppLayout>{children}</AppLayout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Public><Home /></Public>} />
      <Route path="/templates" element={<Public><Templates /></Public>} />
      <Route path="/templates/:slug" element={<Public><TemplateDetails /></Public>} />
      <Route path="/product/:slug" element={<Public><ProductDetails /></Public>} />
      <Route path="/blog" element={<Public><Blog /></Public>} />
      <Route path="/blog/:slug" element={<Public><BlogDetails /></Public>} />
      <Route path="/pricing" element={<Public><Pricing /></Public>} />
      <Route path="/about" element={<Public><About /></Public>} />
      <Route path="/contact" element={<Public><Contact /></Public>} />
      <Route path="/request-custom-website" element={<Public><RequestCustomWebsite /></Public>} />
      <Route path="/search" element={<Public><Search /></Public>} />
      <Route path="/ai-agent" element={<Public><AIAgent /></Public>} />
      <Route path="/faq" element={<Public><FAQ /></Public>} />
      <Route path="/privacy-policy" element={<Public><PrivacyPolicy /></Public>} />
      <Route path="/terms-and-conditions" element={<Public><TermsConditions /></Public>} />
      <Route path="/login" element={<Public><Login /></Public>} />
      <Route path="/signup" element={<Public><Signup /></Public>} />
      <Route path="/forgot-password" element={<Public><ForgotPassword /></Public>} />
      <Route path="/reset-password/:token" element={<Public><ResetPassword /></Public>} />
      <Route path="/oauth/success" element={<Public><OAuthSuccess /></Public>} />

      <Route element={<ProtectedRoute />}>
        <Route path="/checkout/:orderId" element={<Public><Checkout /></Public>} />
        <Route path="/dashboard" element={<Public><Dashboard /></Public>} />
        <Route path="/downloads" element={<Public><Dashboard /></Public>} />
      </Route>

      <Route element={<ProtectedRoute admin />}>
        <Route path="/admin" element={<Public><AdminDashboard /></Public>} />
        <Route path="/admin/analytics" element={<Public><AnalyticsDashboard /></Public>} />
        <Route path="/admin/products" element={<Public><ManageProducts /></Public>} />
        <Route path="/admin/templates" element={<Public><ManageTemplates /></Public>} />
        <Route path="/admin/coupons" element={<Public><ManageCoupons /></Public>} />
        <Route path="/admin/leads" element={<Public><ManageLeads /></Public>} />
        <Route path="/admin/announcements" element={<Public><ManageAnnouncements /></Public>} />
        <Route path="/admin/blogs" element={<Public><ManageBlogs /></Public>} />
        <Route path="/admin/trends" element={<Public><GoogleTrends /></Public>} />
        <Route path="/admin/trends/settings" element={<Public><TrendSettings /></Public>} />
        <Route path="/admin/trends/scheduled" element={<Public><ScheduledPosts /></Public>} />
        <Route path="/admin/users" element={<Public><AdminUsers /></Public>} />
        <Route path="/admin/orders" element={<Public><AdminOrders /></Public>} />
        <Route path="/admin/settings" element={<Public><AdminSettings /></Public>} />
      </Route>
      <Route path="*" element={<Public><NotFound /></Public>} />
    </Routes>
  );
}
