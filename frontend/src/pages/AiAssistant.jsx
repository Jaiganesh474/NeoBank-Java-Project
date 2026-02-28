import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaRobot, FaUser, FaTrashAlt } from 'react-icons/fa';
import Footer from '../components/Footer';
import './AiAssistant.css';

const AiAssistant = () => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your Neo AI assistant. How can I help you today?", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesContainerRef = useRef(null);

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);
    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await api.post('/ai/chat', { message: input });
            const aiMessage = {
                id: Date.now() + 1,
                text: response.data.response,
                sender: 'ai'
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("AI Assistant Error:", error);
            const errorMessage = {
                id: Date.now() + 1,
                text: "I'm having trouble connecting to my brain. Please try again later!",
                sender: 'ai',
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([{ id: 1, text: "Chat cleared. How can I help you now?", sender: 'ai' }]);
    };

    return (
        <div className="ai-container">
            <Navbar />
            <div className="ai-bg-blob blob-1"></div>
            <div className="ai-bg-blob blob-2"></div>
            <div className="ai-content-wrapper">
                <motion.div
                    className="chat-window"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <header className="chat-header">
                        <div className="ai-info">
                            <div className="ai-status-dot"></div>
                            <FaRobot className="header-icon" />
                            <div>
                                <h3>Neo AI Assistant</h3>
                                <span>Powered by Gemini AI</span>
                            </div>
                        </div>
                        <button onClick={clearChat} className="clear-btn" title="Clear Chat">
                            <FaTrashAlt />
                        </button>
                    </header>

                    <div className="messages-container" ref={messagesContainerRef}>
                        <AnimatePresence>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    className={`message-bubble ${msg.sender}`}
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                >
                                    <div className="message-icon">
                                        {msg.sender === 'ai' ? <FaRobot /> : <FaUser />}
                                    </div>
                                    <div className="message-text">
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {loading && (
                            <motion.div className="message-bubble ai loading">
                                <div className="typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <form className="chat-input-area" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder="Ask about your balance, transfers, or saving tips..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                        />
                        <button type="submit" className="send-btn" disabled={loading || !input.trim()}>
                            <FaPaperPlane />
                        </button>
                    </form>
                </motion.div>

                <aside className="ai-sidebar">
                    <div className="ai-card">
                        <h4>Suggested Questions</h4>
                        <ul>
                            <li onClick={() => setInput("How do I open a new account?")}>How do I open a new account?</li>
                            <li onClick={() => setInput("What is the interest rate for savings?")}>What is the interest rate for savings?</li>
                            <li onClick={() => setInput("How can I save more money?")}>How can I save more money?</li>
                            <li onClick={() => setInput("Is my data secure?")}>Is my data secure?</li>
                        </ul>
                    </div>
                </aside>
            </div>
            <Footer />
        </div>
    );
};

export default AiAssistant;
