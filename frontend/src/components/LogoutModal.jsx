import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSignOutAlt } from 'react-icons/fa';

const LogoutModal = ({ isOpen, onConfirm, onCancel }) => {
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
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            color: '#ef4444',
                            fontSize: '1.8rem'
                        }}>
                            <FaSignOutAlt />
                        </div>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--text-main)' }}>
                            Sign Out
                        </h2>

                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
                            Are you sure you want to end your session and logout?
                        </p>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                className="btn-premium ghost"
                                onClick={onCancel}
                                style={{
                                    flex: 1,
                                    padding: '0.8rem',
                                    border: '1px solid var(--surface-border)',
                                    borderRadius: '12px',
                                    background: 'transparent',
                                    color: 'var(--text-muted)',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-premium primary"
                                onClick={onConfirm}
                                style={{
                                    flex: 1,
                                    padding: '0.8rem',
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    boxShadow: '0 8px 20px rgba(239, 68, 68, 0.2)',
                                    cursor: 'pointer'
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default LogoutModal;
