import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, User, MoreHorizontal } from 'lucide-react';

interface SetCardProps {
  id: number;
  title: string;
  termCount: number;
  author: string;
  createdAt: string;
}

export const SetCard: React.FC<SetCardProps> = ({ id, title, termCount, author, createdAt }) => {
  return (
    <Link to={`/sets/${id}`} className="block h-full">
      <div className="glass-card hover:translate-y-[-2px] hover:shadow-xl transition-all duration-300 h-full flex flex-col p-5 relative overflow-hidden group">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100"></div>

        <div className="flex justify-between items-start mb-3 pl-2">
          <div className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            {termCount} terms
          </div>
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <MoreHorizontal size={18} />
          </button>
        </div>

        <h3 className="text-lg font-bold text-gray-800 mb-2 pl-2 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>

        <div className="mt-auto pl-2 pt-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-400 flex items-center justify-center text-white text-xs font-bold shadow-md">
            {author.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-900">{author}</span>
            <span className="text-[10px] text-gray-500">{new Date(createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
