"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getWebSocket, connectWebSocket } from "../utils/WebSocket";

interface Player {
  id: number;
  name: string;
}

const Lobby: React.FC = () => {
  const searchParams = useSearchParams();
  const roomCode = searchParams.get("roomCode");
  const playerName = searchParams.get("playerName");
  const isCreateRoom = searchParams.get("isCreateRoom");

  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (!roomCode || !playerName || isCreateRoom === null) return;

    let ws = getWebSocket();

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.log("WebSocket disconnected, reconnecting...");
      connectWebSocket(roomCode, playerName, isCreateRoom === "true");

      setTimeout(() => {
        ws = getWebSocket();
        if (ws) {
          ws.addEventListener("message", handlePlayerUpdate);
          sendJoinRequest(ws, roomCode, playerName, isCreateRoom);
        }
      }, 500);
    } else {
      ws.addEventListener("message", handlePlayerUpdate);
      sendJoinRequest(ws, roomCode, playerName, isCreateRoom);
    }

    return () => {
      ws?.removeEventListener("message", handlePlayerUpdate);
    };
  }, [roomCode, playerName, isCreateRoom]);

  const sendJoinRequest = (ws: WebSocket, roomCode: string, playerName: string, isCreateRoom: string | null) => {
    if (ws.readyState === WebSocket.OPEN) {
      const action = isCreateRoom === "true" ? "create" : "join";
      ws.send(`${action}:${roomCode}:${playerName}`);
    }
  };

  const handlePlayerUpdate = (event: MessageEvent) => {
    const data = event.data;
    if (data.startsWith("players:")) {
      const playerList: string[] = data.replace("players:", "").split(",");
      const formattedPlayers: Player[] = playerList.map((name, index) => ({
        id: index + 1,
        name,
      }));
      setPlayers(formattedPlayers);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">Game Lobby</h2>
      <p className="text-center text-gray-600 mb-2">
        Room Code: <span className="font-bold text-gray-800">{roomCode}</span>
      </p>
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
