import { store } from "../store";
import { ENDPOINTS } from "./URL";
import { handleMessageReceived, handleMessageStatusUpdated } from "../handlers/LBDashboard/messagingHandlers";
import { getUnreadUserNotifications } from "../actions/notificationAction";

let messagingSocket = null;
let reconnectAttempts = 0;

export const initMessagingSocket = (token) => {
    if (
        messagingSocket &&
        (messagingSocket.readyState === WebSocket.OPEN ||
            messagingSocket.readyState === WebSocket.CONNECTING)
    ) {
        return messagingSocket;
    }

    const webSocketURL = ENDPOINTS.MESSAGING_SERVICE;

    messagingSocket = new WebSocket(webSocketURL, token);

    messagingSocket.onopen = () => {
        reconnectAttempts = 0;
    };

    messagingSocket.onerror = (error) => {
        // console.error("❌ Messaging WebSocket error:", error);
        return error;
    };

    messagingSocket.onmessage = (message) => {
        const data = JSON.parse(message.data);

        if (data.action === "RECEIVE_MESSAGE") {
            store.dispatch(handleMessageReceived(data.payload));
        } else if (data.action === "MESSAGE_STATUS_UPDATED") {
            store.dispatch(handleMessageStatusUpdated(data.payload));
        }

        if (data.action === "NEW_NOTIFICATION") {
            store.dispatch({
                type: "NEW_NOTIFICATION",
                payload: data.payload,
            });
            const state = store.getState();
            const userId = state?.auth?.user?.userid || state?.auth?.user?.userId || state?.auth?.user?._id;
            if (userId) {
                store.dispatch(getUnreadUserNotifications(userId));
            }
        }
    };

    messagingSocket.onclose = () => {
        messagingSocket = null;

        if (reconnectAttempts < 5) {
            setTimeout(() => {
                reconnectAttempts += 1;
                initMessagingSocket(token);
            }, 2000);
        } 
        // else {
        //     console.error("❌ Maximum reconnection attempts reached");
        // }
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

export const markMessagesAsReadViaSocket = (contactId) => {
    if (messagingSocket && messagingSocket.readyState === WebSocket.OPEN) {
        messagingSocket.send(JSON.stringify({
            action: "MARK_MESSAGES_AS_READ",
            contactId,
        }));
    }
};

export const getMessagingSocket = () => messagingSocket;
