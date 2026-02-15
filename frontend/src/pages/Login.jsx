import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, firebaseLogin, loginByPin, requestLoginOtp, loginByOtp } from '../services/auth.service';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { signInWithGoogleRedirect } from '../firebase';
import './Auth.css';
import { FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginMode, setLoginMode] = useState('password'); // password, pin, otp
    const [phoneNumber, setPhoneNumber] = useState('');
    const [pin, setPin] = useState('');
    const [otp, setOtp] = useState('');
    const [otpStep, setOtpStep] = useState(1); // 1: Request, 2: Verify
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const navigate = useNavigate();


    const handleRequestOtp = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }
        setError('');
        setOtpLoading(true);
        try {
            await requestLoginOtp(phoneNumber);
            setOtpStep(2);
            toast.success('OTP sent to your mobile!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Account may not exist.');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            let user;
            if (loginMode === 'password') {
                user = await login(email, password);
            } else if (loginMode === 'pin') {
                if (pin.length < 4) {
                    setError('PIN must be at least 4 digits');
                    setLoading(false);
                    return;
                }
                user = await loginByPin(phoneNumber, pin);
            } else {
                // OTP Mode
                if (otp.length < 6) {
                    setError('Please enter a valid 6-digit OTP');
                    setLoading(false);
                    return;
                }
                user = await loginByOtp(phoneNumber, otp);
            }

            if (user.roles && user.roles.includes('ROLE_ADMIN')) {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials or OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        try {
            signInWithGoogleRedirect();
        } catch (err) {
            setError('Google login failed');
        }
    };

    return (
        <div className="auth-container">
            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Link to="/" className="back-link">
                    <FaArrowLeft /> Home
                </Link>
                <h2 style={{ marginBottom: '0.5rem' }}>Welcome Back</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', textAlign: 'center' }}>
                    Access your account using your Password or Login PIN
                </p>

                {error && <div className="error-message" style={{ marginBottom: '1.5rem' }}>{error}</div>}

                <div style={{ display: 'flex', background: 'var(--input-bg)', padding: '4px', borderRadius: '12px', marginBottom: '2rem', gap: '4px' }}>
                    <button
                        onClick={() => setLoginMode('password')}
                        style={{
                            flex: 1,
                            padding: '10px 4px',
                            borderRadius: '8px',
                            border: 'none',
                            background: loginMode === 'password' ? 'var(--primary)' : 'transparent',
                            color: loginMode === 'password' ? 'white' : 'var(--text-muted)',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >
                        Password
                    </button>
                    <button
                        onClick={() => setLoginMode('pin')}
                        style={{
                            flex: 1,
                            padding: '10px 4px',
                            borderRadius: '8px',
                            border: 'none',
                            background: loginMode === 'pin' ? 'var(--primary)' : 'transparent',
                            color: loginMode === 'pin' ? 'white' : 'var(--text-muted)',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >
                        Login PIN
                    </button>
                    <button
                        onClick={() => setLoginMode('otp')}
                        style={{
                            flex: 1,
                            padding: '10px 4px',
                            borderRadius: '8px',
                            border: 'none',
                            background: loginMode === 'otp' ? 'var(--primary)' : 'transparent',
                            color: loginMode === 'otp' ? 'white' : 'var(--text-muted)',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >
                        Login Via OTP
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {loginMode === 'password' && (
                        <>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </>
                    )}

                    {loginMode === 'pin' && (
                        <>
                            <div className="form-group">
                                <label>Mobile Number</label>
                                <input
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="Enter registered mobile Number"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Login PIN</label>
                                <input
                                    type="password"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    placeholder="••••"
                                    maxLength={4}
                                    style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.2rem' }}
                                    required
                                />
                            </div>
                        </>
                    )}

                    {loginMode === 'otp' && (
                        <>
                            <div className="form-group">
                                <label>Mobile Number</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        placeholder="Enter registered mobile number"
                                        required
                                        disabled={otpStep === 2}
                                        style={{ paddingRight: '100px' }}
                                    />
                                    {otpStep === 1 && (
                                        <button
                                            type="button"
                                            onClick={handleRequestOtp}
                                            disabled={otpLoading || phoneNumber.length < 10}
                                            style={{
                                                position: 'absolute',
                                                right: '8px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'var(--primary)',
                                                color: 'white',
                                                border: 'none',
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer',
                                                opacity: phoneNumber.length < 10 ? 0.5 : 1
                                            }}
                                        >
                                            {otpLoading ? '...' : 'Get OTP'}
                                        </button>
                                    )}
                                    {otpStep === 2 && (
                                        <button
                                            type="button"
                                            onClick={() => setOtpStep(1)}
                                            style={{
                                                position: 'absolute',
                                                right: '8px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'transparent',
                                                color: 'var(--primary)',
                                                border: 'none',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                textDecoration: 'underline'
                                            }}
                                        >
                                            Change Number
                                        </button>
                                    )}
                                </div>
                            </div>
                            {otpStep === 2 && (
                                <motion.div
                                    className="form-group"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <label>Enter 6-Digit OTP</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="000000"
                                        maxLength={6}
                                        style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.2rem', borderColor: 'var(--primary)' }}
                                        required
                                    />
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
                                        Didn't receive? <span onClick={handleRequestOtp} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Resend OTP</span>
                                    </p>
                                </motion.div>
                            )}
                        </>
                    )}

                    <button type="submit" className="auth-btn" disabled={loading || (loginMode === 'otp' && otpStep === 1)} style={{ height: '50px', fontSize: '1rem', marginTop: '1rem' }}>
                        {loading ? 'Authenticating...' : loginMode === 'password' ? 'Sign In' : loginMode === 'pin' ? 'Login with PIN' : 'Verify & Login'}
                    </button>

                    {(loginMode === 'password' || loginMode === 'pin') && (
                        <div className="forgot-password-link">
                            <Link to={`/forgot-password?mode=${loginMode}`}>Forgot {loginMode === 'password' ? 'Password' : 'PIN'}?</Link>
                        </div>
                    )}

                    <div className="divider">
                        <span>OR</span>
                    </div>

                    <button type="button" className="google-btn" onClick={handleGoogleLogin}>
                        <FcGoogle className="google-icon" />
                        Sign in with Google
                    </button>
                </form>
                <p className="auth-link">
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
