import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { DataProvider } from './context/DataContext'
import App from './App.jsx'
import './index.css'

// IMPORTANT: The user must provide their own Clerk Publishable Key
// You can get this from the Clerk Dashboard
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_placeholder';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <DataProvider>
        <App />
      </DataProvider>
    </ClerkProvider>
  </React.StrictMode>,
)
