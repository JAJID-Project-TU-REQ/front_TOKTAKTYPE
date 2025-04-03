// ใน React Component ของคุณ
'use client';
import { useState } from 'react';

function UdpSender() {
  const [status, setStatus] = useState('');

  const sendMessage = async () => {
    setStatus('Sending...');
    try {
      const response = await fetch('/api/send-udp', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Hello World',
          targetIp: '172.25.201.61', 
          targetPort: 41232,    
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send');
      }

      setStatus(`Success: ${data.message}`);
    } catch (error) {
      console.error('Error sending UDP message:', error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <button onClick={sendMessage}>Send UDP Message</button>
      <p>Status: {status}</p>
    </div>
  );
}

export default UdpSender;