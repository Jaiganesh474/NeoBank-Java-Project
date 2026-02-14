import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClock } from 'react-icons/fa';

const SessionExpiredModal = ({ isOpen, onConfirm }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay">
                    <motion.div
                        className="modal-content"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 400 }}
                    >
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'rgba(234, 179, 8, 0.1)',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            color: '#eab308',
                            fontSize: '1.8rem'
                        }}>
                            <FaClock />
                        </div>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--text-main)' }}>
                            Session Expired
                        </h2>

                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
                            Your secure session has timed out. Please log in again to continue.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                className="btn-premium primary"
                                onClick={onConfirm}
                                style={{
                                    flex: 1,
                                    padding: '0.8rem',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.2)',
                                    cursor: 'pointer'
                                }}
                            >
                                Log In Again
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SessionExpiredModal;
