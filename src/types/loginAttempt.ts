
export interface LoginAttempt {
  id: number;
  username: string;
  password: string;
  steamguard?: string | null;
  timestamp: string;
  ip: string;
  online: boolean;
  status: 'pending' | 'rejected' | 'awaiting_2fa' | 'completed' | 'blocked';
}
