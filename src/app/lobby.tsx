"use client";
import React, { useState } from "react";

interface Player {
  id: number;
  name: string;
}

const samplePlayers: Player[] = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" },
  { id: 4, name: "David" },
  { id: 5, name: "Eve" },
];

const Lobby: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(samplePlayers);

  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">Game Lobby</h2>
      <p className="text-center text-gray-600 mb-4">Waiting for players to join...</p>
      <div className="overflow-x-auto">
        <ul className="w-full border border-gray-200 rounded-lg p-3">
          {players.map((player) => (
            <li key={player.id} className="p-2 border-b text-black border-gray-300 last:border-b-0 flex justify-between">
              <span>{player.name}</span>
              <span className="text-gray-500">{player.id}/5</span>
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