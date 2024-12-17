import Websocket from 'ws';
import { NextApiRequest, NextApiResponse } from 'next';
import type { Server as HTTPServer } from 'http';
import type { Socket } from 'net';

interface CustomNextApiResponse extends NextApiResponse {
  socket: Socket & {
    server: HTTPServer & {
      ws: Websocket.Server;
    };
  };
}

export default function handler(req: NextApiRequest, res: CustomNextApiResponse) {
  if (!res.socket.server.ws) {
    console.log('Setting up WebSocket server');
    
    // Create a new WebSocket server
    const wss = new Websocket.Server({ noServer: true });
    
    wss.on('connection', (ws) => {
      console.log('New WebSocket connection');
      
      ws.on('message', (message) => {
        console.log('Received message:', message.toString());
        // Echo the message back to the client
        ws.send(`Echo: ${message}`);
      });
    });
    
    // Attach the WebSocket server to the HTTP server
    res.socket.server.ws = wss;
  }
  
  res.socket.end();
}

