import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DiscoveryPage } from './pages/DiscoveryPage';
import { SettingsPage } from './pages/SettingsPage';
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
