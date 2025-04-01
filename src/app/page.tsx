// "use client"; // บอกให้ไฟล์นี้ทำงานในฝั่ง client

// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import { createRoom, joinRoom } from "./utils/Api";
// import { connectWebSocket } from "./utils/WebSocket";

// export default function LoginPage() {
//   const [name, setName] = useState<string>("");
//   const [roomCode, setRoomCode] = useState<string>("");
//   const router = useRouter();

//   const handleJoinRoom = async () => {
//     if (name && roomCode) {
//       try {
//         const response = await joinRoom(roomCode, name);
  
//         if (response.success) { 
//           connectWebSocket(roomCode, name, false);
//           router.push(`/lobby?roomCode=${roomCode}&playerName=${name}&isCreateRoom=false`);
//         } else {
//           console.error("Failed to join room:", response.error || "Unknown error"); // ✅ ตอนนี้ TypeScript ไม่แจ้ง error แล้ว
//         }
//       } catch (error) {
//         console.error("Error joining room:", error);
//       }
//     }
//   };
  

//   const handleCreateRoom = async () => {
//     if (name) {
//       const response = await createRoom(name);
//       setRoomCode(response.roomCode);  

//       connectWebSocket(response.roomCode, name, true); 
//       router.push(`/lobby?roomCode=${response.roomCode}&playerName=${name}&isCreateRoom=true`);
//     } else {
//       console.error("Name is required");
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-900">
//       <div className="p-6 w-96 text-center bg-gray-800 text-white rounded-xl shadow-lg">
//         <h2 className="text-xl font-bold mb-4">Join or Create a Room</h2>
//         <input 
//         type="text" 
//         placeholder="enter your name" 
//         value={name} onChange={(e) => setName(e.target.value)} 
//         className="w-full p-2 mb-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
//         <input 
//         type="text" 
//         placeholder="Enter room number" 
//         value={roomCode} 
//         onChange={(e) => setRoomCode(e.target.value)}
//         className="w-full p-2 mb-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
//         <button 
//         onClick={handleJoinRoom} 
//         className="w-full p-2 mb-2 bg-blue-500 hover:bg-blue-600 rounded">
//           Join Room
//         </button>
//         <button 
//         onClick={handleCreateRoom} 
//         className="w-full p-2 bg-green-500 hover:bg-green-600 rounded">
//           Create Room
//         </button>
//       </div>
//     </div>
//   );
// }
