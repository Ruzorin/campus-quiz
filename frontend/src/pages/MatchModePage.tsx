import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Timer } from 'lucide-react';
import api from '../services/api';
import clsx from 'clsx';

interface Term {
  id: number;
  term: string;
  definition: string;
}

interface Tile {
  id: string; // Unique ID for the tile
  termId: number; // The logic ID to match
  text: string;
  type: 'term' | 'def';
  state: 'default' | 'selected' | 'matched' | 'wrong';
}

export const MatchModePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNull, setSelectedOne] = useState<string | null>(null);

  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [gameParams, setGameParams] = useState({ isOver: false });

  // Timer effect
  useEffect(() => {
    let interval: any;
    if (startTime && !gameParams.isOver) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 100)); // 1/10th second precision
      }, 100);
    }
    return () => clearInterval(interval);
  }, [startTime, gameParams.isOver]);

  useEffect(() => {
    const fetchSet = async () => {
      try {
        const response = await api.get(`/sets/${id}`);
        const terms: Term[] = response.data.terms;

        // Take 8 pairs (16 tiles) max for a good grid
        const subset = terms.sort(() => 0.5 - Math.random()).slice(0, 8);

        const newTiles: Tile[] = [];
        subset.forEach(t => {
          newTiles.push({ id: `t-${t.id}`, termId: t.id, text: t.term, type: 'term', state: 'default' });
          newTiles.push({ id: `d-${t.id}`, termId: t.id, text: t.definition, type: 'def', state: 'default' });
        });

        // Shuffle tiles
        setTiles(newTiles.sort(() => 0.5 - Math.random()));
        setStartTime(Date.now());
      } catch (error) {
        console.error('Failed to fetch set', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchSet();
  }, [id]);

  const handleTileClick = (clickedId: string) => {
    if (gameParams.isOver) return;

    // Find the tile instance
    const tile = tiles.find(t => t.id === clickedId);
    if (!tile || tile.state === 'matched') return;

    // If clicking same tile, unselect
    if (selectedNull === clickedId) {
      setTiles(prev => prev.map(t => t.id === clickedId ? { ...t, state: 'default' } : t));
      setSelectedOne(null);
      return;
    }

    // Step 1: Select first tile
    if (!selectedNull) {
      setTiles(prev => prev.map(t => t.id === clickedId ? { ...t, state: 'selected' } : t));
      setSelectedOne(clickedId);
      return;
    }

    // Step 2: Select second tile - CHECK MATCH
    const firstId = selectedNull;
    const firstTile = tiles.find(t => t.id === firstId)!;

    // Check match
    const isMatch = firstTile.termId === tile.termId;

    if (isMatch) {
      // Success
      setTiles(prev => prev.map(t => {
        if (t.id === firstId || t.id === clickedId) return { ...t, state: 'matched' };
        return t;
      }));
      setSelectedOne(null);

      // Check Game Over
      const allMatched = tiles.every(t => (t.id === firstId || t.id === clickedId || t.state === 'matched'));
      // Note: `tiles` here is stale in closure, need a robust check. 
      // Actually simpler: count matched in state update or check logic
      // Hacky check:
      setTimeout(() => {
        // Using a ref or functional update checking inside useEffect is safer, but this works for demo
        // We'll rely on a separate useEffect to check win condition based on tiles state
      }, 100);

    } else {
      // Wrong
      setTiles(prev => prev.map(t => {
        if (t.id === firstId || t.id === clickedId) return { ...t, state: 'wrong' };
        return t;
      }));

      // Reset after delay
      setTimeout(() => {
        setTiles(prev => prev.map(t => {
          if (t.id === firstId || t.id === clickedId) return { ...t, state: 'default' };
          return t;
        }));
        setSelectedOne(null);
      }, 700);
    }
  };

  // Win Check Effect
  useEffect(() => {
    if (tiles.length > 0 && tiles.every(t => t.state === 'matched')) {
      setGameParams({ isOver: true });
    }
  }, [tiles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (tiles.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
        <div className="text-6xl mb-4">🤔</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Game Over?</h2>
        <p className="text-gray-500 mb-6">We couldn't load the game tiles. Please try picking a different set.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
        >
          Go to Library
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex justify-between items-center px-8 z-10">
        <button onClick={() => navigate(`/sets/${id}`)} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft /></button>
        <div className="flex items-center space-x-2 text-xl font-mono font-bold text-indigo-600">
          <Timer className="w-6 h-6" />
          <span>{(elapsed / 10).toFixed(1)}s</span>
        </div>
        <div className="w-10"></div>
      </div>

      {gameParams.isOver ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Great Job!</h1>
          <p className="text-2xl text-gray-600 mb-8">You cleared the board in <span className="text-indigo-600 font-bold">{(elapsed / 10).toFixed(1)}s</span></p>
          <div className="space-y-3 w-full max-w-xs">
            <button onClick={() => window.location.reload()} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg">Play Again</button>
            <button onClick={() => navigate(`/sets/${id}`)} className="w-full py-3 bg-white border border-gray-300 rounded-xl font-bold">Back to Set</button>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 h-full content-center">
            {tiles.map(tile => (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile.id)}
                disabled={tile.state === 'matched'}
                className={clsx(
                  "aspect-[4/3] flex items-center justify-center p-4 rounded-xl text-center text-sm font-bold shadow-sm transition-all duration-200 transform",
                  tile.state === 'matched' ? "opacity-0 pointer-events-none" :
                    tile.state === 'selected' ? "bg-indigo-600 text-white scale-105 shadow-xl ring-4 ring-indigo-200" :
                      tile.state === 'wrong' ? "bg-red-500 text-white shake" :
                        "bg-white text-gray-700 hover:shadow-md hover:-translate-y-1 border-b-4 border-gray-200 active:border-b-0 active:translate-y-1"
                )}
              >
                {tile.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
