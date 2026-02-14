import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import './Dashboard.css'; // Reuse dashboard styles

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, accounts: 0, transactions: 0 });

    useEffect(() => {
        // Mock stats or fetch if endpoint exists
        // simplified for now
        setStats({ users: 5, accounts: 12, transactions: 45 });
    }, []);

    return (
        <div className="dashboard-container">
            <Navbar />
            <div className="dashboard-content">
                <header className="dashboard-header">
                    <h1>Admin Dashboard</h1>
                </header>

                <div className="accounts-grid">
                    <div className="account-card">
                        <div className="account-type">Total Users</div>
                        <div className="account-balance">{stats.users}</div>
                    </div>
                    <div className="account-card">
                        <div className="account-type">Total Accounts</div>
                        <div className="account-balance">{stats.accounts}</div>
                    </div>
                    <div className="account-card">
                        <div className="account-type">Total Transactions</div>
                        <div className="account-balance">{stats.transactions}</div>
                    </div>
                </div>

                <div className="recent-activity">
                    <h2>System Management</h2>
                    <p>User management features coming soon.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
