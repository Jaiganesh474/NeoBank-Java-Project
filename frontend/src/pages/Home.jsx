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
                            <Link to="/dashboard" className="primary-btn">Go to Dashboard</Link>
                        ) : (
                            <>
                                <Link to="/register" className="primary-btn">Open Free Account</Link>
                                <Link to="/login" className="secondary-btn">Login to Account</Link>
                            </>
                        )}
                    </motion.div>
                </div>
                <div className="hero-visual">
                    <div className="abstract-shape"></div>
                </div>
            </section>

            <section className="features-grid">
                {features.map((f, i) => (
                    <motion.div
                        className="feature-card"
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                    >
                        <div className="f-icon">{f.icon}</div>
                        <h3>{f.title}</h3>
                        <p>{f.desc}</p>
                    </motion.div>
                ))}
            </section>

            <Footer />
        </div>
    );
};

export default Home;
