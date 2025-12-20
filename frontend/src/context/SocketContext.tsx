import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './useAuthStore';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinClassDuel: (classId: string) => void;
  startClassDuel: (classId: string, setId: number) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinClassDuel: () => { },
  startClassDuel: () => { },
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (token && user) {
      // Connect to IO
      const newSocket = io('http://localhost:3000', {
        auth: { token },
        query: { userId: user.id }
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [token, user]);

  const joinClassDuel = (classId: string) => {
    if (!socket || !user) return;
    socket.emit('join_class_duel', { classId, userId: user.id || 0, username: user.username });
  };

  const startClassDuel = (classId: string) => {
    if (!socket || !user) return;
    socket.emit('create_class_duel', { classId, hostId: user.id || 0, hostName: user.username });
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinClassDuel, startClassDuel }}>
      {children}
    </SocketContext.Provider>
  );
};
