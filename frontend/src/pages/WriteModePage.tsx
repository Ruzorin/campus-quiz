import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';
import clsx from 'clsx';

interface Term {
  id: number;
  term: string;
  definition: string;
}

export const WriteModePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [terms, setTerms] = useState<Term[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  useEffect(() => {
    const fetchSet = async () => {
      try {
        const response = await api.get(`/sets/${id}`);
        // Shuffle terms for the session
        const shuffled = [...response.data.terms].sort(() => 0.5 - Math.random());
        setTerms(shuffled);
      } catch (error) {
        console.error('Failed to fetch set:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchSet();
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback) return;

    const currentTerm = terms[currentIndex];
    const isCorrect = userAnswer.toLowerCase().trim() === currentTerm.term.toLowerCase().trim();

    if (isCorrect) {
      setScore(s => s + 1);
      setFeedback('correct');
      // Auto advance on correct after short delay
      setTimeout(() => {
        nextQuestion();
      }, 1000);
    } else {
      setFeedback('incorrect');
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    setUserAnswer('');
    if (currentIndex < terms.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (terms.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <XCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Set unavailable</h2>
        <p className="text-gray-500 mb-6">We couldn't load any terms for this set. It might have been deleted or moved.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
        >
          Go to Library
        </button>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full">
          <h2 className="text-3xl font-bold mb-4">Session Complete!</h2>
          <p className="text-xl mb-6">Score: <span className="font-bold text-indigo-600">{score} / {terms.length}</span></p>
          <div className="space-y-3">
            <button onClick={() => window.location.reload()} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">Practice Again</button>
            <button onClick={() => navigate(`/sets/${id}`)} className="w-full py-3 border border-gray-300 rounded-xl font-bold hover:bg-gray-50">Back to Set</button>
          </div>
        </div>
      </div>
    );
  }

  const currentTerm = terms[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate(`/sets/${id}`)} className="p-2 hover:bg-gray-200 rounded-full mr-4">
            <ArrowLeft />
          </button>
          <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full transition-all" style={{ width: `${(currentIndex / terms.length) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8 text-center min-h-[400px] flex flex-col justify-center">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Definition</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-8">{currentTerm.definition}</h2>

          <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
            <input
              type="text"
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              className={clsx(
                "w-full text-center text-xl p-4 border-2 rounded-xl outline-none transition-all",
                feedback === 'correct' ? "border-green-500 bg-green-50 text-green-700" :
                  feedback === 'incorrect' ? "border-red-500 bg-red-50 text-red-700" :
                    "border-gray-200 focus:border-indigo-500"
              )}
              placeholder="Type the English term..."
              autoFocus
              disabled={feedback !== null}
            />

            {feedback === 'incorrect' && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                <p className="text-red-600 font-bold mb-1">Incorrect</p>
                <p className="text-gray-500">Correct answer: <span className="font-bold text-indigo-600">{currentTerm.term}</span></p>
                <button
                  type="button"
                  onClick={nextQuestion}
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
                >
                  Continue
                </button>
              </div>
            )}

            {!feedback && (
              <button type="submit" className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg">
                Check
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
