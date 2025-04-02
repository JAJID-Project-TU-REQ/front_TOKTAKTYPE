import { NextResponse } from 'next/server';
import dgram from 'dgram';

export async function POST(request: Request) {
    try {
    const { message, targetIp, targetPort } = await request.json();

    if (!message) {
        return NextResponse.json({ error: 'Missing required fields: message' }, { status: 400 });
    }
    if (!targetIp) {
        return NextResponse.json({ error: 'Missing required fields: targetIp' }, { status: 400 });
    }
    if (!targetPort) {
        return NextResponse.json({ error: 'Missing required fields: targetPort' }, { status: 400 });
    }

    const clientSocket = dgram.createSocket('udp4');
    const bufferMessage = Buffer.from(message);

    clientSocket.send(bufferMessage, 0, bufferMessage.length, targetPort, targetIp, (err) => {
        clientSocket.close();
        if (err) {
            console.error('UDP send error:', err);
        } else {
            console.log(`UDP message sent to ${targetIp}:${targetPort}`);
        }
        });

    clientSocket.on('error', (err) => {
        console.error('UDP client socket error:', err);
        clientSocket.close();
    });

    clientSocket.on('message', (msg, rinfo) => {
        console.log(`clientSocket ได้รับข้อความตอบกลับจาก ${rinfo.address}:${rinfo.port}: "${msg.toString('utf8')}"`);
        clientSocket.close(); // ปิด clientSocket เมื่อได้รับคำตอบ
    });
        
    return NextResponse.json({ success: true, message: `UDP message sent to ${targetIp}:${targetPort}` });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Error', details: error.message }, { status: 500 });
    }
}
