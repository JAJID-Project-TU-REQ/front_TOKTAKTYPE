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

// ฟังก์ชันสำหรับสร้างห้องใหม่
export const createRoom = (
  socket: Socket, 
  playerId:string, 
  callback: (roomId: string) => void) => {
  socket.emit("createRoom", playerId);
  socket.on("roomCreated", (roomId: string) => {
    callback(roomId);
  });
};

// ฟังก์ชันสำหรับเข้าร่วมห้อง
export const joinRoom = (
  socket: Socket,
  roomId: string,
  playerName: string,
  playerId: string,
  onError: (error: string) => void,
  onPlayerListUpdate: (players: Player[]) => void
) => {
  socket.emit("joinRoom", { roomId, playerName, playerId });

  socket.on("error", (error: string) => {
    onError(error);
  });

  socket.on("playerList", (players: Player[]) => {
    onPlayerListUpdate(players);
  });
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
  socket.emit("requestPlayerList", roomId);
  socket.on("playerList", (players: Player[]) => {
    callback(players);
  });
};

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

// ฟังก์ชันสำหรับอัปเดต WPM ของผู้เล่น
export const updateWpm = (socket: Socket, roomId: string, playerId: string, wpm: number) => {
  socket.emit("updateWpm", { roomId, playerId, wpm });
};

// ฟังก์ชันสำหรับเริ่มเกม
export const startGame = (socket: Socket, roomId: string) => {
  socket.emit("startGame", roomId);

  // ฟัง event "gameStarted" เพื่อรับสถานะเกมที่อัปเดต
  socket.on("gameStarted", ({ status }: { status: string }) => {
    onGameStarted(status); // เรียก callback เมื่อเกมเริ่ม
  });

  // ฟัง event "error" เพื่อจัดการข้อผิดพลาด
  socket.on("error", (error: string) => {
    onError(error); // เรียก callback เมื่อเกิดข้อผิดพลาด
  });
};

// ฟังก์ชันสำหรับรับ event เมื่อเกมเริ่ม
export const onGameStarted = (socket: Socket, callback: () => void) => {
  socket.on("gameStarted", () => {
    callback();
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