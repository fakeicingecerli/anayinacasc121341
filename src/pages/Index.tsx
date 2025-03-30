
import React from 'react';
import SteamLoginForm from '../components/SteamLoginForm';
import SteamBackground from '../components/SteamBackground';
import SteamHeader from '../components/SteamHeader';
import ValveFooter from '../components/ValveFooter';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col relative bg-steam-darkBlue text-white">
      <SteamBackground />
      
      <SteamHeader />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl space-y-8">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-medium text-white mb-2">Steam Giriş</h1>
          </div>
          
          {/* Login Form */}
          <div className="bg-[#171a21]/70 backdrop-blur-sm p-6 rounded-md shadow-lg animate-fade-in">
            <SteamLoginForm />
          </div>
        </div>
      </main>
      
      <ValveFooter />
    </div>
  );
};

export default Index;
