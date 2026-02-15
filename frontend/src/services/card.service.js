import api from './api';

const getCard = () => {
    return api.get('cards');
};

const sendOtp = () => {
    return api.post('/cards/send-otp');
};

const issueCard = (otp) => {
    return api.post('/cards/issue', { otp });
};

const updatePin = (cardId, pin, otp) => {
    return api.post(`cards/${cardId}/pin`, { pin, otp });
};

const unlinkCard = (cardId, otp) => {
    return api.post(`cards/${cardId}/unlink?otp=${otp}`);
};

const deleteCard = (cardId, otp) => {
    return api.delete(`cards/${cardId}?otp=${otp}`);
};

const CardService = {
    getCard,
    sendOtp,
    issueCard,
    updatePin,
    unlinkCard,
    deleteCard
};

export default CardService;
