'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Cpu, Layers, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadProgressProps {
  progress: number;
  stage: 'uploading' | 'preprocessing' | 'running_models' | 'generating_gradcam' | 'complete';
}

export default function UploadProgress({ progress, stage }: UploadProgressProps) {
  const stages = [
    { id: 'uploading', label: 'Uploading Image...', icon: UploadCloud },
    { id: 'preprocessing', label: 'Preprocessing...', icon: Layers },
    { id: 'running_models', label: 'Running AI Models...', icon: Cpu },
    { id: 'generating_gradcam', label: 'Generating GradCAM...', icon: Layers },
    { id: 'complete', label: 'Analysis Complete!', icon: CheckCircle2 },
  ];

  const currentStageIndex = stages.findIndex(s => s.id === stage);
  const CurrentIcon = stages[currentStageIndex]?.icon || UploadCloud;

  return (
    <div className="w-full glass-card p-6 border-primary-500/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center border border-primary-500/30 text-primary-400">
            <CurrentIcon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-semibold text-white">{stages[currentStageIndex]?.label}</h4>
            <p className="text-xs text-primary-400 font-medium">Please wait while we process your image</p>
          </div>
        </div>
        <div className="text-2xl font-bold text-white tracking-tighter">
          {Math.round(progress)}%
        </div>
      </div>
      
      <div className="w-full h-3 bg-dark-800 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-primary-600 to-primary-400 relative"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "linear", duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]" />
        </motion.div>
      </div>
      
      <div className="flex justify-between mt-4">
        {stages.map((s, idx) => (
          <div key={s.id} className="flex flex-col items-center gap-1">
            <div className={cn(
              "w-2 h-2 rounded-full transition-colors duration-500",
              idx < currentStageIndex ? "bg-primary-500" : 
              idx === currentStageIndex ? "bg-primary-400 shadow-[0_0_10px_#06b6d4]" : "bg-dark-700"
            )} />
          </div>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide { from { background-position: 20px 0; } to { background-position: 0 0; } }
      `}} />
    </div>
  );
}
