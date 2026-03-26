import React from 'react';
import { ClerkProvider, Show, UserButton, useClerk } from "@clerk/react";
import { useData } from './context/DataContext';
import LandingPage from './components/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import SetupWizard from './components/SetupWizard';

function App() {
  const { store, updateBusinessInfo } = useData();
  const isSetupComplete = store.businessInfo.setupComplete;

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-background antialiased">
      <Show when="signed-out">
        <LandingPage />
      </Show>
      <Show when="signed-in">
        {isSetupComplete ? (
          <DashboardLayout />
        ) : (
          <SetupWizard onComplete={(data) => updateBusinessInfo(data)} />
        )}
      </Show>
    </div>
  );
}

export default App;
