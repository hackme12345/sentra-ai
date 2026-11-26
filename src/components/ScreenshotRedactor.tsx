import { useCallback, useEffect, useRef, useState } from 'react';
import { Eraser, EyeOff, Grid2x2, RotateCcw, ShieldCheck, Square } from 'lucide-react';

type MaskMode = 'blackout' | 'pixelate';

interface MaskRect {
  /** Normalized coordinates (0..1 relative to image natural dimensions) */
  x: number;
  y: number;
  w: number;
  h: number;
  mode: MaskMode;
}

interface ScreenshotRedactorProps {
  imageUrl: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  onRedactedChange: (
    base64: string | null,
    actualMimeType: 'image/jpeg' | 'image/png' | 'image/webp',
    maskCount: number
  ) => void;
}

export function ScreenshotRedactor({
  imageUrl,
  mimeType,
  onRedactedChange,
}: ScreenshotRedactorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [mode, setMode] = useState<MaskMode>('blackout');
  const [masks, setMasks] = useState<MaskRect[]>([]);
  const [draftRect, setDraftRect] = useState<MaskRect | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Store start pointer in normalized coords
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const renderCanvas = useCallback(
    (currentMasks: MaskRect[], activeDraft: MaskRect | null, emitExport: boolean) => {
      const canvas = canvasRef.current;
      const img = imgRef.current;
      if (!canvas || !img || !img.naturalWidth || !img.naturalHeight) return;

      const natW = img.naturalWidth;
      const natH = img.naturalHeight;

      if (canvas.width !== natW || canvas.height !== natH) {
        canvas.width = natW;
        canvas.height = natH;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, natW, natH);
      ctx.drawImage(img, 0, 0, natW, natH);

      const drawMask = (rect: MaskRect, isDraft: boolean) => {
        const px = Math.round(rect.x * natW);
        const py = Math.round(rect.y * natH);
        const pw = Math.max(4, Math.round(rect.w * natW));
        const ph = Math.max(4, Math.round(rect.h * natH));

        if (rect.mode === 'blackout') {
          ctx.fillStyle = '#050912';
          ctx.fillRect(px, py, pw, ph);

          ctx.strokeStyle = isDraft ? '#22D3EE' : 'rgba(34, 211, 238, 0.45)';
          ctx.lineWidth = Math.max(2, Math.round(natW / 400));
          ctx.strokeRect(px, py, pw, ph);
        } else {
          // Pixelate / mosaic blur region directly onto canvas
          const blockSize = Math.max(10, Math.round(Math.min(natW, natH) / 48));
          const tempCanvas = document.createElement('canvas');
          const smallW = Math.max(1, Math.ceil(pw / blockSize));
          const smallH = Math.max(1, Math.ceil(ph / blockSize));
          tempCanvas.width = smallW;
          tempCanvas.height = smallH;
          const tempCtx = tempCanvas.getContext('2d');
          if (tempCtx) {
            tempCtx.drawImage(img, px, py, pw, ph, 0, 0, smallW, smallH);
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(tempCanvas, 0, 0, smallW, smallH, px, py, pw, ph);
            ctx.restore();
          }

          ctx.strokeStyle = isDraft ? '#22D3EE' : 'rgba(52, 211, 153, 0.55)';
          ctx.lineWidth = Math.max(2, Math.round(natW / 400));
          ctx.strokeRect(px, py, pw, ph);
        }
      };

      for (const rect of currentMasks) {
        drawMask(rect, false);
      }
      if (activeDraft) {
        drawMask(activeDraft, true);
      }

      if (emitExport) {
        if (currentMasks.length === 0) {
          onRedactedChange(null, mimeType, 0);
          return;
        }
        const preferredMime = mimeType === 'image/png' ? 'image/png' : 'image/jpeg';
        const exportQuality = preferredMime === 'image/jpeg' ? 0.88 : undefined;
        const dataUrl = canvas.toDataURL(preferredMime, exportQuality);
        const headerMatch = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,/);
        const actualMime = (headerMatch?.[1] as 'image/jpeg' | 'image/png' | 'image/webp') || 'image/png';
        const base64Part = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
        if (base64Part) {
          onRedactedChange(base64Part, actualMime, currentMasks.length);
        }
      }
    },
    [mimeType, onRedactedChange]
  );

  // Load image into memory whenever imageUrl changes
  useEffect(() => {
    setMasks([]);
    setDraftRect(null);
    setImgLoaded(false);

    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
    };
    img.src = imageUrl;

    return () => {
      imgRef.current = null;
    };
  }, [imageUrl]);

  // Re-render when masks change or image finishes loading
  useEffect(() => {
    if (!imgLoaded) return;
    renderCanvas(masks, draftRect, !draftRect);
  }, [imgLoaded, masks, draftRect, renderCanvas]);

  const getNormalizedPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = getNormalizedPoint(e);
    dragStartRef.current = pt;
    setDraftRect({ x: pt.x, y: pt.y, w: 0, h: 0, mode });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const start = dragStartRef.current;
    if (!start) return;
    const pt = getNormalizedPoint(e);
    const x = Math.min(start.x, pt.x);
    const y = Math.min(start.y, pt.y);
    const w = Math.abs(pt.x - start.x);
    const h = Math.abs(pt.y - start.y);
    setDraftRect({ x, y, w, h, mode });
  };

  const handlePointerUp = () => {
    const start = dragStartRef.current;
    dragStartRef.current = null;
    if (!start || !draftRect) {
      setDraftRect(null);
      return;
    }

    // Require minimum drag size (> 1.2% of dimension) so accidental clicks don't leave tiny dots
    if (draftRect.w > 0.012 && draftRect.h > 0.012) {
      setMasks((prev) => [...prev, draftRect]);
    }
    setDraftRect(null);
  };

  const handleUndo = () => {
    setMasks((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setMasks([]);
  };

  return (
    <div className="space-y-3">
      {/* Redaction Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/90 bg-[#080F1D] px-3.5 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#22D3EE] mr-1">
            <EyeOff className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Privacy Redaction Tools</span>
          </span>

          <div className="inline-flex rounded-lg bg-[#050912] border border-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => setMode('blackout')}
              aria-pressed={mode === 'blackout'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                mode === 'blackout'
                  ? 'bg-[#22D3EE] text-[#050912] font-semibold'
                  : 'text-slate-300 hover:text-[#F8FAFC]'
              }`}
            >
              <Square className="w-3 h-3 fill-current" aria-hidden="true" />
              <span>Solid Blackout</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('pixelate')}
              aria-pressed={mode === 'pixelate'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                mode === 'pixelate'
                  ? 'bg-[#22D3EE] text-[#050912] font-semibold'
                  : 'text-slate-300 hover:text-[#F8FAFC]'
              }`}
            >
              <Grid2x2 className="w-3 h-3" aria-hidden="true" />
              <span>Pixelate Blur</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono tabular-nums text-slate-400">
            {masks.length} {masks.length === 1 ? 'area' : 'areas'} masked
          </span>
          <button
            type="button"
            onClick={handleUndo}
            disabled={masks.length === 0}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-[#F8FAFC] hover:border-slate-500 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            <span>Undo</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={masks.length === 0}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-[#F87171] hover:border-[#F87171]/50 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <Eraser className="w-3 h-3" aria-hidden="true" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Interactive Canvas Area */}
      <div className="flex flex-col items-center justify-center rounded-xl bg-[#050912] border border-slate-800/90 p-3">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="max-h-[420px] max-w-full w-auto h-auto rounded-md cursor-crosshair touch-none select-none"
          aria-label="Interactive screenshot redaction canvas. Click and drag to blackout or blur sensitive information."
        />
      </div>

      <p className="text-xs text-slate-400 flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-[#34D399] shrink-0" aria-hidden="true" />
        <span>
          Click and drag directly on the screenshot to mask OTPs, phone numbers, account numbers, or
          names. Only the flattened redacted image is sent to Gemini AI.
        </span>
      </p>
    </div>
  );
}
