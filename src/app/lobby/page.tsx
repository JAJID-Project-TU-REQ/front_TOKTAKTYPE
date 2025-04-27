"use client";
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useSocket } from '../utils/socketContext';
import {
  getRoomIdByPlayerId,
  requestPlayerList,
  Player,
  onPlayerListUpdate,
  leaveRoom,
  requestRoomInfo,
  startGame,
  onGameStarted,
  getGameStatus,
} from '../utils/socketClient';
import { useRouter } from 'next/navigation';

const Lobby: React.FC = () => {
  const router = useRouter();
  const { socket } = useSocket();
  const [roomCode, setRoomId] = useState<string | null>(null);
  const [playerList, setPlayerList] = useState<Player[]>([]);
  const [hostId, setHostId] = useState<string | null>(null);
  const hasEmitted = useRef(false); // flag to track emitting

  useEffect(() => {
    if (!socket) return;

    const playerListHandler = (players: Player[]) => {
      setPlayerList(players);
      console.log("👤 Player List Updated:", players);
    };

    onPlayerListUpdate(socket, playerListHandler);

    onGameStarted(socket, (status: string) => {
      console.log("🚀 Game Status:", status);
      if (status) router.push(`/type`);
    });




    const playerId = localStorage.getItem("playerId");
    if (!(playerId && !hasEmitted.current)) return
    getRoomIdByPlayerId(socket, playerId, (roomId) => {
      if (roomId) {
        setRoomId(roomId);
        console.log("📦 Room ID:", roomId);

        getGameStatus(socket, roomId, (status) => {
          if (!status) return;
          console.log("🚀 Game Status:", status);

          if (status == "playing") router.push('/type');
        });

        requestPlayerList(socket, roomId, (players: Player[]) => {
          setPlayerList(players);
          console.log("👤 Player List:", players);
        });

        requestRoomInfo(socket, roomId, (roomInfo) => {
          setHostId(roomInfo.hostId);
          console.log("📦 Room Info:", roomInfo);
        }, (error) => {
          console.error("Error fetching room info:", error);
        });

      } else {
        router.push(`/`);
        console.log("👤 Player not in a room");
      }
    });
    hasEmitted.current = true


    return () => {
      socket.off("playerList", playerListHandler);
      socket.off('gameStarted');
      socket.off("roomInfo");
      socket.off("error");
    };
  }, [socket]);


  function startGameButton() {
    if (!(socket && roomCode)) return;
    startGame(socket, roomCode)
    console.log("🚀 Game started");
  }

  function leaveRoomButton() {
    const playerId = localStorage.getItem("playerId");
    if (!(socket && roomCode && playerId)) return;
    leaveRoom(socket, roomCode, playerId);
    getRoomIdByPlayerId(socket, playerId, (roomId) => {
      if (roomId) return;
      router.push(`/`);
      console.log("👤 Player left the room");
    });
  }


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
            mb-2 px-4 py-2 ">Room Code: <span className="font-bold text-gray-800">{roomCode || "Loading..."}</span></p>

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
          {localStorage.getItem("playerId") === hostId && (
            <button
              onClick={startGameButton}
              className="mt-4 w-full bg-stone-800 text-white p-2 rounded-lg hover:bg-stone-600"
            >
              ! Start Game !
            </button>
          )}
          <button
            onClick={leaveRoomButton}
            className="mt-4 w-full bg-red-800 text-white p-2 rounded-lg hover:bg-red-600"
          >
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
