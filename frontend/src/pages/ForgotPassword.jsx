import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { forgotPassword, resetPassword, forgotPin, resetPin } from '../services/auth.service';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaLock, FaKey, FaArrowLeft, FaCheckCircle, FaMobileAlt } from 'react-icons/fa';
import './Auth.css';

const ForgotPassword = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialMode = queryParams.get('mode') === 'pin' ? 'pin' : 'password';

    const [mode, setMode] = useState(initialMode); // 'password' or 'pin'
    const [step, setStep] = useState(1); // 1: Identifier, 2: OTP & Reset
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [newValue, setNewValue] = useState(''); // newPassword or newPin
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleIdentifierSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (mode === 'password') {
                await forgotPassword(identifier);
                setMessage('Security OTP sent to your registered email.');
            } else {
                const res = await forgotPin(identifier);
                setMessage(res.message || 'Verification code sent to your mobile number.');
            }
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send verification code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (mode === 'password') {
                await resetPassword(identifier, otp, newValue);
            } else {
                await resetPin(identifier, otp, newValue);
            }
            setStep(3); // 3: Success
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid code or internal error.');
        } finally {
            setLoading(false);
        }
    };

    const isPinMode = mode === 'pin';

    return (
        <div className="auth-container">
            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Link to="/login" className="back-link">
                    <FaArrowLeft /> Back to Login
                </Link>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="auth-header">
                                <h2>Forgot {isPinMode ? 'Secure PIN' : 'Password'}?</h2>
                                <p>
                                    {isPinMode
                                        ? "Enter your identifier and we'll send an OTP to your mobile."
                                        : "Enter your email and we'll send you an OTP."
                                    }
                                </p>
                            </div>

                            <form onSubmit={handleIdentifierSubmit}>
                                <div className="input-group">
                                    {isPinMode ? <FaMobileAlt className="input-icon" /> : <FaEnvelope className="input-icon" />}
                                    <input
                                        type={isPinMode ? "text" : "email"}
                                        placeholder={isPinMode ? "Mobile Number" : "Email Address"}
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        required
                                    />
                                </div>
                                {error && <div className="error-message">{error}</div>}
                                <button type="submit" className="auth-btn" disabled={loading}>
                                    {loading ? 'Processing...' : 'Send Verification Code'}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="auth-header">
                                <h2>Reset {isPinMode ? 'Secure PIN' : 'Password'}</h2>
                                <p>Enter the 6-digit OTP and your new {isPinMode ? 'PIN' : 'password'}.</p>
                            </div>
                            <form onSubmit={handleResetSubmit}>
                                <div className="input-group">
                                    <FaKey className="input-icon" />
                                    <input
                                        type="text"
                                        placeholder="6-Digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        required
                                        maxLength="6"
                                        style={{ letterSpacing: '0.2em', textAlign: 'center' }}
                                    />
                                </div>
                                <div className="input-group">
                                    <FaLock className="input-icon" />
                                    <input
                                        type={isPinMode ? "password" : "password"}
                                        placeholder={`New ${isPinMode ? '4-Digit PIN' : 'Password'}`}
                                        value={newValue}
                                        onChange={(e) => {
                                            if (isPinMode) {
                                                setNewValue(e.target.value.replace(/\D/g, '').slice(0, 4));
                                            } else {
                                                setNewValue(e.target.value);
                                            }
                                        }}
                                        required
                                        minLength={isPinMode ? 4 : 6}
                                        maxLength={isPinMode ? 4 : 50}
                                        style={isPinMode ? { letterSpacing: '0.5em', textAlign: 'center' } : {}}
                                    />
                                </div>
                                {error && <div className="error-message">{error}</div>}
                                {message && <div className="success-message" style={{ color: 'var(--success)', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}
                                <button type="submit" className="auth-btn" disabled={loading}>
                                    {loading ? 'Updating...' : `Update ${isPinMode ? 'PIN' : 'Password'}`}
                                </button>
                                <button
                                    type="button"
                                    className="text-btn"
                                    style={{ marginTop: '1rem', width: '100%' }}
                                    onClick={handleIdentifierSubmit}
                                >
                                    Resend Verification Code
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            className="success-view"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <FaCheckCircle className="success-icon" />
                            <h2>Success!</h2>
                            <p>Your {isPinMode ? 'Login PIN' : 'password'} has been updated successfully.</p>
                            <Link to="/login" className="auth-link-btn">Go to Login</Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
