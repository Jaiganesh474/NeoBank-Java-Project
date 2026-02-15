import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, firebaseLogin, verifyRegistration, resendOtp } from '../services/auth.service';
import { motion, AnimatePresence } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { FaUser, FaEnvelope, FaLock, FaKey, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { signInWithGoogleRedirect, handleRedirectResult } from '../firebase';
import './Auth.css';

const Register = () => {
    const [step, setStep] = useState(1); // 1: Details, 2: OTP
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkRedirect = async () => {
            try {
                const idToken = await handleRedirectResult();
                if (idToken) {
                    setLoading(true);
                    await firebaseLogin(idToken);
                    navigate('/dashboard');
                }
            } catch (err) {
                console.error("Redirect check failed", err);
                setError('Google sign-up failed. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        checkRedirect();
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(formData.firstName, formData.lastName, formData.email, formData.password);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await verifyRegistration(formData.email, otp);
            setStep(3); // Success
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP. Check your email.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError('');
        try {
            await resendOtp(formData.email);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        }
    };

    const handleGoogleSignup = () => {
        try {
            signInWithGoogleRedirect();
        } catch (err) {
            setError('Google sign-up failed');
        }
    };

    return (
        <div className="auth-container">
            <motion.div
                className="auth-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
            >
                <Link to="/" className="back-link">
                    <FaArrowLeft /> Home
                </Link>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="auth-header">
                                <h2>Create Account</h2>
                                <p>Join NeoBank and start your journey.</p>
                            </div>
                            {error && <div className="error-message">{error}</div>}

                            <form onSubmit={handleRegisterSubmit}>
                                <div className="name-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                                    <div className="input-group" style={{ marginBottom: 0, flex: 1 }}>
                                        <FaUser className="input-icon" />
                                        <input
                                            type="text"
                                            name="firstName"
                                            placeholder="First Name"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="input-group" style={{ marginBottom: 0, flex: 1 }}>
                                        <FaUser className="input-icon" />
                                        <input
                                            type="text"
                                            name="lastName"
                                            placeholder="Last Name"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <FaEnvelope className="input-icon" />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email Address"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <FaLock className="input-icon" />
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Choose Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <button type="submit" className="auth-btn" disabled={loading}>
                                    {loading ? 'Processing...' : 'Create Account'}
                                </button>

                                <div className="divider">
                                    <span>OR</span>
                                </div>

                                <button type="button" className="google-btn" onClick={handleGoogleSignup}>
                                    <FcGoogle className="google-icon" />
                                    Sign up with Google
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <div className="auth-header">
                                <h2>Verify Email</h2>
                                <p>We've sent a 6-digit code to <strong>{formData.email}</strong></p>
                            </div>
                            {error && <div className="error-message">{error}</div>}
                            <form onSubmit={handleOtpSubmit}>
                                <div className="input-group">
                                    <FaKey className="input-icon" />
                                    <input
                                        type="text"
                                        placeholder="6-Digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        maxLength="6"
                                    />
                                </div>
                                <button type="submit" className="auth-btn" disabled={loading}>
                                    {loading ? 'Verifying...' : 'Verify & Continue'}
                                </button>
                                <p className="auth-link">
                                    Didn't receive the code? <button type="button" className="text-btn" onClick={handleResendOtp}>Resend</button>
                                </p>
                            </form>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="success" className="success-view" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <FaCheckCircle className="success-icon" />
                            <h2>Verified!</h2>
                            <p>Your NeoBank account is now active.</p>
                            <Link to="/login" className="auth-link-btn">Sign In to Dashboard</Link>
                        </motion.div>
                    )}
                </AnimatePresence>
                {step === 1 && (
                    <p className="auth-link">
                        Already have an account? <Link to="/login">Sign In</Link>
                    </p>
                )}
            </motion.div>
        </div>
    );
};

export default Register;
