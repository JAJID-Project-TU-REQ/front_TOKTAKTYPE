import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let playerId: string | null = null;

// ฟังก์ชันเชื่อมต่อกับ Socket.IO server
export const connectWebSocket = (roomId: string, playerName: string, isCreateRoom: boolean) => {
  // ถ้ามีการเชื่อมต่ออยู่แล้ว ไม่ต้องเชื่อมต่อใหม่
  if (socket && socket.connected) {
    console.log('Socket already connected');
    return socket;
  }

  // เชื่อมต่อกับ Socket.IO server
  socket = io('http://localhost:3001');

  // เมื่อเชื่อมต่อสำเร็จ
  socket.on('connect', () => {
    console.log('Connected to Socket.IO server');
    
    // รับ playerId จาก server
    socket.on('playerId', (id: string) => {
      playerId = id;
      console.log('Received playerId:', playerId);
      
      // หลังจากได้รับ playerId แล้ว ให้เข้าร่วมห้องหรือสร้างห้อง
      if (isCreateRoom) {
        socket.emit('createRoom');
      } else {
        // ตรวจสอบว่า roomId มีค่าและไม่เป็นค่าว่าง
        if (roomId && roomId.trim() !== '') {
          socket.emit('joinRoom', { roomId, playerName, playerId });
        } else {
          console.error('Room ID is missing or empty');
          // แจ้งเตือนผู้ใช้
          const event = new CustomEvent('socketError', { detail: 'Room ID is missing or empty' });
          window.dispatchEvent(event);
        }
      }
    });

    // รับรหัสห้องที่สร้างใหม่
    socket.on('roomCreated', (newRoomId: string) => {
      console.log('Room created:', newRoomId);
      
      // ส่ง event ให้ component อื่นๆ รับรู้
      const event = new CustomEvent('roomCreated', { detail: newRoomId });
      window.dispatchEvent(event);
      
      // เข้าร่วมห้องที่สร้างใหม่
      socket.emit('joinRoom', { roomId: newRoomId, playerName, playerId });
    });

    // รับรายชื่อผู้เล่นในห้อง
    socket.on('playerList', (players: any[]) => {
      console.log('Player list updated:', players);
      // ส่ง event ให้ component อื่นๆ รับรู้
      const event = new CustomEvent('playerListUpdated', { detail: players });
      window.dispatchEvent(event);
      
      // บันทึกข้อมูลผู้เล่นล่าสุดไว้ใน localStorage เพื่อให้สามารถเข้าถึงได้ทันทีหลังจาก refresh
      if (roomId) {
        localStorage.setItem(`playerList_${roomId}`, JSON.stringify(players));
      }
    });

    // รับข้อความแจ้งเตือนว่าห้องเต็ม
    socket.on('roomFull', (message: string) => {
      console.error('Room is full:', message);
      const event = new CustomEvent('socketError', { detail: message });
      window.dispatchEvent(event);
    });

    // รับข้อความแจ้งเตือนว่ามีข้อผิดพลาด
    socket.on('error', (message: string) => {
      console.error('Error:', message);
      // ส่ง event ให้ component อื่นๆ รับรู้
      const event = new CustomEvent('socketError', { detail: message });
      window.dispatchEvent(event);
    });

    // รับสัญญาณว่าเกมเริ่มแล้ว
    socket.on('gameStarted', (data) => {
      console.log('Game started with data:', data);
      
      // ถ้าอยู่ในหน้า lobby ให้นำทางไปยังหน้าเล่นเกม
      if (window.location.pathname.includes('/lobby')) {
        window.location.href = `/type?roomCode=${roomId}&playerName=${playerName}`;
      } else if (window.location.pathname.includes('/type')) {
        // ถ้าอยู่ในหน้าเล่นเกมอยู่แล้ว ให้ส่ง event เพื่อเริ่มเกม
        const event = new CustomEvent('gameStarted', { detail: data });
        window.dispatchEvent(event);
      }
    });

    // รับสัญญาณว่าเกมจบแล้ว
    socket.on('gameEnded', (results) => {
      console.log('Game ended with results:', results);
      // บันทึกผลลัพธ์ไว้ใน localStorage เพื่อให้หน้า leaderboard สามารถเข้าถึงได้
      localStorage.setItem(`gameResults_${roomId}`, JSON.stringify(results));
      // นำทางไปยังหน้า leaderboard
      window.location.href = `/leaderboard?roomCode=${roomId}&playerName=${playerName}`;
    });
  });

  // เมื่อการเชื่อมต่อถูกตัด
  socket.on('disconnect', () => {
    console.log('Disconnected from Socket.IO server');
  });

  return socket;
};

// ฟังก์ชันสำหรับดึง socket ที่เชื่อมต่ออยู่
export const getWebSocket = () => {
  return socket;
};

// ฟังก์ชันสำหรับดึง playerId
export const getPlayerId = () => {
  return playerId;
};

// ฟังก์ชันสำหรับออกจากห้อง
export const leaveRoom = (roomId: string) => {
  if (socket && playerId) {
    socket.emit('leaveRoom', { roomId, playerId });
  }
};

// ฟังก์ชันสำหรับเริ่มเกม
export const startGame = (roomId: string) => {
  if (socket) {
    socket.emit('startGame', roomId);
  }
};

// ฟังก์ชันสำหรับอัปเดต WPM
export const updateWpm = (roomId: string, wpm: number) => {
  if (socket && playerId) {
    socket.emit('updateWpm', { roomId, playerId, wpm });
  }
};

// ฟังก์ชันสำหรับส่งข้อมูลเมื่อเกมจบ
export const sendGameResults = (roomId: string, wpm: number, accuracy: number, mistakes: number, time: number) => {
  if (socket && playerId) {
    socket.emit('gameFinished', { roomId, playerId, wpm, accuracy, mistakes, time });
  }
};