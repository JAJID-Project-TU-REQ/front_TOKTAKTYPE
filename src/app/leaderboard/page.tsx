"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getWebSocket, connectWebSocket } from '../utils/WebSocket';

// Types for our data
interface Player {
  name: string;
  wpm: number;
  rank: number;
}

// ไม่จำเป็นต้องใช้ GameProps เนื่องจากเราใช้ URL parameters แทน

const TokTakTypeLeaderboard: React.FC = () => {
  const searchParams = useSearchParams();
  const roomCode = searchParams.get("roomCode");
  const playerName = searchParams.get("playerName");
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [maxPlayers, setMaxPlayers] = useState<number>(10);
  
  useEffect(() => {
    if (roomCode && playerName) {
      // ตรวจสอบการเชื่อมต่อ WebSocket
      const ws = getWebSocket();
      if (!ws || !ws.connected) {
        console.log("Socket.IO disconnected, reconnecting...");
        connectWebSocket(roomCode, playerName, false);
      }
      
      // ดึงข้อมูลผลการแข่งขันจาก localStorage
      const savedResults = localStorage.getItem(`gameResults_${roomCode}`);
      if (savedResults) {
        try {
          const resultsData = JSON.parse(savedResults);
          console.log("Loading game results from localStorage:", resultsData);
          
          // แปลงข้อมูลให้อยู่ในรูปแบบที่ต้องการแสดงผล
          const sortedPlayers = resultsData
            .map((player: any, index: number) => ({
              name: player.name,
              wpm: player.wpm || 0,
              rank: index + 1
            }))
            .sort((a: Player, b: Player) => b.wpm - a.wpm)
            .map((player: Player, index: number) => ({
              ...player,
              rank: index + 1
            }));
          
          setPlayers(sortedPlayers);
          setMaxPlayers(sortedPlayers.length);
        } catch (error) {
          console.error("Error parsing saved game results:", error);
        }
      }
    }
  }, [roomCode, playerName]);
  
  // ถ้าไม่มีข้อมูลผู้เล่น ให้ใช้ข้อมูลจำลอง
  const mockPlayers: Player[] = [
    { name: "jaymin", wpm: 75, rank: 1 },
    { name: "dew", wpm: 68, rank: 2 },
    { name: "ice", wpm: 62, rank: 3 },
    { name: "jeang", wpm: 55, rank: 4 },
    { name: "aom", wpm: 50, rank: 5 },
  ];

  // ใช้ข้อมูลจริงถ้ามี หรือใช้ข้อมูลจำลองถ้าไม่มี
  const displayPlayers = players.length > 0 ? players : mockPlayers;

  return (
    <div className="leaderboard-container" style={{
      fontFamily: "'Jersey M54', sans-serif",
      maxWidth: '500px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Navigation Bar */}
      <div className="nav-bar" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        {/* Back Button */}
        <div 
          className="back-button" 
          style={{
            cursor: 'pointer',
            fontSize: '20px',
          }}
          onClick={() => window.location.href = '/firstpage'}
        >
          &lt;&lt;
        </div>

        {/* Logo (center) - Empty div with comment as requested */}
        <div className="logo-container" style={{
          width: '100px',
          height: '40px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* Will use next/image here later for the TTT logo */}
        </div>
        
        {/* Current Player Display */}
        <div className="current-player" style={{
          fontWeight: 'bold',
          fontSize: '18px'
        }}>
          {playerName} <span style={{ marginLeft: '5px' }}>🎮</span>
        </div>
      </div>

      {/* Game Title and Code */}
      <div className="game-header" style={{
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <h1 style={{
          fontSize: '28px',
          marginBottom: '5px',
          letterSpacing: '2px'
        }}>TOK-TAK-TYPE</h1>
        <div style={{
          fontSize: '14px',
          backgroundColor: '#f0f0f0',
          display: 'inline-block',
          padding: '5px 15px',
          borderRadius: '20px'
        }}>
          code : {roomCode}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="leaderboard-table" style={{
        border: '1px solid #ddd',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        {displayPlayers.map((player, index) => (
          <div 
            key={index}
            className="player-row" 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 20px',
              borderBottom: index < displayPlayers.length - 1 ? '1px solid #eee' : 'none',
              backgroundColor: player.name === playerName ? '#f9f9f9' : 'white'
            }}
          >
            <div className="player-name">{player.name}</div>
            <div className="player-stats" style={{
              display: 'flex',
              gap: '15px'
            }}>
              <div className="player-wpm">{player.wpm} WPM</div>
              <div className="player-rank">{player.rank}/{maxPlayers}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Play Again Button */}
      <div className="play-again" style={{
        textAlign: 'center',
        marginTop: '20px'
      }}>
        <button 
          style={{
            backgroundColor: '#4a4a4a',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '10px 25px',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
          onClick={() => window.location.href = `/lobby?roomCode=${roomCode}&playerName=${playerName}&isCreateRoom=false`}
        >
          Play Again
        </button>
      </div>

    </div>
  );
};

export default TokTakTypeLeaderboard;

// Usage example:
// Import the Jersey M54 font in your global CSS or _app.tsx:
// @import url('https://fonts.googleapis.com/css2?family=Jersey+M54&display=swap');

// You would use the component like this:
// <TokTakTypeLeaderboard />
// The component will automatically get roomCode and playerName from URL parameters