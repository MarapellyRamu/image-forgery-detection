'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Upload, History, Shield, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const { isAdmin, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload & Detect', href: '/dashboard/upload', icon: Upload },
    { name: 'History', href: '/dashboard/history', icon: History },
  ];

  if (isAdmin) {
    links.push({ name: 'Admin Panel', href: '/admin', icon: Shield });
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 256 }}
      className="fixed inset-y-0 left-0 z-40 bg-dark-950/80 backdrop-blur-xl border-r border-white/10 flex flex-col hidden md:flex"
    >
      <div className="h-16 flex items-center px-4 border-b border-white/10 relative">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 group flex-grow overflow-hidden whitespace-nowrap">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/20 shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-outfit font-bold text-xl tracking-tight text-white group-hover:text-primary-400 transition-colors">
              Forgery.ai
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </Link>
        )}
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "absolute -right-3 top-5 w-6 h-6 rounded-full bg-dark-800 border border-white/10 flex items-center justify-center text-dark-300 hover:text-white transition-colors",
            collapsed && "right-2 top-5 relative"
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-3">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group whitespace-nowrap",
                isActive 
                  ? "bg-primary-500/10 text-primary-400 border border-primary-500/20" 
                  : "text-dark-300 hover:bg-white/5 hover:text-white"
              )}
              title={collapsed ? link.name : undefined}
            >
              <Icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary-400")} />
              {!collapsed && <span className="font-medium">{link.name}</span>}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full whitespace-nowrap"
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
