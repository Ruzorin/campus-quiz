import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../context/useAuthStore';
import { Home, Layers, PlusCircle, User, LogOut, School, Flame, Search, Settings } from 'lucide-react';
import { useMsal } from "@azure/msal-react";

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { instance } = useMsal();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    instance.logoutPopup();
  };

  const isActive = (path: string) => location.pathname === path;

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Desktop Navigation (Top Bar) - Hidden on Mobile */}
      <nav className="hidden md:block sticky top-0 z-50 glass border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-1.5 rounded-lg shadow-sm">
                  <School size={24} />
                </div>
                <span className="font-bold text-xl text-gray-800 tracking-tight">Campus<span className="text-indigo-600">Quiz</span></span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/') ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  Home
                </Link>
                <Link to="/classes" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/classes') ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  Classes
                </Link>
                <Link to="/discovery" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/discovery') ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  Discovery
                </Link>
                <Link to="/create-set" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/create-set') ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  Create
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                <div className="flex items-center gap-1 text-orange-500 font-bold mr-2 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                  <span className="text-xs">{(user as any)?.streak || 0}</span>
                  <div className="relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <Flame size={14} fill="currentColor" />
                  </div>
                </div>
                {user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                title="Log out"
              >
                <LogOut size={20} />
              </button>
              <Link
                to="/settings"
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Settings"
              >
                <Settings size={20} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar (Logo & Profile) */}
      <div className="md:hidden fixed top-0 w-full z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 h-14 flex items-center justify-between shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-1 rounded-md">
            <School size={20} />
          </div>
          <span className="font-bold text-lg text-gray-800">Campus<span className="text-indigo-600">Quiz</span></span>
        </Link>
        <button onClick={handleLogout} className="text-gray-400 hover:text-red-500">
          <LogOut size={20} />
        </button>
      </div>

      {/* Mobile Bottom Navigation (Fixed) */}
      <div className="md:hidden fixed bottom-0 w-full z-50 bg-white border-t border-gray-200 pb-safe pt-2 px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-end pb-3">
          <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-indigo-600' : 'text-gray-400'}`}>
            <Home size={24} fill={isActive('/') ? "currentColor" : "none"} />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link to="/classes" className={`flex flex-col items-center gap-1 ${isActive('/classes') ? 'text-indigo-600' : 'text-gray-400'}`}>
            <Layers size={24} />
            <span className="text-[10px] font-medium">Classes</span>
          </Link>
          <Link to="/discovery" className={`flex flex-col items-center gap-1 ${isActive('/discovery') ? 'text-indigo-600' : 'text-gray-400'}`}>
            <Search size={24} />
            <span className="text-[10px] font-medium">Search</span>
          </Link>

          {/* Floating Action Button for Create */}
          <Link to="/create-set" className="relative -top-5">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-full shadow-lg text-white shadow-indigo-200 transform transition-transform active:scale-95">
              <PlusCircle size={28} />
            </div>
          </Link>

          <Link to="/profile" className={`flex flex-col items-center gap-1 ${isActive('/profile') ? 'text-indigo-600' : 'text-gray-400'}`}>
            <User size={24} />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>
      </div>

      {/* Spacer for Mobile Top/Bottom bars */}
      <div className="md:hidden h-16"></div>
    </>
  );
};
