import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';
import { sendPhoneOtp, createAccountWithOtp } from '../services/account.service';
import webSocketService from '../services/websocket.service';
import { getCurrentUser, fetchCurrentUser } from '../services/auth.service';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPhone, FaKey, FaPiggyBank, FaCheckCircle, FaArrowRight, FaArrowLeft, FaShieldAlt, FaExclamationTriangle, FaMobileAlt, FaLock } from 'react-icons/fa';
import './OpenAccount.css';

const OpenAccount = () => {
    const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Success
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [accountType, setAccountType] = useState('SAVINGS');
    const [initialDeposit, setInitialDeposit] = useState('100.00');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const user = getCurrentUser();

    useEffect(() => {
        if (user?.email) {
            webSocketService.connect(user.email, (message) => {
                toast.info(message, { autoClose: 10000 });
            });
        }
        return () => webSocketService.disconnect();
    }, [user?.email]);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await sendPhoneOtp(phoneNumber);
            toast.success("Security Code Sent!");
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndCreate = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await createAccountWithOtp(phoneNumber, otp, accountType, parseFloat(initialDeposit));
            await fetchCurrentUser();
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Please double-check your code.');
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="step-indicator">
            {[1, 2, 3].map((s) => (
                <div key={s} className={`step-dot ${step >= s ? 'active' : ''} ${step > s ? 'completed' : ''}`}>
                    {step > s ? <FaCheckCircle /> : s}
                </div>
            ))}
            <div className="step-line">
                <div className="step-line-fill" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
            </div>
        </div>
    );

    return (
        <div className="open-account-container">
            <Navbar />

            <main className="open-account-content">
                <motion.div
                    className="open-account-card glass-panel-premium"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: "spring" }}
                >
                    <div className="card-header-premium">
                        <div className="header-icon-glow">
                            <FaShieldAlt />
                        </div>
                        <h1>Secure Account Opening</h1>
                        <p>Join NeoBank with our 3-step secure verification process.</p>
                    </div>

                    {renderStepIndicator()}

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="step-content"
                            >
                                <div className="step-header">
                                    <h3><FaMobileAlt /> Mobile Verification</h3>
                                    <p>We'll send a one-time password to verify your identity.</p>
                                </div>

                                {error && (
                                    <motion.div
                                        className="error-banner"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                    >
                                        <FaExclamationTriangle /> {error}
                                    </motion.div>
                                )}

                                <form onSubmit={handleSendOtp} className="premium-form">
                                    <div className="input-group">
                                        <label>Mobile Number</label>
                                        <div className="input-wrapper-premium">
                                            <FaPhone className="input-icon" />
                                            <input
                                                type="tel"
                                                placeholder="e.g. 9876543210"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                required
                                                className="premium-input"
                                            />
                                        </div>
                                        <small>Enter your 10-digit mobile number.</small>
                                    </div>

                                    <button type="submit" className="btn-premium primary" disabled={loading}>
                                        {loading ? <span className="loader"></span> : <>Send Security Code <FaArrowRight /></>}
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
                                className="step-content"
                            >
                                <div className="step-header">
                                    <h3><FaLock /> Verify & Configure</h3>
                                    <p>Enter the code sent to <strong>{phoneNumber}</strong></p>
                                </div>

                                {error && (
                                    <motion.div
                                        className="error-banner"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                    >
                                        <FaExclamationTriangle /> {error}
                                    </motion.div>
                                )}

                                <form onSubmit={handleVerifyAndCreate} className="premium-form">
                                    <div className="form-row">
                                        <div className="input-group half">
                                            <label>Account Type</label>
                                            <div className="input-wrapper-premium">
                                                <FaPiggyBank className="input-icon" />
                                                <select
                                                    value={accountType}
                                                    onChange={(e) => setAccountType(e.target.value)}
                                                    className="premium-input"
                                                >
                                                    <option value="SAVINGS">Savings Account</option>
                                                    <option value="CHECKING">Checking Account</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="input-group half">
                                            <label>Initial Deposit</label>
                                            <div className="input-wrapper-premium">
                                                <span className="currency-symbol">₹</span>
                                                <input
                                                    type="number"
                                                    value={initialDeposit}
                                                    onChange={(e) => setInitialDeposit(e.target.value)}
                                                    className="premium-input"
                                                    style={{ paddingLeft: '2.5rem' }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="input-group">
                                        <label>OTP Code</label>
                                        <div className="input-wrapper-premium">
                                            <FaKey className="input-icon" />
                                            <input
                                                type="text"
                                                placeholder="Enter 6-digit code"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                maxLength="6"
                                                required
                                                className="premium-input otp-tracking-small"
                                            />
                                        </div>
                                    </div>

                                    <div className="action-buttons">
                                        <button type="button" className="btn-premium secondary" onClick={() => setStep(1)}>
                                            <FaArrowLeft /> Back
                                        </button>
                                        <button type="submit" className="btn-premium primary" disabled={loading}>
                                            {loading ? <span className="loader"></span> : <>Verify & Open <FaCheckCircle /></>}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                className="success-content"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <div className="success-icon-large">
                                    <FaCheckCircle />
                                </div>
                                <h2>Welcome to NeoBank!</h2>
                                <p>Your <strong>{accountType}</strong> account has been successfully created and linked to your mobile number.</p>

                                <div className="account-summary-card">
                                    <div className="summary-row">
                                        <span>Mobile Linked</span>
                                        <strong>{phoneNumber}</strong>
                                    </div>
                                    <div className="summary-row">
                                        <span>Initial Balance</span>
                                        <strong>₹{parseFloat(initialDeposit).toFixed(2)}</strong>
                                    </div>
                                </div>

                                <button onClick={() => navigate('/dashboard')} className="btn-premium success-btn">
                                    Go to Dashboard <FaArrowRight />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
};

export default OpenAccount;
