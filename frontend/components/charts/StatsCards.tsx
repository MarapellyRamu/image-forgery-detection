'use client';

import React from 'react';
import Card from '../ui/Card';
import { Upload, ShieldCheck, AlertTriangle, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsProps {
  total: number;
  authentic: number;
  forged: number;
}

export default function StatsCards({ total, authentic, forged }: StatsProps) {
  const rate = total > 0 ? ((forged / total) * 100).toFixed(1) : '0';

  const stats = [
    { label: 'Total Uploads', value: total, icon: Upload, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Authentic', value: authentic, icon: ShieldCheck, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Forged', value: forged, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Detection Rate', value: `${rate}%`, icon: Activity, color: 'text-primary-400', bg: 'bg-primary-500/10' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card key={i} className="p-4 flex flex-row items-center gap-4 hover:border-white/20 transition-colors">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-dark-400">{stat.label}</p>
              <h3 className="text-2xl font-bold font-outfit text-white">{stat.value}</h3>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
