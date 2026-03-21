import React from 'react';
import { ClerkProvider, SignedIn, SignedOut, UserButton, useClerk } from "@clerk/clerk-react";
import { useData } from './context/DataContext';
import LandingPage from './components/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import SetupWizard from './components/SetupWizard';

function App() {
  const { store, updateBusinessInfo } = useData();
  const isSetupComplete = store.businessInfo.setupComplete;

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-background antialiased">
      <SignedOut>
        <LandingPage />
      </SignedOut>

      <SignedIn>
        {isSetupComplete ? (
          <DashboardLayout />
        ) : (
          <SetupWizard onComplete={(data) => updateBusinessInfo(data)} />
        )}
      </SignedIn>
    </div>
  );
}

export default App;
