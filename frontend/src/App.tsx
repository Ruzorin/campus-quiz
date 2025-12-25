import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DiscoveryPage } from './pages/DiscoveryPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SetDetailPage } from './pages/SetDetailPage';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { LearningModePage } from './pages/LearningModePage';
import { WriteModePage } from './pages/WriteModePage';
import { MatchModePage } from './pages/MatchModePage';
import { ListeningModePage } from './pages/ListeningModePage';
import { SmartReviewPage } from './pages/SmartReviewPage';
import { SpeedTyperPage } from './pages/SpeedTyperPage';
import { MemoryGamePage } from './pages/MemoryGamePage';
import { SpeakingGamePage } from './pages/SpeakingGamePage';
import { ClassesPage } from './pages/ClassesPage';
import { ClassDetailPage } from './pages/ClassDetailPage';
import { DuelGamePage } from './pages/DuelGamePage';
import { PlayPage } from './pages/PlayPage';

import { useAuthStore } from './context/useAuthStore';

// MSAL
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./authConfig";

import { SocketProvider } from './context/SocketContext';

const msalInstance = new PublicClientApplication(msalConfig);

// Placeholder for protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  const { login, setError } = useAuthStore();
  // Initialize 'processing' if we see a token in the URL to prevent ProtectedRoute from redirecting immediately
  const [isProcessingAuth, setIsProcessingAuth] = React.useState(() => {
    return !!new URLSearchParams(window.location.search).get('token');
  });

  // Global Auth Handler for OAuth Redirects
  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');
    const username = searchParams.get('username');
    const errorMsg = searchParams.get('error');

    if (token && username) {
      console.log("OAuth Token Detected. Logging in...");

      // Extract ID from mock token if possible (Resilience against backend lag)
      let userId = 0;
      if (token.startsWith('mock_jwt_token_')) {
        const extractedId = parseInt(token.replace('mock_jwt_token_', ''), 10);
        if (!isNaN(extractedId)) userId = extractedId;
      }

      // Decode and Login
      const mockUser = {
        id: userId, // Use extracted ID! 
        username: decodeURIComponent(username),
        email: 'user@emu.edu.tr',
        xp: 0,
        level: 1,
        streak: 0
      };

      login(token, mockUser as any);

      // Clean URL but keep the user on the home page (dashboard)
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (errorMsg) {
      console.error("Auth Error:", errorMsg);
      setError("Authentication failed. Please try again.");
    }

    // Auth processing done
    setIsProcessingAuth(false);
  }, [login, setError]);

  // Restore session on mount
  const { checkAuth } = useAuthStore();
  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isProcessingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <MsalProvider instance={msalInstance}>
      <SocketProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar />
            <main>
              <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route path="/" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />

                <Route path="/sets/:id" element={
                  <ProtectedRoute>
                    <SetDetailPage />
                  </ProtectedRoute>
                } />

                <Route path="/sets/:id/flashcards" element={
                  <ProtectedRoute>
                    <FlashcardsPage />
                  </ProtectedRoute>
                } />

                <Route path="/sets/:id/learn" element={
                  <ProtectedRoute>
                    <LearningModePage />
                  </ProtectedRoute>
                } />

                <Route path="/sets/:id/write" element={
                  <ProtectedRoute>
                    <WriteModePage />
                  </ProtectedRoute>
                } />

                <Route path="/sets/:id/match" element={
                  <ProtectedRoute>
                    <MatchModePage />
                  </ProtectedRoute>
                } />

                <Route path="/sets/:id/listening" element={
                  <ProtectedRoute>
                    <ListeningModePage />
                  </ProtectedRoute>
                } />

                <Route path="/sets/:id/typer" element={
                  <ProtectedRoute>
                    <SpeedTyperPage />
                  </ProtectedRoute>
                } />

                <Route path="/sets/:id/memory" element={
                  <ProtectedRoute>
                    <MemoryGamePage />
                  </ProtectedRoute>
                } />

                <Route path="/sets/:id/speaking" element={
                  <ProtectedRoute>
                    <SpeakingGamePage />
                  </ProtectedRoute>
                } />

                <Route path="/classes" element={
                  <ProtectedRoute>
                    <ClassesPage />
                  </ProtectedRoute>
                } />

                <Route path="/play" element={
                  <ProtectedRoute>
                    <PlayPage />
                  </ProtectedRoute>
                } />

                <Route path="/classes/:id" element={
                  <ProtectedRoute>
                    <ClassDetailPage />
                  </ProtectedRoute>
                } />

                <Route path="/settings" element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } />

                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />

                <Route path="/smart-review" element={
                  <ProtectedRoute>
                    <SmartReviewPage />
                  </ProtectedRoute>
                } />
                <Route path="/sets" element={
                  <ProtectedRoute>
                    <div>My Sets Page (TODO)</div>
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </SocketProvider>
    </MsalProvider>
  );
}

export default App;
