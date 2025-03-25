// socket.js
let socket = null;

export const initSocket = (token) => {
  socket = new WebSocket("ws://localhost:4500/timer-service", token); // JWT in protocol header

  socket.onopen = () => {
    // console.log("✅ WebSocket connected");
  };

  socket.onclose = () => {
    // console.log("❌ WebSocket disconnected");
  };

  socket.onerror = (err) => {
    console.error("WebSocket error:", err);
  };

  return socket;
};

export const getSocket = () => socket;