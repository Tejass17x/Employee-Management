import React from 'react';
import { Construction } from 'lucide-react';

const PlaceholderPage = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center text-white font-sans animate-fade-in">
      <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
        <Construction size={40} className="text-blue-500" />
      </div>
      <h1 className="text-3xl font-bold mb-3">{title} Page</h1>
      <p className="text-slate-400 max-w-md">
        This module is currently under development. The complete interface for 
        <span className="text-blue-400 font-semibold"> {title} </span> 
        will be connected to the backend soon.
      </p>
    </div>
  );
};

export default PlaceholderPage;