import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Plus, Users, School, LogIn, ArrowRight, Hash } from 'lucide-react';

interface ClassModel {
  id: number;
  name: string;
  join_code: string;
  owner: { username: string };
  role: 'student' | 'admin';
  created_at: string;
}

export const ClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Form states
  const [newClassName, setNewClassName] = useState('');
  const [joinCode, setJoinCode] = useState('');
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

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/classes', { name: newClassName });
      setShowCreateModal(false);
      setNewClassName('');
      fetchClasses();
    } catch (err) {
      setError('Failed to create class');
      console.error(err);
    }
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/classes/join', { join_code: joinCode });
      setShowJoinModal(false);
      setJoinCode('');
      fetchClasses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join class');
    }
  };

  if (loading) return <div className="p-8 text-center bg-gray-50 min-h-screen">Loading classes...</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <LogIn className="h-5 w-5 mr-2" />
            Join Class
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Class
          </button>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <School className="mx-auto h-16 w-16 text-indigo-200" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No classes yet</h3>
          <p className="mt-2 text-gray-500">Get started by creating a new class or joining an existing one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <Link key={cls.id} to={`/classes/${cls.id}`} className="group relative block bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
              <div className="h-3 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{cls.name}</h3>
                  {cls.role === 'admin' && <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-1 rounded-full">Admin</span>}
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-gray-500 flex items-center">
                    <span className="w-20 text-gray-400">Instructor:</span>
                    <span className="font-medium text-gray-700">{cls.owner.username}</span>
                  </p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <span className="w-20 text-gray-400">Code:</span>
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600 select-all">{cls.join_code}</span>
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 group-hover:text-indigo-600 transition-colors">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1.5" />
                    <span>View Details</span>
                  </div>
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Create a New Class</h2>
            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}
            <form onSubmit={handleCreateClass}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Class Name</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full border-gray-300 rounded-xl shadow-sm p-3 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="e.g. Advanced English 101"
                  required
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-200 transition-all transform active:scale-95">Create Class</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Join a Class</h2>
            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}
            <form onSubmit={handleJoinClass}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Class Code</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="w-full pl-10 border-gray-300 rounded-xl shadow-sm p-3 border uppercase font-mono tracking-wider focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="ABC123"
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 ml-1">Ask your instructor for the 6-character class code.</p>
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowJoinModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium shadow-lg shadow-green-200 transition-all transform active:scale-95">Join Class</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
