import React from 'react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaBolt, FaChartLine, FaRobot, FaPalette } from 'react-icons/fa';
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
                    <div className="abstract-shape"></div>
                    {/* Floating Cards or 3D Elements could go here */}
                    <motion.div
                        className="glass-panel-premium"
                        style={{ width: '300px', height: '200px', borderRadius: '30px' }}
                        animate={{ y: [0, -20, 0], rotateX: [0, 5, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    />
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
