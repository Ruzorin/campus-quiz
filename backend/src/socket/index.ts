import { db } from '../db';
import { terms } from '../db/schema';
import { eq } from 'drizzle-orm';
import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

interface GameRoom {
  id: string; // class_id
  hostId: number;
  setId?: number; // Added setId
  players: {
    id: number;
    username: string;
    score: number;
    progress: number; // 0-100%
  }[];
  status: 'waiting' | 'playing' | 'finished';
  currentQuestionIndex: number;
}

const rooms: Record<string, GameRoom> = {};

export const initializeSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173", // Frontend URL
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    // Host starts a class duel
    socket.on('create_class_duel', ({ classId, hostId, hostName, setId }) => {
      rooms[classId] = {
        id: classId,
        hostId,
        setId,
        players: [],
        status: 'waiting',
        currentQuestionIndex: 0
      };

      socket.join(classId);
      console.log(`Class Duel created for Class ${classId} by ${hostName} with Set ${setId}`);

      // Broadcast to class members that a duel is starting
      socket.to(classId).emit('duel_created');
    });

    // Student joins the duel
    socket.on('join_class_duel', ({ classId, userId, username }) => {
      const room = rooms[classId];
      if (!room) {
        socket.emit('error', { message: 'No active duel for this class' });
        return;
      }

      if (room.status !== 'waiting') {
        socket.emit('error', { message: 'Duel already started' });
        return;
      }

      // Check if already joined
      if (!room.players.find(p => p.id === userId)) {
        room.players.push({ id: userId, username, score: 0, progress: 0 });
      }

      socket.join(classId);
      // Notify everyone in the room
      io.to(classId).emit('player_joined', room.players);
      console.log(`${username} joined Class ${classId}`);
    });

    // Host starts the game
    socket.on('start_game', async ({ classId }) => {
      const room = rooms[classId];
      if (room && room.hostId && room.setId) {
        // Fetch terms for the set
        const setTerms = await db.select().from(terms).where(eq(terms.set_id, room.setId));

        // Transform to questions
        const questions = setTerms.map((t: any) => ({
          id: t.id,
          term: t.term,
          correctAnswer: t.definition,
          options: [t.definition, "Wrong 1", "Wrong 2", "Wrong 3"] // TODO: Better distractors
        }));

        room.status = 'playing';
        io.to(classId).emit('game_started', { questions });
        console.log(`Game started for Class ${classId}`);
      }
    });

    // Player submits an update (score/progress)
    socket.on('update_progress', ({ classId, userId, score, progress }) => {
      const room = rooms[classId];
      if (!room) return;

      const player = room.players.find(p => p.id === userId);
      if (player) {
        player.score = score;
        player.progress = progress;
        // Broadcast live scoreboard to everyone
        io.to(classId).emit('scoreboard_update', room.players);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Handle player leaving logic if needed
    });
  });

  return io;
};
