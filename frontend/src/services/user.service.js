import api from './api';

const sendUpdateOtp = async () => {
    return api.post('users/send-update-otp');
};

const updateProfile = async (firstName, lastName, email, otp) => {
    return api.put('users/profile', { firstName, lastName, email, otp });
};

const changePassword = async (newPassword, otp) => {
    return api.post('users/change-password', { newPassword, otp });
};

const sendDeleteOtp = async () => {
    return api.post('users/send-delete-otp');
};

const deleteUser = async (otp) => {
    return api.delete(`users/me?otp=${otp}`);
};

const sendMobileUpdateOtp = async (phoneNumber) => {
    return api.post('users/send-mobile-update-otp', { phoneNumber });
};

const updateMobile = async (phoneNumber, otp) => {
    // Reusing the same endpoint but with phoneNumber
    return api.put('users/profile', { phoneNumber, otp });
};

const updateAvatar = async (profileImageUrl) => {
    return api.put('users/avatar', { profileImageUrl });
};

const uploadAvatarFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('users/avatar/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

const removeAvatar = async () => {
    return api.delete('users/avatar');
};

const setTpin = async (tpin) => {
    return api.post('users/set-tpin', { tpin });
};

const verifyTpin = async (tpin) => {
    return api.post('users/verify-tpin', { tpin });
};

const sendTpinOtp = async () => {
    return api.post('users/send-tpin-otp');
};

const resetTpin = async (otp, newTpin) => {
    return api.post('users/reset-tpin', { otp, newTpin });
};

const setLoginPin = async (pin) => {
    return api.post('users/set-login-pin', { pin });
};

const resetLoginPin = async (otp, pin) => {
    return api.post('users/reset-login-pin', { otp, pin });
};

const changeLoginPin = async (oldPin, newPin) => {
    return api.post('users/change-login-pin', { oldPin, newPin });
};

const changeTpin = async (oldTpin, newTpin) => {
    return api.post('users/change-tpin', { oldTpin, newTpin });
};

const getNotificationSettings = async () => {
    return api.get('users/notifications');
};

const updateNotificationSettings = async (settings) => {
    return api.put('users/notifications', settings);
};

const UserService = {
    sendUpdateOtp,
    updateProfile,
    changePassword,
    sendDeleteOtp,
    deleteUser,
    sendMobileUpdateOtp,
    updateMobile,
    updateAvatar,
    uploadAvatarFile,
    removeAvatar,
    setTpin,
    verifyTpin,
    sendTpinOtp,
    resetTpin,
    setLoginPin,
    resetLoginPin,
    changeLoginPin,
    changeTpin,
    getNotificationSettings,
    updateNotificationSettings
};

export default UserService;
