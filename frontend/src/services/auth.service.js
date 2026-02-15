import api from './api';

export const login = async (email, password) => {
    const response = await api.post('/auth/signin', { email, password });
    if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify({
            id: response.data.id,
            email: response.data.email,
            firstName: response.data.firstName,
            roles: response.data.roles,
            lastLogin: response.data.lastLogin,
            phoneNumber: response.data.phoneNumber,
            profileImageUrl: response.data.profileImageUrl,
            tpinSet: response.data.tpinSet,
            loginPinSet: response.data.loginPinSet
        }));
    }
    return response.data;
};

export const loginByPin = async (identifier, pin) => {
    const response = await api.post('/auth/signin-pin', { identifier, pin });
    if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify({
            id: response.data.id,
            email: response.data.email,
            firstName: response.data.firstName,
            roles: response.data.roles,
            lastLogin: response.data.lastLogin,
            phoneNumber: response.data.phoneNumber,
            profileImageUrl: response.data.profileImageUrl,
            tpinSet: response.data.tpinSet,
            loginPinSet: response.data.loginPinSet
        }));
    }
    return response.data;
};

export const requestLoginOtp = async (phoneNumber) => {
    const response = await api.post('/auth/login-otp', { phoneNumber });
    return response.data;
};

export const loginByOtp = async (phoneNumber, otp) => {
    const response = await api.post('/auth/signin-otp', { phoneNumber, otp });
    if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify({
            id: response.data.id,
            email: response.data.email,
            firstName: response.data.firstName,
            roles: response.data.roles,
            lastLogin: response.data.lastLogin,
            phoneNumber: response.data.phoneNumber,
            profileImageUrl: response.data.profileImageUrl,
            tpinSet: response.data.tpinSet,
            loginPinSet: response.data.loginPinSet
        }));
    }
    return response.data;
};

export const firebaseLogin = async (idToken) => {
    const response = await api.post('/auth/firebase-signin', { idToken });
    if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify({
            id: response.data.id,
            email: response.data.email,
            firstName: response.data.firstName,
            roles: response.data.roles,
            lastLogin: response.data.lastLogin,
            phoneNumber: response.data.phoneNumber,
            profileImageUrl: response.data.profileImageUrl,
            tpinSet: response.data.tpinSet,
            loginPinSet: response.data.loginPinSet
        }));
    }
    return response.data;
};

export const register = async (firstName, lastName, email, password) => {
    const response = await api.post('/auth/signup', {
        firstName,
        lastName,
        email,
        password,
    });
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
};

export const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
};

export const resetPassword = async (email, otp, newPassword) => {
    const response = await api.post('/auth/reset-password', { email, otp, newPassword });
    return response.data;
};

export const forgotPin = async (identifier) => {
    const response = await api.post('/auth/forgot-pin', { identifier });
    return response.data;
};

export const resetPin = async (identifier, otp, newPin) => {
    const response = await api.post('/auth/reset-pin', { identifier, otp, newPin });
    return response.data;
};

export const verifyRegistration = async (email, otp) => {
    const response = await api.post('/auth/verify-registration', { email, otp });
    return response.data;
};

export const resendOtp = async (email) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
};

export const fetchCurrentUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const response = await api.get('/auth/me');
        if (response.data.id) {
            localStorage.setItem('user', JSON.stringify({
                id: response.data.id,
                email: response.data.email,
                firstName: response.data.firstName,
                roles: response.data.roles,
                lastLogin: response.data.lastLogin,
                phoneNumber: response.data.phoneNumber,
                profileImageUrl: response.data.profileImageUrl,
                tpinSet: response.data.tpinSet,
                loginPinSet: response.data.loginPinSet
            }));
        }
        return response.data;
    } catch (error) {
        console.warn("User session not found or expired.");
        return null;
    }
};
