"use client";
import React, { useState } from "react";
import Image from 'next/image'

export default function LoginPage() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");

  const handleJoinRoom = () => {
    if (name && room) {
      console.log(`Joining room`);
    }
  };

  const handleCreateRoom = () => {
    if (name) {
      console.log(`Creating a new room`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="p-6 w-96 text-center bg-gray-800 text-white rounded-xl shadow-lg">
      <Image
        src="/logo.png"
        width={500}
        height={500}
        alt="Picture of the author"
      />
        <h2 className="text-xl font-bold mb-4">Join or Create a Room</h2>
        <input type="text" placeholder="enter your name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 mb-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        <input type="text" placeholder="Enter room number" value={room} onChange={(e) => setRoom(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        <button onClick={handleJoinRoom} className="w-full p-2 mb-2 bg-blue-500 hover:bg-blue-600 rounded">
          Join Room
        </button>
        <button onClick={handleCreateRoom} className="w-full p-2 bg-green-500 hover:bg-green-600 rounded">
          Create Room
        </button>
      </div>
    </div>
  );
}

