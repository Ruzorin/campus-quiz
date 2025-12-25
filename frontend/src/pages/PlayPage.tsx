import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Gamepad2, Hash, Users, ArrowRight, School, Trophy, Zap } from 'lucide-react';

interface ClassModel {
  id: number;
  name: string;
  role: 'student' | 'admin';
  owner: { username: string };
}

export const PlayPage: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameCode, setGameCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data);
    } catch (err) {
      console.error('Failed to fetch classes', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameCode.trim()) return;

    // Logic to handle game code - for now assuming it might be a class code or redirect to a generic lobby
    // Ideally this would check if it's a "Game Instance" code vs "Class Join" code.
    // For this implementation, we'll try to join the class if it's a class code, or join a duel room directly.

    // Simplification for User Request: "Join Team/Code Game"
    // Let's assume for now checks if it's a class to join, then redirects to that class context.
    try {
      await api.post('/classes/join', { join_code: gameCode.toUpperCase() });
      // If successful, navigate to the class page or duel page
      // We'll refetch or notify logic
      alert("Joined class successfully! Redirecting...");
      fetchClasses();
      setGameCode('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid code or already joined.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
          Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Play?</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Enter a game code to join a team challenge, or jump back into your class activities.
        </p>

        {/* Temporary Setup Button for User Testing */}
        <button
          onClick={async () => {
            if (!confirm("Bu işlem hesabınızı 'Öğretmen' yapar ve test verisi oluşturur. Devam?")) return;
            try {
              await api.post('/debug/setup');
              alert("Hesap güncellendi! Sayfa yenileniyor...");
              window.location.reload();
            } catch (e) { alert("Hata oluştu."); }
          }}
          className="mt-4 text-xs text-gray-400 hover:text-indigo-600 underline"
        >
          (Test İçin): Hesabımı Öğretmen Yap & Test Verisi Yükle
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {/* Option 1: Enter Code */}
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-indigo-100 border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Hash size={120} />
          </div>

          <div className="relative z-10">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-6">
              <Gamepad2 size={32} />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Have a Game Code?</h2>
            <p className="text-gray-500 mb-8">Enter the code shared by your teacher or friend to join a live game.</p>

            <form onSubmit={handleJoinByCode} className="relative">
              <input
                type="text"
                value={gameCode}
                onChange={(e) => {
                  setGameCode(e.target.value.toUpperCase());
                  setError('');
                }}
                className="w-full h-16 pl-6 pr-32 bg-gray-50 border-2 border-gray-200 rounded-2xl text-2xl font-mono focus:border-indigo-600 focus:ring-0 outline-none transition-all uppercase tracking-widest placeholder-gray-300"
                placeholder="A1B2C3"
                maxLength={6}
              />
              <button
                type="submit"
                disabled={!gameCode}
                className="absolute right-2 top-2 bottom-2 px-6 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-gray-900 transition-all active:scale-95"
              >
                JOIN
              </button>
            </form>
            {error && <p className="mt-3 text-red-500 text-sm font-medium animate-pulse">{error}</p>}
          </div>
        </div>

        {/* Option 2: Class Games */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Trophy size={140} />
          </div>

          <div className="relative z-10 h-full flex flex-col">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-6">
              <Zap size={32} />
            </div>

            <h2 className="text-2xl font-bold mb-2">My Classes</h2>
            <p className="text-indigo-100 mb-8">Jump into active games or start a new duel in your classes.</p>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 max-h-[300px]">
              {loading ? (
                <div className="text-indigo-200">Loading classes...</div>
              ) : classes.length === 0 ? (
                <div className="text-center py-8 bg-white/10 rounded-xl border border-white/10">
                  <p className="text-sm">You haven't joined any classes yet.</p>
                </div>
              ) : (
                classes.map(cls => (
                  <button
                    key={cls.id}
                    onClick={() => navigate(`/classes/${cls.id}`)}
                    className="w-full group flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <School size={18} />
                      </div>
                      <div>
                        <div className="font-bold truncate max-w-[150px]">{cls.name}</div>
                        <div className="text-xs text-indigo-200 flex items-center gap-1">
                          <Users size={10} /> {cls.role}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all" size={20} />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
