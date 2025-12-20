import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/useAuthStore';
import { ArrowLeft, Volume2, CheckCircle2, Play } from 'lucide-react';
import api from '../services/api';
import clsx from 'clsx';

interface Term {
  id: number;
  term: string;
  definition: string;
}

interface SetDetail {
  id: number;
  title: string;
  terms: Term[];
}

export const ListeningModePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [setData, setSetData] = useState<SetDetail | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [currentTermIndex, setCurrentTermIndex] = useState(0);

  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Ref to hold the current utterance to prevent GC issues
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const fetchSet = async () => {
      try {
        const response = await api.get(`/sets/${id}`);
        setSetData(response.data);
        // Shuffle terms
        if (response.data.terms && response.data.terms.length > 0) {
          const shuffled = [...response.data.terms].sort(() => 0.5 - Math.random()).slice(0, 10);
          setTerms(shuffled);
        } else {
          setTerms([]);
        }
      } catch (error) {
        console.error('Failed to fetch set:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchSet();

    // Cleanup audio on unmount
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [id]);

  useEffect(() => {
    if (gameStarted && terms.length > 0 && !showResult && feedback === null) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        playAudio(terms[currentTermIndex].term);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentTermIndex, terms, feedback, showResult, gameStarted]);

  const playAudio = (text: string) => {
    if (!window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;

    // Attempt to pick a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang === 'en-US' && !v.name.includes('Microsoft David')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleStartGame = () => {
    setGameStarted(true);
    // Explicitly resume in case it was paused
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback !== null) return;

    const currentTerm = terms[currentTermIndex];
    if (!currentTerm) return;

    // Normalize input and term (remove punctuation, lower case)
    const normalize = (str: string) => str.toLowerCase().replace(/[.,!?;:]/g, '').trim();
    const isCorrect = normalize(userInput) === normalize(currentTerm.term);

    if (isCorrect) {
      setFeedback('correct');
      setScore(s => s + 1);

      if (user) {
        try {
          await api.post('/progress', {
            user_id: user.id,
            class_id: undefined, // Optional
            term_id: currentTerm.id,
            is_correct: true,
            set_id: parseInt(id!)
          });
        } catch (err) { console.error(err); }
      }

      setTimeout(() => {
        nextTerm();
      }, 1500);
    } else {
      setFeedback('incorrect');
    }
  };

  const nextTerm = () => {
    setFeedback(null);
    setUserInput('');
    if (currentTermIndex < terms.length - 1) {
      setCurrentTermIndex(prev => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!setData) return <div className="min-h-screen flex items-center justify-center text-red-500">Set not found</div>;
  if (terms.length === 0) return <div className="min-h-screen flex items-center justify-center text-gray-500">Not enough terms to play.</div>;

  // Start Screen Overlay
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Volume2 className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Listening Challenge</h1>
          <p className="text-gray-500 mb-8">Listen to the word and type exactly what you hear.</p>
          <button
            onClick={handleStartGame}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Play className="fill-current w-5 h-5" />
            Start Game
          </button>
          <button onClick={() => navigate(`/sets/${id}`)} className="mt-4 text-gray-400 font-semibold hover:text-gray-600">Cancel</button>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <h2 className="text-3xl font-bold mb-4">Dictation Complete!</h2>
          <p className="text-xl mb-6">Score: {score} / {terms.length}</p>
          <div className="flex gap-4">
            <button onClick={() => window.location.reload()} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold">Try Again</button>
            <button onClick={() => navigate(`/sets/${id}`)} className="flex-1 border-2 py-3 rounded-xl font-bold">Back</button>
          </div>
        </div>
      </div>
    );
  }

  const currentTerm = terms[currentTermIndex];
  const progress = ((currentTermIndex) / terms.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(`/sets/${id}`)} className="p-2 hover:bg-gray-200 rounded-full"><ArrowLeft /></button>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center relative overflow-hidden">
          {feedback === 'correct' && (
            <div className="absolute inset-0 bg-green-100 flex items-center justify-center z-10 animate-in fade-in">
              <CheckCircle2 className="w-20 h-20 text-green-600" />
            </div>
          )}

          <div className="mb-8">
            <button
              onClick={() => playAudio(currentTerm.term)}
              className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-indigo-200 transition-colors animate-pulse-slow"
            >
              <Volume2 className="w-10 h-10 text-indigo-600" />
            </button>
            <p className="text-gray-500">Type what you hear</p>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className={clsx(
                "w-full text-center text-2xl font-bold p-4 border-b-2 outline-none mb-6 transition-colors",
                feedback === 'incorrect' ? "border-red-500 text-red-600 bg-red-50" : "border-gray-200 focus:border-indigo-500"
              )}
              placeholder="Type here..."
              autoFocus
              readOnly={feedback === 'correct'}
              autoComplete="off"
            />

            {feedback === 'incorrect' && (
              <div className="mb-6 animate-in slide-in-from-top-2">
                <p className="text-red-500 font-bold mb-1">Incorrect!</p>
                <p className="text-gray-500">Correct: <span className="font-bold text-gray-800">{currentTerm.term}</span></p>
                <button
                  type="button"
                  onClick={nextTerm}
                  className="mt-4 text-indigo-600 font-bold hover:underline"
                >
                  Next Word
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={!userInput.trim() || feedback !== null}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl translate-y-0 active:translate-y-1"
            >
              Check Answer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
