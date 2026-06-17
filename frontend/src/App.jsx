import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/ToastProvider';
import { AdminRoute } from './components/ProtectedRoute';
import AppShell from './components/AppShell';

// Auth / public pages
import Signup from './components/signup';
import Signin from './components/signin';
import AdminLogin from './pages/AdminLogin';
import ForgotPassword from './pages/ForgotPassword';
import PasswordReset from './pages/PasswordReset';
import EmailVerify from './pages/EmailVerify';

// User app pages
import Home from './pages/Home';
import Journal from './pages/Journal';
import Insights from './pages/Insights';
import ChatbotPage from './pages/Chatbot';
import Resources from './pages/Resources';
import Reviews from './pages/Reviews';

// Admin pages (own layout via AdminPanel sidebar)
import AddBooks from './pages/AddBooks';
import AddVideo from './pages/AddVideos';
import DeleteBooks from './pages/DeleteBooks';
import DeleteVideo from './pages/DeleteVideos';
import AdminPanel from './components/ui/AdminPanel';
import ViewReviews from './components/viewreviews';
import ViewUsers from './components/viewusers';

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="text-7xl font-display font-bold text-neutral-200 mb-4">404</p>
      <h1 className="text-xl font-semibold text-neutral-800 mb-2">Page not found</h1>
      <p className="text-sm text-neutral-500 mb-6">
        The page you are looking for does not exist or has moved.
      </p>
      <a
        href="/home"
        className="inline-flex h-10 items-center rounded-button bg-primary-500 px-5 text-sm font-semibold text-white hover:bg-primary-600 transition-all duration-150"
      >
        Back to home
      </a>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <Routes>
          {/* ── Root ─────────────────────────────────────────── */}
          <Route path="/" element={<Navigate to="/signin" replace />} />

          {/* ── Auth / Public (no app shell) ─────────────────── */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/passwordreset/:id/:token" element={<PasswordReset />} />
          <Route path="/verifyemail/:id/:token" element={<EmailVerify />} />

          {/* ── Admin routes (own layout) ─────────────────────── */}
          <Route path="/admin-panel"  element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="/addbooks"     element={<AdminRoute><AddBooks /></AdminRoute>} />
          <Route path="/addvideos"    element={<AdminRoute><AddVideo /></AdminRoute>} />
          <Route path="/deletebooks"  element={<AdminRoute><DeleteBooks /></AdminRoute>} />
          <Route path="/deletevideos" element={<AdminRoute><DeleteVideo /></AdminRoute>} />
          <Route path="/viewreviews"  element={<AdminRoute><ViewReviews /></AdminRoute>} />
          <Route path="/viewusers"    element={<AdminRoute><ViewUsers /></AdminRoute>} />

          {/* ── User app (AppShell layout — auth checked inside AppShell) */}
          <Route element={<AppShell />}>
            <Route path="/home"      element={<Home />} />
            <Route path="/journal"   element={<Journal />} />
            <Route path="/insights"  element={<Insights />} />
            <Route path="/chatbot"   element={<ChatbotPage />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/reviews"   element={<Reviews />} />

            {/* Legacy route redirects */}
            <Route path="/getjournals"       element={<Navigate to="/journal?tab=history" replace />} />
            <Route path="/analysis"          element={<Navigate to="/insights" replace />} />
            <Route path="/emotiondetection"  element={<Navigate to="/insights" replace />} />
            <Route path="/books"             element={<Navigate to="/resources?tab=books" replace />} />
            <Route path="/videocategorized"  element={<Navigate to="/resources" replace />} />
            <Route path="/addreview"         element={<Navigate to="/reviews" replace />} />
            <Route path="/updatereviews"     element={<Navigate to="/reviews" replace />} />
          </Route>

          {/* ── 404 ──────────────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ToastProvider>
    </Router>
  );
}
