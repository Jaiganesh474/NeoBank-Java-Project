import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const PageLayout = ({ title, children }) => (
    <div className="page-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>{title}</h1>
                <div style={{ lineHeight: '1.8', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                    {children}
                </div>
            </motion.div>
        </main>
        <Footer />
    </div>
);

export const AboutUs = () => (
    <PageLayout title="About Us">
        <p>NeoBank is defined by its commitment to innovation and security. We are building the future of digital banking, one feature at a time.</p>
        <p>Founded in 2024, our mission is to simplify personal finance through cutting-edge technology.</p>
    </PageLayout>
);

export const Careers = () => (
    <PageLayout title="Careers">
        <p>Join our team of dreamers, builders, and doers. We are looking for passionate individuals to help us redefine banking.</p>
        <p>Check back soon for open positions in Engineering, Design, and Product.</p>
    </PageLayout>
);

export const Press = () => (
    <PageLayout title="Press">
        <p>Read the latest news and updates about NeoBank.</p>
        <ul>
            <li>NeoBank launches AI-Powered Assistant (Feb 2025)</li>
            <li>Reached 1 Million Users Milestone (Jan 2025)</li>
        </ul>
    </PageLayout>
);

export const DataPrivacy = () => (
    <PageLayout title="Data Privacy">
        <p>Your privacy is our top priority. We use state-of-the-art encryption to protect your personal and financial data.</p>
        <p>We never sell your data to third parties.</p>
    </PageLayout>
);

export const FraudCare = () => (
    <PageLayout title="Fraud Care">
        <p>Our sophisticated fraud detection systems monitor your account 24/7.</p>
        <p>If you suspect any unauthorized activity, please contact support immediately.</p>
    </PageLayout>
);

export const Insurance = () => (
    <PageLayout title="Insurance">
        <p>Your deposits are insured up to the maximum limit allowed by law.</p>
        <p>Rest easy knowing your money is safe with NeoBank.</p>
    </PageLayout>
);

export const HelpCenter = () => (
    <PageLayout title="Help Center">
        <p>Browse our FAQs and guides to get the most out of NeoBank.</p>
        <ul>
            <li>How to reset your password</li>
            <li>Making your first transfer</li>
            <li>Setting up TPIN</li>
        </ul>
    </PageLayout>
);

export const ContactUs = () => (
    <PageLayout title="Contact Us">
        <p>We are here to help.</p>
        <p>Email: support@neobank.com</p>
        <p>Phone: +1 (800) 123-4567</p>
    </PageLayout>
);

export const ApiDocs = () => (
    <PageLayout title="API Documentation">
        <p>Build the future of finance with the NeoBank API.</p>
        <p>Developer documentation coming soon.</p>
    </PageLayout>
);

export const PrivacyPolicy = () => (
    <PageLayout title="Privacy Policy">
        <p>This Privacy Policy describes how we collect, use, and handle your information.</p>
        <p>Last updated: February 2025</p>
    </PageLayout>
);

export const TermsOfService = () => (
    <PageLayout title="Terms of Service">
        <p>By using NeoBank, you agree to these Terms. Please read them carefully.</p>
        <p>Last updated: February 2025</p>
    </PageLayout>
);
