import React from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';
import clsx from 'clsx';

interface LeaderboardEntry {
  username: string;
  score?: number;
  xp?: number;
  level?: number;
  date?: string;
}

interface LeaderboardTableProps {
  title: string;
  entries: LeaderboardEntry[];
  type: 'xp' | 'score';
  loading?: boolean;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ title, entries, type, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500">No scores yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-300" />
          {title}
        </h3>
      </div>

      <div className="divide-y divide-gray-100">
        {entries.map((entry, index) => (
          <div
            key={index}
            className={clsx(
              "flex items-center justify-between p-4 hover:bg-gray-50 transition-colors",
              index === 0 && "bg-yellow-50/50",
              index === 1 && "bg-gray-50/50",
              index === 2 && "bg-orange-50/50"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={clsx(
                "w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm",
                index === 0 ? "bg-yellow-100 text-yellow-700" :
                  index === 1 ? "bg-gray-200 text-gray-700" :
                    index === 2 ? "bg-orange-100 text-orange-800" :
                      "bg-gray-100 text-gray-500"
              )}>
                {index + 1}
              </div>

              <div className="flex flex-col">
                <span className={clsx(
                  "font-bold",
                  index < 3 ? "text-gray-900" : "text-gray-700"
                )}>
                  {entry.username}
                </span>
                {entry.level && (
                  <span className="text-xs text-gray-500">Lvl {entry.level}</span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="font-bold text-indigo-600 block">
                {type === 'xp' ? `${entry.xp} XP` : entry.score}
              </span>
              {type === 'score' && entry.date && (
                <span className="text-xs text-gray-400">
                  {new Date(entry.date).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
