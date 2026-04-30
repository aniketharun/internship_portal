import { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AuthContext from './contexts/AuthContext';
import { useContext } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import Home from './pages/Home';
import CreateInternship from './pages/CreateInternship';
import InternshipDetails from './pages/InternshipDetails';
import MyApplications from './pages/MyApplications';
import RecruiterDashboard from './pages/RecruiterDashboard';
import JobApplications from './pages/JobApplications';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Tests from './pages/Tests';
import TakeTest from './pages/TakeTest';
import TestResults from './pages/TestResults';
import CreateTest from './pages/CreateTest';
import ManageTests from './pages/ManageTests';
import Chat from './pages/Chat';
import ExperienceFeed from './pages/ExperienceFeed';
import AIChatbot from './components/AIChatbot';
import ResumeFloatingBtn from './components/ResumeFloatingBtn';
import ResumeChecker from './pages/ResumeChecker';
import AllInternships from './pages/AllInternships';
import AiMatch from './pages/AiMatch';
import Footer from './components/Footer';

import { GoogleOAuthProvider } from '@react-oauth/google';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } },
};

// Redirects unauthenticated users to /login; shows nothing while auth is loading
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ flex: 1 }}>
        <Routes location={location}>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/resetpassword/:resettoken" element={<ResetPassword />} />

          {/* Protected routes — redirect to /login if not authenticated */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/internships/new" element={<ProtectedRoute><CreateInternship /></ProtectedRoute>} />
          <Route path="/internships/:id" element={<ProtectedRoute><InternshipDetails /></ProtectedRoute>} />
          <Route path="/my-applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><RecruiterDashboard /></ProtectedRoute>} />
          <Route path="/internships/:id/applications" element={<ProtectedRoute><JobApplications /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/tests" element={<ProtectedRoute><Tests /></ProtectedRoute>} />
          <Route path="/tests/:id" element={<ProtectedRoute><TakeTest /></ProtectedRoute>} />
          <Route path="/tests/results" element={<ProtectedRoute><TestResults /></ProtectedRoute>} />
          <Route path="/tests/new" element={<ProtectedRoute><CreateTest /></ProtectedRoute>} />
          <Route path="/tests/manage" element={<ProtectedRoute><ManageTests /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><ExperienceFeed /></ProtectedRoute>} />
          <Route path="/resume-checker" element={<ProtectedRoute><ResumeChecker /></ProtectedRoute>} />
          <Route path="/all-internships" element={<ProtectedRoute><AllInternships /></ProtectedRoute>} />
          <Route path="/ai-match" element={<ProtectedRoute><AiMatch /></ProtectedRoute>} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const GOOGLE_CLIENT_ID = "33307593436-fn3tk1magvl534o2sl7icodlto0ma0qi.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <AuthProvider>
          <div className="app-container">
            <Navbar />
            <AIChatbot isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
            <ResumeFloatingBtn isChatOpen={isChatOpen} />
            <AnimatedRoutes />
            <Footer />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
