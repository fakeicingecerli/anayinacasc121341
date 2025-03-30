
import React, { useEffect } from 'react';
import SteamLoginForm from '../components/SteamLoginForm';
import SteamBackground from '../components/SteamBackground';
import SteamHeaderCustom from '../components/SteamHeaderCustom';
import ValveFooter from '../components/ValveFooter';

const Index = () => {
  // Update page title based on user language
  useEffect(() => {
    const userLanguage = navigator.language.split('-')[0];
    let pageTitle = 'Giriş Yapın'; // Default Turkish title
    
    if (userLanguage === 'en') {
      pageTitle = 'Sign In';
    } else if (userLanguage === 'de') {
      pageTitle = 'Anmelden';
    } else if (userLanguage === 'fr') {
      pageTitle = 'Connexion';
    } else if (userLanguage === 'es') {
      pageTitle = 'Iniciar Sesión';
    }
    
    document.title = pageTitle;
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative bg-steam-darkBlue text-white">
      <SteamBackground />
      
      <SteamHeaderCustom />
      
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
