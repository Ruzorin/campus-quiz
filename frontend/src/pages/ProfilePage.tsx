import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../context/useAuthStore';
import { useMsal } from "@azure/msal-react";
import { LogOut, User, Award, Flame, BookOpen, GraduationCap, Settings } from 'lucide-react';
import api from '../services/api';

const AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Molly",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Zack",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Kyle",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Bella",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=George"
];

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { instance } = useMsal();
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [editError, setEditError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<any>(null); // Re-added stats state properly

  useEffect(() => {
    if (user?.username) {
      setNewUsername(user.username);
      setNewAvatar(user.avatar_url || '');
    }
  }, [user]);

  // Fetch stats logic (kept from before, ensured it exists)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setIsSaving(true);

    try {
      await api.put('/users/profile', { username: newUsername, avatar_url: newAvatar });
      setIsEditing(false);
      window.location.reload();
    } catch (err: any) {
      setEditError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const activeAvatar = user?.avatar_url || stats?.avatar_url;

  const handleLogout = () => {
    logout();
    instance.logoutPopup();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 relative">
      {/* ... (existing header and stats) */}
      <div className="flex flex-col items-center mb-8">
        <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-1 mb-4 shadow-xl cursor-default group relative">
          <div className="h-full w-full rounded-full bg-white overflow-hidden flex items-center justify-center">
            {activeAvatar ? (
              <img src={activeAvatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-indigo-600 to-purple-600">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 rounded-full text-white shadow-lg hover:scale-110 transition-transform"
          >
            <Settings size={14} />
          </button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{user?.username}</h1>
        <p className="text-gray-500 flex items-center gap-1">
          <GraduationCap size={16} /> Level {stats?.level || 1} Student
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-4 text-center">
          <div className="flex justify-center text-orange-500 mb-2"><Flame size={24} /></div>
          <div className="font-bold text-xl text-gray-800">{stats?.streak || 0}</div>
          <div className="text-xs text-gray-500 font-medium uppercase">Day Streak</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="flex justify-center text-blue-500 mb-2"><BookOpen size={24} /></div>
          <div className="font-bold text-xl text-gray-800">{stats?.setsCreated || 0}</div>
          <div className="text-xs text-gray-500 font-medium uppercase">Sets Created</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="flex justify-center text-purple-500 mb-2"><Award size={24} /></div>
          <div className="font-bold text-xl text-gray-800">{stats?.termsMastered || 0}</div>
          <div className="text-xs text-gray-500 font-medium uppercase">Words Mastered</div>
        </div>
      </div>

      <div className="glass-card p-6 mb-8 flex justify-between items-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div>
          <div className="text-indigo-100 text-sm font-medium mb-1">Total XP Earned</div>
          <div className="text-3xl font-bold">{stats?.xp || 0} XP</div>
        </div>
        <Award size={40} className="text-white/80" />
      </div>

      {/* Account Actions */}
      <div className="glass-card p-2">
        <button
          onClick={() => setIsEditing(true)}
          className="w-full flex items-center p-4 hover:bg-gray-50 rounded-xl transition-colors text-left gap-4 text-gray-700 font-medium"
        >
          <User size={20} className="text-gray-400" />
          Edit Profile
        </button>
        <div className="h-px bg-gray-100 mx-4"></div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center p-4 hover:bg-red-50 rounded-xl transition-colors text-left gap-4 text-red-600 font-medium"
        >
          <LogOut size={20} />
          Log Out
        </button>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Edit Profile</h2>
            {editError && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{editError}</div>}

            <form onSubmit={handleSaveProfile}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full border-gray-300 rounded-xl shadow-sm p-3 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  minLength={3}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Choose Avatar</label>
                <div className="grid grid-cols-4 gap-3">
                  {AVATARS.map((avatar, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewAvatar(avatar)}
                      className={`relative rounded-full overflow-hidden aspect-square border-2 transition-all ${newAvatar === avatar ? 'border-indigo-600 ring-2 ring-indigo-300 scale-105' : 'border-gray-200 hover:border-indigo-300'}`}
                    >
                      <img src={avatar} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                      {newAvatar === avatar && (
                        <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                          {/* Checkmark could go here */}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
