import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getAccounts, transferMoney } from '../services/account.service';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaArrowRight, FaCheckCircle, FaExclamationTriangle, FaArrowLeft, FaReceipt, FaUser, FaLock } from 'react-icons/fa';
import Footer from '../components/Footer';
import './Transfer.css';

const Transfer = () => {
    const [accounts, setAccounts] = useState([]);
    const [step, setStep] = useState(1); // 1: Input, 2: Confirm, 3: Success
    const [formData, setFormData] = useState({
        fromAccountNumber: '',
        toAccountNumber: '',
        recipientName: '',
        amount: '',
        description: ''
    });
    const [tpin, setTpin] = useState('');
    const [showTpinModal, setShowTpinModal] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successTransaction, setSuccessTransaction] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const data = await getAccounts();
                setAccounts(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, fromAccountNumber: data[0].accountNumber }));
                }
            } catch (err) {
                console.error("Failed to load accounts", err);
            }
        };
        fetchAccounts();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const nextStep = () => {
        if (!formData.toAccountNumber || !formData.recipientName || !formData.amount) {
            setError('Please fill in recipient details and amount');
            return;
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setStep(2);
    };

    const prevStep = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setStep(1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            const result = await transferMoney(
                formData.fromAccountNumber,
                formData.toAccountNumber,
                Number(formData.amount),
                formData.description,
                tpin
            );
            setSuccessTransaction(result);
            setShowTpinModal(false);
            setTpin('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Transfer failed. Please check recipient details.');
            setLoading(false);
            setStep(1); // Go back to fix
        }
    };

    const selectedAccount = accounts.find(a => a.accountNumber === formData.fromAccountNumber);

    return (
        <div className="transfer-container">
            <Navbar />
            <div className="transfer-content">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="transfer-card-v2"
                        >
                            <div className="transfer-header">
                                <div className="transfer-icon-shell"><FaPaperPlane /></div>
                                <h2>Send Money</h2>
                                <p>Transfer funds to anyone in the NeoBank network.</p>
                            </div>

                            {error && <div className="error-alert"><FaExclamationTriangle /> {error}</div>}

                            <div className="transfer-form-v2">
                                <div className="input-group-v2">
                                    <label>Debit Account</label>
                                    <select name="fromAccountNumber" value={formData.fromAccountNumber} onChange={handleChange}>
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.accountNumber}>
                                                {acc.accountType} — ₹{acc.balance.toLocaleString()}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-group-v2">
                                    <label>Recipient Account Number</label>
                                    <div className="input-with-icon">
                                        <FaUser className="i-prefix" />
                                        <input
                                            type="text"
                                            name="toAccountNumber"
                                            placeholder="12 digit account number"
                                            value={formData.toAccountNumber}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="input-group-v2">
                                    <label>Recipient Name</label>
                                    <div className="input-with-icon">
                                        <FaUser className="i-prefix" />
                                        <input
                                            type="text"
                                            name="recipientName"
                                            placeholder="Enter recipient's full name"
                                            value={formData.recipientName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="input-group-v2">
                                    <label>Transfer Amount</label>
                                    <div className="amount-input-shell">
                                        <span className="currency-prefix">₹</span>
                                        <input
                                            type="number"
                                            name="amount"
                                            placeholder="0.00"
                                            value={formData.amount}
                                            onChange={handleChange}
                                            className="amount-field"
                                        />
                                    </div>
                                    {selectedAccount && (
                                        <p className="balance-hint">Available Bal: ₹{selectedAccount.balance.toLocaleString()}</p>
                                    )}
                                </div>

                                <div className="input-group-v2">
                                    <label>Message (Optional)</label>
                                    <input
                                        type="text"
                                        name="description"
                                        placeholder="What's this for?"
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </div>

                                <button onClick={nextStep} className="next-btn-v2">
                                    Review Transfer <FaArrowRight />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="transfer-card-v2 confirmation"
                        >
                            <div className="transfer-header">
                                <div className="transfer-icon-shell" style={{ color: 'var(--primary)' }}><FaReceipt /></div>
                                <h2>Review Details</h2>
                                <p>Please confirm the transaction information below.</p>
                            </div>

                            <div className="review-board">
                                <div className="review-item">
                                    <span>From</span>
                                    <p>{selectedAccount?.accountType} (••• {formData.fromAccountNumber.slice(-4)})</p>
                                </div>
                                <div className="review-item">
                                    <span>To Account</span>
                                    <p>{formData.toAccountNumber}</p>
                                </div>
                                <div className="review-item">
                                    <span>Recipient</span>
                                    <p>{formData.recipientName}</p>
                                </div>
                                <div className="review-item amount-highlight">
                                    <span>Amount</span>
                                    <p>₹{Number(formData.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                </div>
                                {formData.description && (
                                    <div className="review-item">
                                        <span>Reference</span>
                                        <p>{formData.description}</p>
                                    </div>
                                )}
                            </div>

                            <div className="confirmation-actions">
                                <button onClick={prevStep} className="back-btn-v2"><FaArrowLeft /> Edit</button>
                                <button onClick={() => setShowTpinModal(true)} className="confirm-btn-v2" disabled={loading}>
                                    Pay Securely 🔒
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="transfer-card-v2 success-view"
                        >
                            <motion.div
                                className="success-icon-shell"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                            >
                                <FaCheckCircle />
                            </motion.div>
                            <h2>Transfer Successful!</h2>
                            <p>Your payment of <strong>₹{Number(formData.amount).toLocaleString()}</strong> has been dispatched.</p>

                            <div className="success-details">
                                <div className="detail-line">
                                    <span>Transaction ID</span>
                                    <span>#{successTransaction?.transactionId || 'N/A'}</span>
                                </div>
                                <div className="detail-line">
                                    <span>Status</span>
                                    <span className="status-badge">Completed</span>
                                </div>
                            </div>

                            <div className="success-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <button onClick={() => navigate('/dashboard')} className="next-btn-v2">Return to Dashboard</button>
                                <button onClick={() => {
                                    setStep(1);
                                    setFormData({ ...formData, toAccountNumber: '', amount: '', description: '', recipientName: '' });
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }} className="btn-premium secondary-v2" style={{ width: '100%', padding: '1.2rem', borderRadius: '18px', fontWeight: 800, fontSize: '1.1rem' }}>
                                    New Transfer
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <AnimatePresence>
                {showTpinModal && (
                    <div className="modal-overlay">
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <div className="modal-icon-shell">
                                <FaLock className="lock-icon-premium" />
                            </div>
                            <h2 className="modal-title">Authorize Payment</h2>
                            <p className="modal-desc">Enter your Secure TPIN to process this transaction of ₹{Number(formData.amount).toLocaleString()}.</p>

                            <div className="input-wrapper-premium" style={{ marginBottom: '2rem' }}>
                                <FaLock className="input-icon" />
                                <input
                                    type="password"
                                    className="premium-input tpin-input"
                                    placeholder="Enter TPIN"
                                    value={tpin}
                                    onChange={(e) => setTpin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    maxLength={4}
                                    autoFocus
                                />
                            </div>

                            <div className="modal-actions-balanced">
                                <button className="modal-btn-cancel" onClick={() => setShowTpinModal(false)} disabled={loading}>
                                    Cancel
                                </button>
                                <button
                                    className="modal-btn-confirm"
                                    onClick={handleSubmit}
                                    disabled={loading || tpin.length !== 4}
                                >
                                    {loading ? 'Processing...' : 'Confirm'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <Footer />
        </div>
    );
};

export default Transfer;
