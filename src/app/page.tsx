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
  const handleJoinRoom = async () => {
    if (name && roomCode) {
      try {
        const response = await joinRoom(roomCode, name);

      if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.log("WebSocket disconnected, reconnecting...");
        connectWebSocket(roomCode, playerName, isCreateRoom === "true");
      }

      loadPlayers(roomCode); // ⬅️ ใช้ฟังก์ชันที่ย้ายไป `api.tsx`
    }
  }, [roomCode, playerName, isCreateRoom]);

  const loadPlayers = async (roomCode: string) => {
    try {
      const data = await fetchPlayerNames(roomCode); // ⬅️ ใช้ API ที่ย้ายไป
      const playersWithId = data.players.map((name, index) => ({
        id: index + 1, // ใช้ index เป็น id หากไม่มี id จาก API
        name,
      }));
      setPlayers(playersWithId); // ตั้งค่าให้เป็น Player[]
    } catch (error) {
      console.error("Error fetching player names:", error);
    }
  };

  return (
    // Background jra
    <div className="min-h-screen bg-[url('/try.svg')] bg-cover">
      <div className="flex flex-col items-center justify-start pt-10">
        <div className="mb-4">
          <Image
            src="/logo.png"
            width={200}
            height={200}
            alt="LOGO TTT"
          />
        </div>

        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">Game Lobby</h2>
          {/* ROOM BOX */}
            <p className=" flex
            bg-white bg-opacity-80 border-2
             border-stone-500 rounded-2xl 
             text-center text-gray-600 
             justify-center
             mb-2 px-4 py-2 ">Room Code: <span className="font-bold text-gray-800">{roomCode}</span></p>
          
          {/* Waiting player */}
          <p className="text-center text-gray-600 mb-4">Waiting for players to join...</p>
          
          {/* Table player */}
          <div className="overflow-x-auto">
            <ul className="w-full border border-gray-200 rounded-lg p-3">
              {players.map((player) => (
                <li key={player.id} className="p-2 border-b text-black border-gray-300 last:border-b-0 flex justify-between">
                  <span>{player.name}</span>
                  <span className="text-gray-500">{player.id}/10</span>
                </li>
              ))}
            </ul>
          </div>
          <button className="mt-4 w-full bg-stone-800 text-white  p-2 rounded-lg hover:bg-stone-600">
            ! Start Game !
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
