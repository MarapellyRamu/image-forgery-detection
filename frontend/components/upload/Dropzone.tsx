'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileImage, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '../ui/Button';

interface DropzoneProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  disabled?: boolean;
}

export default function Dropzone({ onFileSelect, selectedFile, disabled }: DropzoneProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      onFileSelect(file);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [] },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 1,
    disabled
  });

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={cn(
            "w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 transition-all duration-300 cursor-pointer bg-dark-900/30",
            isDragActive ? "border-primary-500 bg-primary-500/5 shadow-[0_0_30px_rgba(6,182,212,0.15)]" : "border-dark-700 hover:border-primary-500/50 hover:bg-dark-800/50",
            isDragReject && "border-red-500 bg-red-500/5",
            disabled && "opacity-50 cursor-not-allowed pointer-events-none"
          )}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mb-4 shadow-lg">
            <UploadCloud className={cn("w-8 h-8", isDragActive ? "text-primary-400" : "text-dark-400")} />
          </div>
          <p className="text-lg font-semibold text-white text-center mb-1">
            {isDragActive ? "Drop image here..." : "Drag & drop your image"}
          </p>
          <p className="text-sm text-dark-400 text-center">
            or click to browse from your computer
          </p>
          <div className="mt-4 flex gap-2">
            <span className="px-2 py-1 rounded bg-dark-800 text-xs text-dark-300">JPEG</span>
            <span className="px-2 py-1 rounded bg-dark-800 text-xs text-dark-300">PNG</span>
            <span className="px-2 py-1 rounded bg-dark-800 text-xs text-dark-300">Max 10MB</span>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-white/10 group bg-dark-900 flex items-center justify-center">
          {preview && (
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-contain p-2"
            />
          )}
          <div className="absolute inset-0 bg-dark-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <FileImage className="w-6 h-6 text-primary-400" />
              <div className="text-left">
                <p className="text-sm font-medium text-white truncate max-w-[200px]">{selectedFile.name}</p>
                <p className="text-xs text-dark-300">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            <Button variant="danger" size="sm" onClick={removeFile} disabled={disabled}>
              <X className="w-4 h-4 mr-1" /> Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
