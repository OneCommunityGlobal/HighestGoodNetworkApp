let messagingSocket = null;

export const initMessagingSocket = (token) => {
    const messagingSocket = new WebSocket("ws://localhost:4500/messaging-service", token);

  messagingSocket.onopen = () => {
    console.log("📡 Messaging WebSocket connected");
  };

  messagingSocket.onerror = (error) => {
    console.error("❌ Messaging WebSocket error:", error);
  };

  messagingSocket.onmessage = (message) => {
    const data = JSON.parse(message.data);
    console.log("📥 New message:", data);
    // Handle incoming message in your app
  };

  messagingSocket.onclose = () => {
    console.log("📴 Messaging WebSocket disconnected");
  };

  return messagingSocket;
};

export const getMessagingSocket = () => messagingSocket;