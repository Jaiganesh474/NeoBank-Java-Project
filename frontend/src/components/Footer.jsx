import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaGithub, FaShieldAlt } from 'react-icons/fa';
import Logo from './Logo';
import './Footer.css';

const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="main-footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <div className="footer-logo">
                        <Logo size={28} className="logo-icon" />
                        <span>NeoBank</span>
                    </div>
                    <p>The next generation of intelligent, premium digital banking for the modern world.</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.7 }}>Simplifying your financial life with state-of-the-art security and elegant design.</p>
                    <div className="footer-badges" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <div className="badge-item">
                            <FaShieldAlt style={{ color: 'var(--success)' }} />
                            <span>FDIC Insured</span>
                        </div>
                    </div>
                </div>

                <div className="footer-links-grid">
                    <div className="link-group">
                        <h4>Company</h4>
                        <ul>
                            <li><Link to="/about" onClick={scrollToTop}>About Us</Link></li>
                            <li><Link to="/careers" onClick={scrollToTop}>Careers</Link></li>
                            <li><Link to="/press" onClick={scrollToTop}>Press</Link></li>
                        </ul>
                    </div>
                    <div className="link-group">
                        <h4>Products</h4>
                        <ul>
                            <li><Link to="/cards" onClick={scrollToTop}>Neo Cards</Link></li>
                            <li><Link to="/savings" onClick={scrollToTop}>Savings Plus</Link></li>
                            <li><Link to="/loans" onClick={scrollToTop}>Personal Loans</Link></li>
                        </ul>
                    </div>
                    <div className="link-group">
                        <h4>Security</h4>
                        <ul>
                            <li><Link to="/data-privacy" onClick={scrollToTop}>Data Privacy</Link></li>
                            <li><Link to="/fraud-care" onClick={scrollToTop}>Fraud Care</Link></li>
                            <li><Link to="/insurance" onClick={scrollToTop}>Insurance</Link></li>
                        </ul>
                    </div>
                    <div className="link-group">
                        <h4>Support</h4>
                        <ul>
                            <li><Link to="/help-center" onClick={scrollToTop}>Help Center</Link></li>
                            <li><Link to="/contact-us" onClick={scrollToTop}>Contact Us</Link></li>
                            <li><Link to="/api-docs" onClick={scrollToTop}>API Docs</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-cta-column">
                    <h4>Stay Connected</h4>
                    <p style={{ fontSize: '0.85rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Get the latest updates on new features and rates.</p>
                    <div className="footer-social">
                        <div className="social-icons">
                            <motion.a whileHover={{ y: -5, color: '#1877F2' }} href="#" target="_blank"><FaFacebook /></motion.a>
                            <motion.a whileHover={{ y: -5, color: '#1DA1F2' }} href="#" target="_blank"><FaTwitter /></motion.a>
                            <motion.a whileHover={{ y: -5, color: '#0A66C2' }} href="#" target="_blank"><FaLinkedin /></motion.a>
                            <motion.a whileHover={{ y: -5, color: 'var(--text-main)' }} href="#" target="_blank"><FaGithub /></motion.a>
                        </div>
                    </div>
                    <button onClick={scrollToTop} className="scroll-top-btn" title="Scroll to top">
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            ↑
                        </motion.div>
                        Back to Top
                    </button>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© 2026 NeoBank. Built with passion for excellence.</p>
                <div className="legal-links">
                    <Link to="/privacy-policy" onClick={scrollToTop}>Privacy Policy</Link>
                    <Link to="/terms-of-service" onClick={scrollToTop}>Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
