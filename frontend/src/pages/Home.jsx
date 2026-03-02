import React from 'react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaBolt, FaChartLine, FaRobot, FaPalette, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import Footer from '../components/Footer';
import './Home.css';

import { getCurrentUser } from '../services/auth.service';

const Home = () => {
    const user = getCurrentUser();
    const features = [
        { icon: <FaBolt />, title: 'Lightning Fast', desc: 'Real-time transactions and instant notifications.' },
        { icon: <FaShieldAlt />, title: 'Bank-Grade Security', desc: 'Your assets are protected by industry-leading encryption.' },
        { icon: <FaChartLine />, title: 'Smart Analytics', desc: 'Visualize your spending habits with intuitive charts.' },
        { icon: <FaRobot />, title: 'AI Assistant', desc: 'Get personalized financial advice from our Gemini AI.' },
        { icon: <FaPalette />, title: 'Custom Themes', desc: 'Personalize your banking experience with premium themes.' }
    ];

    return (
        <div className="home-container">
            <Navbar />

            <section className="hero-section">
                <div className="hero-content">
                    <motion.div
                        className="hero-badge"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <span>New</span> Next-Gen Banking Now Live
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Banking Reimagined <br />
                        <span>Powered by Intelligence</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Experience the next generation of financial freedom.
                        Smart, secure, and beautiful banking for everyone.
                    </motion.p>
                    <motion.div
                        className="hero-btns"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        {user ? (
                            <Link to="/dashboard" className="primary-btn-3d">Go to Dashboard</Link>
                        ) : (
                            <>
                                <Link to="/register" className="primary-btn-3d">Open Free Account</Link>
                                <Link to="/login" className="secondary-btn-3d">Login to Account</Link>
                            </>
                        )}
                    </motion.div>
                </div>
                <div className="hero-visual-3d">
                    <motion.div
                        className="floating-card-ui"
                        animate={{ y: [0, -20, 0], rotateX: [5, 10, 5], rotateY: [-15, -10, -15] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <div className="card-chip"></div>
                        <div className="card-logo">NeoBank</div>
                        <div className="card-number">•••• •••• •••• 4289</div>
                        <div className="card-footer">
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>CARDHOLDER</span>
                                <span className="card-name">JOHN DOE</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                                <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>VALID THRU</span>
                                <span className="card-exp">12/28</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="floating-badge badge-income"
                        animate={{ y: [0, 15, 0], x: [0, 10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    >
                        <div className="badge-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
                            <FaArrowDown />
                        </div>
                        <div className="badge-info">
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Income</span>
                            <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 900 }}>+₹45,000.00</strong>
                        </div>
                    </motion.div>

                    <motion.div
                        className="floating-badge badge-expense"
                        animate={{ y: [0, -15, 0], x: [0, -10, 0] }}
                        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    >
                        <div className="badge-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--error)' }}>
                            <FaArrowUp />
                        </div>
                        <div className="badge-info">
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Expense</span>
                            <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 900 }}>-₹2,450.00</strong>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="features-section-3d">
                <div className="features-grid-3d">
                    {features.map((f, i) => (
                        <motion.div
                            className="feature-card-3d"
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className="f-icon-3d">{f.icon}</div>
                            <div className="f-content-3d">
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Home;
