import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuthStore } from '../context/useAuthStore';
import { Trophy, Timer, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock question type for now
interface Question {
  id: number;
  term: string;
  options: string[];
  correctAnswer: string;
}

interface Player {
  id: number;
  username: string;
  score: number;
  progress: number;
}

export const DuelGamePage: React.FC = () => {
  const { id: classId } = useParams<{ id: string }>();
  const { socket, isConnected } = useSocket();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [status, setStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [players, setPlayers] = useState<Player[]>([]);
  const [countdown, setCountdown] = useState(3);

  // Game State
  const [questions, setQuestions] = useState<Question[]>([]); // would be fetched via socket
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    if (!socket || !classId) return;

    // Join the room
    socket.emit('join_class_duel', { classId, userId: user?.id, username: user?.username });

    // Listeners
    socket.on('player_joined', (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
    });

    socket.on('game_started', (data: { questions: Question[] }) => {
      setStatus('playing');
      setQuestions(data.questions);
    });

    socket.on('scoreboard_update', (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
    });

    return () => {
      socket.off('player_joined');
      socket.off('game_started');
      socket.off('scoreboard_update');
    };
  }, [socket, classId, user]);

  const handleStartGame = () => {
    if (socket && classId) {
      socket.emit('start_game', { classId });
    }
  };

  const handleAnswer = (option: string) => {
    if (selectedOption || !questions[currentQIndex]) return;

    setSelectedOption(option);
    const correct = option === questions[currentQIndex].correctAnswer;
    setIsCorrect(correct);

    // Update Score locally and send to server
    if (correct && socket && classId && user) {
      const newScore = (players.find(p => p.id === user.id)?.score || 0) + 100;
      const progress = ((currentQIndex + 1) / questions.length) * 100;

      socket.emit('update_progress', {
        classId,
        userId: user.id,
        score: newScore,
        progress
      });
    }

    setTimeout(() => {
      if (currentQIndex < questions.length - 1) {
        setCurrentQIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setStatus('finished');
      }
    }, 1500);
  };

  if (!isConnected) {
    return <div className="flex justify-center items-center h-screen">Connecting to game server...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700">
        <div className="flex items-center gap-3">
          <Trophy className="text-yellow-400 w-8 h-8" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Class Duel
          </h1>
        </div>
        <div className="text-slate-400 font-mono">
          Room: {classId}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Game Area */}
        <div className="lg:col-span-3">

          {/* WAITING ROOM */}
          {status === 'waiting' && (
            <div className="bg-slate-800 rounded-3xl p-12 text-center border border-slate-700 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-slate-700/[0.2] bg-[length:20px_20px]" />
              <div className="relative z-10">
                <h2 className="text-4xl font-black mb-6 tracking-tight">Waiting for Players...</h2>
                <div className="flex justify-center flex-wrap gap-4 mb-12">
                  {players.map(p => (
                    <div key={p.id} className="bg-slate-700 px-6 py-3 rounded-full flex items-center gap-3 border border-slate-600 animate-in fade-in zoom-in duration-300">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="font-bold">{p.username}</span>
                    </div>
                  ))}
                </div>

                {/* Only Host sees Start Button - simplified check */}
                <button
                  onClick={handleStartGame}
                  className="px-12 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-2xl font-bold text-xl shadow-xl shadow-indigo-500/20 transform hover:scale-105 transition-all text-white"
                >
                  Start Duel 🚀
                </button>
              </div>
            </div>
          )}

          {/* PLAYING STATE */}
          {status === 'playing' && questions[currentQIndex] && (
            <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <span className="text-slate-400 font-mono">Question {currentQIndex + 1}/{questions.length}</span>
                <div className="flex items-center gap-2 text-indigo-400">
                  <Timer className="w-5 h-5" />
                  <span className="font-bold">00:15</span>
                </div>
              </div>

              <h3 className="text-3xl font-bold text-center mb-12 min-h-[100px] flex items-center justify-center">
                {questions[currentQIndex].term}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions[currentQIndex].options.map((opt, idx) => {
                  let btnClass = "bg-slate-700 hover:bg-slate-600";
                  if (selectedOption === opt) {
                    btnClass = isCorrect ? "bg-green-500 hover:bg-green-600 border-green-400" : "bg-red-500 hover:bg-red-600 border-red-400";
                  } else if (selectedOption && opt === questions[currentQIndex].correctAnswer) {
                    btnClass = "bg-green-500/50 border-green-400/50"; // Show correct answer dimmed
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(opt)}
                      disabled={!!selectedOption}
                      className={`p-6 rounded-xl text-xl font-bold transition-all border-2 border-transparent ${btnClass}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* FINISHED STATE */}
          {status === 'finished' && (
            <div className="text-center bg-slate-800 rounded-3xl p-12 border border-slate-700">
              <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6" />
              <h2 className="text-4xl font-bold mb-4">Duel Finished!</h2>
              <div className="text-2xl text-slate-300">
                Your Score: <span className="text-green-400 font-mono font-bold">{players.find(p => p.id === user?.id)?.score}</span>
              </div>
              <button
                onClick={() => navigate('/classes')}
                className="mt-12 px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-colors"
              >
                Back to Class
              </button>
            </div>
          )}
        </div>

        {/* Live Leaderboard Sidebar */}
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 h-fit">
          <h3 className="text-lg font-bold text-slate-300 mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-indigo-400" />
            Live Leaderboard
          </h3>
          <div className="space-y-4">
            {players.sort((a, b) => b.score - a.score).map((player, idx) => (
              <div key={player.id} className="relative">
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span className={`font-bold ${player.id === user?.id ? 'text-indigo-400' : 'text-slate-300'}`}>
                    {idx + 1}. {player.username}
                  </span>
                  <span className="font-mono text-slate-400">{player.score}</span>
                </div>
                <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${player.progress || 0}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
