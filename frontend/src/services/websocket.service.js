import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
    constructor() {
        this.client = null;
        this.subscriptions = new Set();
    }

    connect(userId, onMessageReceived) {
        const socket = new SockJS('http://localhost:8080/ws-banking');
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
