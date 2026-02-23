import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWallet, FaArrowLeft, FaEye, FaEyeSlash, FaCalendarAlt, FaHistory, FaArrowUp, FaArrowDown, FaBuilding, FaIdCard, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import webSocketService from '../services/websocket.service';
import { getCurrentUser } from '../services/auth.service';
import './Dashboard.css';
import './AccountDetails.css';

const AccountDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [account, setAccount] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAccountNumber, setShowAccountNumber] = useState(false);
    const [showBalance, setShowBalance] = useState(() => {
        const saved = localStorage.getItem('hide_balance_pref');
        return saved !== 'true';
    });

    const fetchDetails = async () => {
        try {
            const [accRes, txRes] = await Promise.all([
                api.get(`/accounts/${id}`),
                api.get(`/accounts/${id}/transactions`)
            ]);
            setAccount(accRes.data);
            setTransactions(txRes.data);
        } catch (err) {
            toast.error("Failed to load account details");
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();

        // Real-time monitoring
        const user = getCurrentUser();
        if (user?.id) {
            webSocketService.connect(user.id, (message) => {
                try {
                    const data = JSON.parse(message);
                    toast.info(data.message, { icon: "💰" });
                    fetchDetails(); // Refresh details on new transaction
                } catch (e) {
                    fetchDetails();
                }
            });
        }

        return () => {
            webSocketService.disconnect();
        };
    }, [id, navigate]);

    if (loading) return (
        <div className="loading-screen" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--background)' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                <FaHistory style={{ fontSize: '3rem', color: 'var(--primary)' }} />
            </motion.div>
        </div>
    );

    if (!account) return null;

    return (
        <div className="dashboard-container account-details-container">
            <Navbar />

            <main className="dashboard-content account-details-main">
                <header className="dashboard-header account-details-header">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="back-btn-v2"
                            style={{ width: 'fit-content', padding: '0.5rem 1rem', marginBottom: '1.5rem' }}
                        >
                            <FaArrowLeft /> Back
                        </button>
                        <h1>{account.accountType}</h1>
                        <p>Detailed insights for your wallet ending in {account.accountNumber.slice(-4)}</p>
                    </motion.div>
                </header>

                <div className="account-details-grid">
                    {/* Primary Info Card */}
                    <div className="glass-panel primary-info-card" style={{ gridColumn: 'span 6' }}>
                        <div className="balance-display">
                            <div className="panel-header" style={{ marginBottom: 0 }}>
                                <span className="stat-label">Available Balance</span>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowBalance(prev => {
                                            const newVal = !prev;
                                            localStorage.setItem('hide_balance_pref', (!newVal).toString());
                                            return newVal;
                                        });
                                    }}
                                    className="theme-toggle-btn"
                                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white' }}
                                    title={showBalance ? "Hide Balance" : "Show Balance"}
                                >
                                    {showBalance ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            <h2 className="stat-value" style={{ margin: '0.5rem 0' }}>
                                {showBalance ? `₹${Number(account.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '••••••'}
                            </h2>
                        </div>

                        <div className="acc-number-row" style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '1.5rem', marginTop: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.05em', fontWeight: 700 }}>Account Number</span>
                                    <p style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.1em', marginTop: '0.2rem' }}>
                                        {showAccountNumber ? account.accountNumber : `•••• •••• ${account.accountNumber.slice(-4)}`}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowAccountNumber(!showAccountNumber)}
                                    className="theme-toggle-btn"
                                    style={{ background: 'white', color: 'var(--primary)' }}
                                >
                                    {showAccountNumber ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Account Info */}
                    <div className="glass-panel metadata-card" style={{ gridColumn: 'span 6' }}>
                        <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
                            <h3>Account Metadata</h3>
                            <FaIdCard style={{ color: 'var(--primary)' }} />
                        </div>

                        <div className="metadata-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="info-item">
                                <span style={{ opacity: 0.6, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaBuilding /> Branch
                                </span>
                                <p style={{ fontWeight: 700, marginTop: '0.2rem' }}>Corporate HQ - Virtual</p>
                            </div>
                            <div className="info-item">
                                <span style={{ opacity: 0.6, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaCalendarAlt /> Opened On
                                </span>
                                <p style={{ fontWeight: 700, marginTop: '0.2rem' }}>
                                    {new Date(account.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="info-item">
                                <span style={{ opacity: 0.6, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaCheckCircle /> Status
                                </span>
                                <p style={{ fontWeight: 700, marginTop: '0.2rem', color: 'var(--success)' }}>{account.status || 'Active'}</p>
                            </div>
                            <div className="info-item">
                                <span style={{ opacity: 0.6, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaWallet /> Currency
                                </span>
                                <p style={{ fontWeight: 700, marginTop: '0.2rem' }}>INR (₹)</p>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--primary-light)', borderRadius: '12px', border: '1px solid rgba(var(--primary-rgb), 0.1)' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--primary)', textAlign: 'center' }}>
                                This account is fully KYC verified and eligible for global transfers.
                            </p>
                        </div>
                    </div>

                    {/* Transactions for this account */}
                    <div className="glass-panel transactions-history-card" style={{ gridColumn: 'span 12' }}>
                        <div className="panel-header">
                            <h3>Transaction History</h3>
                            <FaHistory style={{ color: 'var(--primary)' }} />
                        </div>

                        <div className="transaction-list" style={{ marginTop: '1rem' }}>
                            {transactions.length > 0 ? transactions.map(tx => (
                                <div key={tx.id} className="item-row transaction-item">
                                    <div className="mini-icon" style={{
                                        width: '45px',
                                        height: '45px',
                                        borderRadius: '12px',
                                        fontSize: '1.1rem',
                                        background: tx.type === 'DEPOSIT' || tx.type === 'CREDIT' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: tx.type === 'DEPOSIT' || tx.type === 'CREDIT' ? 'var(--success)' : 'var(--error)'
                                    }}>
                                        {tx.type === 'DEPOSIT' || tx.type === 'CREDIT' ? <FaArrowDown /> : <FaArrowUp />}
                                    </div>
                                    <div className="item-info">
                                        <p className="item-title">{tx.recipientName || tx.type}</p>
                                        <span className="item-subtitle">
                                            {new Date(tx.createdAt).toLocaleString()} • {tx.transactionId.slice(0, 8)}
                                        </span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p className="item-amount" style={{ color: tx.type === 'DEPOSIT' || tx.type === 'CREDIT' ? 'var(--success)' : 'var(--error)' }}>
                                            {showBalance ? `${tx.type === 'DEPOSIT' || tx.type === 'CREDIT' ? '+' : '-'}₹${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '••••'}
                                        </p>
                                        <span className="item-subtitle" style={{ fontSize: '0.7rem' }}>{tx.status}</span>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '3rem' }}>
                                    <FaHistory style={{ fontSize: '3rem', opacity: 0.1, marginBottom: '1rem' }} />
                                    <p style={{ color: 'var(--text-muted)' }}>No transactions found for this account.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AccountDetails;
