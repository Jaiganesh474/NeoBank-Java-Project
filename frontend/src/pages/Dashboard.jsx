import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { getCurrentUser, fetchCurrentUser } from '../services/auth.service';
import CardService from '../services/card.service';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWallet, FaArrowUp, FaArrowDown, FaPlus, FaCheckCircle, FaBullseye, FaExchangeAlt, FaHistory, FaPiggyBank, FaShieldAlt, FaEye, FaEyeSlash, FaTrash, FaCreditCard, FaKey, FaArrowRight } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';
import webSocketService from '../services/websocket.service';
import './Dashboard.css';

const Dashboard = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCardNumber, setShowCardNumber] = useState(false);
    const [card, setCard] = useState(null);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [modalMode, setModalMode] = useState('card'); // 'card' or 'delete'
    const [selectedAccountId, setSelectedAccountId] = useState(null);
    const [otp, setOtp] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [showBalance, setShowBalance] = useState(() => {
        const saved = localStorage.getItem('hide_balance_pref');
        return saved !== 'true'; // Default to true (visible) if not set
    });
    const [weeklyGrowth, setWeeklyGrowth] = useState({ percent: 0, isPositive: true });
    const [allTransactions, setAllTransactions] = useState([]);
    const [showAccountNumbers, setShowAccountNumbers] = useState(false);

    const user = getCurrentUser();
    const navigate = useNavigate();

    const [chartData, setChartData] = useState([]);


    const recentTransactions = allTransactions.slice(0, 3).map((tx, idx) => {
        let amount = Number(tx.amount);
        // If it's a transfer where we sent money, it's negative
        if (tx.type === 'TRANSFER' || tx.type === 'WITHDRAWAL' || tx.type === 'PAYMENT') {
            amount = -Math.abs(amount);
        } else {
            amount = Math.abs(amount);
        }

        return {
            id: tx.id || idx,
            type: tx.type,
            recipient: tx.recipientName || tx.recipientAccountNumber || 'Transaction',
            date: new Date(tx.createdAt).toLocaleString('en-IN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }),
            amount: amount,
            status: tx.status
        };
    });

    const fetchDashboardData = async () => {
        try {
            // Fetch accounts first (critical)
            const accountsRes = await api.get('/accounts');
            setAccounts(accountsRes.data);

            // Fetch card separately to not block UI if no card exists or error occurs
            try {
                const cardRes = await CardService.getCard();
                if (cardRes.data && cardRes.status === 200) {
                    setCard(cardRes.data);
                } else {
                    setCard(null);
                }
            } catch (cardErr) {
                setCard(null);
            }

            // Fetch transactions for recent activity (using primary account)
            try {
                const txRes = await api.get('/accounts/transactions');
                setAllTransactions(txRes.data);
                if (accountsRes.data.length > 0) {
                    calculateGrowth(txRes.data, accountsRes.data);
                    generateChartData(txRes.data, accountsRes.data);
                }
            } catch (txErr) {
                console.error("Failed to fetch transactions", txErr);
                // Don't fail the whole dashboard for transactions
            }

        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
            if (err.response?.status !== 401) {
                toast.error("Failed to load dashboard data");
            }
        } finally {
            setLoading(false);
        }
    };


    const generateChartData = (transactions, currentAccounts) => {
        if (!currentAccounts || currentAccounts.length === 0) {
            setChartData([]);
            return;
        }

        const now = new Date();
        const myAccountNumbers = currentAccounts.map(a => a.accountNumber);

        // Find the oldest account creation date - This is our NEW starting point
        const oldestAccountDate = new Date(Math.min(...currentAccounts.map(a => new Date(a.createdAt))));
        // Ensure starting point is at the beginning of that day for a clean start
        const chartStartDate = new Date(oldestAccountDate);
        chartStartDate.setHours(0, 0, 0, 0);

        // Start with current cumulative balance
        let runningBalance = currentAccounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

        const sortedTx = [...transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const points = [];

        // 1. Add "Now" point
        points.push({
            time: now.getTime(),
            amount: Number(runningBalance.toFixed(2))
        });

        // 2. Generate time markers (Midnights from account opening until now)
        const timeMarkers = [];
        const iterDate = new Date(now);
        iterDate.setHours(0, 0, 0, 0);

        while (iterDate >= chartStartDate) {
            timeMarkers.push(iterDate.getTime());
            iterDate.setDate(iterDate.getDate() - 1);
        }

        // Add transaction times as markers
        sortedTx.forEach(tx => {
            const txTime = new Date(tx.createdAt).getTime();
            if (txTime >= chartStartDate.getTime()) {
                timeMarkers.push(txTime);
            }
        });

        // Sort markers descending and remove duplicates
        const uniqueSortedMarkers = [...new Set(timeMarkers)].sort((a, b) => b - a);

        let txIdx = 0;
        uniqueSortedMarkers.forEach(timestamp => {
            const markerDate = new Date(timestamp);

            while (txIdx < sortedTx.length) {
                const tx = sortedTx[txIdx];
                const txTime = new Date(tx.createdAt).getTime();

                if (txTime <= timestamp) break;

                const isInternal = (tx.type === 'TRANSFER' || tx.type === 'DEPOSIT') && myAccountNumbers.includes(tx.recipientAccountNumber);

                if (!isInternal) {
                    if (['TRANSFER', 'WITHDRAWAL', 'PAYMENT'].includes(tx.type)) {
                        runningBalance += Number(tx.amount);
                    } else if (['DEPOSIT', 'CREDIT', 'REFUND'].includes(tx.type)) {
                        runningBalance -= Number(tx.amount);
                    }
                }
                txIdx++;
            }

            // Boundary check
            let finalAmount = runningBalance;
            if (markerDate < oldestAccountDate) {
                finalAmount = 0;
            }

            points.push({
                time: timestamp,
                amount: Number(Math.max(0, finalAmount).toFixed(2))
            });
        });

        setChartData(points.sort((a, b) => a.time - b.time));
    };

    const calculateGrowth = (transactions, currentAccounts) => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const myAccountNumbers = currentAccounts.map(a => a.accountNumber);
        const totalBalance = currentAccounts.reduce((sum, acc) => sum + acc.balance, 0);

        let netChange = 0;
        transactions.forEach(tx => {
            const txDate = new Date(tx.createdAt);
            if (txDate >= weekAgo) {
                // If it's a transfer between our own accounts, ignore it for TOTAL portfolio growth
                const isInternal = (tx.type === 'TRANSFER' || tx.type === 'DEPOSIT') && myAccountNumbers.includes(tx.recipientAccountNumber);

                if (!isInternal) {
                    if (tx.type === 'TRANSFER' || tx.type === 'WITHDRAWAL' || tx.type === 'PAYMENT') {
                        netChange -= Number(tx.amount);
                    } else if (tx.type === 'DEPOSIT' || tx.type === 'CREDIT' || tx.type === 'REFUND') {
                        netChange += Number(tx.amount);
                    }
                }
            }
        });

        const startingBalance = totalBalance - netChange;
        let percent = 0;
        if (startingBalance > 0) {
            percent = (netChange / startingBalance) * 100;
        } else if (netChange > 0) {
            percent = 100;
        }

        setWeeklyGrowth({
            percent: Math.abs(percent).toFixed(1),
            isPositive: netChange >= 0
        });
    };

    useEffect(() => {
        fetchDashboardData();

        // Connect WebSocket
        if (user?.id) {
            webSocketService.connect(user.id, (message) => {
                try {
                    const data = JSON.parse(message);
                    toast.info(data.message || "Account updated", {
                        icon: "💳",
                        toastId: 'ws-update-' + Date.now()
                    });
                    // Refresh data on real-time update
                    fetchDashboardData();
                } catch (e) {
                    // Fallback for string messages
                    toast.info(message);
                    fetchDashboardData();
                }
            });
        }

        return () => {
            webSocketService.disconnect();
        };
    }, [user?.id]);

    const handleInitiateDeleteAccount = async (accountId) => {
        if (!window.confirm("Are you sure you want to delete this account? This action cannot be undone.")) return;

        // Find account to get phone number (for info purposes, backend handles sending)
        const acc = accounts.find(a => a.id === accountId);
        if (!acc) return;

        setActionLoading(true);
        try {
            // Need an endpoint to send OTP for account action. Reuse card OTP or account specific?
            // AccountController has /api/accounts/send-otp but takes phoneNumber in body.
            // CardService.sendOtp() uses UserPrincipal.
            // Let's use CardService.sendOtp() as a generic "User Action OTP" since it sends to user's phone.
            await CardService.sendOtp();

            setSelectedAccountId(accountId);
            setModalMode('delete');
            setShowOtpModal(true);
            toast.info("OTP sent for security verification");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirmDeleteAccount = async () => {
        if (otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }
        setActionLoading(true);
        try {
            await api.delete(`/accounts/${selectedAccountId}?otp=${otp}`);
            toast.success("Account deleted successfully");
            setShowOtpModal(false);
            setOtp('');
            await fetchCurrentUser();
            fetchDashboardData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete account");
        } finally {
            setActionLoading(false);
        }
    };

    const handleInitiateCard = async () => {
        if (accounts.length === 0) {
            toast.warning("Please open an account first!");
            return;
        }
        setActionLoading(true);
        try {
            await CardService.sendOtp();
            setModalMode('card');
            setShowOtpModal(true);
            toast.info("OTP sent to your registered mobile number");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerifyAndIssueCard = async () => {
        if (otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }
        setActionLoading(true);
        try {
            const res = await CardService.issueCard(otp);
            setCard(res.data);
            setShowOtpModal(false);
            setOtp('');
            toast.success("Neo Platinum Debit Card Activated!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Card activation failed. Check OTP.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleModalSubmit = () => {
        if (modalMode === 'card') {
            handleVerifyAndIssueCard();
        } else {
            handleConfirmDeleteAccount();
        }
    };

    const getTotalBalance = () => {
        return accounts.reduce((total, acc) => total + Number(acc.balance), 0).toLocaleString(undefined, { minimumFractionDigits: 2 });
    };

    if (loading) return (
        <div className="loading-screen" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--background)' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                <FaHistory style={{ fontSize: '3rem', color: 'var(--primary)' }} />
            </motion.div>
        </div>
    );

    return (
        <div className="dashboard-container">
            <Navbar />

            <main className="dashboard-content">
                <header className="dashboard-header">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1>Dashboard</h1>
                        <p>Welcome back! You have active insights today.</p>
                    </motion.div>
                    <div className="header-actions">
                        <motion.button
                            className="add-btn"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/transfer')}
                        >
                            <FaPlus /> New Transaction
                        </motion.button>
                        {accounts.length === 0 && (
                            <motion.button
                                className="add-btn"
                                style={{ background: 'var(--success)', marginLeft: '1rem' }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/open-account')}
                            >
                                <FaPiggyBank /> Open Account
                            </motion.button>
                        )}
                    </div>
                </header>

                <div className="dashboard-grid">
                    {/* Main High-Impact Cards */}
                    <motion.div
                        className="glass-panel stat-card-total"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <span className="stat-label">Available Balance</span>
                                <h2 className="stat-value">
                                    {showBalance ? `₹${getTotalBalance()}` : '••••••'}
                                </h2>
                            </div>
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
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    color: 'white',
                                    padding: '10px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    zIndex: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                title={showBalance ? "Hide Balance" : "Show Balance"}
                            >
                                {showBalance ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        <div className={`stat-trend ${weeklyGrowth.isPositive ? 'positive' : 'negative'}`}>
                            {weeklyGrowth.isPositive ? <FaArrowUp /> : <FaArrowDown />}
                            {weeklyGrowth.percent}% {weeklyGrowth.isPositive ? 'growth' : 'decrease'} this week
                        </div>
                    </motion.div>

                    <motion.div
                        className="neo-card-container"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {card ? (
                            <div className="neo-card-visual">
                                <div className="card-top">
                                    <FaShieldAlt style={{ fontSize: '1.3rem', opacity: 0.8 }} />
                                    <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '0.1em' }}>  NEO PLATINUM </span>
                                    <button
                                        className="card-toggle-visibility"
                                        onClick={() => setShowCardNumber(!showCardNumber)}
                                        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: 'auto' }}
                                    >
                                        {showCardNumber ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                <p className="card-number-display">
                                    {showCardNumber ? card.cardNumber : `•••• •••• •••• ${card.cardNumber.slice(-4)}`}
                                </p>
                                <div className="card-bottom">
                                    <div>
                                        <span style={{ fontSize: '0.7rem', opacity: 0.6, textTransform: 'uppercase' }}>Card Holder</span>
                                        <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{card.cardHolderName}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '0.7rem', opacity: 0.6, textTransform: 'uppercase' }}>Expires</span>
                                        <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{card.expiryDate}</p>
                                    </div>
                                    <div className="card-chip" style={{
                                        width: '40px',
                                        height: '30px',
                                        background: 'linear-gradient(135deg, #FFD700, #DAA520)',
                                        borderRadius: '6px',
                                        marginLeft: '1rem'
                                    }}></div>
                                </div>
                            </div>
                        ) : (
                            <div className="neo-card-placeholder" onClick={handleInitiateCard}>
                                <div style={{
                                    width: '70px',
                                    height: '70px',
                                    borderRadius: '20px',
                                    background: 'rgba(var(--primary-rgb), 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--primary)',
                                    fontSize: '2rem'
                                }}>
                                    <FaCreditCard />
                                </div>
                                <h3>Activate New Debit Card</h3>
                                <p style={{ maxWidth: '80%', textAlign: 'center', fontSize: '0.9rem' }}>
                                    Unlock premium features and global access. Click to activate now.
                                </p>
                                {actionLoading && <div className="loader" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}></div>}
                            </div>
                        )}
                    </motion.div>

                    {accounts.length === 0 && (
                        <motion.div
                            className="glass-panel mini-stat"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate('/open-account')}
                        >
                            <div className="mini-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}><FaPlus /></div>
                            <div>
                                <span className="stat-label">Quick Action</span>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Open Account</h3>
                            </div>
                        </motion.div>
                    )}

                    {/* Analytics Section */}
                    <div className="glass-panel analytics-panel">
                        <div className="panel-header">
                            <h3>Account Activity</h3>
                            <div className="stat-trend positive" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                Real-time Insights
                            </div>
                        </div>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={320}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border)" />
                                    <XAxis
                                        dataKey="time"
                                        type="number"
                                        domain={['dataMin', 'dataMax']}
                                        tickFormatter={(t) => {
                                            const d = new Date(t);
                                            return `${d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
                                        }}
                                        stroke="var(--text-muted)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="var(--text-muted)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => showBalance ? `₹${val}` : '••••'}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--surface)',
                                            borderRadius: '16px',
                                            border: '1px solid var(--surface-border)',
                                            boxShadow: 'var(--card-shadow)'
                                        }}
                                        labelFormatter={(label) => new Date(label).toLocaleString('en-IN', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            year: 'numeric'
                                        })}
                                        itemStyle={{ color: 'var(--primary)', fontWeight: 700 }}
                                        formatter={(value) => [showBalance ? `₹${Number(value).toLocaleString()}` : '••••', 'Balance']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="var(--primary)"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#velocityGrad)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Accounts and Recent Transactions */}
                    <div className="glass-panel wallets-panel">
                        <div className="panel-header">
                            <h3>My Wallets</h3>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <button
                                    onClick={() => setShowAccountNumbers(!showAccountNumbers)}
                                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}
                                    title={showAccountNumbers ? "Hide Account Numbers" : "Show Account Numbers"}
                                >
                                    {showAccountNumbers ? <FaEyeSlash /> : <FaEye />}
                                </button>
                                <FaWallet style={{ color: 'var(--primary)' }} />
                            </div>
                        </div>
                        <div className="accounts-list">
                            {accounts.map(acc => (
                                <div
                                    key={acc.id}
                                    className="item-row clickable-row"
                                    onClick={() => navigate(`/account/${acc.id}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="mini-icon" style={{ width: '45px', height: '45px', borderRadius: '12px', fontSize: '1.1rem' }}>
                                        <FaWallet />
                                    </div>
                                    <div className="item-info">
                                        <p className="item-title">{acc.accountType}</p>
                                        <span className="item-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            No. {showAccountNumbers ? acc.accountNumber : `•••• ${acc.accountNumber.slice(-4)}`}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setShowAccountNumbers(!showAccountNumbers); }}
                                                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', padding: 0, opacity: 0.6 }}
                                            >

                                            </button>
                                        </span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div className="item-amount">
                                            {showBalance ? `₹${acc.balance.toLocaleString()}` : '••••'}
                                        </div>
                                        <button
                                            className="delete-item-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleInitiateDeleteAccount(acc.id);
                                            }}
                                            style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', marginTop: '0.5rem', fontSize: '0.9rem', opacity: 0.6 }}
                                            onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                            onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
                                            title="Delete Account"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel activity-panel">
                        <div className="panel-header">
                            <h3>Recent Activity</h3>
                            <motion.button
                                className="text-btn"
                                style={{
                                    fontWeight: 700,
                                    color: 'var(--primary)',
                                    background: 'rgba(var(--primary-rgb), 0.1)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    cursor: 'pointer',
                                    border: 'none',
                                    fontSize: '0.9rem'
                                }}
                                whileHover={{ scale: 1.05, background: 'rgba(var(--primary-rgb), 0.2)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/transactions')}
                            >
                                View All History <FaArrowRight style={{ fontSize: '0.8rem' }} />
                            </motion.button>
                        </div>
                        <div className="transaction-list">
                            {recentTransactions.map(tx => (
                                <div key={tx.id} className="item-row">
                                    <div className="mini-icon" style={{
                                        width: '45px',
                                        height: '45px',
                                        borderRadius: '12px',
                                        fontSize: '1.1rem',
                                        background: tx.amount < 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                        color: tx.amount < 0 ? 'var(--error)' : 'var(--success)'
                                    }}>
                                        {tx.amount < 0 ? <FaArrowUp /> : <FaArrowDown />}
                                    </div>
                                    <div className="item-info">
                                        <p className="item-title">{tx.recipient}</p>
                                        <span className="item-subtitle">{tx.date} • {tx.type}</span>
                                    </div>
                                    <div>
                                        <p className="item-amount" style={{ color: tx.amount < 0 ? 'var(--error)' : 'var(--success)', textAlign: 'right' }}>
                                            {showBalance ? `${tx.amount < 0 ? '-' : '+'}₹${Math.abs(tx.amount).toFixed(2)}` : '••••'}
                                        </p>
                                        <span className="item-subtitle" style={{ display: 'block', textAlign: 'right', fontSize: '0.7rem' }}>{tx.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main >

            {/* OTP Modal */}
            <AnimatePresence>
                {showOtpModal && (
                    <div className="modal-overlay">
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                        >
                            <button
                                className="close-modal-btn"
                                onClick={() => setShowOtpModal(false)}
                                style={{ top: '1.25rem', right: '1.25rem', fontSize: '1.8rem', opacity: 0.6 }}
                            >
                                <IoClose />
                            </button>
                            <div className="modal-icon" style={{ fontSize: '3rem', color: modalMode === 'delete' ? 'var(--error)' : 'var(--primary)', marginBottom: '1rem' }}>
                                {modalMode === 'delete' ? <FaTrash /> : <FaShieldAlt />}
                            </div>
                            <h2 className="modal-title">
                                {modalMode === 'delete' ? 'Confirm Deletion' : 'Verify Identity'}
                            </h2>
                            <p className="modal-desc">
                                {modalMode === 'delete'
                                    ? "Enter the OTP sent to your mobile to permanently delete your account."
                                    : "We've sent a 6-digit OTP to your registered mobile number to securely activate your Neo Platinum card."
                                }
                            </p>

                            <div className="input-wrapper-premium" style={{ marginBottom: '2rem' }}>
                                <FaKey className="input-icon" style={{ left: '1rem', fontSize: '1rem' }} />
                                <input
                                    type="text"
                                    className="premium-input otp-tracking-small"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    style={{ paddingLeft: '2.5rem' }}
                                />
                            </div>

                            <button
                                className="btn-premium primary"
                                onClick={handleModalSubmit}
                                disabled={actionLoading || otp.length !== 6}
                                style={{ background: modalMode === 'delete' ? 'var(--error)' : 'var(--primary)' }}
                            >
                                {actionLoading ? 'Verifying...' : (modalMode === 'delete' ? 'Delete Account' : 'Activate Card')}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
};

export default Dashboard;
