export const API_URL = "http://localhost:8080/api/gameroom";

export async function createRoom(playerName: string): Promise<{ roomCode: string }> {
  const response = await fetch(`${API_URL}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerName }),
  });
  return response.json();
}

export async function joinRoom(roomCode: string, playerName: string): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(`${API_URL}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomCode, playerName }), // ✅ ส่งผ่าน body
  });

  return response.json();
}

export async function fetchPlayerNames(roomCode: string): Promise<{ players: string[] }> {
  const response = await fetch(`${API_URL}/players?roomCode=${roomCode}`);
  return response.json();
}