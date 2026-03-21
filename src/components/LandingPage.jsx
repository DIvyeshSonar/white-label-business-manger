import React from 'react';
import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { 
  Building2, 
  BarChart3, 
  Users, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Smartphone
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-xl">
                W
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">WhiteLabel CRM</span>
            </div>
            <div className="flex items-center gap-4">
              <SignInButton mode="modal">
                <button className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">
                  Login
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
                  Get Started
                </button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-8 animate-slide-up">
            <span className="flex h-2 w-2 rounded-full bg-primary-600"></span>
            The Ultimate Business Management Suite
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Manage your entire business from <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-600 to-teal-400">one single dashboard.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '200ms' }}>
            Invoicing, inventory, customers, and analytics combined into a powerful, white-labeled solution tailored for your brand.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <SignUpButton mode="modal">
              <button className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-700 hover:shadow-lg hover:-translate-y-0.5 transition-all focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 border-2 border-gray-200 px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all focus:ring-2 focus:ring-gray-200 focus:ring-offset-2">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-32 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Everything you need to scale</h2>
            <p className="mt-4 text-gray-600">Powerful enterprise-grade tools simplified for daily operations.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6 text-primary-600" />}
              title="Real-time Analytics"
              description="Track sales, monitor inventory levels, and analyze revenue trends instantly."
            />
            <FeatureCard 
              icon={<FileText className="w-6 h-6 text-primary-600" />}
              title="Smart Invoicing"
              description="Generate GST-compliant professional invoices with integrated bank and QR details."
            />
            <FeatureCard 
              icon={<Building2 className="w-6 h-6 text-primary-600" />}
              title="Multi-User Support"
              description="Securely isolate data per tenant while managing operations centrally."
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6 text-primary-600" />}
              title="CRM Integration"
              description="Keep track of your suppliers and customers seamlessly from contact to conversion."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-primary-600" />}
              title="Lightning Fast"
              description="Built with modern architecture ensuring zero lag during complex data processing."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6 text-primary-600" />}
              title="Bank-grade Security"
              description="Enterprise-level authentication powered by Clerk protects your data 24/7."
            />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} WhiteLabel Business Manager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;
