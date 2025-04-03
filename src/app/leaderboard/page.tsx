"use client";
import React from 'react';

// Types for our data
interface Player {
  name: string;
  wpm: number;
  rank: number;
}

interface GameProps {
  currentPlayer: string;
  players?: Player[]; // Make players optional
  maxPlayers: number;
  gameCode: string;
}

const TokTakTypeLeaderboard: React.FC<GameProps> = ({
  currentPlayer,
  players = [], // Default to empty array
  maxPlayers,
  gameCode
}) => {
  // Mock data - you can replace this with actual data
  const mockPlayers: Player[] = [
    { name: "jaymin", wpm: 75, rank: 1 },
    { name: "dew", wpm: 68, rank: 2 },
    { name: "ice", wpm: 62, rank: 3 },
    { name: "jeang", wpm: 55, rank: 4 },
    { name: "aom", wpm: 50, rank: 5 },
  ];

  // Use mock data if players array is empty
  const displayPlayers = players && players.length > 0 ? players : mockPlayers;

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
          {currentPlayer} <span style={{ marginLeft: '5px' }}>🎮</span>
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
          code : {gameCode}
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
              backgroundColor: player.name === currentPlayer ? '#f9f9f9' : 'white'
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


    </div>
  );
};

export default TokTakTypeLeaderboard;

// Usage example:
// Import the Jersey M54 font in your global CSS or _app.tsx:
// @import url('https://fonts.googleapis.com/css2?family=Jersey+M54&display=swap');

// You would use the component like this:
// <TokTakTypeLeaderboard 
//   currentPlayer="jaymin"
//   maxPlayers={5}
//   gameCode="8548"
// />