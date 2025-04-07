"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";  // ใช้ useSearchParams เพื่อดึง query params
import { getWebSocket, connectWebSocket } from "../utils/WebSocket";
import Image from 'next/image';

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

      if (!ws || !ws.connected) {
        console.log("Socket.IO disconnected, reconnecting...");
        connectWebSocket(roomCode, playerName, isCreateRoom === "true");
      }

      // เพิ่ม event listener สำหรับรับข้อมูลผู้เล่นจาก Socket.IO
      const handlePlayerListUpdate = (event: CustomEvent) => {
        const playersData = event.detail;
        console.log("Received player list update:", playersData);
        const playersWithId = playersData.map((player: any, index: number) => ({
          id: index + 1,
          name: player.name,
        }));
        setPlayers(playersWithId);
      };
      
      // เพิ่ม event listener สำหรับข้อผิดพลาดจาก Socket.IO
      const handleSocketError = (event: CustomEvent) => {
        const errorMessage = event.detail;
        console.error("Socket error:", errorMessage);
        alert(errorMessage);
        // ถ้าเกิดข้อผิดพลาด ให้กลับไปยังหน้าหลัก
        window.location.href = '/';
      };

      window.addEventListener('playerListUpdated', handlePlayerListUpdate as EventListener);
      window.addEventListener('socketError', handleSocketError as EventListener);

      // ตรวจสอบข้อมูลผู้เล่นที่บันทึกไว้ใน localStorage
      const savedPlayerList = localStorage.getItem(`playerList_${roomCode}`);
      if (savedPlayerList) {
        try {
          const playersData = JSON.parse(savedPlayerList);
          console.log("Loading saved player list from localStorage:", playersData);
          const playersWithId = playersData.map((player: any, index: number) => ({
            id: index + 1,
            name: player.name,
          }));
          setPlayers(playersWithId);
        } catch (error) {
          console.error("Error parsing saved player list:", error);
        }
      }

      // ร้องขอข้อมูลผู้เล่นปัจจุบันจาก server เมื่อเข้าสู่หน้า lobby
      if (ws && ws.connected) {
        console.log("Requesting current player list for room:", roomCode);
        ws.emit('requestPlayerList', roomCode);
      }

      return () => {
        window.removeEventListener('playerListUpdated', handlePlayerListUpdate as EventListener);
        window.removeEventListener('socketError', handleSocketError as EventListener);
      };
    }
  }, [roomCode, playerName, isCreateRoom]);

  // เพิ่ม useEffect เพื่อร้องขอข้อมูลผู้เล่นทุก 2 วินาที เพื่อให้แน่ใจว่าข้อมูลเป็นปัจจุบัน
  useEffect(() => {
    if (roomCode) {
      const intervalId = setInterval(() => {
        const ws = getWebSocket();
        if (ws && ws.connected) {
          ws.emit('requestPlayerList', roomCode);
        }
      }, 2000); // ร้องขอทุก 2 วินาที

      return () => clearInterval(intervalId);
    }
  }, [roomCode]);

  // ไม่จำเป็นต้องใช้ loadPlayers อีกต่อไป เพราะเราใช้ข้อมูลจาก WebSocket โดยตรง
  // ฟังก์ชันนี้ถูกแทนที่ด้วย event listener 'playerListUpdated' ที่รับข้อมูลจาก WebSocket

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
          <button 
            className="mt-4 w-full bg-stone-800 text-white p-2 rounded-lg hover:bg-stone-600"
            onClick={() => {
              if (roomCode) {
                // เรียกใช้ฟังก์ชัน startGame จาก WebSocket.ts
                const { startGame } = require('../utils/WebSocket');
                startGame(roomCode);
              }
            }}
          >
            ! Start Game !
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
