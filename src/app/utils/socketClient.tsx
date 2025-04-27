import { Socket } from "socket.io-client";



// TypeScript Interfaces
export interface Player {
  id: string;
  socketId: string;
  name: string;
  wpm: number;
}

export interface RoomInfo {
  roomId: string;
  hostId: string;
  status: string;
  players: Player[];
}

export interface newHostId {
  newHostId: string;
}

// ฟังก์ชันสำหรับสร้างห้องใหม่
export const createRoom = (socket: Socket, playerId: string, callback: (roomId: string) => void) => {
  socket.emit("createRoom", playerId);
  socket.on("roomCreated", (createdRoomId: string) => {
    callback(createdRoomId);
  });
};

// ฟังก์ชันสำหรับเข้าร่วมห้อง
export const joinRoom = (
  socket: Socket,
  roomId: string,
  playerName: string,
  playerId: string,
  onError: (error: string) => void,
  // onPlayerListUpdate: (players: Player[]) => void
) => {
  socket.emit("joinRoom", { roomId, playerName, playerId });

  socket.on("error", (error: string) => {
    onError(error);
  });

  // socket.on("playerList", (players: Player[]) => {
  //   onPlayerListUpdate(players);
  // });
};

// ฟังก์ชันสำหรับออกจากห้อง
export const leaveRoom = (socket: Socket, roomId: string, playerId: string) => {
  socket.emit("leaveRoom", { roomId, playerId });
};

// ฟังก์ชันสำหรับร้องขอรายชื่อผู้เล่นในห้อง
export const requestPlayerList = (
  socket: Socket,
  roomId: string,
  callback: (players: Player[]) => void
) => {
  socket.emit("requestPlayerList", roomId , callback);
  // socket.on("playerList", (players: Player[]) => {
  //   callback(players);
  // });
};
export const onPlayerListUpdate = (
  socket: Socket,
  callback: (players: Player[]) => void
) => {
  socket.on("playerList", (players: Player[]) => {
    callback(players);
  });
}
// ฟังก์ชันสำหรับร้องขอข้อมูลห้อง
export const requestRoomInfo = (
  socket: Socket,
  roomId: string,
  callback: (roomInfo: RoomInfo) => void,
  onError: (error: string) => void
) => {
  socket.emit("requestRoomInfo", roomId);
  socket.on("roomInfo", (roomInfo: RoomInfo) => {
    callback(roomInfo);
  });
  socket.on("error", (error: string) => {
    onError(error);
  });
};

// ฟังก์ชันสำหรับค้นหา roomId โดยใช้ playerId
export const getRoomIdByPlayerId = (
  socket: Socket,
  playerId: string,
  callback: (roomId: string | null) => void
) => {
  socket.emit("getRoomIdByPlayerId", playerId, (roomId: string | null) => {
    callback(roomId);
  });
};

export const getStartTimestamp = (
  socket: Socket,
  roomId: string,
  callback: (timestamp: number) => void
) => {
  socket.emit("getStartTimestamp", roomId, (timestamp: number) => {
    callback(timestamp);
  });
}

export const getGameStatus = (
  socket: Socket,
  roomId: string,
  callback: (status: string) => void
) => {
  socket.emit("getGameStatus", roomId, (status: string) => {
    callback(status);
  });
}

// ฟังก์ชันสำหรับอัปเดต WPM ของผู้เล่น
export const updatePlayerWpm = (socket: Socket, roomId: string, playerId: string, wpm: number) => {
  socket.emit("updateWpm", { roomId, playerId, wpm });
};

export const getPlayersWpm = (
  socket: Socket,
  roomId: string,
  callback: (playersWpm: { name: string; wpm: number }[] | null) => void
) => {
  socket.emit("getPlayersWpm", roomId, (playersWpm: { name: string; wpm: number }[] | null) => {
    callback(playersWpm);
  });
};

// ฟังก์ชันสำหรับเริ่มเกม
export const startGame = (socket: Socket, roomId: string) => {
  socket.emit("startGame", roomId);
};

// ฟังก์ชันสำหรับรับ event เมื่อเกมเริ่ม
export const onGameStarted = (socket: Socket, callback: (status: string) => void) => {
  socket.on("gameStarted", (status: string) => {
    callback(status);
  });
};

// ฟังก์ชันสำหรับรับ event เมื่อ host เปลี่ยน
export const onHostChanged = (socket: Socket, callback: (newHostId: string) => void) => {
  socket.on("hostChanged", (newHostId: string) => {
    callback(newHostId);
  });
};

// ฟังก์ชันสำหรับรับ playerId เมื่อเชื่อมต่อ
export const onPlayerIdReceived = (socket: Socket, callback: (playerId: string) => void) => {
  socket.on("playerId", (playerId: string) => {
    callback(playerId);
  });
};

export const errorHandler = (socket: Socket, callback: (error: string) => void) => {
  socket.on("error", (error: string) => {
    callback(error);
  });
}