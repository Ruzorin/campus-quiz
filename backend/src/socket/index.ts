import { db } from '../db';
import { terms } from '../db/schema';
import { eq } from 'drizzle-orm';
import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { rooms } from './roomStore';

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

        // Helper to shuffle array
        const shuffle = (array: any[]) => {
          for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
          }
          return array;
        };

        // Transform to questions with REAL distractors
        const questions = setTerms.map((t: any) => {
          // Get 3 random wrong answers from other terms
          const otherTerms = setTerms.filter(term => term.id !== t.id);
          const distractors = shuffle(otherTerms)
            .slice(0, 3)
            .map(term => term.definition);

          // Pad with generic wrong answers if not enough terms in set
          while (distractors.length < 3) {
            distractors.push(`Random Wrong Answer ${distractors.length + 1}`);
          }

          const options = shuffle([t.definition, ...distractors]);

          return {
            id: t.id,
            term: t.term,
            correctAnswer: t.definition,
            options
          };
        });

        // Limit to 10 questions for a quick duel, or all if less
        const selectedQuestions = shuffle(questions).slice(0, 10);

        room.status = 'playing';
        io.to(classId).emit('game_started', { questions: selectedQuestions });
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
