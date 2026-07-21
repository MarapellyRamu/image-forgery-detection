'use client';

/**
 * GradCamViewer — three-panel comparison viewer.
 *
 * Displays:
 *   1. Original uploaded image (from local File blob)
 *   2. GradCAM heatmap overlay (fetched from backend via authenticated API call)
 *
 * The GradCAM image requires a JWT bearer token which normal <img src> tags
 * can't send.  We fetch it as a blob and convert to an object URL instead.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Download, Maximize2, ImageOff } from 'lucide-react';
import Button from '../ui/Button';
import { imagesApi } from '@/lib/api';
import Spinner from '../ui/Spinner';

interface GradCamViewerProps {
  /** Database prediction ID — used to call /api/images/gradcam/{id}. */
  predictionId: number;
  /** The original File object so we can show a local preview without re-fetching. */
  originalFile: File | null;
  /** Pre-built URL string for the gradcam endpoint (may include token). */
  gradcamUrl: string | null;
}

type Panel = 'original' | 'gradcam';

export default function GradCamViewer({ predictionId, originalFile, gradcamUrl }: GradCamViewerProps) {
  const [activePanel, setActivePanel] = useState<Panel>('gradcam');
  const [originalBlobUrl, setOriginalBlobUrl] = useState<string>('');
  const [gradcamBlobUrl, setGradcamBlobUrl] = useState<string>('');
  const [gradcamLoading, setGradcamLoading] = useState(true);
  const [gradcamError, setGradcamError] = useState(false);

  // ── Build original image blob URL from the File object ──────────────────
  useEffect(() => {
    if (!originalFile) return;
    const url = URL.createObjectURL(originalFile);
    setOriginalBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [originalFile]);

  // ── Fetch GradCAM image as blob (needs auth header) ─────────────────────
  useEffect(() => {
    if (!predictionId) return;
    let revoke = '';
    setGradcamLoading(true);
    setGradcamError(false);

    imagesApi.getGradcam(predictionId)
      .then((res) => {
        const url = URL.createObjectURL(new Blob([res.data], { type: 'image/png' }));
        revoke = url;
        setGradcamBlobUrl(url);
      })
      .catch(() => setGradcamError(true))
      .finally(() => setGradcamLoading(false));

    return () => { if (revoke) URL.revokeObjectURL(revoke); };
  }, [predictionId]);

  // ── Current image to display ─────────────────────────────────────────────
  const currentUrl = activePanel === 'original' ? originalBlobUrl : gradcamBlobUrl;

  const handleDownload = () => {
    if (!currentUrl) return;
    const a = document.createElement('a');
    a.href = currentUrl;
    a.download = `forgery-${activePanel}-${predictionId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const panels: { id: Panel; label: string }[] = [
    { id: 'original', label: 'Original' },
    { id: 'gradcam',  label: 'GradCAM Overlay' },
  ];

  return (
    <div className="w-full flex flex-col gap-4">
      {/* ── Tab Switcher ──────────────────────────────────────────────── */}
      <div className="flex p-1 bg-dark-900/80 rounded-xl border border-white/10 w-fit mx-auto">
        {panels.map(({ id, label }) => (
          <button
            key={id}
            id={`gradcam-tab-${id}`}
            onClick={() => setActivePanel(id)}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
              activePanel === id
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30'
                : 'text-dark-300 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Image Viewer ─────────────────────────────────────────────── */}
      <div className="relative w-full aspect-video bg-dark-950 rounded-2xl overflow-hidden border border-white/10 group">
        {/* Loading state for GradCAM */}
        {activePanel === 'gradcam' && gradcamLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-dark-400">
            <Spinner size="lg" />
            <span className="text-sm">Loading GradCAM heatmap…</span>
          </div>
        )}

        {/* Error state */}
        {activePanel === 'gradcam' && gradcamError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-dark-400">
            <ImageOff className="w-10 h-10" />
            <span className="text-sm">GradCAM not available for this prediction</span>
          </div>
        )}

        {/* Image */}
        {currentUrl && (
          <img
            src={currentUrl}
            alt={`${activePanel} view for prediction ${predictionId}`}
            className="w-full h-full object-contain"
          />
        )}

        {/* Action buttons overlay */}
        {currentUrl && (
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="bg-dark-900/80 backdrop-blur-md border border-white/10 p-2"
              onClick={handleDownload}
              title="Download image"
            >
              <Download className="w-4 h-4 text-white" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="bg-dark-900/80 backdrop-blur-md border border-white/10 p-2"
              onClick={() => window.open(currentUrl, '_blank')}
              title="Open full-size"
            >
              <Maximize2 className="w-4 h-4 text-white" />
            </Button>
          </div>
        )}
      </div>

      <p className="text-xs text-dark-400 text-center">
        GradCAM heatmap highlights the image regions most influential to the model's decision.
        Warmer colors (red/yellow) indicate higher suspicion of manipulation.
      </p>
    </div>
  );
}
