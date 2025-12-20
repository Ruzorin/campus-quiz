import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/useAuthStore';
import { ArrowLeft, Volume2, CheckCircle2, XCircle, RefreshCw, Trophy } from 'lucide-react';
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

type QuestionType = 'mc-term-to-def' | 'mc-def-to-term' | 'written';

interface Question {
  type: QuestionType;
  term: Term;
  options?: Term[]; // For MC
}

export const LearningModePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [setData, setSetData] = useState<SetDetail | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  useEffect(() => {
    const fetchSet = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/sets/${id}`);
        setSetData(response.data);
        generateQuestions(response.data.terms);
      } catch (error) {
        console.error('Failed to fetch set:', error);
        setSetData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSet();
  }, [id]);

  const generateQuestions = (terms: Term[]) => {
    const newQuestions: Question[] = [];
    const shuffledTerms = [...terms].sort(() => 0.5 - Math.random());
    const roundTerms = shuffledTerms.slice(0, 10);

    roundTerms.forEach(term => {
      const rand = Math.random();
      let type: QuestionType = 'mc-term-to-def';

      if (rand > 0.6) type = 'written';
      else if (rand > 0.3) type = 'mc-def-to-term';

      let options: Term[] = [];
      if (type !== 'written') {
        const distractors = terms
          .filter(t => t.id !== term.id)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        options = [...distractors, term].sort(() => 0.5 - Math.random());
      }
      newQuestions.push({ type, term, options });
    });

    setQuestions(newQuestions);
    setLoading(false);
  };

  const handleSpeak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleOptionClick = (optionTerm: Term) => {
    if (feedback !== null) return;

    const currentQ = questions[currentIndex];
    const isCorrect = optionTerm.id === currentQ.term.id;

    setSelectedOption(optionTerm.id);
    processAnswer(isCorrect);
  };

  const handleWrittenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback !== null) return;

    const currentQ = questions[currentIndex];
    const isCorrect = writtenAnswer.toLowerCase().trim() === currentQ.term.term.toLowerCase().trim();

    processAnswer(isCorrect);
  };

  const processAnswer = async (isCorrect: boolean) => {
    if (isCorrect) {
      setFeedback('correct');
      setScore(s => s + 1);
      setTimeout(nextQuestion, 1000);
    } else {
      setFeedback('incorrect');
      setShowCorrectAnswer(true);
    }

    if (user && questions[currentIndex]) {
      try {
        await api.post('/progress', {
          user_id: user.id,
          term_id: questions[currentIndex].term.id,
          is_correct: isCorrect
        });
      } catch (err) {
        console.error('Failed to save progress', err);
      }
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    setSelectedOption(null);
    setWrittenAnswer('');
    setShowCorrectAnswer(false);

    if (currentIndex < questions.length - 1) {
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

  if (!setData) {
    if (id === 'smart-review') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <Trophy className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">You're All Caught Up!</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            No weak terms found. You've mastered all your current vocabulary!
            Check back later or start a new set.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            Back to Dashboard
          </button>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <XCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Set not found</h2>
        <p className="text-gray-500 mb-6">The study set you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
        >
          Go Home
        </button>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center">
          <div className="mb-6 flex justify-center">
            {score / questions.length > 0.7 ?
              <CheckCircle2 className="w-20 h-20 text-green-500" /> :
              <RefreshCw className="w-20 h-20 text-orange-500" />
            }
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Round Complete!</h2>
          <p className="text-lg text-gray-600 mb-6">
            You scored <span className="font-bold text-indigo-600">{score}</span> out of <span className="font-bold">{questions.length}</span>
          </p>

          <button
            onClick={() => {
              setShowResult(false);
              setCurrentIndex(0);
              setScore(0);
              generateQuestions(setData.terms);
            }}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl mb-4"
          >
            Study Again
          </button>

          <button
            onClick={() => navigate(`/sets/${id}`)}
            className="w-full py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors"
          >
            Back to Set
          </button>
        </div>
      </div >
    );
  }

  const currentQ = questions[currentIndex];
  // Guard against empty state render
  if (!currentQ) return null;

  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(`/sets/${id}`)}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex-1 mx-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-center text-gray-500 mt-1 font-medium">
              {currentIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[400px] flex flex-col relative transition-all duration-300">

          {/* Feedback Overlay */}
          {feedback && (
            <div className={clsx(
              "absolute inset-0 z-10 flex items-center justify-center bg-opacity-90 backdrop-blur-sm transition-opacity duration-300",
              feedback === 'correct' ? "bg-green-50" : "bg-red-50"
            )}>
              <div className="text-center p-8 animate-in zoom-in duration-300">
                {feedback === 'correct' ? (
                  <>
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-3xl font-bold text-green-700 mb-2">Correct!</h3>
                  </>
                ) : (
                  <>
                    <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <XCircle className="w-12 h-12 text-red-600" />
                    </div>
                    <h3 className="text-3xl font-bold text-red-700 mb-2">Incorrect</h3>
                    <p className="text-gray-600 mb-2">The correct answer was:</p>
                    <p className="text-xl font-bold text-gray-900 mb-4">{currentQ.term.definition}</p>
                    <p className="text-lg text-indigo-600 font-semibold">{currentQ.term.term}</p>
                  </>
                )}

                <button
                  onClick={nextQuestion}
                  className={clsx(
                    "mt-6 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95",
                    feedback === 'correct' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                  )}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Question Section */}
          <div className="p-8 text-center border-b border-gray-100 flex-1 flex flex-col justify-center items-center">
            <span className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-4">
              {currentQ.type === 'mc-def-to-term' ? 'Select the Term' : currentQ.type === 'written' ? 'Type the Term' : 'Select the Definition'}
            </span>

            <h2 className="text-3xl font-bold text-gray-800 leading-tight mb-6">
              {currentQ.type === 'mc-def-to-term' ? currentQ.term.definition : currentQ.term.term}
            </h2>

            {currentQ.type !== 'mc-def-to-term' && (
              <button
                onClick={() => handleSpeak(currentQ.term.term)}
                className="p-3 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors"
              >
                <Volume2 className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Answer Section */}
          <div className="p-6 bg-gray-50">
            {currentQ.type === 'written' ? (
              <form onSubmit={handleWrittenSubmit} className="max-w-md mx-auto">
                <input
                  type="text"
                  value={writtenAnswer}
                  onChange={(e) => setWrittenAnswer(e.target.value)}
                  placeholder="Type the answer..."
                  className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-center mb-4"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!writtenAnswer.trim()}
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  Check Answer
                </button>
                <p className="text-center text-sm text-gray-400 mt-4">Press Enter to calculate</p>
              </form>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {currentQ.options?.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionClick(option)}
                    className={clsx(
                      "p-4 text-left rounded-xl border-2 transition-all duration-200 hover:shadow-md",
                      selectedOption === option.id
                        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                        : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50"
                    )}
                  >
                    <span className="text-lg font-medium text-gray-700">
                      {currentQ.type === 'mc-def-to-term' ? option.term : option.definition}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div >
  );
};
