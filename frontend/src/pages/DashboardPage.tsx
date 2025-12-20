import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { SetCard } from '../components/features/SetCard';
import { Plus, Search, Filter } from 'lucide-react';

interface StudySet {
  id: number;
  title: string;
  description: string;
  term_count: number;
  author: string;
  created_at: string;
}

export const DashboardPage: React.FC = () => {
  const [sets, setSets] = useState<StudySet[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'classes', 'recent'

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const response = await api.get('/sets');
        // Transform the response to match the interface if needed
        const mappedSets = response.data.map((set: any) => ({
          id: set.id,
          title: set.title,
          description: set.description,
          term_count: set.terms ? set.terms.length : 0,
          author: set.owner?.username || 'Unknown',
          created_at: set.created_at
        }));
        setSets(mappedSets);
      } catch (error) {
        console.error('Failed to fetch sets', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSets();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Library</h1>
          <p className="text-gray-500 mt-1">Pick up where you left off</p>
        </div>

        {/* Mobile Search/Action Bar */}
        <div className="flex gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search sets..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm"
            />
          </div>
          <button className="md:hidden p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm">
            <Filter className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar pb-2">
        {['All Sets', 'My Classes', 'Recent', 'Favorites'].map((label) => (
          <button
            key={label}
            className="whitespace-nowrap px-5 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-600 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-colors active:scale-95"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Smart Review Banner */}
      <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center">
              <span className="mr-2">🧠</span> Smart Review Mode
            </h2>
            <p className="text-indigo-100 max-w-xl">
              Our SRS algorithm has identified terms you're struggling with.
              Start a personalized session to master them!
            </p>
          </div>
          <Link
            to="/smart-review"
            className="px-8 py-3 bg-white text-indigo-600 rounded-xl font-bold shadow-lg hover:bg-indigo-50 hover:scale-105 transition-all text-sm sm:text-base border border-transparent"
          >
            Start Review Session
          </Link>
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sets.map((set, index) => (
            <div key={set.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <SetCard
                id={set.id}
                title={set.title}
                termCount={set.term_count}
                author={set.author}
                createdAt={set.created_at}
              />
            </div>
          ))}

          {/* Create New Card */}
          <Link
            to="/create-set"
            className="group flex flex-col items-center justify-center h-full min-h-[180px] border-2 border-dashed border-gray-300 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer"
          >
            <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus className="h-6 w-6" />
            </div>
            <span className="font-semibold text-gray-900">Create new set</span>
            <span className="text-sm text-gray-500 mt-1">Flashcards, quizzes & more</span>
          </Link>
        </div>
      )}
    </div>
  );
};
