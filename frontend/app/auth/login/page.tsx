'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    try {
      // authApi.login handles URLSearchParams encoding internally
      const response = await authApi.login(email, password);
      const token = response.data.access_token;

      // Temporarily store token so the getMe() call can use it via interceptor
      localStorage.setItem('forgery_token', token);
      const meRes = await authApi.getMe();

      login(token, meRes.data);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid credentials');
      localStorage.removeItem('forgery_token');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-dark-950">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px]" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/20 mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-outfit text-white tracking-tight">Welcome Back</h1>
          <p className="text-dark-400 mt-2">Sign in to your Forgery.ai account</p>
        </div>

        <Card className="p-8 border-white/10 shadow-2xl backdrop-blur-2xl bg-dark-900/60">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-dark-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            <div className="flex justify-end">
              <a href="#" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">Forgot password?</a>
            </div>

            <Button type="submit" loading={isLoading} className="w-full mt-2">
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-dark-400">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Sign up
            </Link>
          </div>
        </Card>

        {/* Demo Credentials Hint */}
        <div className="mt-8 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 text-sm text-primary-200 backdrop-blur-sm text-center">
          <p className="font-semibold mb-1">Demo Credentials:</p>
          <p>Admin: admin@forgery.ai / Admin@123</p>
        </div>
      </motion.div>
    </div>
  );
}
