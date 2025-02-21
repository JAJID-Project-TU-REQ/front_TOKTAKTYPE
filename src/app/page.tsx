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
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="p-6 w-96 text-center bg-white text-white rounded-xl">
      <Image
        src="/logo.png"
        width={350}
        height={300}
        alt="Picture of the author"
      />
        <h2 className="text-xl font-bold mb-4">Join or Create a Room</h2>
        <input type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 mb-3 rounded-xl text-black border border-stone-950 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
      
        {/* Room number */}
         <div className="mt-6 flex max-w-md gap-x-4 mb-4 bg-black p-4 rounded-3xl">
          <label htmlFor="email-address" className="sr-only">Code room</label>
          <input id="code-room" name="coderoom" type="code" required className="min-w-0 flex-auto rounded-3xl bg-white px-3.5 py-2 text-base text-black outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6" placeholder="Enter Room code" />
          <button type="submit" className="flex-none rounded-mx px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-stone-800 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">Join room</button>
        </div>

        <button onClick={handleCreateRoom} className="w-10/12 p-2 bg-black hover:bg-stone-800 rounded-3xl">
          Create Room
        </button>
      </div>
    </div>
  );
}

