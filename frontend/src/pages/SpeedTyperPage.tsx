import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/useAuthStore';
import api from '../services/api';
import { ArrowLeft, Play, Heart, Trophy, Flame } from 'lucide-react';
import clsx from 'clsx';

interface Term {
  id: number;
  term: string;
  definition: string;
}

interface FallingWord {
  id: number;
  termId: number;
  text: string;
  x: number; // Percentage 0-90
  y: number; // Percentage 0-100
  speed: number;
}

export const SpeedTyperPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [terms, setTerms] = useState<Term[]>([]);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');

  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [input, setInput] = useState('');
  const [level, setLevel] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const lastSpawnTime = useRef<number>(0);
  const spawnRate = useRef(2000); // Start spawning every 2s

  // Fetch Data
  useEffect(() => {
    const fetchSet = async () => {
      try {
        const response = await api.get(`/sets/${id}`);
        setTerms(response.data.terms);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchSet();
  }, [id]);

  // Game Loop
  const gameLoop = useCallback((timestamp: number) => {
    if (gameState !== 'playing') return;

    setFallingWords(prev => {
      const nextWords: FallingWord[] = [];
      let damageTaken = false;

      prev.forEach(word => {
        const nextY = word.y + word.speed;

        // Check collision with bottom
        if (nextY > 90) {
          damageTaken = true;
        } else {
          nextWords.push({ ...word, y: nextY });
        }
      });

      if (damageTaken) {
        setLives(l => {
          const newLives = l - 1;
          if (newLives <= 0) setGameState('gameover');
          return newLives;
        });
      }

      return nextWords;
    });

    // Spawn new words
    if (timestamp - lastSpawnTime.current > spawnRate.current) {
      spawnWord();
      lastSpawnTime.current = timestamp;
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, terms, level]);

  const spawnWord = () => {
    if (terms.length === 0) return;
    const randomTerm = terms[Math.floor(Math.random() * terms.length)];

    // Determine word type (term or definition) - mainly term for typing practice
    const text = randomTerm.term;

    const newWord: FallingWord = {
      id: Date.now(),
      termId: randomTerm.id,
      text: text,
      x: Math.random() * 80 + 5, // 5% to 85% width
      y: -10,
      speed: 0.1 + (level * 0.05), // Speed increases with level
    };

    setFallingWords(prev => [...prev, newWord]);
  };

  useEffect(() => {
    if (gameState === 'playing') {
      lastSpawnTime.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState, gameLoop]);

  // Difficulty Increase
  useEffect(() => {
    // Increase level every 50 points
    const newLevel = Math.floor(score / 50) + 1;
    if (newLevel !== level) {
      setLevel(newLevel);
      spawnRate.current = Math.max(500, 2000 - (newLevel * 100)); // Spawn faster
    }
  }, [score]);

  // Input Handling
  useEffect(() => {
    const matchIndex = fallingWords.findIndex(w => w.text.toLowerCase() === input.toLowerCase().trim());

    if (matchIndex !== -1) {
      // Correct!
      const matchedWord = fallingWords[matchIndex];

      // Flash effect (handled by React removal mostly)
      setFallingWords(prev => prev.filter((_, i) => i !== matchIndex));
      setScore(s => s + 10);
      setInput(''); // Clear input

      // XP tracking (optional: batch this or do it on gameover to reduce API calls)
      if (user) {
        // Optimistic update
        api.post('/progress', {
          user_id: user.id,
          term_id: matchedWord.termId,
          is_correct: true,
          set_id: parseInt(id!),
          game_mode: 'typer'
        }).catch(console.error);
      }
    }
  }, [input, fallingWords]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setFallingWords([]);
    setLevel(1);
    spawnRate.current = 2000;
    setInput('');
  };

  if (loading) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="h-screen bg-slate-900 text-white overflow-hidden flex flex-col relative font-mono">
      {/* HUD */}
      <div className="bg-slate-800 p-4 flex justify-between items-center shadow-lg z-10">
        <button onClick={() => navigate(`/sets/${id}`)} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
          <ArrowLeft />
        </button>

        <div className="flex gap-8 text-xl font-bold">
          <div className="flex items-center gap-2 text-yellow-400">
            <Trophy /> {score}
          </div>
          <div className="flex items-center gap-2 text-red-500">
            <Heart className={clsx(lives < 2 && "animate-pulse")} fill="currentColor" /> {lives}
          </div>
          <div className="flex items-center gap-2 text-orange-400">
            <Flame /> Lvl {level}
          </div>
        </div>

        <div className="w-10"></div>
      </div>

      {/* Game Area */}
      <div ref={containerRef} className="flex-1 relative bg-slate-900">
        {fallingWords.map(word => (
          <div
            key={word.id}
            className="absolute text-2xl font-bold px-3 py-1 bg-slate-800/80 rounded border border-indigo-500 shadow-lg transition-transform text-indigo-300 whitespace-nowrap"
            style={{
              left: `${word.x}%`,
              top: `${word.y}%`,
            }}
          >
            {word.text}
          </div>
        ))}

        {/* Danger Zone */}
        <div className="absolute bottom-0 w-full h-1 bg-red-600/50 shadow-[0_0_20px_rgba(220,38,38,0.5)]"></div>
      </div>

      {/* Input Area */}
      <div className="p-6 bg-slate-800 flex justify-center z-20">
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full max-w-2xl bg-slate-900 border-2 border-slate-700 rounded-xl px-6 py-4 text-2xl text-center focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-700"
          placeholder={gameState === 'playing' ? "Type falling words..." : ""}
          disabled={gameState !== 'playing'}
        />
      </div>

      {/* Overlays */}
      {gameState === 'start' && (
        <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-50 animate-in fade-in">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-8 tracking-tighter">
            SPEED TYPER
          </h1>
          <p className="text-slate-400 text-xl mb-12 max-w-md text-center">
            Words are falling from the sky! Type them correctly before they crash into your base.
          </p>
          <button
            onClick={startGame}
            className="px-12 py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-2xl shadow-xl shadow-indigo-900/50 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
          >
            <Play fill="currentColor" /> START MISSION
          </button>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center z-50 animate-in zoom-in">
          <h1 className="text-6xl font-black text-white mb-4">MISSION FAILED</h1>
          <div className="text-4xl font-bold text-yellow-400 mb-12">Final Score: {score}</div>

          <div className="flex gap-6">
            <button
              onClick={startGame}
              className="px-8 py-4 bg-white text-red-900 rounded-xl font-bold text-xl hover:bg-gray-100 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => navigate(`/sets/${id}`)}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold text-xl hover:bg-white/10 transition-colors"
            >
              Exit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
