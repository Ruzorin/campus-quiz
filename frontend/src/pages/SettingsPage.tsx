import React, { useState, useEffect } from 'react';
import { Volume2, Moon, Sun, Monitor, Bell, User, Check, X } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  // Mock state for settings (persistence would likely use localStorage + Context)
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [notifications, setNotifications] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(''); // Would come from user profile
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSound = localStorage.getItem('soundEnabled');
    if (savedSound !== null) setSoundEnabled(savedSound === 'true');
    // Theme logic would go here
  }, []);

  const handleSave = () => {
    localStorage.setItem('soundEnabled', String(soundEnabled));
    // Save other settings...
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="space-y-6">
        {/* Appearance Section */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-indigo-600" />
            Appearance
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${theme === 'light' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <Sun className="w-6 h-6" />
              <span className="font-medium">Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${theme === 'dark' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <Moon className="w-6 h-6" />
              <span className="font-medium">Dark</span>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${theme === 'system' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <Monitor className="w-6 h-6" />
              <span className="font-medium">System</span>
            </button>
          </div>
        </section>

        {/* Sound & Notifications */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-pink-600" />
            Preferences
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Sound Effects</h3>
                  <p className="text-sm text-gray-500">Play sounds during quizzes and games</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
              </label>
            </div>

            <div className="border-t border-gray-100 pt-4 flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-500">Reminders for assignments and streaks</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Profile Helper Stub */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-green-600" />
            Profile Settings
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
              <User className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/me.jpg"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95"
          >
            {isSaved ? <Check className="w-5 h-5" /> : null}
            {isSaved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
};
