import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, BookOpen, Layers, PenTool, Brain, Trophy, Mic } from 'lucide-react';
import { LeaderboardTable } from '../components/common/LeaderboardTable';

interface Term {
  id: number;
  term: string;
  definition: string;
  image_url?: string;
}

interface StudySet {
  id: number;
  title: string;
  description: string;
  terms: Term[];
  owner: { id: number; username: string };
  is_public: boolean;
}

export const SetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [set, setSet] = useState<StudySet | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSetAndLeaderboard = async () => {
      if (!id) return;
      try {
        const [setResponse, lbResponse] = await Promise.all([
          api.get(`/sets/${id}`),
          api.get(`/leaderboard/set/${id}?mode=learn`) // Fetch leaderboard for learn mode by default
        ]);
        setSet(setResponse.data);
        setLeaderboard(lbResponse.data || []);
      } catch (err) {
        setError('Failed to load set context');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSetAndLeaderboard();
  }, [id]);

  if (loading) return <div className="p-8 text-center bg-gray-50 flex-1">Loading set...</div>;
  if (error || !set) return <div className="p-8 text-center text-red-500 bg-gray-50 flex-1">{error || 'Set not found'}</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link to="/" className="text-gray-500 hover:text-gray-900 inline-flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Library
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{set.title}</h1>
        <div className="flex items-center text-sm text-gray-500 mt-2">
          <span className="font-medium mr-2">By {set.owner.username}</span>
          <span>• {set.terms.length} terms</span>
        </div>
        {set.description && <p className="mt-4 text-gray-600">{set.description}</p>}
      </div>

      {/* Study Modes Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Link to={`/sets/${id}/flashcards`} className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center h-32 group">
          <Layers className="h-8 w-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-gray-700">Flashcards</span>
        </Link>
        <Link to={`/sets/${id}/learn`} className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center h-32 group">
          <Brain className="h-8 w-8 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-gray-700">Learn</span>
        </Link>
        <Link to={`/sets/${id}/write`} className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center h-32 group">
          <PenTool className="h-8 w-8 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-gray-700">Write</span>
        </Link>
        <Link to={`/sets/${id}/match`} className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center h-32 group">
          <BookOpen className="h-8 w-8 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-gray-700">Match</span>
        </Link>
        <Link to={`/sets/${id}/listening`} className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center h-32 group">
          <Brain className="h-8 w-8 text-pink-500 mb-2 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-gray-700">Listening</span>
        </Link>
        <Link to={`/sets/${id}/typer`} className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center h-32 group">
          <Trophy className="h-8 w-8 text-yellow-500 mb-2 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-gray-700">Speed Typer</span>
        </Link>
        <Link to={`/sets/${id}/memory`} className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center h-32 group">
          <Layers className="h-8 w-8 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-gray-700">Memory</span>
        </Link>
        <Link to={`/sets/${id}/speaking`} className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center h-32 group">
          <Mic className="h-8 w-8 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-gray-700">Speaking Survival</span>
        </Link>
      </div>

      {/* Leaderboard Section */}
      <div className="mb-10">
        <LeaderboardTable
          title="Top Learners All-Time"
          entries={leaderboard.map(l => ({ username: l.username, score: l.score, date: l.date }))}
          type="score"
        />
      </div>

      {/* Terms List Preview */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-700">Terms in this set ({set.terms.length})</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {set.terms.map(term => (
            <div key={term.id} className="p-4 sm:flex hover:bg-gray-50">
              <div className="sm:w-1/3 pr-4 border-r-0 sm:border-r border-gray-100 font-medium text-gray-900 mb-2 sm:mb-0">
                {term.term}
              </div>
              <div className="sm:w-2/3 pl-0 sm:pl-4 text-gray-600">
                {term.definition}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
