import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaGithub, FaShieldAlt } from 'react-icons/fa';
import Logo from './Logo';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="main-footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <div className="footer-logo">
                        <Logo size={28} className="logo-icon" />
                        <span>NeoBank</span>
                    </div>
                    <p>The next generation of intelligent, premium digital banking for the modern world.</p>
                </div>

                <div className="footer-links-grid">
                    <div className="link-group">
                        <h4>Company</h4>
                        <ul>
                            <li onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><Link to="/about">About Us</Link></li>
                            <li onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><Link to="/careers">Careers</Link></li>
                            <li onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><Link to="/press">Press</Link></li>
                        </ul>
                    </div>
                    <div className="link-group">
                        <h4>Security</h4>
                        <ul>
                            <li onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><Link to="/data-privacy">Data Privacy</Link></li>
                            <li onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><Link to="/fraud-care">Fraud Care</Link></li>
                            <li onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><Link to="/insurance">Insurance</Link></li>
                        </ul>
                    </div>
                    <div className="link-group">
                        <h4>Support</h4>
                        <ul>
                            <li onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><Link to="/help-center">Help Center</Link></li>
                            <li onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><Link to="/contact-us">Contact Us</Link></li>
                            <li onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><Link to="/api-docs">API Docs</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-social">
                    <h4>Follow Us</h4>
                    <div className="social-icons">
                        <motion.a whileHover={{ y: -5 }} href="#" target="_blank"><FaFacebook /></motion.a>
                        <motion.a whileHover={{ y: -5 }} href="#" target="_blank"><FaTwitter /></motion.a>
                        <motion.a whileHover={{ y: -5 }} href="#" target="_blank"><FaLinkedin /></motion.a>
                        <motion.a whileHover={{ y: -5 }} href="#" target="_blank"><FaGithub /></motion.a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© 2026 NeoBank. Built with passion for excellence.</p>
                <div className="legal-links">
                    <Link to="/privacy-policy" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Privacy Policy</Link>
                    <Link to="/terms-of-service" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
