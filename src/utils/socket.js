// socket.js
let socket = null;
import {io} from 'socket.io-client';

let messagingSocket = null;

export const initSocket = (token) => {
  socket = new WebSocket("ws://localhost:4500/timer-service", token); // JWT in protocol header

  socket.onopen = () => {
    // console.log("✅ WebSocket connected");
  };

  socket.onclose = () => {
    // console.log("❌ WebSocket disconnected");
  };

  socket.onerror = () => {
    // console.error("WebSocket error:", err);
  };

  return socket;
};

export const initMessagingSocket = (token) => {
  if (!token) {
    console.error("❌ Messaging Socket.IO initialization failed: No token provided");
    return null;
  }

  console.log("🔑 Initializing Messaging Socket.IO with token:", token);

  messagingSocket = io("http://localhost:4500", {
    path: "/lb-messaging",
    query: { token },
  });

  messagingSocket.on("connect", () => {
    console.log("✅ Messaging Socket.IO connected");
  });

  messagingSocket.on("disconnect", (reason) => {
    console.log("❌ Messaging Socket.IO disconnected:", reason);
  });

  messagingSocket.on("RECEIVE_MESSAGE", (data) => {
    console.log("📩 Message received:", data);
  });

  messagingSocket.on("MESSAGE_READ", (data) => {
    console.log("📖 Messages read:", data);
  });

  return messagingSocket;
};


export const getMessagingSocket = () => messagingSocket;
export const getSocket = () => socket;