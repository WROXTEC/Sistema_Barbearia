import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { Logo } from './components/Logo';
import { MainMenu } from './components/MainMenu';
import { ScheduleForm } from './components/ScheduleForm';
import { BarberInfo } from './components/BarberInfo';
import { MyAppointments } from './components/MyAppointments';
import { AdminDashboard } from './components/admin/AdminDashboard';

function AppContent() {
  const { currentView, isAdmin } = useApp();

  console.log('AppContent render - isAdmin:', isAdmin, 'currentView:', currentView);

  if (isAdmin) {
    console.log('Rendering AdminDashboard');
    return <AdminDashboard />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'schedule':
        return <ScheduleForm />;
      case 'info':
        return <BarberInfo />;
      case 'my-appointments':
        return <MyAppointments />;
      default:
        return (
          <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <Logo />
            <MainMenu />
          </div>
        );
    }
  };

  return renderView();
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;