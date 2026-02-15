import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
    constructor() {
        this.client = null;
        this.subscriptions = new Set();
    }

    connect(userId, onMessageReceived) {
        const getWsURL = () => {
            let envUrl = import.meta.env.VITE_API_BASE_URL;
            if (envUrl) {
                // If the envUrl is "https://backend.com/api", we want "https://backend.com/ws-banking"
                let base = envUrl.trim().replace(/\/+$/, '');
                if (base.endsWith('/api')) {
                    base = base.slice(0, -4);
                }
                const finalWsUrl = `${base}/ws-banking`;
                console.log("WebSocket: Initializing with URL:", finalWsUrl);
                return finalWsUrl;
            }
            if (import.meta.env.PROD) {
                return '/ws-banking';
            }
            return 'http://localhost:8080/ws-banking';
        };

        const socket = new SockJS(getWsURL());
        this.client = new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log(str),
            onConnect: () => {
                console.log('Connected to WebSocket');
                this.client.subscribe(`/topic/user/${userId}`, (message) => {
                    onMessageReceived(message.body);
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            }
        });

        this.client.activate();
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
        }
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;
