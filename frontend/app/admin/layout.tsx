'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../dashboard/layout';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/ui/Spinner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) router.push('/auth/login');
      else if (!isAdmin) router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <Spinner className="w-8 h-8 text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 text-white flex">
      <Sidebar />
      <main className="flex-1 md:pl-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
