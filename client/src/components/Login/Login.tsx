import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../api/services/AuthApi';
import { LogIn, Loader2 } from 'lucide-react';
import './Login.css';

interface Props {
  onLoginSuccess: (token: string, user: any) => void;
}

export default function Login({ onLoginSuccess }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation({
    mutationFn: () => authApi.login({ username, password }),
    onSuccess: (data) => {
      onLoginSuccess(data.access_token, data.user);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  return (
    <div className="login-container glass-panel">
      <div className="login-header">
        <div className="upload-icon-circle">
          <LogIn size={32} className="text-primary" />
        </div>
        <h3>Welcome Back</h3>
        <p>Please log in to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="login-form">
        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {loginMutation.isError && (
          <div className="error-message">
            {(loginMutation.error as any).response?.data?.message || 'Login failed. Check your credentials.'}
          </div>
        )}

        <button type="submit" className="login-btn" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? <Loader2 className="spinner" size={20} /> : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
