import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../context/useAuthStore';
import { ArrowLeft, Brain, CheckCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Reusing types roughly
interface Term {
  id: number;
  term: string;
  definition: string;
  image_url?: string;
}

export const SmartReviewPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [terms, setTerms] = useState<Term[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);

  // Quiz State
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    fetchReviewSession();
  }, [user]);

  const fetchReviewSession = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get(`/progress/smart-review?userId=${user.id}`);
      if (res.data.terms && res.data.terms.length > 0) {
        setTerms(res.data.terms);
        generateOptions(res.data.terms[0], res.data.terms);
      } else {
        setTerms([]); // Handle empty state
      }
    } catch (e) {
      console.error("Smart Review Fetch Error", e);
    } finally {
      setLoading(false);
    }
  };

  const generateOptions = (currentTerm: Term, allTerms: Term[]) => {
    // Simple distractor logic: pick 3 random definitions from the same set
    const distractors = allTerms
      .filter(t => t.id !== currentTerm.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(t => t.definition);

    const opts = [...distractors, currentTerm.definition].sort(() => 0.5 - Math.random());
    setOptions(opts);
  };

  const handleAnswer = async (option: string) => {
    if (selectedOption) return;

    setSelectedOption(option);
    const correct = option === terms[currentIndex].definition;
    setIsCorrect(correct);

    // Update Backend
    // NOTE: We probably want to hit the generic /progress endpoint
    await api.post('/progress', {
      user_id: user?.id,
      term_id: terms[currentIndex].id,
      is_correct: correct,
      game_mode: 'smart_review'
    });

    setTimeout(() => {
      if (currentIndex < terms.length - 1) {
        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);
        setSelectedOption(null);
        setIsCorrect(null);
        generateOptions(terms[nextIdx], terms);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading your personalized session...</div>;

  if (terms.length === 0) return (
    <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
      <Brain className="w-20 h-20 text-indigo-200 mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">All Caught Up!</h1>
      <p className="text-gray-500 mb-8 max-w-md">You've mastered all your terms for now. Great job keeping your memory sharp!</p>
      <button onClick={() => navigate('/')} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold">Back onto Dashboard</button>
    </div>
  );

  if (showResult) return (
    <div className="h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-white">
      <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full border border-indigo-50">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Session Complete!</h2>
        <p className="text-gray-500 mb-8">You've reviewed {terms.length} terms. Your brain thanks you.</p>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-indigo-50 p-4 rounded-2xl">
            <div className="text-2xl font-bold text-indigo-600">{terms.length}</div>
            <div className="text-xs text-indigo-400 uppercase font-bold tracking-wider">Terms</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-2xl">
            <div className="text-2xl font-bold text-orange-600">+{terms.length * 15}</div>
            <div className="text-xs text-orange-400 uppercase font-bold tracking-wider">XP Earned</div>
          </div>
        </div>
        <div className="space-y-3">
          <button onClick={() => window.location.reload()} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5" /> Review Again
          </button>
          <button onClick={() => navigate('/')} className="w-full py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl">
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  const currentTerm = terms[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 max-w-2xl mx-auto w-full">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Smart Review</span>
          <span className="font-bold text-gray-700">{currentIndex + 1} / {terms.length}</span>
        </div>
        <div className="w-6" /> {/* Spacer */}
      </div>

      {/* Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentTerm.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-3xl shadow-xl w-full p-8 md:p-12 mb-8 text-center border-b-4 border-gray-100 min-h-[200px] flex flex-col items-center justify-center"
          >
            {true && ( // Always show for now if in Smart Review
              <div className="mb-4">
                <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full uppercase">Weak Term</span>
              </div>
            )}
            <h2 className="text-3xl md:text-4xl font-black text-gray-800 break-words w-full">
              {currentTerm.term}
            </h2>
          </motion.div>
        </AnimatePresence>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {options.map((option, idx) => {
            let btnClass = "bg-white border-2 border-gray-100 hover:border-indigo-200 text-gray-600";
            const isSelected = selectedOption === option;

            if (isSelected) {
              btnClass = isCorrect ? "bg-green-50 border-green-500 text-green-700 ring-4 ring-green-500/20" : "bg-red-50 border-red-500 text-red-700 ring-4 ring-red-500/20";
            } else if (selectedOption && option === currentTerm.definition) {
              btnClass = "bg-green-50 border-green-500 text-green-700 opacity-50";
            }

            return (
              <button
                key={idx}
                disabled={!!selectedOption}
                onClick={() => handleAnswer(option)}
                className={`p-6 rounded-2xl font-bold text-lg transition-all transform active:scale-95 ${btnClass} shadow-sm`}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  );
};
