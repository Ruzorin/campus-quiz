import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/useAuthStore';
import api from '../services/api';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

interface Term {
  id: number;
  term: string;
  definition: string;
}

interface Card {
  id: string; // Unique ID for the card instance
  termId: number; // Matches pairs
  content: string;
  type: 'term' | 'definition';
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryGamePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<Card[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    fetchGame();
  }, [id]);

  const fetchGame = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/sets/${id}`);
      const terms: Term[] = response.data.terms;

      // Limit to 8 pairs (16 cards) for manageable grid
      const gameTerms = terms.sort(() => .5 - Math.random()).slice(0, 8);

      const deck: Card[] = [];
      gameTerms.forEach(t => {
        deck.push({
          id: `term-${t.id}`,
          termId: t.id,
          content: t.term,
          type: 'term',
          isFlipped: false,
          isMatched: false
        });
        deck.push({
          id: `def-${t.id}`,
          termId: t.id,
          content: t.definition,
          type: 'definition',
          isFlipped: false,
          isMatched: false
        });
      });

      setCards(deck.sort(() => .5 - Math.random()));
      setGameWon(false);
      setMoves(0);
      setMatches(0);
      setFlippedCards([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (clickedCard: Card) => {
    if (
      clickedCard.isFlipped ||
      clickedCard.isMatched ||
      flippedCards.length >= 2
    ) return;

    // Flip logic
    const newCards = cards.map(c =>
      c.id === clickedCard.id ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    const newFlipped = [...flippedCards, clickedCard];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      checkForMatch(newFlipped, newCards);
    }
  };

  const checkForMatch = (currentFlipped: Card[], currentCards: Card[]) => {
    const [card1, card2] = currentFlipped;
    const isMatch = card1.termId === card2.termId;

    if (isMatch) {
      // Mark as matched
      setTimeout(() => {
        setCards(prev => prev.map(c =>
          c.id === card1.id || c.id === card2.id
            ? { ...c, isMatched: true, isFlipped: true }
            : c
        ));
        setFlippedCards([]);
        setMatches(m => {
          const newM = m + 1;
          if (newM === currentCards.length / 2) setGameWon(true);
          return newM;
        });

        // Award XP logic (simplified)
        if (user) {
          api.post('/progress', {
            user_id: user.id,
            term_id: card1.termId,
            is_correct: true,
            set_id: parseInt(id!),
            game_mode: 'memory'
          }).catch(console.error);
        }

      }, 500);
    } else {
      // Unflip after delay
      setTimeout(() => {
        setCards(prev => prev.map(c =>
          c.id === card1.id || c.id === card2.id
            ? { ...c, isFlipped: false }
            : c
        ));
        setFlippedCards([]);
      }, 1000);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-violet-50 p-6 flex flex-col items-center">
      {/* HUD */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <button onClick={() => navigate(`/sets/${id}`)} className="p-2 bg-white rounded-full shadow hover:bg-gray-50">
          <ArrowLeft className="text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-violet-900">Memory Match</h1>
        <div className="bg-white px-4 py-2 rounded-xl shadow font-semibold text-violet-700">
          Moves: {moves}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-4 w-full max-w-4xl">
        {cards.map(card => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card)}
            className="aspect-video relative cursor-pointer perspective-1000"
          >
            <div className={clsx(
              "w-full h-full transition-all duration-500 transform-style-3d shadow-lg rounded-xl",
              (card.isFlipped || card.isMatched) ? "rotate-y-180" : ""
            )}>
              {/* Back (Hidden) */}
              <div className="absolute inset-0 bg-violet-600 rounded-xl backface-hidden flex items-center justify-center border-4 border-white">
                <div className="w-8 h-8 rounded-full border-2 border-violet-400 bg-violet-500/50"></div>
              </div>

              {/* Front (Content) */}
              <div className={clsx(
                "absolute inset-0 bg-white rounded-xl backface-hidden rotate-y-180 flex items-center justify-center p-2 text-center border-4",
                card.isMatched ? "border-green-400 bg-green-50" : "border-violet-200"
              )}>
                <span className={clsx(
                  "font-bold select-none",
                  card.content.length > 20 ? "text-sm" : "text-base"
                )}>
                  {card.content}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Win Modal */}
      {gameWon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl scale-in-center">
            <h2 className="text-4xl font-bold text-violet-600 mb-2">You Won!</h2>
            <p className="text-gray-500 mb-8">Great memory! You finished in {moves} moves.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={fetchGame}
                className="w-full py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 flex items-center justify-center gap-2"
              >
                <RefreshCw size={20} /> Play Again
              </button>
              <button
                onClick={() => navigate(`/sets/${id}`)}
                className="w-full py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};
