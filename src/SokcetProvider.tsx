// src/contexts/SocketContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectError: string | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connectError: null,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  useEffect(() => {
    const socketInstance = io('http://localhost:5000', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],  // Try both transports
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      setConnectError(null);
      console.log('Socket connected successfully');
    });

    socketInstance.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('Socket disconnected. Reason:', reason);
    });

    socketInstance.on('connect_error', (err) => {
      setIsConnected(false);
      setConnectError(err.message);
      console.error('Socket connection error:', err.message);
    });

    // Add event logging
    socketInstance.onAny((eventName, ...args) => {
      console.log('Socket event received:', eventName, args);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, connectError }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);