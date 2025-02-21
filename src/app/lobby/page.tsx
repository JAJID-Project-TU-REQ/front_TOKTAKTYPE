"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";  // ใช้ useSearchParams เพื่อดึง query params
import { getWebSocket, connectWebSocket } from "../utils/WebSocket";
import { fetchPlayerNames } from "../utils/Api";

interface Player {
  id: number;
  name: string;
}

const Lobby: React.FC = () => {
  const searchParams = useSearchParams();  // ใช้ useSearchParams
  const roomCode = searchParams.get("roomCode");
  const playerName = searchParams.get("playerName");
  const isCreateRoom = searchParams.get("isCreateRoom");

  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (roomCode && playerName && isCreateRoom !== null) {
      const ws = getWebSocket();

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
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">Game Lobby</h2>
      <p className="text-center text-gray-600 mb-2">Room Code: <span className="font-bold text-gray-800">{roomCode}</span></p>
      <p className="text-center text-gray-600 mb-4">Waiting for players to join...</p>
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
      <button className="mt-4 w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600">
        Start Game
      </button>
    </div>
  );
};

export default Lobby;
