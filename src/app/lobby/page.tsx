"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";  // ใช้ useSearchParams เพื่อดึง query params
import { getWebSocket, connectWebSocket } from "../utils/WebSocket";
import { fetchPlayerNames } from "../utils/Api";
import Image from 'next/image'

interface Player {
    id:number;
    name:string;
}

const LobbyPage: React.FC = () => {

    return (
            <div className="
                min-h-screen bg-[url('/try.svg')] bg-cover">
                <div className="flex items-start justify-center pt-10">
                <Image
                src="/logo.png"
                width={200}
                height={200}
                alt="LOGO GAME"/>
                </div>
                
                <div className="flex items-center justify-center mt-3"></div>
                    <div className="w-32 items-center justify-center bg-white border-2 border-stone-500 rounded-2xl">
                        <p className="text-center">Room Code: ABC123</p>
                    </div>
                </div>

    );
};

export default LobbyPage;