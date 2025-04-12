"use client";
import React, { useState, useEffect} from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image'
import { motion } from "framer-motion";
import { useSocket } from "./utils/socketContext";
import { 
        onPlayerIdReceived,
        createRoom,
        joinRoom
      } from "./utils/socketClient";

export default function LoginPage() {
  const { socket } = useSocket();
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [roomCode, setRoomCode] = useState<string>("");

  
  // const router = useRouter();

  useEffect(() => {
    if (socket) {
      const existingPlayerId = localStorage.getItem("playerId");
      if (!existingPlayerId) {
        onPlayerIdReceived(socket, (playerId: string) => {
          localStorage.setItem("playerId", playerId);
          console.log("👤 Player ID received:", playerId);
        });
      } else {
        console.log("👤 Existing Player ID:", existingPlayerId);
      }
    }
    
  }, [socket]);

  const handleCreateRoom = () => {
    if (socket) {
      createRoom(socket, (roomId: string) => {
        console.log("📦 Room created with ID:", roomId);
        setRoomCode(roomId); // แสดงรหัสห้องที่สร้าง
  
        joinRoom(
          socket,
          roomId,
          name,
          localStorage.getItem("playerId") || "",
          (error: string) => {
            console.error("❌ Error joining room:", error);
          },
          (players) => {
            console.log("👥 Players in room:", players);
          }
        )  
      });
    }
  };

  const handleJoinRoom = () => {
    const playerId = localStorage.getItem("playerId");
    if (!playerId) {
      console.error("Player ID not found");
      return;
    }

    if (socket) {
      joinRoom(
        socket,
        roomCode,
        name,
        playerId,
        (error: string) => {
          console.error("❌ Error joining room:", error);
        },
        (players) => {
          console.log("👥 Players in room:", players);
        }
      );
    }

  };

  const character = [
    { id: 1, name: "Borhk" , image: "/Apple boy.svg"},
    { id: 2, name: "aL" , image: "/Blue boy.svg"},
    { id: 3, name: "Victoria" , image: "/flow.svg"},
    { id: 4, name: "Vocalno", image: "/red.svg"},
    { id: 5, name: "Solanum" , image: "/Tomato.svg"}
  ]
  const [selected,setSelected] = useState<number | null>(null);

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
        {roomCode}
        {/* Character pick */}
        <div className="flex flex-col items-center gap-4 w-full">
          <h1 className="text-xl font-bold text-black">{roomCode}</h1>
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

          <button type="submit" 
          onClick={handleJoinRoom}
          className="flex-none rounded-mx px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-stone-800 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
            Join room</button> 
        </div>

        <button
        onClick={handleCreateRoom}
        className="w-10/12 p-2 bg-black
         hover:bg-stone-800 
         rounded-3xl">
          Create Room
        </button>

      </div>
      </div>

  );
}
