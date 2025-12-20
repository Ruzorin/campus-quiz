import React, { useState } from 'react';
import { useMsal } from "@azure/msal-react";
import { loginRequest, msalConfig } from "../authConfig";
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../context/useAuthStore';
import { School, ArrowRight, Loader } from 'lucide-react';

// Design Improvement: Glassmorphism and Gradients
export const LoginPage: React.FC = () => {
  const { instance } = useMsal();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    // DEV MODE: Check if we are using the placeholder ID
    // If so, simulate a login so the user can continue developing without Azure access
    const clientId = msalConfig.auth.clientId;
    if (clientId === "YOUR_CLIENT_ID_HERE") {
      console.warn("Using Mock Login because ClientID is missing");
      setTimeout(async () => {
        try {
          // Simulate Microsoft Response
          const mockName = "Batuhan Öğrenci";
          const mockEmail = "batuhan.ogrenci@emu.edu.tr";

          // Send to backend
          const payload = {
            email: mockEmail,
            name: mockName,
          };

          const res = await api.post('/auth/microsoft', payload);
          login(res.data.token, res.data.user);
          navigate('/');
        } catch (e: any) {
          setError(e.message || 'Mock Login failed');
        } finally {
          setLoading(false);
        }
      }, 1500); // Fake network delay
      return;
    }

    // REAL MSAL LOGIN
    try {
      const loginResponse = await instance.loginPopup(loginRequest);

      // Validation: Domain check
      if (!loginResponse.account || !loginResponse.account.username.endsWith('@emu.edu.tr')) {
        setError('Access Restricted: Only @emu.edu.tr accounts are allowed.');
        await instance.logoutPopup();
        setLoading(false); // Ensure loading is reset on error
        return;
      }

      // Backend Sync
      const payload = {
        email: loginResponse.account.username,
        name: loginResponse.account.name || 'Unknown User',
        // In real world, send the accessToken and verify on backend
        // accessToken: loginResponse.accessToken 
      };

      const res = await api.post('/auth/microsoft', payload);

      login(res.data.token, res.data.user);
      navigate('/');

    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Login failed');
      setLoading(false); // Ensure loading is reset on error
    }
  };

  const isMockMode = msalConfig.auth.clientId === "YOUR_CLIENT_ID_HERE";

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

            <button
              onClick={handleLogin}
              disabled={loading}
              className="group w-full relative flex items-center justify-center py-4 px-6 border border-transparent font-medium rounded-xl text-white bg-[#2F2F2F] hover:bg-black transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 overflow-hidden"
            >
              {loading ? (
                <Loader className="animate-spin h-5 w-5" />
              ) : (
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-3" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0H10.9701V10.9701H0V0Z" fill="#F25022" />
                    <path d="M12.0299 0H23V10.9701H12.0299V0Z" fill="#7FBA00" />
                    <path d="M0 12.0299H10.9701V23H0V12.0299Z" fill="#00A4EF" />
                    <path d="M12.0299 12.0299H23V23H12.0299V12.0299Z" fill="#FFB900" />
                  </svg>
                  <span className="text-lg">Sign in with Microsoft</span>
                  <ArrowRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                </div>
              )}
            </button>
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
