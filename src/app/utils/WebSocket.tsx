let socket: WebSocket | null = null;

export const connectWebSocket = (roomCode: string, playerName: string, isCreateRoom: boolean) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log("WebSocket already connected.");
    return;
  }

  socket = new WebSocket(`ws://192.168.1.134:8080/ws/game-room`);

  socket.onopen = () => {
    console.log("Connected to WebSocket server.");
    console.log(`${roomCode}:${playerName}`);

    if (isCreateRoom) {
      socket?.send(`create:${roomCode}:${playerName}`);
    } else {
      socket?.send(`join:${roomCode}:${playerName}`);
    }
  };

  socket.onmessage = (event) => {
    console.log("Message from server:", event.data);
  };

  socket.onclose = () => {
    console.log("WebSocket disconnected.");
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
};

export const getWebSocket = () => socket;