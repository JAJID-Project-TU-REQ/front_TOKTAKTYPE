"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoom, joinRoom } from "./utils/Api";
import { connectWebSocket } from "./utils/WebSocket";
import Image from 'next/image'
import { motion } from "framer-motion";

export default function LoginPage() {
  const [name, setName] = useState<string>("");
  const [roomCode, setRoomCode] = useState<string>("");
  const router = useRouter();

  const character = [
    { id: 1, name: "Borhk" , image: "/Apple boy.svg"},
    { id: 2, name: "aL" , image: "/Blue boy.svg"},
    { id: 3, name: "Victoria" , image: "/flow.svg"},
    { id: 4, name: "Vocalno", image: "/red.svg"},
    { id: 5, name: "Solanum" , image: "/Tomato.svg"}
  ]
  const [selected,setSelected] = useState<number | null>(null);
  
  const handleJoinRoom = async () => {
    if (name && roomCode) {
      try {
        const response = await joinRoom(roomCode, name);
  
        if (response.success) { 
          connectWebSocket(roomCode, name, false);
          router.push(`/lobby?roomCode=${roomCode}&playerName=${name}&isCreateRoom=false`);
        } else {
          console.error("Failed to join room:", response.error || "Unknown error"); // ✅ ตอนนี้ TypeScript ไม่แจ้ง error แล้ว

        if (!ws || ws.readyState !== WebSocket.OPEN) {
          console.log("WebSocket disconnected, reconnecting...");
          const ws = null; // Define ws if not already defined
          const playerName = name; // Use name as playerName
          const isCreateRoom = false; // Set isCreateRoom to false for joining
          connectWebSocket(roomCode, playerName, isCreateRoom);
        }
      } catch (error) {
        console.error("Error joining room:", error);
      }
    }
  };
  

  const handleCreateRoom = async () => {
    if (name) {
      const response = await createRoom(name);
      setRoomCode(response.roomCode);  

      connectWebSocket(response.roomCode, name, true); 
      router.push(`/lobby?roomCode=${response.roomCode}&playerName=${name}&isCreateRoom=true`);
    } else {
      console.error("Name is required");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/try.svg')] bg-cover bg-center">
      <div className="p-6 w-full max-w-md text-center bg-white text-white rounded-xl">
        <div className="flex justify-center mb-4">
          <Image
            src="/logo.png"
            width={200}
            height={300}
            alt="Picture of the author"
          />
        </div>

        {/* Character pick */}
        <div className="flex flex-col items-center gap-4 w-full">
          <h1 className="text-xl font-bold text-black">Select Your Character</h1>
          <div className="grid grid-cols-3 gap-4 justify-center">
            {character.slice(0, 3).map((char) => (
              <motion.div
          key={char.id}
          className={`w-24 h-24 rounded-lg flex items-center justify-center cursor-pointer text-lg font-bold shadow-lg transition-all border-2 ${
            selected === char.id ? "scale-110 border-stone-500" : "border-transparent"
          }`}
          onClick={() => setSelected(char.id)}
          whileHover={{ scale: 1.1 }}
              >
          <Image
            src={char.image}
            alt={char.name}
            width={96}
            height={96}
            className="w-full h-full object-cover rounded-lg"
            priority={selected === char.id}
          />
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 justify-center">
            {character.slice(3).map((char) => (
              <motion.div
          key={char.id}
          className={`w-24 h-24 rounded-lg flex items-center justify-center cursor-pointer text-lg font-bold shadow-lg transition-all border-2 ${
            selected === char.id ? "scale-110 border-stone-500" : "border-transparent"
          }`}
          onClick={() => setSelected(char.id)}
          whileHover={{ scale: 1.1 }}
              >
          <Image
            src={char.image}
            alt={char.name}
            width={96}
            height={96}
            className="w-full h-full object-cover rounded-lg"
            priority={selected === char.id}
          />
              </motion.div>
            ))}
          </div>
        </div>


      {/* Name input box */}
        <h2 className="text-xl font-bold mb-2 mt-3 text-black">Join or Create a Room</h2>
        <input type="text" 
        placeholder="Enter your name" 
        value={name} onChange={(e) => setName(e.target.value)} 
        className="w-full p-3 rounded-xl text-black border
         border-stone-950 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
      
        {/* Room number */}
         <div className=" flex max-w-md gap-x-4 mt-2 mb-2 bg-black p-4 rounded-3xl">
          <input value={roomCode} onChange={(e) => setRoomCode(e.target.value)} type="text" 
          required className="min-w-0 flex-auto rounded-3xl
           bg-white px-3.5 py-2 text-base text-black outline-1 -outline-offset-1 outline-white/10
            placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6" 
            placeholder="Enter Room code" />

          <button onClick={handleJoinRoom} type="submit" 
          className="flex-none rounded-mx px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-stone-800 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
            Join room</button> 
        </div>

        <button onClick={handleCreateRoom} 
        className="w-10/12 p-2 bg-black
         hover:bg-stone-800 
         rounded-3xl">
          Create Room
        </button>

      </div>
      </div>

  );
}
