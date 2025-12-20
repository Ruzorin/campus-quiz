import React from 'react';
import { School, ArrowRight, Loader } from 'lucide-react';
import MicrosoftLoginButton from '../components/MicrosoftLoginButton';
import { useAuthStore } from '../context/useAuthStore';

import { useNavigate } from 'react-router-dom';

// Design Improvement: Glassmorphism and Gradients
export const LoginPage: React.FC = () => {
  const { isLoading, error, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex text-gray-900 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 font-sans overflow-hidden relative">
      {/* Decorative Orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-10 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="m-auto z-10 p-8">
        <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl p-10 max-w-md w-full text-center space-y-8">

          <div className="space-y-2">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg mb-4">
              <School className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Campus<span className="text-indigo-600">Quiz</span>
            </h1>
            <p className="text-gray-500">
              Connect with your classmates and master your courses.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            {error && (
              <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-center justify-center">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center p-4">
                <Loader className="animate-spin h-8 w-8 text-indigo-600" />
              </div>
            ) : (
              <MicrosoftLoginButton className="transform transition-transform hover:-translate-y-1 shadow-md hover:shadow-lg" />
            )}

            <p className="text-xs text-gray-400 mt-4">
              Restricted to <span className="font-semibold text-gray-500">@emu.edu.tr</span> accounts only.
            </p>
          </div>

        </div>
        <div className="mt-8 text-white/80 text-sm text-center font-light">
          &copy; 2025 Class Learning Platform. Built for Students.
        </div>
      </div>

      {/* CSS Animation for blobs */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};
