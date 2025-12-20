import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http'; // Import http
import { initializeSocket } from './socket'; // Import socket init
import { setRoutes } from './routes/sets';
import { authRoutes } from './routes/auth';
import { classRoutes } from './routes/classes';
import { progressRoutes } from './routes/progress';
import { progressRoutes } from './routes/progress';
import { userRoutes } from './routes/users';
import leaderboardRoutes from './routes/leaderboard';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
const httpServer = createServer(app); // Wrap express app
const io = initializeSocket(httpServer); // Initialize Socket

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Quizlet-like API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/sets', setRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);

// Listen on httpServer, not app
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
