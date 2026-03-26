import React, { useState } from 'react';
import { UserButton } from "@clerk/react";
import Dashboard from './Dashboard';
import Inventory from './Inventory';
import InvoiceGenerator from './InvoiceGenerator';
import Suppliers from './Suppliers';
import Customers from './Customers';
import Reports from './Reports';
import Settings from './Settings';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  Users, 
  CreditCard, 
  BarChart, 
  Settings as SettingsIcon,
  Menu,
  X
} from 'lucide-react';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');

  const navigation = [
    { name: 'Dashboard', id: 'dashboard', icon: LayoutDashboard },
    { name: 'Inventory', id: 'inventory', icon: Package },
    { name: 'Suppliers', id: 'suppliers', icon: Truck },
    { name: 'Customers', id: 'customers', icon: Users },
    { name: 'Transactions', id: 'transactions', icon: CreditCard },
    { name: 'Reports', id: 'reports', icon: BarChart },
    { name: 'Settings', id: 'settings', icon: SettingsIcon },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const renderView = () => {
    switch(currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory />;
      case 'transactions':
        return <InvoiceGenerator />;
      case 'suppliers':
        return <Suppliers />;
      case 'customers':
        return <Customers />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">{currentView} View Placeholder</h2>
            </div>
            <div className="card-body">
              <p className="text-gray-600">This section ({currentView}) is currently under construction in React.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar Desktop & Mobile */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">W</div>
            <span className="text-xl font-bold tracking-tight text-gray-900">WLBM</span>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-gray-500 hover:text-gray-900">
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon size={20} className={isActive ? 'text-primary-600' : 'text-gray-400'} />
                {item.name}
              </button>
            );
          })}
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-x-4 border-b border-gray-100 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 capitalize hidden sm:block">
              {currentView}
            </h1>
          </div>
          
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
          </div>
        </header>

        {/* Dynamic View Content */}
        <div className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          {renderView()}
        </div>
      </main>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
