import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { FaArrowUp, FaArrowDown, FaSearch, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Dashboard.css'; // Reuse dashboard styles for consistency

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL'); // ALL, CREDIT, DEBIT
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/accounts/transactions');
            setTransactions(res.data);
        } catch (err) {
            console.error("Failed to fetch transactions", err);
            toast.error("Failed to load transaction history");
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(tx => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
            (tx.recipientName || '').toLowerCase().includes(term) ||
            (tx.description || '').toLowerCase().includes(term) ||
            (tx.transactionId || '').toLowerCase().includes(term);

        let matchesType = true;
        if (filterType === 'CREDIT') {
            matchesType = tx.amount > 0 || tx.type === 'DEPOSIT' || tx.type === 'CREDIT';
        } else if (filterType === 'DEBIT') {
            matchesType = tx.amount < 0 || tx.type === 'TRANSFER' || tx.type === 'WITHDRAWAL';
        }

        return matchesSearch && matchesType;
    });

    const getUserFriendlyType = (type, amount) => {
        if (type === 'TRANSFER') return amount < 0 ? 'Sent Money' : 'Received Money';
        return type ? (type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()) : 'Transaction';
    };

    return (
        <div className="dashboard-container">
            <Navbar />
            <div className="dashboard-content">
                <header className="dashboard-header" style={{ alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => navigate('/dashboard')}
                            style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--surface-border)',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                padding: '0.6rem', // detailed sizing
                                borderRadius: '12px', // slightly rounded square looks modern
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.1rem',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateX(-3px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                            title="Back to Dashboard"
                        >
                            <FaArrowLeft />
                        </button>
                        <div>
                            <h1 style={{ marginBottom: '0.2rem' }}>Transaction History</h1>
                            <p style={{ margin: 0, opacity: 0.7 }}>Track your financial journey with detailed records.</p>
                        </div>
                    </div>
                </header>

                <div className="glass-panel" style={{ minHeight: '600px' }}>
                    <div className="panel-header" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div className="search-bar-premium" style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                            <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search by name, ID, or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.8rem 1rem 0.8rem 2.5rem',
                                    borderRadius: '12px',
                                    border: '1px solid var(--surface-border)',
                                    background: 'var(--input-bg)',
                                    color: 'var(--text-main)',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div className="filter-group" style={{ display: 'flex', gap: '0.5rem' }}>
                            {['ALL', 'CREDIT', 'DEBIT'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    style={{
                                        padding: '0.6rem 1.2rem',
                                        borderRadius: '100px',
                                        border: '1px solid var(--surface-border)',
                                        background: filterType === type ? 'var(--primary)' : 'transparent',
                                        color: filterType === type ? 'white' : 'var(--text-muted)',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {type === 'ALL' ? 'All' : type === 'CREDIT' ? 'Income' : 'Expense'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="transaction-list-full" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading records...</div>
                        ) : filteredTransactions.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                <FaCalendarAlt style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }} />
                                <p>No transactions found matching your criteria.</p>
                            </div>
                        ) : (
                            filteredTransactions.map(tx => {
                                const isNegative = tx.amount < 0 || (tx.type === 'TRANSFER' && tx.amount < 0) || tx.type === 'WITHDRAWAL' || tx.type === 'PAYMENT';
                                const amount = Math.abs(tx.amount);

                                return (
                                    <motion.div
                                        key={tx.id || Math.random()}
                                        className="item-row"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ scale: 1.01 }}
                                    >
                                        <div className="mini-icon" style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '14px',
                                            fontSize: '1.2rem',
                                            background: isNegative ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                            color: isNegative ? 'var(--error)' : 'var(--success)'
                                        }}>
                                            {isNegative ? <FaArrowUp /> : <FaArrowDown />}
                                        </div>
                                        <div className="item-info">
                                            <p className="item-title" style={{ fontSize: '1rem' }}>{tx.recipientName || tx.recipient || 'Transaction'}</p>
                                            <span className="item-subtitle">
                                                {new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString()} • {getUserFriendlyType(tx.type, tx.amount)}
                                                {tx.description && <span style={{ marginLeft: '0.5rem', opacity: 0.8 }}>— {tx.description}</span>}
                                            </span>
                                            {tx.transactionId && <span className="item-subtitle" style={{ fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>ID: {tx.transactionId}</span>}
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p className="item-amount" style={{
                                                color: isNegative ? 'var(--error)' : 'var(--success)',
                                                fontSize: '1.1rem'
                                            }}>
                                                {isNegative ? '-' : '+'}₹{amount.toFixed(2)}
                                            </p>
                                            <span className={`status-badge ${tx.status ? tx.status.toLowerCase() : 'completed'}`} style={{
                                                fontSize: '0.75rem',
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '4px',
                                                background: (tx.status === 'COMPLETED' || !tx.status) ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                                                color: (tx.status === 'COMPLETED' || !tx.status) ? 'var(--success)' : 'var(--text-muted)',
                                                display: 'inline-block',
                                                marginTop: '0.3rem'
                                            }}>
                                                {tx.status || 'COMPLETED'}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Transactions;
