'use client';

import React from 'react';
import { FileText, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, formatConfidence } from '@/lib/utils';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useRouter } from 'next/navigation';
import { imagesApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface ResultCardProps {
  id: number;            // database prediction ID
  result: string;        // 'authentic' | 'forged'
  confidence: number;    // 0.0 – 1.0
  modelUsed: string;
  processingTime: number;
  onReset: () => void;
}

export default function ResultCard({ id, result, confidence, modelUsed, processingTime, onReset }: ResultCardProps) {
  const isAuthentic = result.toLowerCase() === 'authentic';
  const router = useRouter();

  const handleDownloadReport = async () => {
    try {
      const res = await imagesApi.downloadReport(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to download report');
    }
  };

  return (
    <Card className={cn("relative overflow-hidden border-t-4", isAuthentic ? "border-t-green-500" : "border-t-red-500")}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-current opacity-5 blur-2xl pointer-events-none" 
           style={{ color: isAuthentic ? '#22c55e' : '#ef4444' }} />
           
      <div className="flex flex-col items-center text-center py-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-xl",
            isAuthentic ? "bg-green-500/20 text-green-500 shadow-green-500/20" : "bg-red-500/20 text-red-500 shadow-red-500/20"
          )}
        >
          {isAuthentic ? <ShieldCheck className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
        </motion.div>
        
        <h2 className="text-3xl font-bold font-outfit text-white mb-2 tracking-tight">
          {result.charAt(0).toUpperCase() + result.slice(1).toLowerCase()}
        </h2>
        
        <div className="flex items-center gap-2 mb-6">
          <span className="text-dark-300 text-sm">Confidence:</span>
          <span className={cn("font-bold text-lg", isAuthentic ? "text-green-400" : "text-red-400")}>
            {formatConfidence(confidence)}
          </span>
        </div>

        <div className="w-full grid grid-cols-2 gap-4 mb-8 text-left">
          <div className="bg-dark-900/50 rounded-xl p-3 border border-white/5">
            <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">Model Used</p>
            <p className="text-sm font-medium text-white">{modelUsed}</p>
          </div>
          <div className="bg-dark-900/50 rounded-xl p-3 border border-white/5">
            <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">Processing Time</p>
            <p className="text-sm font-medium text-white">{processingTime.toFixed(2)}s</p>
          </div>
        </div>

        <div className="flex flex-col w-full gap-3">
          <Button variant="secondary" className="w-full flex items-center justify-center gap-2" onClick={handleDownloadReport}>
            <FileText className="w-4 h-4" /> Download PDF Report
          </Button>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1 bg-dark-800/50 border border-white/5" onClick={() => router.push('/dashboard/history')}>
              View History
            </Button>
            <Button variant="primary" className="flex-1" onClick={onReset}>
              <RotateCcw className="w-4 h-4 mr-2" /> New Upload
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
