import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/useAuthStore';
import api from '../services/api';
import { ArrowLeft, Mic, Play, RefreshCw, AlertCircle, SkipForward } from 'lucide-react';
import clsx from 'clsx';

// Type definition for Web Speech API
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

interface Term {
  id: number;
  term: string;
  definition: string;
}

// Levenshtein distance for fuzzy matching
const getLevenshteinDistance = (a: string, b: string) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

export const SpeakingGamePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [terms, setTerms] = useState<Term[]>([]);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover' | 'error'>('start');
  const [errorMessage, setErrorMessage] = useState('');

  const [currentTermIndex, setCurrentTermIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [lastTranscript, setLastTranscript] = useState('');
  const [history, setHistory] = useState<string[]>([]); // Debug history

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    fetchSet();
    return () => {
      stopGame();
    };
  }, [id]);

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

  const initSpeech = () => {
    const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
    const SpeechRecognitionAPI = SpeechRecognition || webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setGameState('error');
      setErrorMessage("Your browser doesn't support Speech Recognition. Please use Chrome or Edge.");
      return null;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const currentHeard = (finalTranscript || interimTranscript).trim().toLowerCase();

      if (currentHeard) {
        setLastTranscript(currentHeard);
        checkAnswer(currentHeard);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech error", event.error);
      if (event.error === 'not-allowed') {
        setGameState('error');
        setErrorMessage("Microphone access denied. Please allow microphone permissions in your browser settings.");
      }
    };

    recognition.onend = () => {
      if (gameState === 'playing') {
        try {
          recognition.start();
        } catch (e) { /* ignore */ }
      }
    };

    return recognition;
  };

  const startGame = () => {
    if (!recognitionRef.current) {
      recognitionRef.current = initSpeech();
      if (!recognitionRef.current) return;
    }

    try {
      recognitionRef.current.start();
    } catch (e) { /* Already started */ }

    setGameState('playing');
    setScore(0);
    setTimeLeft(15);
    setCurrentTermIndex(Math.floor(Math.random() * terms.length));
    setLastTranscript('');
    setHistory([]);

    startTimer();
  };

  const stopGame = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          handleGameOver();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
  };

  const handleGameOver = () => {
    stopGame();
    setGameState('gameover');
  };

  const checkAnswer = (transcript: string) => {
    if (gameState !== 'playing') return;

    // Normalize target
    const currentTerm = terms[currentTermIndex];
    if (!currentTerm) return;

    const targetFormatted = currentTerm.term.toLowerCase().replace(/[.,!?;:]/g, '').trim();

    // Check strict containment first
    if (transcript.includes(targetFormatted)) {
      handleCorrect();
      return;
    }

    // Check fuzzy match on the last few words
    const words = transcript.split(' ');
    // Check combined last 1, 2, or 3 words to capture phrases
    const candidates = [
      words[words.length - 1],
      words.slice(-2).join(' '),
      words.slice(-3).join(' ')
    ].filter(Boolean);

    for (const cand of candidates) {
      const dist = getLevenshteinDistance(cand, targetFormatted);
      const maxAllowed = Math.max(2, Math.floor(targetFormatted.length * 0.3)); // Allow 2 errors or 30%, whichever is greater

      if (dist <= maxAllowed) {
        handleCorrect();
        return;
      }
    }
  };

  const handleCorrect = () => {
    setScore(s => s + 1);
    setTimeLeft(t => Math.min(t + 4, 20)); // Bonus 4s, Cap 20s
    setLastTranscript('');
    setHistory(prev => [...prev.slice(-4), terms[currentTermIndex].term]);

    // Next Word
    let nextIndex = Math.floor(Math.random() * terms.length);
    if (nextIndex === currentTermIndex && terms.length > 1) {
      nextIndex = (nextIndex + 1) % terms.length;
    }
    setCurrentTermIndex(nextIndex);

    // XP
    if (user) {
      api.post('/progress', {
        user_id: user.id,
        term_id: terms[currentTermIndex].id,
        is_correct: true,
        set_id: parseInt(id!)
      }).catch(() => { });
    }
  };

  const handleSkip = () => {
    setTimeLeft(t => Math.max(0, t - 2)); // Penalty 2s
    let nextIndex = Math.floor(Math.random() * terms.length);
    if (nextIndex === currentTermIndex && terms.length > 1) {
      nextIndex = (nextIndex + 1) % terms.length;
    }
    setCurrentTermIndex(nextIndex);
  };

  if (loading) return <div>Loading...</div>;

  const currentTerm = terms[currentTermIndex];

  return (
    <div className="min-h-screen bg-rose-50 flex flex-col items-center p-4 relative overflow-hidden font-sans">
      {/* HUD */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-6 z-10">
        <button onClick={() => navigate(`/sets/${id}`)} className="p-3 bg-white rounded-full shadow hover:bg-rose-100 transition">
          <ArrowLeft className="text-rose-900" />
        </button>
        <div className="flex gap-4 items-center">
          <div className="text-sm font-semibold text-rose-800 bg-rose-100 px-3 py-1 rounded-full">
            Streak: {history.length}
          </div>
          <div className="text-3xl font-black text-rose-900">
            {score}
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md z-10">

        {/* Word Card */}
        {gameState === 'playing' && currentTerm && (
          <div className="relative w-full mb-8">
            <div className="bg-white p-10 rounded-[2rem] shadow-2xl text-center border-b-[8px] border-rose-200 animate-in zoom-in duration-300">
              <h2 className="text-5xl font-black text-slate-800 mb-4">{currentTerm.term}</h2>
              <p className="text-slate-500 font-medium text-lg leading-relaxed">{currentTerm.definition}</p>
            </div>

            {/* Skip Button */}
            <button
              onClick={handleSkip}
              className="absolute -right-4 -bottom-4 bg-slate-200 hover:bg-slate-300 text-slate-600 p-3 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95"
              title="Skip (-2s)"
            >
              <SkipForward size={24} />
            </button>
          </div>
        )}

        {/* Timer Bar */}
        {gameState === 'playing' && (
          <div className="w-full h-8 bg-rose-200 rounded-full overflow-hidden mb-8 border-4 border-white shadow-inner">
            <div
              className={clsx("h-full transition-all duration-100 ease-linear shadow-[0_0_20px_rgba(0,0,0,0.1)_inset]",
                timeLeft > 5 ? "bg-emerald-500" : timeLeft > 2 ? "bg-amber-500" : "bg-rose-600 animate-pulse"
              )}
              style={{ width: `${Math.min(100, (timeLeft / 20) * 100)}%` }}
            />
            <div className="absolute w-full text-center text-xs font-bold text-white/50 -mt-6 mix-blend-overlay">
              TIME REMAINING
            </div>
          </div>
        )}

        {/* Feedback / Mic Status */}
        <div className="min-h-[100px] flex items-center justify-center w-full">
          {gameState === 'playing' && (
            <div className="flex flex-col items-center gap-3 w-full">
              <div className={clsx(
                "p-5 rounded-full text-white shadow-xl transition-all duration-300",
                lastTranscript ? "bg-emerald-500 scale-110" : "bg-rose-600 animate-pulse"
              )}>
                <Mic size={32} />
              </div>
              <div className="bg-white/50 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/50 w-full text-center">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Hearing</p>
                <p className="text-slate-800 font-bold text-lg min-h-[1.5rem] break-words">
                  {lastTranscript || "Say the word..."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Start Screen */}
      {gameState === 'start' && (
        <div className="absolute inset-0 bg-rose-600 flex flex-col items-center justify-center z-50 text-white p-8 text-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl animate-bounce">
            <Mic size={64} className="text-rose-600" />
          </div>
          <h1 className="text-5xl font-black mb-4 tracking-tighter drop-shadow-md">SPEAKING SURVIVAL</h1>
          <p className="text-xl max-w-md mb-12 opacity-90 font-medium">Say the words correctly before the time runs out! Each correct word gives you +4 seconds.</p>
          <button
            onClick={startGame}
            className="w-full max-w-sm px-10 py-6 bg-white text-rose-600 rounded-2xl font-black text-2xl shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)] hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3"
          >
            <Play fill="currentColor" /> START GAME
          </button>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center z-50 text-white animate-in zoom-in font-sans">
          <h1 className="text-7xl font-black mb-2 text-rose-500 tracking-tighter">TIME'S UP!</h1>
          <p className="text-2xl mb-8 opacity-70 font-medium">You survived! Words mastered:</p>

          <div className="bg-slate-800 p-10 rounded-[2rem] mb-10 text-center border-t-4 border-slate-700 w-full max-w-sm shadow-2xl">
            <div className="text-sm uppercase tracking-widest text-slate-400 mb-2 font-bold">Final Score</div>
            <div className="text-8xl font-black text-white bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">{score}</div>
          </div>

          <div className="flex gap-4 w-full max-w-md">
            <button
              onClick={startGame}
              className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold text-xl hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/50"
            >
              <RefreshCw /> Retry
            </button>
            <button
              onClick={() => navigate(`/sets/${id}`)}
              className="flex-1 py-4 bg-slate-800 border-2 border-slate-700 text-slate-300 rounded-xl font-bold text-xl hover:bg-slate-700 transition-colors"
            >
              Exit
            </button>
          </div>
        </div>
      )}

      {/* Error Screen */}
      {gameState === 'error' && (
        <div className="absolute inset-0 bg-white flex flex-col items-center justify-center z-50 p-8 text-center">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle size={40} className="text-rose-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Microphone Access Needed</h2>
          <p className="text-gray-600 mb-8 max-w-md text-lg leading-relaxed">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all"
          >
            Refresh & Try Again
          </button>
          <button
            onClick={() => navigate(`/sets/${id}`)}
            className="mt-4 text-gray-400 hover:text-gray-600 font-semibold"
          >
            Go Back
          </button>
        </div>
      )}

    </div>
  );
};
