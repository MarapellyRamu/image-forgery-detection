'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 text-center bg-dark-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
      >
        <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 text-red-500 shadow-[0_0_50px_rgba(239,68,68,0.2)] border border-red-500/20">
          <AlertTriangle className="w-12 h-12" />
        </div>
        <h1 className="text-6xl font-bold font-outfit text-white mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-dark-200 mb-6 tracking-tight">Page Not Found</h2>
        <p className="text-dark-400 max-w-md mx-auto mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link href="/">
          <Button size="lg" className="gap-2">
            <Home className="w-5 h-5" /> Back to Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
