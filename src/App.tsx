import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkoutProvider } from './context/WorkoutContext';
import type { TabType } from './types';

// Componentes
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { HomePage } from './components/home/HomePage';
import { RoutinesPage } from './components/routines/RoutinesPage';
import { ExercisesPage } from './components/exercises/ExercisesPage';
import { HistoryPage } from './components/history/HistoryPage';
import { ProfilePage } from './components/profile/ProfilePage';
import { ActiveWorkoutPage } from './components/workout/ActiveWorkoutPage';

const AppContent: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('home');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
            A carregar Registo de Treinos...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="iphone-viewport shadow-2xl">
      {/* Top Header Apple iPhone 15 Pro */}
      <Header />

      {/* Main Content Area mobile-first */}
      <main className="flex-1">
        {activeTab === 'home' && <HomePage setActiveTab={setActiveTab} />}
        {activeTab === 'routines' && <RoutinesPage setActiveTab={setActiveTab} />}
        {activeTab === 'exercises' && <ExercisesPage />}
        {activeTab === 'history' && <HistoryPage />}
        {activeTab === 'profile' && <ProfilePage />}
        {activeTab === 'active_workout' && <ActiveWorkoutPage setActiveTab={setActiveTab} />}
      </main>

      {/* Bottom Floating Dynamic Navigation Bar */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <AppContent />
      </WorkoutProvider>
    </AuthProvider>
  );
};

export default App;
