import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Volume2, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface Term {
  id: number;
  term: string;
  definition: string;
}

export const FlashcardsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [terms, setTerms] = useState<Term[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await api.get(`/sets/${id}`);
        if (response.data && response.data.terms) {
          // Shuffle terms for variety
          const shuffled = [...response.data.terms].sort(() => Math.random() - 0.5);
          setTerms(shuffled);
        }
      } catch (error) {
        console.error("Failed to load terms", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTerms();
  }, [id]);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % terms.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + terms.length) % terms.length);
    }, 150);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't flip the card
    const text = terms[currentIndex].term;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; // Set to English
    utterance.rate = 0.9; // Slightly slower for learning
    window.speechSynthesis.speak(utterance);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading flashcards...</div>;
  if (terms.length === 0) return <div className="p-8 text-center text-gray-500">No terms in this set.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Flashcards</span>
          <p className="text-gray-500 text-xs">{currentIndex + 1} / {terms.length}</p>
        </div>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Card Container */}
      <div className="flex-1 flex items-center justify-center perspective-1000 mb-8">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`relative w-full text-center max-w-lg aspect-[5/3] cursor-pointer transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front (Term) */}
          <div
            className="absolute inset-0 backface-hidden glass-card flex flex-col items-center justify-center p-8 border-b-4 border-indigo-500"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-2">{terms[currentIndex].term}</h2>
            <p className="text-sm text-gray-400 font-medium uppercase mt-4">Term</p>

            {/* TTS Button on Front */}
            <button
              onClick={handleSpeak}
              className="absolute top-4 right-4 p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full transition-colors shadow-sm active:scale-95"
              title="Listen to pronunciation"
            >
              <Volume2 size={24} />
            </button>
          </div>

          {/* Back (Definition) */}
          <div
            className="absolute inset-0 backface-hidden glass-card flex flex-col items-center justify-center p-8 border-b-4 border-purple-500 rotate-y-180"
          >
            <h2 className="text-3xl font-medium text-gray-700">{terms[currentIndex].definition}</h2>
            <p className="text-sm text-gray-400 font-medium uppercase mt-4">Definition</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 pb-8">
        <button
          onClick={handlePrev}
          className="p-4 bg-white border border-gray-200 text-gray-600 rounded-full shadow-lg active:scale-95 transition-transform hover:text-indigo-600"
        >
          <ChevronLeft size={32} />
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-xl shadow-indigo-200 active:scale-95 transition-transform"
        >
          <RotateCw size={32} />
        </button>

        <button
          onClick={handleNext}
          className="p-4 bg-white border border-gray-200 text-gray-600 rounded-full shadow-lg active:scale-95 transition-transform hover:text-indigo-600"
        >
          <ChevronRight size={32} />
        </button>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};
