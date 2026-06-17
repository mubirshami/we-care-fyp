import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '../components/ui/ToastProvider';
import { AdminRoute } from '../components/layout/AdminRoute';
import AppShell from '../components/layout/AppShell';

// Auth / public pages
import SignUp from '../features/auth/SignUp';
import SignIn from '../features/auth/SignIn';
import AdminLogin from '../features/admin/AdminLogin';
import ForgotPassword from '../features/auth/ForgotPassword';
import PasswordReset from '../features/auth/PasswordReset';
import EmailVerify from '../features/auth/EmailVerify';

// User app pages
import Home from '../features/dashboard/Dashboard';
import Journal from '../features/journal/Journal';
import Insights from '../features/insights/Insights';
import ChatbotPage from '../features/chatbot/Chatbot';
import Resources from '../features/resources/Resources';
import Reviews from '../features/reviews/Reviews';

// Admin pages
import BooksPanel from '../features/admin/BooksPanel';
import VideosPanel from '../features/admin/VideosPanel';
import AdminShell from '../features/admin/AdminShell';
import ReviewsPanel from '../features/admin/ReviewsPanel';
import UsersPanel from '../features/admin/UsersPanel';

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="text-7xl font-display font-bold text-neutral-200 mb-4">404</p>
      <h1 className="text-xl font-semibold text-neutral-800 mb-2">Page not found</h1>
      <p className="text-sm text-neutral-500 mb-6">The page you are looking for does not exist or has moved.</p>
      <a href="/home" className="inline-flex h-10 items-center rounded-button bg-primary-500 px-5 text-sm font-semibold text-white hover:bg-primary-600 transition-all duration-150">
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
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/passwordreset/:id/:token" element={<PasswordReset />} />
          <Route path="/verifyemail/:id/:token" element={<EmailVerify />} />

          {/* ── Admin routes (own layout) ─────────────────────── */}
          <Route path="/admin-panel"  element={<AdminRoute><AdminShell /></AdminRoute>} />
          <Route path="/addbooks"     element={<AdminRoute><BooksPanel /></AdminRoute>} />
          <Route path="/deletebooks"  element={<AdminRoute><BooksPanel /></AdminRoute>} />
          <Route path="/addvideos"    element={<AdminRoute><VideosPanel /></AdminRoute>} />
          <Route path="/deletevideos" element={<AdminRoute><VideosPanel /></AdminRoute>} />
          <Route path="/viewreviews"  element={<AdminRoute><ReviewsPanel /></AdminRoute>} />
          <Route path="/viewusers"    element={<AdminRoute><UsersPanel /></AdminRoute>} />

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
