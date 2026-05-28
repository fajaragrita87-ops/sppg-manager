import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdminStore } from '../../store/superAdminStore';
import { Shield, Mail, Lock, KeyRound } from 'lucide-react';

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const { signIn, isLoading } = useSuperAdminStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password || !otp) {
      setError('Harap isi semua field');
      return;
    }

    const result = await signIn(email, password, otp);
    
    if (result.error) {
      setError(result.error);
    } else {
      navigate('/superadmin');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1e293b] rounded-2xl shadow-2xl border border-[#334155] p-8">
        <h1 className="text-2xl font-bold text-white text-center mb-6">Super Admin Login</h1>
        
        {error && (
          <div className="bg-rose-500/10 text-rose-400 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm mb-1">Email</label>
            <input 
              type="email" 
              className="w-full bg-[#0f172a] border border-[#334155] text-white rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sppg.com"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-[#0f172a] border border-[#334155] text-white rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-1">2FA Code</label>
            <input 
              type="text" 
              className="w-full bg-[#0f172a] border border-[#334155] text-white rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 font-mono"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg mt-4"
          >
            {isLoading ? 'Loading...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
