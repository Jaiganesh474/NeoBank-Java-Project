import api from './api';

export const getAccounts = async () => {
    const response = await api.get('accounts');
    return response.data;
};

export const createAccount = async (accountType, initialDeposit) => {
    const response = await api.post('accounts', {
        accountType,
        initialDeposit
    });
    return response.data;
};

export const sendPhoneOtp = async (phoneNumber) => {
    const response = await api.post('/accounts/send-otp', { phoneNumber });
    return response.data;
};

export const createAccountWithOtp = async (phoneNumber, otp, accountType, initialDeposit) => {
    const response = await api.post('/accounts/create-with-otp', {
        phoneNumber,
        otp,
        accountType,
        initialDeposit
    });
    return response.data;
};

export const transferMoney = async (fromAccountNumber, toAccountNumber, amount, description, tpin) => {
    const response = await api.post('/accounts/transfer', {
        fromAccountNumber,
        toAccountNumber,
        amount,
        description,
        tpin
    });
    return response.data;
};

export const deleteAccount = async (accountId) => {
    const response = await api.delete(`accounts/${accountId}`);
    return response.data;
};
