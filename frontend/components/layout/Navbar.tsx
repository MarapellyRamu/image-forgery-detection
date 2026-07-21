'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';
import { Menu, X, Shield, LayoutDashboard, User as UserIcon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Don't show navbar on dashboard routes, as they use Sidebar
  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="fixed top-0 inset-x-0 h-16 z-50 glass-card rounded-none border-t-0 border-x-0 border-b border-white/10 bg-dark-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-all">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-outfit font-bold text-xl tracking-tight text-white group-hover:text-primary-400 transition-colors">
            Forgery.ai
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-dark-300 hover:text-white transition-colors">
                Dashboard
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-sm font-medium text-dark-300 hover:text-white transition-colors">
                  Admin
                </Link>
              )}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-dark-300 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-dark-800 border border-white/10 flex items-center justify-center">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  {user?.username}
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 glass-card border-white/10 shadow-xl overflow-hidden"
                    >
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-sm font-medium text-dark-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/auth/signup" className="px-4 py-2 text-sm font-medium rounded-xl bg-white text-dark-950 hover:bg-dark-100 transition-colors">
                Get Started
              </Link>
            </div>
          )}
          <div className="w-px h-6 bg-white/10" />
          <ThemeToggle />
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <ThemeToggle />
          <button onClick={() => setIsOpen(!isOpen)} className="text-white">
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-card rounded-none border-x-0 border-b-0 bg-dark-950/95"
          >
            <div className="px-4 py-4 flex flex-col gap-4">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)} className="text-white font-medium py-2">
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setIsOpen(false)} className="text-white font-medium py-2">
                      Admin
                    </Link>
                  )}
                  <button onClick={() => { logout(); setIsOpen(false); }} className="text-red-400 font-medium py-2 text-left">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setIsOpen(false)} className="text-white font-medium py-2">
                    Sign In
                  </Link>
                  <Link href="/auth/signup" onClick={() => setIsOpen(false)} className="text-primary-400 font-medium py-2">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
