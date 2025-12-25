import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../context/useAuthStore';
import { useMsal } from "@azure/msal-react";
import { LogOut, User, Award, Flame, BookOpen, GraduationCap } from 'lucide-react';
import api from '../services/api';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { instance } = useMsal();
  const [stats, setStats] = useState<any>(null);

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

  const handleLogout = () => {
    logout();
    instance.logoutPopup();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
      <div className="flex flex-col items-center mb-8">
        <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-1 mb-4 shadow-xl">
          <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-indigo-600 to-purple-600">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{user?.username}</h1>
        <p className="text-gray-500 flex items-center gap-1">
          <GraduationCap size={16} /> Level {stats?.level || 1} Student
        </p>
      </div>

      {/* Stats Grid */}
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
          onClick={() => alert("Editing profile is coming soon!")}
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
    </div>
  );
};
