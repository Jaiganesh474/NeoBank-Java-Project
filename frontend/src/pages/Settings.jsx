import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUser, logout, fetchCurrentUser } from '../services/auth.service';
import UserService from '../services/user.service';
import CardService from '../services/card.service';
import { FaUser, FaLock, FaBell, FaShieldAlt, FaTrash, FaTimes, FaKey, FaCreditCard, FaShieldVirus, FaEye, FaEyeSlash, FaPalette, FaHistory, FaGlobe, FaDesktop } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const user = getCurrentUser();
    const navigate = useNavigate();
    const fileInputRef = React.useRef(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);

    // Card State
    const [card, setCard] = useState(null);
    const [cardLoading, setCardLoading] = useState(false);
    const [cardPin, setCardPin] = useState('');
    const [confirmCardPin, setConfirmCardPin] = useState('');
    const [cardMode, setCardMode] = useState('view'); // view, manage
    const [showCardDetails, setShowCardDetails] = useState(false);

    // Profile State
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
    const [isEditing, setIsEditing] = useState(false);

    // Avatar State
    const [selectedAvatar, setSelectedAvatar] = useState(user?.profileImageUrl || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`);
    const avatarOptions = [
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName || 'Felix'}`,
        `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`,
        `https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka`,
        `https://api.dicebear.com/7.x/avataaars/svg?seed=Zack`,
        `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.firstName || 'Bot'}`,
        `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${user?.firstName || 'Emoji'}`
    ];

    const handleAvatarUpdate = async (url) => {
        try {
            setSelectedAvatar(url);
            await UserService.updateAvatar(url);
            const updatedUser = { ...user, profileImageUrl: url };
            localStorage.setItem('user', JSON.stringify(updatedUser)); // Update local storage
            toast.success("Avatar updated successfully!");
        } catch (err) {
            toast.error("Failed to update avatar");
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            toast.error("Please upload an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("File size should be less than 5MB");
            return;
        }

        try {
            const res = await UserService.uploadAvatarFile(file);
            const newUrl = res.data.data; // URL from backend
            setSelectedAvatar(newUrl);

            // Update local user
            const updatedUser = { ...user, profileImageUrl: newUrl };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            toast.success("Avatar uploaded successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to upload image");
        }
    };

    // Password State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Modals State
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [otpAction, setOtpAction] = useState(null); // 'profile', 'password', 'delete', 'mobile', 'tpin-reset'
    const [otp, setOtp] = useState('');
    const [storedOtp, setStoredOtp] = useState('');

    // TPIN State
    const [oldTpin, setOldTpin] = useState('');
    const [tpin, setTpin] = useState('');
    const [confirmTpin, setConfirmTpin] = useState('');
    const [tpinMode, setTpinMode] = useState(user?.tpinSet ? 'view' : 'set'); // view, set, reset, reset-confirmed
    const [tpinResetStep, setTpinResetStep] = useState(1);
    const [showPinModal, setShowPinModal] = useState(false);
    const [modalType, setModalType] = useState('tpin'); // 'tpin', 'login-pin'

    // Login PIN State
    const [oldLoginPin, setOldLoginPin] = useState('');
    const [loginPin, setLoginPin] = useState('');
    const [confirmLoginPin, setConfirmLoginPin] = useState('');
    const [loginPinMode, setLoginPinMode] = useState(user?.loginPinSet ? 'view' : 'set'); // view, set, reset, forgot

    // New Preferences States
    const [themePreference, setThemePreference] = useState(localStorage.getItem('theme') || 'light');
    const [currency, setCurrency] = useState('INR');
    const [language, setLanguage] = useState('English');
    const [twoFactorAuth, setTwoFactorAuth] = useState(false);

    // Notification States
    const [notifEmail, setNotifEmail] = useState(true);
    const [notifSms, setNotifSms] = useState(true);
    const [notifPush, setNotifPush] = useState(false);
    const [notifMarketing, setNotifMarketing] = useState(false);

    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            await UserService.sendUpdateOtp();
            setOtpAction('profile');
            setShowOtpModal(true);
            toast.info("OTP sent to your email for verification");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateMobile = async () => {
        if (!phoneNumber) {
            toast.error("Please enter a phone number");
            return;
        }
        setLoading(true);
        try {
            await UserService.sendMobileUpdateOtp(phoneNumber);
            setOtpAction('mobile');
            setShowOtpModal(true);
            toast.info("OTP sent to your new mobile number");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        setLoading(true);
        try {
            await UserService.sendUpdateOtp(); // Reuse same email OTP logic
            setOtpAction('password');
            setShowOtpModal(true);
            toast.info("OTP sent to your email for verification");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
        setLoading(true);
        try {
            const res = await UserService.sendDeleteOtp();
            setOtpAction('delete');
            setShowOtpModal(true);
            toast.info(res.data.message || "OTP sent for verification");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const verifyOtpAndExecute = async () => {
        setLoading(true);
        try {
            if (otpAction === 'profile') {
                const res = await UserService.updateProfile(firstName, lastName, email, otp);
                // Update local storage user
                const updatedUser = { ...user, firstName, lastName, email };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                toast.success(res.data.message);
                setIsEditing(false);
            } else if (otpAction === 'mobile') {
                const res = await UserService.updateMobile(phoneNumber, otp);
                const updatedUser = { ...user, phoneNumber };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                toast.success(res.data.message);
                setIsEditing(false);
            } else if (otpAction === 'password') {
                const res = await UserService.changePassword(newPassword, otp);
                toast.success(res.data.message);
                setNewPassword('');
                setConfirmPassword('');
                setShowPasswordModal(false);
            } else if (otpAction === 'delete') {
                await UserService.deleteUser(otp);
                toast.success("Account deleted successfully");
                logout();
                navigate('/');
                return;
            } else if (otpAction === 'tpin-reset') {
                // For TPIN reset, first verify OTP then allow setting new PIN in overlay
                setStoredOtp(otp);
                setTpinMode('reset-confirmed');
                setOldTpin('');
                setTpin('');
                setConfirmTpin('');
                setModalType('tpin');
                setShowPinModal(true);
                setShowOtpModal(false);
                setOtp('');
                setLoading(false);
                return;
            } else if (otpAction === 'login-pin-reset') {
                // For forgot pin, we save otp and show pin fields in overlay
                setStoredOtp(otp);
                setLoginPinMode('forgot');
                setOldLoginPin('');
                setLoginPin('');
                setConfirmLoginPin('');
                setModalType('login-pin');
                setShowPinModal(true);
                setShowOtpModal(false);
                setOtp('');
                setLoading(false);
                return;
            } else if (otpAction === 'card-pin') {
                await CardService.updatePin(card.id, cardPin, otp);
                toast.success("Debit Card PIN updated successfully!");
                setCardMode('view');
                setCardPin('');
                setConfirmCardPin('');
            } else if (otpAction === 'card-unlink') {
                await CardService.unlinkCard(card.id, otp);
                toast.success("Card unlinked successfully");
                setCard(null);
            } else if (otpAction === 'card-delete') {
                await CardService.deleteCard(card.id, otp);
                toast.success("Card permanently deleted");
                setCard(null);
            }

            // Sync user state from backend
            const refreshedUser = await fetchCurrentUser();
            localStorage.setItem('user', JSON.stringify(refreshedUser));

            setShowOtpModal(false);
            setOtp('');
        } catch (err) {
            toast.error(err.response?.data?.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSetTpin = async () => {
        if (tpin.length !== 4) {
            toast.error("TPIN must be 4 digits");
            return;
        }
        if (tpin !== confirmTpin) {
            toast.error("TPINs do not match");
            return;
        }
        setLoading(true);
        try {
            if (tpinMode === 'set') {
                await UserService.setTpin(tpin);
                toast.success("Transaction PIN set successfully");
            } else if (tpinMode === 'reset-confirmed') {
                await UserService.resetTpin(storedOtp, tpin);
                toast.success("Transaction PIN reset successfully!");
            } else if (tpinMode === 'change') {
                if (oldTpin.length !== 4) {
                    toast.error("Please enter your current 4-digit TPIN");
                    setLoading(false);
                    return;
                }
                await UserService.changeTpin(oldTpin, tpin);
                toast.success("Transaction PIN updated successfully!");
            }

            // Always refres state from backend for security flags
            const refreshedUser = await fetchCurrentUser();
            localStorage.setItem('user', JSON.stringify(refreshedUser));
            setTpinMode('view');
            setOldTpin('');
            setTpin('');
            setConfirmTpin('');
            setStoredOtp('');
            setShowPinModal(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleResetTpinRequest = async () => {
        setLoading(true);
        try {
            await UserService.sendTpinOtp();
            setOtpAction('tpin-reset');
            setModalType('tpin');
            setShowOtpModal(true);
            toast.info("OTP sent to your mobile/email");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResetTpinConfirm = async () => {
        if (tpin.length !== 4) {
            toast.error("New TPIN must be 4 digits");
            return;
        }
        if (!otp || otp.length !== 6) {
            toast.error("Please enter valid OTP");
            return;
        }
        setLoading(true);
        try {
            await UserService.resetTpin(otp, tpin);
            toast.success("TPIN reset successfully");

            const refreshedUser = await fetchCurrentUser();
            localStorage.setItem('user', JSON.stringify(refreshedUser));

            setTpinResetStep(1);
            setTpinMode('view');
            setTpin('');
            setOtp('');
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to reset TPIN");
        } finally {
            setLoading(false);
        }
    };

    const handleSetLoginPin = async () => {
        if (loginPin.length < 4) {
            toast.error("PIN must be at least 4 digits");
            return;
        }
        if (loginPin !== confirmLoginPin) {
            toast.error("PINs do not match");
            return;
        }

        setLoading(true);
        try {
            if (loginPinMode === 'set') {
                await UserService.setLoginPin(loginPin);
                toast.success("Login PIN configured!");
            } else if (loginPinMode === 'reset') {
                if (!oldLoginPin) {
                    toast.error("Please enter your current PIN");
                    setLoading(false);
                    return;
                }
                await UserService.changeLoginPin(oldLoginPin, loginPin);
                toast.success("Login PIN updated successfully!");
            } else if (loginPinMode === 'forgot') {
                await UserService.resetLoginPin(storedOtp, loginPin);
                toast.success("Login PIN reset successfully!");
            }

            const refreshedUser = await fetchCurrentUser();
            localStorage.setItem('user', JSON.stringify(refreshedUser));
            setLoginPinMode('view');
            setOldLoginPin('');
            setLoginPin('');
            setConfirmLoginPin('');
            setStoredOtp('');
            setShowPinModal(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update Login PIN");
        } finally {
            setLoading(false);
        }
    };

    const handleLoginPinResetRequest = async () => {
        setLoading(true);
        try {
            await UserService.sendTpinOtp(); // Use same action otp
            setOtpAction('login-pin-reset');
            setModalType('login-pin');
            setShowOtpModal(true);
            toast.info("Security code sent via mobile/email");
        } catch (err) {
            toast.error("Failed to send code");
        } finally {
            setLoading(false);
        }
    };

    const handleCardUnlinkRequest = async () => {
        setLoading(true);
        try {
            await CardService.sendOtp();
            setOtpAction('card-unlink');
            setShowOtpModal(true);
            toast.info("OTP sent for verification");
        } catch (err) {
            toast.error("Failed to request OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleCardDeleteRequest = async () => {
        if (!window.confirm("CRITICAL: This will permanently delete your card data. Continue?")) return;
        setLoading(true);
        try {
            await CardService.sendOtp();
            setOtpAction('card-delete');
            setShowOtpModal(true);
            toast.info("CRITICAL action OTP sent");
        } catch (err) {
            toast.error("Failed to request OTP");
        } finally {
            setLoading(false);
        }
    };

    // Card Handlers
    const fetchCard = async () => {
        setCardLoading(true);
        try {
            const res = await CardService.getCard();
            if (res.status === 200) {
                setCard(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch card", err);
        } finally {
            setCardLoading(false);
        }
    };

    React.useEffect(() => {
        if (activeTab === 'pins' || activeTab === 'cards') {
            fetchCard();
        }
    }, [activeTab]);

    const handleCardPinRequest = async () => {
        setLoading(true);
        try {
            await CardService.sendOtp();
            setOtpAction('card-pin');
            setShowOtpModal(true);
            toast.info("OTP sent to your registered mobile number");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container" style={{ position: 'relative' }}>
            <Navbar />
            <main className="dashboard-content" style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '1.5rem' }}>
                <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>Settings</h1>
                        <p style={{ fontSize: '0.95rem' }}>Manage your account preferences and security.</p>
                    </motion.div>
                    <button
                        className="modal-close-btn"
                        onClick={() => navigate('/dashboard')}
                        style={{ background: 'var(--input-bg)', border: '1px solid var(--surface-border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                        <FaTimes />
                    </button>
                </header>

                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px' }}>
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        {/* Sidebar */}
                        <div style={{ flex: '0 0 200px', borderRight: '1px solid var(--surface-border)', paddingRight: '1rem' }}>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                <li
                                    onClick={() => setActiveTab('profile')}
                                    style={{
                                        marginBottom: '0.6rem',
                                        padding: '0.6rem 1rem',
                                        borderRadius: '10px',
                                        background: activeTab === 'profile' ? 'var(--primary-light)' : 'transparent',
                                        color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-muted)',
                                        fontWeight: activeTab === 'profile' ? '700' : '500',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <FaUser style={{ marginRight: '10px' }} /> Profile Info
                                </li>
                                <li
                                    onClick={() => setActiveTab('security')}
                                    style={{
                                        marginBottom: '0.6rem',
                                        padding: '0.6rem 1rem',
                                        borderRadius: '10px',
                                        background: activeTab === 'security' ? 'var(--primary-light)' : 'transparent',
                                        color: activeTab === 'security' ? 'var(--primary)' : 'var(--text-muted)',
                                        fontWeight: activeTab === 'security' ? '700' : '500',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <FaShieldAlt style={{ marginRight: '10px' }} /> Privacy & Security
                                </li>
                                <li
                                    onClick={() => setActiveTab('pins')}
                                    style={{
                                        marginBottom: '0.6rem',
                                        padding: '0.7rem 1.25rem',
                                        borderRadius: '12px',
                                        background: activeTab === 'pins' ? 'var(--primary-light)' : 'transparent',
                                        color: activeTab === 'pins' ? 'var(--primary)' : 'var(--text-muted)',
                                        fontWeight: activeTab === 'pins' ? '800' : '500',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        transition: 'all 0.3s ease',
                                        border: activeTab === 'pins' ? '1px solid rgba(var(--primary-rgb), 0.1)' : '1px solid transparent'
                                    }}
                                >
                                    <FaKey style={{ marginRight: '10px' }} />  PINs
                                </li>
                                <li
                                    onClick={() => setActiveTab('cards')}
                                    style={{
                                        marginBottom: '0.6rem',
                                        padding: '0.7rem 1.25rem',
                                        borderRadius: '12px',
                                        background: activeTab === 'cards' ? 'var(--primary-light)' : 'transparent',
                                        color: activeTab === 'cards' ? 'var(--primary)' : 'var(--text-muted)',
                                        fontWeight: activeTab === 'cards' ? '800' : '500',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        transition: 'all 0.3s ease',
                                        border: activeTab === 'cards' ? '1px solid rgba(var(--primary-rgb), 0.1)' : '1px solid transparent'
                                    }}
                                >
                                    <FaCreditCard style={{ marginRight: '10px' }} /> Cards
                                </li>
                                <li
                                    onClick={() => setActiveTab('preferences')}
                                    style={{
                                        marginBottom: '0.6rem',
                                        padding: '0.7rem 1.25rem',
                                        borderRadius: '12px',
                                        background: activeTab === 'preferences' ? 'var(--primary-light)' : 'transparent',
                                        color: activeTab === 'preferences' ? 'var(--primary)' : 'var(--text-muted)',
                                        fontWeight: activeTab === 'preferences' ? '800' : '500',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        transition: 'all 0.3s ease',
                                        border: activeTab === 'preferences' ? '1px solid rgba(var(--primary-rgb), 0.1)' : '1px solid transparent'
                                    }}
                                >
                                    <FaPalette style={{ marginRight: '10px' }} /> Preferences
                                </li>
                                <li
                                    onClick={() => setActiveTab('notifications')}
                                    style={{
                                        marginBottom: '0.6rem',
                                        padding: '0.7rem 1.25rem',
                                        borderRadius: '12px',
                                        background: activeTab === 'notifications' ? 'var(--primary-light)' : 'transparent',
                                        color: activeTab === 'notifications' ? 'var(--primary)' : 'var(--text-muted)',
                                        fontWeight: activeTab === 'notifications' ? '800' : '500',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        transition: 'all 0.3s ease',
                                        border: activeTab === 'notifications' ? '1px solid rgba(var(--primary-rgb), 0.1)' : '1px solid transparent'
                                    }}
                                >
                                    <FaBell style={{ marginRight: '10px' }} /> Notifications
                                </li>
                                <li
                                    onClick={() => setActiveTab('devices')}
                                    style={{
                                        marginBottom: '0.6rem',
                                        padding: '0.7rem 1.25rem',
                                        borderRadius: '12px',
                                        background: activeTab === 'devices' ? 'var(--primary-light)' : 'transparent',
                                        color: activeTab === 'devices' ? 'var(--primary)' : 'var(--text-muted)',
                                        fontWeight: activeTab === 'devices' ? '800' : '500',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        transition: 'all 0.3s ease',
                                        border: activeTab === 'devices' ? '1px solid rgba(var(--primary-rgb), 0.1)' : '1px solid transparent'
                                    }}
                                >
                                    <FaDesktop style={{ marginRight: '10px' }} /> Active Devices
                                </li>
                            </ul>
                        </div>

                        {/* Content */}
                        <div style={{ flex: '1 0 300px' }}>
                            {activeTab === 'profile' && (
                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                                        <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Profile Information</h2>
                                        {!isEditing && (
                                            <button className="btn-premium primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', width: 'fit-content', minHeight: 'unset' }} onClick={() => setIsEditing(true)}>Edit Profile</button>
                                        )}
                                    </div>

                                    <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                                        <div style={{ position: 'relative', display: 'inline-block' }}>
                                            <img
                                                src={selectedAvatar}
                                                alt="Current Avatar"
                                                style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid var(--surface)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
                                                {avatarOptions.map((url, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={url}
                                                        alt={`Option ${idx}`}
                                                        onClick={() => handleAvatarUpdate(url)}
                                                        style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            borderRadius: '50%',
                                                            cursor: 'pointer',
                                                            border: selectedAvatar === url ? '2px solid var(--primary)' : '2px solid transparent',
                                                            opacity: selectedAvatar === url ? 1 : 0.7,
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                                        onMouseLeave={e => e.currentTarget.style.opacity = selectedAvatar === url ? 1 : 0.7}
                                                    />
                                                ))}
                                                <div
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        background: 'var(--surface)',
                                                        border: '1px dashed var(--text-muted)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        fontSize: '1.2rem',
                                                        color: 'var(--text-muted)'
                                                    }}
                                                    onClick={() => fileInputRef.current.click()}
                                                    title="Upload Image"
                                                >
                                                    +
                                                </div>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileUpload}
                                                    hidden
                                                    accept="image/*"
                                                />
                                            </div>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Select an avatar or upload your own</p>

                                            {selectedAvatar && !selectedAvatar.includes('ui-avatars.com') && (
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm('Remove custom avatar?')) {
                                                            try {
                                                                await UserService.removeAvatar();
                                                                const defaultUrl = `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`;
                                                                setSelectedAvatar(defaultUrl);
                                                                const updatedUser = { ...user, profileImageUrl: null };
                                                                localStorage.setItem('user', JSON.stringify(updatedUser));
                                                                toast.success("Avatar removed");
                                                            } catch (e) {
                                                                toast.error("Failed to remove avatar");
                                                            }
                                                        }
                                                    }}
                                                    style={{
                                                        marginTop: '0.5rem',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: 'var(--error)',
                                                        fontSize: '0.8rem',
                                                        cursor: 'pointer',
                                                        textDecoration: 'underline'
                                                    }}
                                                >
                                                    Remove Profile Image
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.3rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem' }}>First Name</label>
                                            <input type="text" className="premium-input" style={{ height: '40px', fontSize: '0.9rem' }} value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={!isEditing} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.3rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem' }}>Last Name</label>
                                            <input type="text" className="premium-input" style={{ height: '40px', fontSize: '0.9rem' }} value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={!isEditing} />
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.3rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem' }}>Email Address</label>
                                        <input type="email" className="premium-input" style={{ height: '40px', fontSize: '0.9rem' }} value={email} onChange={(e) => setEmail(e.target.value)} disabled={!isEditing} />
                                    </div>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.3rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem' }}>Mobile Number</label>
                                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                                            <input
                                                type="text"
                                                className="premium-input"
                                                style={{ height: '40px', fontSize: '0.9rem' }}
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                disabled={!isEditing}
                                                placeholder="10-digit mobile number"
                                            />
                                            {isEditing && phoneNumber !== user.phoneNumber && (
                                                <button
                                                    className="btn-premium primary"
                                                    style={{ whiteSpace: 'nowrap', padding: '0 1rem', fontSize: '0.8rem' }}
                                                    onClick={handleUpdateMobile}
                                                    disabled={loading}
                                                >
                                                    {loading ? '...' : 'Verify'}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div style={{ display: 'flex', gap: '0.8rem', borderTop: '1px solid var(--surface-border)', paddingTop: '1.2rem' }}>
                                            <button className="btn-premium primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }} onClick={handleUpdateProfile} disabled={loading}>
                                                {loading ? 'Syncing...' : 'Save Changes'}
                                            </button>
                                            <button className="btn-premium ghost" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }} onClick={() => { setIsEditing(false); setFirstName(user.firstName); setLastName(user.lastName); setEmail(user.email); setPhoneNumber(user.phoneNumber || ''); }}>Cancel</button>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'security' && (
                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>Privacy & Security</h2>

                                    <div style={{ padding: '1.2rem', background: 'var(--input-bg)', borderRadius: '20px', border: '1px solid var(--surface-border)', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><FaLock style={{ color: 'var(--primary)', fontSize: '0.9rem' }} /> Password</h3>
                                                <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Regularly change your password for better security.</p>
                                            </div>
                                            <button className="btn-premium primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', width: 'fit-content', minHeight: 'unset' }} onClick={() => setShowPasswordModal(true)}>
                                                Change Password
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ padding: '1.2rem', background: 'rgba(239, 68, 68, 0.03)', borderRadius: '20px', border: '1px solid var(--error-light)' }}>
                                        <h3 style={{ color: 'var(--error)', margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <FaTrash style={{ fontSize: '0.9rem' }} /> Deactivate Account
                                        </h3>
                                        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1rem', fontSize: '0.85rem', lineHeight: '1.5' }}>
                                            Permanently delete your NeoBank registration. Action is irreversible.
                                        </p>
                                        <button className="btn-premium" style={{ background: 'var(--error)', color: 'white', padding: '0.5rem 1.2rem', fontSize: '0.85rem' }} onClick={handleDeleteAccount} disabled={loading}>
                                            Delete My Account
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'pins' && (
                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.6rem', fontWeight: '800' }}>Access PINs</h2>

                                    {/* Login PIN */}
                                    <div style={{ padding: '1.8rem', background: 'var(--input-bg)', borderRadius: '28px', border: '1px solid var(--surface-border)', marginBottom: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <FaShieldVirus style={{ color: 'var(--primary)', fontSize: '1.2rem' }} />
                                                </div>
                                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>Login PIN</h3>
                                            </div>
                                            {user.loginPinSet && <span style={{ fontSize: '0.7rem', padding: '5px 12px', borderRadius: '100px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontWeight: 800, letterSpacing: '0.05em' }}>ACTIVE</span>}
                                        </div>

                                        {!user.loginPinSet ? (
                                            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Secure your account with a 4-6 digit numeric PIN for instant access.</p>
                                                <button className="btn-premium primary" style={{ width: 'auto', padding: '0.8rem 2.5rem' }} onClick={() => { setModalType('login-pin'); setLoginPinMode('set'); setShowPinModal(true); }}>Setup Login PIN</button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '1rem' }}>
                                                <button className="btn-premium primary" style={{ width: 'auto', padding: '0.6rem 1.5rem', fontSize: '0.85rem' }} onClick={() => { setModalType('login-pin'); setLoginPinMode('reset'); setShowPinModal(true); }}>Change Login PIN</button>
                                                <button className="btn-premium ghost" style={{ width: 'auto', padding: '0.6rem 1.5rem', fontSize: '0.85rem' }} onClick={handleLoginPinResetRequest}>Forgot Login PIN?</button>
                                            </div>
                                        )}
                                    </div>

                                    {/* TPIN */}
                                    <div style={{ padding: '1.8rem', background: 'var(--input-bg)', borderRadius: '28px', border: '1px solid var(--surface-border)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <FaLock style={{ color: 'var(--primary)', fontSize: '1rem' }} />
                                                </div>
                                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>Transaction PIN (TPIN)</h3>
                                            </div>
                                            {user.tpinSet && <span style={{ fontSize: '0.7rem', padding: '5px 12px', borderRadius: '100px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontWeight: 800, letterSpacing: '0.05em' }}>SECURE</span>}
                                        </div>

                                        {!user.tpinSet ? (
                                            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Authorize transfers and bill payments with a secure 4-digit TPIN.</p>
                                                <button className="btn-premium primary" style={{ width: 'auto', padding: '0.8rem 2.5rem' }} onClick={() => { setModalType('tpin'); setTpinMode('set'); setShowPinModal(true); }}>Initialize TPIN</button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '1rem' }}>
                                                <button className="btn-premium primary" style={{ width: 'auto', padding: '0.6rem 1.5rem', fontSize: '0.85rem' }} onClick={() => { setModalType('tpin'); setTpinMode('change'); setShowPinModal(true); }}>Change TPIN</button>
                                                <button className="btn-premium ghost" style={{ width: 'auto', padding: '0.6rem 1.5rem', fontSize: '0.85rem' }} onClick={handleResetTpinRequest}>Forgot TPIN?</button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'cards' && (
                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.6rem', fontWeight: '800' }}>Cards</h2>
                                    <div style={{ padding: '1.5rem', border: '1px solid var(--surface-border)', background: 'var(--input-bg)', borderRadius: '24px' }}>
                                        {cardLoading ? (
                                            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading card details...</div>
                                        ) : card ? (
                                            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                                {/* Card Visual Mini */}
                                                <div style={{ flex: '0 0 280px', height: '170px', background: 'linear-gradient(135deg, #1e293b 0%, #020617 100%)', borderRadius: '20px', padding: '1.5rem', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 15px 30px rgba(0,0,0,0.3)', position: 'relative' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 700 }}>NEO PLATINUM</div>
                                                        <button onClick={() => setShowCardDetails(!showCardDetails)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {showCardDetails ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                                        </button>
                                                    </div>
                                                    <div style={{ fontSize: '1.2rem', letterSpacing: '0.2em', fontFamily: 'monospace' }}>
                                                        {showCardDetails ? card.cardNumber : `•••• •••• •••• ${card.cardNumber.slice(-4)}`}
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                        <div style={{ fontSize: '0.8rem' }}>
                                                            <div style={{ opacity: 0.6, fontSize: '0.6rem' }}>EXPIRES</div>
                                                            {card.expiryDate}
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ opacity: 0.6, fontSize: '0.6rem' }}>CVV</div>
                                                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{showCardDetails ? card.cvv : '•••'}</div>
                                                        </div>
                                                        <div style={{ fontSize: '1.2rem', fontWeight: '900', fontStyle: 'italic' }}>VISA</div>
                                                    </div>
                                                </div>

                                                {/* Card Controls */}
                                                <div style={{ flex: '1 0 250px' }}>
                                                    {cardMode === 'view' ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                                            <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>Active Card Control</h4>
                                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Linked to Account No: {card.linkedAccountNumber}</p>

                                                            <button className="btn-premium primary" style={{ width: '100%', padding: '0.8rem' }} onClick={() => setCardMode('manage')}>Set / Reset Card PIN</button>
                                                            <button className="btn-premium ghost" style={{ width: '100%', padding: '0.8rem' }} onClick={handleCardUnlinkRequest}>Unlink from Account</button>
                                                            <button className="btn-premium" style={{ width: '100%', padding: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }} onClick={handleCardDeleteRequest}>Permanent Deletion</button>
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>Manage Debit PIN</h4>
                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                                <input type="password" placeholder="New PIN" maxLength={4} className="premium-input" style={{ height: '45px', textAlign: 'center' }} value={cardPin} onChange={(e) => setCardPin(e.target.value.replace(/\D/g, ''))} />
                                                                <input type="password" placeholder="Confirm" maxLength={4} className="premium-input" style={{ height: '45px', textAlign: 'center' }} value={confirmCardPin} onChange={(e) => setConfirmCardPin(e.target.value.replace(/\D/g, ''))} />
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                                <button className="btn-premium primary" style={{ flex: 2 }} onClick={handleCardPinRequest}>Verify & Set PIN</button>
                                                                <button className="btn-premium ghost" style={{ flex: 1 }} onClick={() => setCardMode('view')}>Back</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>No active debit card found on this profile.</p>
                                                <button className="btn-premium primary" onClick={() => navigate('/dashboard')}>Get Your Virtual Card</button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'preferences' && (
                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.6rem', fontWeight: '800' }}>App Preferences</h2>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <div style={{ padding: '1.5rem', background: 'var(--input-bg)', borderRadius: '24px', border: '1px solid var(--surface-border)' }}>
                                            <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}><FaPalette /> Appearance</h3>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                {['light', 'dark'].map(t => (
                                                    <button
                                                        key={t}
                                                        onClick={() => {
                                                            setThemePreference(t);
                                                            document.documentElement.setAttribute('data-theme', t);
                                                            localStorage.setItem('theme', t);
                                                            window.dispatchEvent(new Event('storage'));
                                                        }}
                                                        style={{
                                                            flex: 1,
                                                            padding: '1rem',
                                                            borderRadius: '16px',
                                                            border: themePreference === t ? '2px solid var(--primary)' : '1.5px solid var(--surface-border)',
                                                            background: themePreference === t ? 'var(--primary-light)' : 'var(--surface)',
                                                            color: themePreference === t ? 'var(--primary)' : 'var(--text-main)',
                                                            fontWeight: '700',
                                                            textTransform: 'capitalize',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {t} Mode
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                            <div style={{ padding: '1.5rem', background: 'var(--input-bg)', borderRadius: '24px', border: '1px solid var(--surface-border)' }}>
                                                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}><FaGlobe /> Language</h3>
                                                <select className="premium-input" value={language} onChange={(e) => setLanguage(e.target.value)}>
                                                    <option>English</option>
                                                    <option>Hindi</option>
                                                    <option>Spanish</option>
                                                    <option>French</option>
                                                </select>
                                            </div>
                                            <div style={{ padding: '1.5rem', background: 'var(--input-bg)', borderRadius: '24px', border: '1px solid var(--surface-border)' }}>
                                                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>Currency</h3>
                                                <select className="premium-input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                                                    <option value="INR">Indian Rupee (₹)</option>
                                                    <option value="USD">US Dollar ($)</option>
                                                    <option value="EUR">Euro (€)</option>
                                                    <option value="GBP">Pound (£)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'notifications' && (
                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.6rem', fontWeight: '800' }}>Notification Settings</h2>

                                    <div style={{ background: 'var(--input-bg)', borderRadius: '28px', border: '1px solid var(--surface-border)', overflow: 'hidden' }}>
                                        {[
                                            { label: 'Email Alerts', desc: 'Receive transaction receipts & monthly statements.', state: notifEmail, setter: setNotifEmail },
                                            { label: 'SMS Notifications', desc: 'Real-time SMS for withdrawals & secure access.', state: notifSms, setter: setNotifSms },
                                            { label: 'Browser Push', desc: 'Instant desktop notifications for account activity.', state: notifPush, setter: setNotifPush },
                                            { label: 'Marketing Info', desc: 'Get updates on new products and premium offers.', state: notifMarketing, setter: setNotifMarketing }
                                        ].map((item, idx) => (
                                            <div key={idx} style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx === 3 ? 'none' : '1px solid var(--surface-border)' }}>
                                                <div>
                                                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)' }}>{item.label}</h4>
                                                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.desc}</p>
                                                </div>
                                                <div
                                                    onClick={() => item.setter(!item.state)}
                                                    style={{
                                                        width: '50px',
                                                        height: '26px',
                                                        background: item.state ? 'var(--primary)' : 'var(--surface-border)',
                                                        borderRadius: '20px',
                                                        position: 'relative',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        background: 'white',
                                                        borderRadius: '50%',
                                                        position: 'absolute',
                                                        top: '3px',
                                                        left: item.state ? '27px' : '3px',
                                                        transition: 'all 0.3s ease',
                                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                                    }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'devices' && (
                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.6rem', fontWeight: '800' }}>Logged-in Devices</h2>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ padding: '1.5rem', background: 'var(--primary-light)', borderRadius: '24px', border: '1px solid rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                            <div style={{ width: '50px', height: '50px', background: 'var(--primary)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.25rem' }}>
                                                <FaDesktop />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Windows Desktop • Chrome</h4>
                                                    <span style={{ fontSize: '0.65rem', padding: '3px 8px', background: 'var(--primary)', color: 'white', borderRadius: '100px', fontWeight: 800 }}>CURRENT</span>
                                                </div>
                                                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>San Francisco, USA • 192.168.1.1</p>
                                            </div>
                                        </div>

                                        <div style={{ padding: '1.5rem', background: 'var(--input-bg)', borderRadius: '24px', border: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: '1.5rem', opacity: 0.8 }}>
                                            <div style={{ width: '50px', height: '50px', background: 'var(--text-muted)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.25rem' }}>
                                                <FaHistory />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>iPhone 15 Pro • Safari</h4>
                                                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Yesterday, 10:45 PM • Mobile App</p>
                                            </div>
                                            <button style={{ background: 'none', border: 'none', color: 'var(--error)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>Logout</button>
                                        </div>

                                        <button className="btn-premium" style={{ border: '1.5px solid var(--error)', color: 'var(--error)', background: 'transparent', marginTop: '1rem', height: '50px' }} onClick={logout}>
                                            Sign Out from All Devices
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Change Password Modal */}
                <AnimatePresence>
                    {showPasswordModal && (
                        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ zIndex: 1500 }}>
                            <motion.div className="modal-content" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} style={{ padding: '2.5rem', borderRadius: '28px', maxWidth: '450px' }}>
                                <button className="modal-close" onClick={() => setShowPasswordModal(false)}><FaTimes /></button>
                                <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
                                    <div style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1rem' }}><FaLock /></div>
                                    <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Change Password</h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Protect your account with a strong password.</p>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600' }}>New Password</label>
                                    <input type="password" placeholder="Min. 6 chars" className="premium-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                </div>
                                <div style={{ marginBottom: '1.8rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600' }}>Confirm Password</label>
                                    <input type="password" placeholder="Repeat password" className="premium-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                </div>

                                <button className="btn-premium primary" style={{ width: '100%', height: '50px' }} onClick={handleChangePassword} disabled={loading || !newPassword}>
                                    {loading ? 'Processing...' : 'Verify Identity via Email'}
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* OTP Modal */}
                <AnimatePresence>
                    {showOtpModal && (
                        <motion.div
                            className="modal-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ zIndex: 2000 }}
                        >
                            <motion.div
                                className="modal-content"
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                style={{ padding: '2.5rem', borderRadius: '32px', maxWidth: '450px' }}
                            >
                                <button
                                    className="modal-close"
                                    onClick={() => setShowOtpModal(false)}
                                    style={{
                                        position: 'absolute',
                                        top: '1.5rem',
                                        right: '1.5rem',
                                        background: '#f1f5f9',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '50%',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: '#64748b',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                                >
                                    <FaTimes size={14} />
                                </button>
                                <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
                                    <div style={{
                                        fontSize: '2.8rem',
                                        color: '#2563eb',
                                        marginBottom: '1rem',
                                        display: 'inline-flex',
                                        padding: '1.2rem',
                                        background: 'rgba(37, 99, 235, 0.05)',
                                        borderRadius: '24px',
                                        boxShadow: 'inset 0 0 20px rgba(37, 99, 235, 0.05)'
                                    }}>
                                        <FaShieldAlt />
                                    </div>
                                    <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.4rem', color: '#1e293b' }}>Identity Verification</h2>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6', padding: '0 1rem' }}>
                                        {otpAction === 'mobile'
                                            ? `Security code sent to your new mobile: ${phoneNumber}`
                                            : otpAction === 'delete'
                                                ? `Deep security check: Enter the code sent to your mobile to confirm account deletion.`
                                                : otpAction === 'card-pin'
                                                    ? `Enter the 6-digit code sent to your registered number to authorize PIN change.`
                                                    : otpAction === 'card-unlink'
                                                        ? `Requesting verification code to unlink this card safely.`
                                                        : otpAction === 'card-delete'
                                                            ? `CRITICAL SECURITY: Please enter the code sent to your mobile to finalize card deletion.`
                                                            : otpAction === 'login-pin-reset'
                                                                ? `Access token sent via mobile/email for Login PIN recovery.`
                                                                : `A secure 6-digit authorization code has been dispatched to ${user.email}.`
                                        }
                                    </p>
                                </div>

                                <div className="input-wrapper-premium" style={{ marginBottom: '2rem', position: 'relative' }}>
                                    <FaKey className="input-icon" style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#2563eb', opacity: 0.6 }} />
                                    <input
                                        type="text"
                                        className="premium-input"
                                        style={{
                                            paddingLeft: '3rem',
                                            height: '60px',
                                            fontSize: '1.5rem',
                                            letterSpacing: '0.4em',
                                            fontWeight: '700',
                                            textAlign: 'center',
                                            background: '#ffffff',
                                            border: '1.5px solid #cbd5e1',
                                            color: '#1e293b'
                                        }}
                                        placeholder="000000"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    />
                                </div>

                                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                        Didn't receive the code? <button style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>Resend</button>
                                    </p>
                                </div>

                                <button
                                    className="btn-premium primary"
                                    style={{ width: '100%', height: '60px', fontSize: '1.1rem', fontWeight: '800', borderRadius: '16px', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)' }}
                                    onClick={verifyOtpAndExecute}
                                    disabled={loading || otp.length !== 6}
                                >
                                    {loading ? 'Verifying Identity...' : 'Confirm & Proceed'}
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* PIN MANAGEMENT MODAL OVERLAY */}
                <AnimatePresence>
                    {showPinModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'rgba(30, 41, 59, 0.7)',
                                backdropFilter: 'blur(15px)',
                                zIndex: 1100,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '1rem'
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 30, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.9, y: 30, opacity: 0 }}
                                style={{
                                    background: '#ffffff',
                                    width: '100%',
                                    maxWidth: '480px',
                                    borderRadius: '32px',
                                    padding: '2.5rem',
                                    position: 'relative',
                                    boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.15)',
                                    border: '1px solid #e2e8f0'
                                }}
                            >
                                <button
                                    onClick={() => { setShowPinModal(false); setOldTpin(''); setTpin(''); setConfirmTpin(''); }}
                                    style={{
                                        position: 'absolute',
                                        right: '25px',
                                        top: '25px',
                                        background: '#f1f5f9',
                                        border: 'none',
                                        color: '#64748b',
                                        cursor: 'pointer',
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <FaTimes size={18} />
                                </button>

                                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        background: 'rgba(37, 99, 235, 0.1)',
                                        borderRadius: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1.5rem',
                                        color: '#2563eb',
                                        fontSize: '1.8rem'
                                    }}>
                                        {modalType === 'tpin' ? <FaLock /> : <FaShieldVirus />}
                                    </div>
                                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>
                                        {modalType === 'tpin' ? 'Transaction PIN' : 'Login PIN'}
                                    </h2>
                                    <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                                        {modalType === 'tpin'
                                            ? (tpinMode === 'set' ? 'Setup a secure 4-digit PIN for transactions' : tpinMode === 'change' ? 'Update your current transaction PIN' : 'Set a new TPIN after verification')
                                            : (loginPinMode === 'set' ? 'Setup your secure access PIN' : loginPinMode === 'reset' ? 'Update your current access PIN' : 'Reset your forgotten PIN')
                                        }
                                    </p>
                                </div>

                                <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                                    {modalType === 'login-pin' && loginPinMode === 'reset' && (
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '8px', fontWeight: '600' }}>Original PIN</label>
                                            <input
                                                type="password"
                                                placeholder="••••"
                                                maxLength={6}
                                                className="premium-input"
                                                value={oldLoginPin}
                                                onChange={(e) => setOldLoginPin(e.target.value.replace(/\D/g, ''))}
                                                style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.4rem', height: '60px', background: '#ffffff', border: '1.5px solid #cbd5e1', color: '#1e293b' }}
                                            />
                                        </div>
                                    )}

                                    {modalType === 'tpin' && tpinMode === 'change' && (
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '8px', fontWeight: '600' }}>Current TPIN</label>
                                            <input
                                                type="password"
                                                placeholder="••••"
                                                maxLength={4}
                                                className="premium-input"
                                                value={oldTpin}
                                                onChange={(e) => setOldTpin(e.target.value.replace(/\D/g, ''))}
                                                style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.4rem', height: '60px', background: '#ffffff', border: '1.5px solid #cbd5e1', color: '#1e293b' }}
                                            />
                                        </div>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '2rem' }}>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                                {modalType === 'tpin' ? (tpinMode === 'change' ? 'New TPIN' : 'New TPIN') : (loginPinMode === 'reset' ? 'New PIN' : 'New PIN')}
                                            </label>
                                            <input
                                                type="password"
                                                placeholder="••••"
                                                maxLength={modalType === 'tpin' ? 4 : 6}
                                                className="premium-input"
                                                value={modalType === 'tpin' ? tpin : loginPin}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    modalType === 'tpin' ? setTpin(val) : setLoginPin(val);
                                                }}
                                                style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.4rem', height: '60px', background: '#ffffff', border: '1.5px solid #cbd5e1', color: '#1e293b' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '8px', fontWeight: '600' }}>Confirm</label>
                                            <input
                                                type="password"
                                                placeholder="••••"
                                                maxLength={modalType === 'tpin' ? 4 : 6}
                                                className="premium-input"
                                                value={modalType === 'tpin' ? confirmTpin : confirmLoginPin}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    modalType === 'tpin' ? setConfirmTpin(val) : setConfirmLoginPin(val);
                                                }}
                                                style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.4rem', height: '60px', background: '#ffffff', border: '1.5px solid #cbd5e1', color: '#1e293b' }}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        className="btn-premium primary"
                                        style={{ width: '100%', height: '60px', fontSize: '1.1rem', fontWeight: '800', borderRadius: '18px' }}
                                        onClick={modalType === 'tpin' ? handleSetTpin : handleSetLoginPin}
                                        disabled={loading}
                                    >
                                        {loading ? 'Processing...' : 'Confirm Security PIN'}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
            <Footer />
        </div>
    );
};

export default Settings;
