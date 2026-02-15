import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transfer from './pages/Transfer';
import OpenAccount from './pages/OpenAccount';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import AiAssistant from './pages/AiAssistant';
import ForgotPassword from './pages/ForgotPassword';
import { firebaseLogin } from './services/auth.service';
import { handleRedirectResult } from './firebase';
import { ToastContainer } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import SessionExpiredModal from './components/SessionExpiredModal';
import 'react-toastify/dist/ReactToastify.css';
import Settings from './pages/Settings';
import Transactions from './pages/Transactions';
import AccountDetails from './pages/AccountDetails';
import { AboutUs, Careers, Press, DataPrivacy, FraudCare, Insurance, HelpCenter, ContactUs, ApiDocs, PrivacyPolicy, TermsOfService } from './pages/FooterPages';
import { toast } from 'react-toastify';

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={5000} theme="colored" />
      <AuthRedirectHandler />
      <SessionExpiredHandler />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Footer Pages */}
        <Route path="/about" element={<AboutUs />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/press" element={<Press />} />
        <Route path="/data-privacy" element={<DataPrivacy />} />
        <Route path="/fraud-care" element={<FraudCare />} />
        <Route path="/insurance" element={<Insurance />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/api-docs" element={<ApiDocs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/ai-assistant" element={<AiAssistant />} />
          <Route path="/open-account" element={<OpenAccount />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/account/:id" element={<AccountDetails />} />
        </Route>
      </Routes>
    </Router>
  );
}

// Global handler for Firebase Auth Redirect results
const AuthRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleRedirect = async () => {
      // Only process redirect results if we are on a relevant page
      const authPaths = ['/login', '/register', '/', '/index.html'];
      if (authPaths.includes(location.pathname)) {
        try {
          const idToken = await handleRedirectResult();
          if (idToken) {
            toast.info("Google Authentication successful! Syncing with NeoBank...", { toastId: 'auth-syncing' });

            const user = await firebaseLogin(idToken);
            if (user) {
              toast.success(`Welcome back, ${user.firstName}! Redirecting to dashboard...`);
              if (user.roles && user.roles.includes('ROLE_ADMIN')) {
                navigate('/admin');
              } else {
                navigate('/dashboard');
              }
            } else {
              throw new Error("No user data returned from backend");
            }
          }
        } catch (error) {
          console.error("Auth redirect processing failed", error);
          const errorMsg = error.response?.data?.message || error.message || "Failed to sync with backend";
          toast.error(`Sign-in failed: ${errorMsg}. Please try local login.`, { toastId: 'auth-error' });
        }
      }
    };
    handleRedirect();
  }, [location.pathname, navigate]);

  return null;
};

const SessionExpiredHandler = () => {
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    let timeoutId;

    const checkTokenExpiry = () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          handleSessionExpired();
        } else {
          // Set timeout for exact expiry time
          const timeLeft = (decoded.exp - currentTime) * 1000;

          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            handleSessionExpired();
          }, timeLeft);
        }
      } catch (e) {
        console.error("Token decoding failed", e);
      }
    };

    const handleSessionExpired = () => {
      setSessionExpired(true);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    };

    // Initial check
    checkTokenExpiry();

    // Re-check whenever token changes in localStorage (e.g. after login)
    const handleStorageChange = (e) => {
      if (e.key === 'token') checkTokenExpiry();
    };

    window.addEventListener('session-expired', handleSessionExpired);
    window.addEventListener('storage', handleStorageChange);

    // Poll occasionally as fallback or for more active monitoring
    const intervalId = setInterval(checkTokenExpiry, 30000);

    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
      window.removeEventListener('storage', handleStorageChange);
      if (timeoutId) clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  const handleLoginRedirect = () => {
    setSessionExpired(false);
    window.location.href = '/';
  };

  return <SessionExpiredModal isOpen={sessionExpired} onConfirm={handleLoginRedirect} />;
};

export default App;
