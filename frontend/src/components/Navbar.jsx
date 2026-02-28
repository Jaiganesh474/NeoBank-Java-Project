import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/auth.service';
import { FaBars, FaTimes, FaUniversity, FaMoon, FaSun, FaRobot, FaSignOutAlt, FaChevronDown, FaCog } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import LogoutModal from './LogoutModal';
import Logo from './Logo';
import './Navbar.css';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const navigate = useNavigate();
    const user = getCurrentUser();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDropdown && !event.target.closest('.profile-dropdown-container')) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDropdown]);

    const handleLogout = () => {
        setIsLogoutModalOpen(true);
        setShowDropdown(false);
        setIsOpen(false);
    };

    const confirmLogout = () => {
        logout();
        navigate('/');
    };

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const toggleMenu = () => setIsOpen(!isOpen);

    const NavLinks = () => (
        <>
            <Link to="/dashboard" className="nav-link" onClick={() => setIsOpen(false)}>Dashboard</Link>
            <Link to="/transfer" className="nav-link" onClick={() => setIsOpen(false)}>Transfer</Link>
            <Link to="/ai-assistant" className="nav-link ai-link" onClick={() => setIsOpen(false)}>
                <FaRobot /> Ask Neo AI
            </Link>
            {user?.roles?.includes('ROLE_ADMIN') && (
                <Link to="/admin" className="nav-link" onClick={() => setIsOpen(false)}>Admin</Link>
            )}
        </>
    );

    return (
        <>
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="navbar-container">
                    <div className="navbar-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="mobile-toggle hide-on-desktop" onClick={toggleMenu} style={{ cursor: 'pointer', display: 'flex' }}>
                            <FaBars style={{ fontSize: '1.25rem' }} />
                        </div>
                        <div className="navbar-brand">
                            <Link to="/" onClick={() => setIsOpen(false)}>
                                <Logo size={28} className="brand-icon" />
                                <span className="brand-text hide-on-mobile-small">NeoBank</span>
                            </Link>
                        </div>
                    </div>

                    {/* Desktop Actions */}
                    <div className="navbar-actions-desktop hide-on-mobile">
                        {user && <div className="desktop-links"><NavLinks /></div>}

                        <motion.button
                            className="theme-toggle-btn"
                            onClick={toggleTheme}
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.1 }}
                            aria-label="Toggle Theme"
                        >
                            {theme === 'light' ? <FaMoon /> : <FaSun style={{ color: '#facc15' }} />}
                        </motion.button>

                        {user ? (
                            <div className="profile-dropdown-container">
                                <div
                                    className="user-profile-summary"
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <img
                                        src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.firstName}&background=random&bold=true`}
                                        alt="avatar"
                                        className="user-avatar"
                                    />
                                    <div className="user-info-text">
                                        <span className="user-name">{user.firstName}</span>
                                        <span className="user-role" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {user.roles.includes('ROLE_ADMIN') ? 'ADMIN' : user.roles[0].replace('ROLE_', '')} <FaChevronDown style={{ fontSize: '0.6rem' }} />
                                        </span>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {showDropdown && (
                                        <motion.div
                                            className="profile-menu-dropdown"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="dropdown-header">
                                                <p className="user-full-name">{user.firstName} {user.lastName || ''}</p>
                                                <p className="user-email">{user.email}</p>
                                            </div>
                                            <div className="dropdown-divider"></div>
                                            <div className="dropdown-item" style={{ cursor: 'default', background: 'transparent' }}>
                                                <small style={{ opacity: 0.7, fontSize: '0.75rem' }}>Last Login:</small>
                                                <span style={{ fontSize: '0.8rem', marginLeft: 'auto' }}>
                                                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString(undefined, {
                                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    }) : 'First Login'}
                                                </span>
                                            </div>
                                            <div className="dropdown-divider"></div>
                                            <Link to="/settings" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                                                <FaCog /> Settings
                                            </Link>
                                            <button onClick={handleLogout} className="dropdown-item logout-btn">
                                                <FaSignOutAlt /> Logout
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="auth-btns">
                                <Link to="/login" className="nav-link">Login</Link>
                                <Link to="/register" className="nav-link-btn primary-btn">Sign Up</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Only Theme Toggle (Right side) */}
                    <div className="navbar-actions-mobile hide-on-desktop">
                        <motion.button
                            className="theme-toggle-btn"
                            onClick={toggleTheme}
                            whileTap={{ scale: 0.9 }}
                            aria-label="Toggle Theme"
                        >
                            {theme === 'light' ? <FaMoon /> : <FaSun style={{ color: '#facc15' }} />}
                        </motion.button>
                    </div>
                </div>

            </nav>

            <Sidebar
                isOpen={isOpen}
                toggleMenu={toggleMenu}
                user={user}
                theme={theme}
                toggleTheme={toggleTheme}
                handleLogout={handleLogout}
            />
            <LogoutModal
                isOpen={isLogoutModalOpen}
                onConfirm={confirmLogout}
                onCancel={() => setIsLogoutModalOpen(false)}
            />
        </>
    );
};

export default Navbar;
