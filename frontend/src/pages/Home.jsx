import React from 'react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaBolt, FaChartLine, FaRobot, FaPalette, FaCube } from 'react-icons/fa';
import Footer from '../components/Footer';
import Scene3D from '../components/Scene3D';
import './Home.css';

import { getCurrentUser } from '../services/auth.service';

const Home = () => {
    const user = getCurrentUser();
    const features = [
        { icon: <FaBolt />, title: 'Lightning Fast', desc: 'Real-time transactions and instant notifications.' },
        { icon: <FaShieldAlt />, title: 'Bank-Grade Security', desc: 'Your assets are protected by industry-leading encryption.' },
        { icon: <FaChartLine />, title: 'Smart Analytics', desc: 'Visualize your spending habits with intuitive charts.' },
        { icon: <FaRobot />, title: 'AI Assistant', desc: 'Get personalized financial advice from our Gemini AI.' },
        { icon: <FaCube />, title: '3D Experience', desc: 'Interact with your finances in a stunning immersive environment.' }
    ];

    return (
        <div className="home-container">
            <Navbar />

            <section className="hero-section">
                <div className="hero-content">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="hero-badge"
                    >
                        <span>NEW</span> Next-Gen 3D Banking
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Banking in <br />
                        <span>The Third Dimension</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Experience the most immersive financial platform ever built.
                        Depth, intelligence, and security combined.
                    </motion.p>
                    <motion.div
                        className="hero-btns"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        {user ? (
                            <Link to="/dashboard" className="primary-btn-3d">Enter Workspace</Link>
                        ) : (
                            <>
                                <Link to="/register" className="primary-btn-3d">Begin Your Journey</Link>
                                <Link to="/login" className="secondary-btn-3d">Login</Link>
                            </>
                        )}
                    </motion.div>
                </div>
                <div className="hero-visual-3d">
                    <Scene3D />
                </div>
            </section>

            <section className="features-section-3d">
                <div className="section-header">
                    <h2>Immersive Ecosystem</h2>
                    <p>Designed for the future of finance</p>
                </div>
                <div className="features-grid-3d">
                    {features.map((f, i) => (
                        <motion.div
                            className="feature-card-3d"
                            key={i}
                            initial={{ opacity: 0, z: -100, rotateY: 30 }}
                            whileInView={{ opacity: 1, z: 0, rotateY: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            whileHover={{
                                scale: 1.05,
                                rotateY: 10,
                                rotateX: -5,
                                z: 50,
                                boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
                            }}
                            style={{ transformStyle: 'preserve-3d' }}
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
