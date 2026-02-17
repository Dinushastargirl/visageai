
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6 px-4 bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">VisageAI</h1>
        </div>
        <nav className="hidden md:flex gap-6">
          <span className="text-sm font-medium text-slate-500 hover:text-blue-600 cursor-pointer transition-colors">How it works</span>
          <span className="text-sm font-medium text-slate-500 hover:text-blue-600 cursor-pointer transition-colors">Privacy</span>
        </nav>
      </div>
    </header>
  );
};

export default Header;
