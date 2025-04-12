"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSocket } from '../utils/socketContext';
import { getRoomIdByPlayerId, requestPlayerList, Player } from '../utils/socketClient';


const Lobby: React.FC = () => {
  const { socket } = useSocket();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerList, setPlayerList] = useState<Player[]>([]);

  useEffect(() => {
    console.log('now in lobby page')
    console.log('socket', socket)
    console.log('roomId', roomId)
    console.log('playerList', playerList)
    if (socket) {
      const playerId = localStorage.getItem("playerId");
      if (playerId) {
        // ดึง roomId จาก playerId
        getRoomIdByPlayerId(socket, playerId, (roomId) => {
          if (roomId) {
            setRoomId(roomId);
            console.log("📦 Room ID:", roomId);

            // ดึงรายชื่อผู้เล่นในห้อง
            requestPlayerList(socket, roomId, (players) => {
              setPlayerList(players); // players จะเป็น array ของ Player
              console.log("👥 Players in room:", players);
            });
          }
        });
      }
    }
  }, [socket]);

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
            mb-2 px-4 py-2 ">Room Code: <span className="font-bold text-gray-800">{roomId || "Loading..."}</span></p>
          
          {/* Waiting player */}
          <p className="text-center text-gray-600 mb-4">Waiting for players to join...</p>
          
          {/* Table player */}
          <div className="overflow-x-auto">
            <ul className="w-full border border-gray-200 rounded-lg p-3">
            {playerList.length > 0 ? (
                playerList.map((player) => (
                  <li
                    key={player.id}
                    className="flex justify-between items-center border-b border-gray-300 py-2"
                  >
                    <span className="text-gray-800">{player.name}</span>
                  </li>
                ))
              ) : (
                <li className="text-center text-gray-600">No players yet...</li>
              )}
            </ul>
          </div>
          <button 
            className="mt-4 w-full bg-stone-800 text-white p-2 rounded-lg hover:bg-stone-600"
          >
            ! Start Game !
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
