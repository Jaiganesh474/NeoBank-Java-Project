import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaRobot, FaCog, FaSignOutAlt, FaMoon, FaSun, FaArrowRight, FaHome, FaExchangeAlt, FaShieldAlt } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleMenu, user, theme, toggleTheme, handleLogout }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="sidebar-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleMenu}
                    />
                    <motion.div
                        className="mobile-sidebar"
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        <div className="sidebar-header">
                            <span className="brand-text">NeoBank</span>
                            <button onClick={toggleMenu} className="close-btn" aria-label="Close menu">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="sidebar-content-scroll" style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                            {user ? (
                                <>
                                    <div style={{ marginBottom: '2.5rem' }}>
                                        <h5 className="sidebar-section-title">Navigation</h5>
                                        <div className="sidebar-links-group">
                                            <Link to="/dashboard" className="sidebar-link" onClick={toggleMenu}>
                                                <FaHome /> Dashboard
                                            </Link>
                                            <Link to="/transfer" className="sidebar-link" onClick={toggleMenu}>
                                                <FaExchangeAlt /> Money Transfer
                                            </Link>
                                            <Link to="/ai-assistant" className="sidebar-link ai-link" onClick={toggleMenu}>
                                                <FaRobot /> Ask Neo AI
                                            </Link>
                                            {user?.roles?.includes('ROLE_ADMIN') && (
                                                <Link to="/admin" className="sidebar-link" onClick={toggleMenu}>
                                                    <FaShieldAlt /> Admin Console
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <h5 className="sidebar-section-title">Account Details</h5>
                                        <div className="sidebar-profile-card">
                                            <div className="profile-card-header">
                                                <img
                                                    src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.firstName}&background=random&bold=true`}
                                                    alt="User Profile"
                                                    className="profile-card-avatar"
                                                />
                                                <div className="profile-card-info">
                                                    <h4>{user.firstName} {user.lastName || ''}</h4>
                                                    <p>{user.email}</p>
                                                </div>
                                            </div>

                                            <div className="sidebar-sublinks">
                                                <Link to="/settings" className="sidebar-sublink" onClick={toggleMenu}>
                                                    <FaCog /> Settings & Security
                                                </Link>
                                                <div className="sidebar-sublink" onClick={toggleTheme}>
                                                    {theme === 'light' ? <FaMoon /> : <FaSun style={{ color: '#facc15' }} />}
                                                    <span>{theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}</span>
                                                </div>
                                                <button onClick={handleLogout} className="sidebar-sublink logout">
                                                    <FaSignOutAlt /> Log out
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="sidebar-auth-group">
                                    <h5 className="sidebar-section-title">Getting Started</h5>
                                    <Link to="/login" className="sidebar-auth-btn secondary" onClick={toggleMenu}>
                                        Sign In
                                    </Link>
                                    <Link to="/register" className="sidebar-auth-btn primary" onClick={toggleMenu}>
                                        Open Free Account <FaArrowRight style={{ fontSize: '0.8rem', marginLeft: '5px' }} />
                                    </Link>

                                    <div className="sidebar-sublink" onClick={toggleTheme} style={{ marginTop: '1rem', justifyContent: 'center' }}>
                                        {theme === 'light' ? <FaMoon /> : <FaSun style={{ color: '#facc15' }} />}
                                        <span>Toggle Appearance</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '1rem 0', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
                                NeoBank Premium Banking v2.0
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Sidebar;
