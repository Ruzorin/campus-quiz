import React, { useState } from 'react';
import { Search, Globe, BookOpen, Clock, TrendingUp, Filter, Star, User, Copy, Check, Users } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: number;
  title: string;
  description: string;
  author: string;
  term_count: number;
  created_at: string;
}

export const DiscoveryPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [copyingId, setCopyingId] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const response = await api.get(`/sets/search?q=${encodeURIComponent(query)}`);
      setResults(response.data);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (id: number) => {
    try {
      setCopyingId(id);
      const response = await api.post(`/sets/${id}/copy`);
      // Navigate to the new set or show success message
      // For now, let's navigate to the dashboard or show a toast
      // navigating to the new set is better UX
      navigate(`/sets/${response.data.setId}`);
    } catch (error) {
      console.error('Copy failed', error);
      setCopyingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Discover Public Sets
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Find study sets created by teachers and other students.
          Clone them to your library to start studying instantly.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-16 relative">
        <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 animate-pulse"></div>
        <form onSubmit={handleSearch} className="relative flex shadow-xl rounded-2xl bg-white overflow-hidden">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for 'Cell Biology', 'Spanish Basics'..."
            className="flex-1 px-8 py-5 text-lg text-gray-900 focus:outline-none placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors disabled:opacity-70 flex items-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <Search className="w-6 h-6" />
            )}
            Search
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((set) => (
          <div key={set.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
                  {set.term_count} Terms
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                {set.title}
              </h3>
              <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">
                {set.description || 'No description provided.'}
              </p>

              <div className="flex items-center text-sm text-gray-400 border-t pt-4 mt-auto">
                <Users className="w-4 h-4 mr-2" />
                <span>By {set.author}</span>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between group-hover:bg-indigo-50/30 transition-colors">
              <span className="text-xs text-gray-400 font-medium">
                {new Date(set.created_at).toLocaleDateString()}
              </span>
              <button
                onClick={() => handleCopy(set.id)}
                disabled={copyingId === set.id}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all text-sm font-semibold disabled:opacity-50"
              >
                {copyingId === set.id ? (
                  <>
                    <div className="animate-spin h-3 w-3 border-2 border-indigo-600 border-t-transparent rounded-full" />
                    Copying...
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Clone Set
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {searched && results.length === 0 && !loading && (
        <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-6">
            <Search className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No sets found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            We couldn't find any public sets matching "{query}".
            Try different keywords or create your own set!
          </p>
        </div>
      )}
    </div>
  );
};
