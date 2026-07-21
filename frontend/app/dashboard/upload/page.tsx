'use client';

/**
 * Upload & Detect page.
 *
 * Left panel  — Dropzone + Start Analysis button / UploadProgress
 * Right panel — ResultCard + GradCamViewer (appears after detection)
 *
 * The backend returns:
 *   { id, result, confidence, processing_time, model_used, grad_cam_path }
 * We use the id to call the gradcam and report endpoints.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';
import toast from 'react-hot-toast';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Dropzone from '@/components/upload/Dropzone';
import UploadProgress from '@/components/upload/UploadProgress';
import ResultCard from '@/components/detection/ResultCard';
import GradCamViewer from '@/components/heatmap/GradCamViewer';
import { imagesApi } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────
type ProgressStage =
  | 'uploading'
  | 'preprocessing'
  | 'running_models'
  | 'generating_gradcam'
  | 'complete';

interface PredictionResult {
  id: number;
  result: string;
  confidence: number;
  processing_time: number;
  model_used: string;
  grad_cam_path: string | null; // backend field: null if GradCAM failed
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');
  const [progressStage, setProgressStage] = useState<ProgressStage>('uploading');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<PredictionResult | null>(null);

  // ── Upload + detect handler ─────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select an image first');
      return;
    }

    setStatus('processing');
    setProgress(0);
    setProgressStage('uploading');

    const formData = new FormData();
    formData.append('file', file);

    // Animate through stages while the server request is in-flight
    const stageSchedule: [number, ProgressStage][] = [
      [10, 'uploading'],
      [35, 'preprocessing'],
      [60, 'running_models'],
      [85, 'generating_gradcam'],
    ];
    let lastTarget = 0;
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + 1;
        const stage = stageSchedule.findLast(([t]) => next >= t)?.[1] ?? 'uploading';
        setProgressStage(stage);
        if (next >= 99) clearInterval(interval);
        return Math.min(next, 99);
      });
    }, 80); // ~8 seconds to reach 99 — backend usually replies faster

    try {
      const res = await imagesApi.uploadImage(formData);
      clearInterval(interval);
      setProgress(100);
      setProgressStage('complete');

      setTimeout(() => {
        setResult(res.data as PredictionResult);
        setStatus('done');
      }, 600);
    } catch (err: any) {
      clearInterval(interval);
      const msg = err.response?.data?.detail || 'Analysis failed. Please try again.';
      toast.error(msg);
      setStatus('idle');
      setProgress(0);
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = () => {
    setFile(null);
    setResult(null);
    setStatus('idle');
    setProgress(0);
    setProgressStage('uploading');
  };

  // ── GradCAM URLs ──────────────────────────────────────────────────────────
  // The original image and the GradCAM overlay are served from the backend.
  const gradcamUrl = result?.id
    ? imagesApi.getGradcamUrl(result.id)
    : null;

  const originalImageUrl = result?.id
    ? imagesApi.getImageUrl(
        // We don't have the exact filename here, but we know the pattern from
        // the backend: {user_id}_{timestamp}_{original_filename}
        // Instead, we use the local file blob URL for the original image preview.
        ''
      )
    : null;

  // Use a local blob URL for the "original" panel so auth headers aren't needed.
  const [localPreviewUrl] = useState<string>(() => '');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Update blob URL when file changes
  React.useEffect(() => {
    if (!file) { setPreviewUrl(''); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold font-outfit tracking-tight">Upload &amp; Detect</h1>
        <p className="text-dark-400 mt-1">
          Upload a JPEG or PNG image (max 10 MB) to check it for signs of manipulation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* ── Left Column: Upload ─────────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          <Card title="Image Upload" className="border-white/10 shadow-xl">
            <Dropzone
              onFileSelect={setFile}
              selectedFile={file}
              disabled={status === 'processing'}
            />

            <AnimatePresence mode="wait">
              {status === 'processing' ? (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6"
                >
                  <UploadProgress progress={progress} stage={progressStage} />
                </motion.div>
              ) : status === 'idle' ? (
                <motion.div
                  key="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 flex justify-end"
                >
                  <Button
                    id="start-analysis-btn"
                    size="lg"
                    onClick={handleUpload}
                    disabled={!file}
                    className="w-full sm:w-auto text-lg shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Analysis
                  </Button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </Card>
        </div>

        {/* ── Right Column: Results ──────────────────────────────────── */}
        <AnimatePresence>
          {status === 'done' && result && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-6"
            >
              <ResultCard
                id={result.id}
                result={result.result}
                confidence={result.confidence}
                modelUsed={result.model_used}
                processingTime={result.processing_time}
                onReset={reset}
              />

              {/* GradCAM Viewer — shown even in demo mode (uses random heatmap) */}
              <Card
                title="Explainable AI — GradCAM Analysis"
                className="border-white/10 shadow-xl"
              >
                <p className="text-dark-400 text-sm mb-4">
                  The heatmap highlights regions the model found most suspicious.
                  Red = high attention, blue = low attention.
                </p>
                <GradCamViewer
                  predictionId={result.id}
                  originalFile={file}
                  gradcamUrl={gradcamUrl}
                />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
