import { getWebSocket, getPlayerId } from './WebSocket';

// ฟังก์ชันสำหรับดึงรายชื่อผู้เล่นในห้อง
export const fetchPlayerNames = async (roomId: string) => {
  // ในเวอร์ชันที่ใช้ Socket.IO เราจะไม่ใช้ API นี้โดยตรง
  // แต่จะใช้ event จาก Socket.IO แทน
  // แต่เราจะเก็บฟังก์ชันนี้ไว้เพื่อความเข้ากันได้กับโค้ดเดิม
  return {
    players: [] // ส่งค่าว่างกลับไป เพราะข้อมูลจริงจะมาจาก Socket.IO event
  };
};

// ฟังก์ชันสำหรับสร้างห้องใหม่
export const createRoom = async (playerName: string) => {
  // ในเวอร์ชันที่ใช้ Socket.IO เราจะไม่ใช้ API นี้โดยตรง
  // แต่จะใช้ event จาก Socket.IO แทน
  // แต่เราจะเก็บฟังก์ชันนี้ไว้เพื่อความเข้ากันได้กับโค้ดเดิม
  
  // สร้าง Promise เพื่อรอรับรหัสห้องจาก Socket.IO
  return new Promise((resolve) => {
    const socket = getWebSocket();
    
    if (socket) {
      // ส่ง event createRoom ไปยัง server
      socket.emit('createRoom');
      
      // ใช้ event listener ที่เพิ่มเข้าไปใน window
      const handleRoomCreated = (event: CustomEvent) => {
        const newRoomId = event.detail;
        window.removeEventListener('roomCreated', handleRoomCreated as EventListener);
        resolve({ roomCode: newRoomId });
      };
      
      window.addEventListener('roomCreated', handleRoomCreated as EventListener);
      
      // ตั้ง timeout เพื่อป้องกันการรอนานเกินไป
      setTimeout(() => {
        window.removeEventListener('roomCreated', handleRoomCreated as EventListener);
        resolve({ roomCode: 'TEMP' }); // ใช้ค่าชั่วคราวถ้ารอนานเกินไป
      }, 5000);
    } else {
      // ถ้าไม่มีการเชื่อมต่อ Socket.IO ให้ใช้ค่าชั่วคราว
      resolve({ roomCode: 'TEMP' });
    }
  });
};


// ฟังก์ชันสำหรับเข้าร่วมห้อง
export const joinRoom = async (roomId: string, playerName: string) => {
  // ในเวอร์ชันที่ใช้ Socket.IO เราจะไม่ใช้ API นี้โดยตรง
  // แต่จะใช้ event จาก Socket.IO แทน
  // แต่เราจะเก็บฟังก์ชันนี้ไว้เพื่อความเข้ากันได้กับโค้ดเดิม
  return {
    success: true
  };
};