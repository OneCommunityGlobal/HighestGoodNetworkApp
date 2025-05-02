import { store } from "../store";
import { handleMessageReceived, handleMessageStatusUpdated } from "actions/lbdashboard/messagingActions";

let messagingSocket = null;
let reconnectAttempts = 0;

export const initMessagingSocket = (token) => {
    messagingSocket = new WebSocket("ws://localhost:4500/messaging-service", token);

    messagingSocket.onopen = () => {
        reconnectAttempts = 0;
    };

    messagingSocket.onerror = (error) => {
        console.error("❌ Messaging WebSocket error:", error);
    };

    messagingSocket.onmessage = (message) => {
        const data = JSON.parse(message.data);
      
        if (data.action === "RECEIVE_MESSAGE") {
            store.dispatch(handleMessageReceived(data.payload));
        } else if (data.action === "MESSAGE_STATUS_UPDATED") {
            store.dispatch(handleMessageStatusUpdated(data.payload));
        }
      };

    messagingSocket.onclose = () => {
        messagingSocket = null;

        if (reconnectAttempts < 5) {
            setTimeout(() => {
                reconnectAttempts++;
                initMessagingSocket(token);
            }, 2000); 
        } else {
            console.error("❌ Maximum reconnection attempts reached");
        }
    };

    return messagingSocket;
};

export const updateChatState = (isActive, inChatWith) => {
    if (messagingSocket && messagingSocket.readyState === WebSocket.OPEN) {
        messagingSocket.send(JSON.stringify({
            action: "UPDATE_CHAT_STATE",
            isActive,
            inChatWith,
        }));
    }
};

export const getMessagingSocket = () => messagingSocket;