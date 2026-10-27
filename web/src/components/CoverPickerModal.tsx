import React, { useRef, useState } from 'react';

export interface CoverPickerProps {
  currentCoverUrl: string | null;
  onCoverChange: (selection: {
    coverDataUrl: string | null;
    coverSourceUrl: string | null;
    removeCover: boolean;
  }) => void;
  onAnalyzeCover?: (coverDataUrl: string) => void;
  analyzingCover?: boolean;
}

export function CoverPicker({
  currentCoverUrl,
  onCoverChange,
  onAnalyzeCover,
  analyzingCover = false,
}: CoverPickerProps) {
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragStartRef = useRef<{
    x: number;
    y: number;
    ox: number;
    oy: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setZoom(1);
        setOffsetX(0);
        setOffsetY(0);
        setRawImageSrc(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const applyCrop = () => {
    if (!rawImageSrc) return;
    let finalDataUrl = rawImageSrc;
    try {
      const canvas = document.createElement('canvas');
      const targetW = 400;
      const targetH = 600;
      canvas.width = targetW;
      canvas.height = targetH;
      const img = imgRef.current;
      if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, targetW, targetH);

          const baseScale = Math.max(
            targetW / img.naturalWidth,
            targetH / img.naturalHeight,
          );
          const scale = baseScale * zoom;
          const drawW = img.naturalWidth * scale;
          const drawH = img.naturalHeight * scale;
          const dx = (targetW - drawW) / 2 + (offsetX / 100) * (targetW / 2);
          const dy = (targetH - drawH) / 2 + (offsetY / 100) * (targetH / 2);

          ctx.drawImage(img, dx, dy, drawW, drawH);
          const out = canvas.toDataURL('image/jpeg', 0.85);
          if (out && out.startsWith('data:image/')) {
            finalDataUrl = out;
          }
        }
      }
    } catch {
      // Fallback to rawImageSrc in environments without canvas implementation
    }

    onCoverChange({
      coverDataUrl: finalDataUrl,
      coverSourceUrl: null,
      removeCover: false,
    });
    setRawImageSrc(null);
  };

  const handleRemoveCover = () => {
    setRawImageSrc(null);
    onCoverChange({
      coverDataUrl: null,
      coverSourceUrl: null,
      removeCover: true,
    });
  };

  return (
    <div className="cover-picker">
      <div className="cover-picker-card">
        {currentCoverUrl ? (
          <div className="cover-preview-box">
            <img
              src={currentCoverUrl}
              alt="Aperçu de la couverture"
              className="cover-preview-img"
              onError={() => {
                if (currentCoverUrl.startsWith('http')) {
                  handleRemoveCover();
                }
              }}
            />
            <button
              type="button"
              className="btn btn-ghost-danger btn-sm"
              onClick={handleRemoveCover}
            >
              Retirer
            </button>
          </div>
        ) : (
          <div className="cover-placeholder">Pas de couverture</div>
        )}

        <div className="cover-actions">
          <label className="btn btn-secondary btn-sm file-btn">
            📷 Photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              aria-label="Prendre une photo de couverture"
              onChange={handleFileChange}
              hidden
            />
          </label>

          <label className="btn btn-secondary btn-sm file-btn">
            📁 Fichier
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              aria-label="Choisir un fichier de couverture"
              onChange={handleFileChange}
              hidden
            />
          </label>
        </div>

        {onAnalyzeCover &&
          currentCoverUrl &&
          currentCoverUrl.startsWith('data:image/') && (
            <button
              type="button"
              className="btn btn-secondary btn-sm cover-analyze-btn"
              disabled={analyzingCover}
              onClick={() => onAnalyzeCover(currentCoverUrl)}
            >
              {analyzingCover
                ? 'Analyse…'
                : '🔍 Identifier depuis la couverture'}
            </button>
          )}
      </div>

      {rawImageSrc && (
        <div
          className="crop-modal"
          role="dialog"
          aria-label="Recadrer la couverture"
        >
          <h4>Recadrer la couverture</h4>
          <div
            className="crop-viewport"
            onPointerDown={(e) => {
              dragStartRef.current = {
                x: e.clientX,
                y: e.clientY,
                ox: offsetX,
                oy: offsetY,
              };
            }}
            onPointerMove={(e) => {
              if (!dragStartRef.current) return;
              const dx = e.clientX - dragStartRef.current.x;
              const dy = e.clientY - dragStartRef.current.y;
              setOffsetX(
                Math.max(-100, Math.min(100, dragStartRef.current.ox + dx)),
              );
              setOffsetY(
                Math.max(-100, Math.min(100, dragStartRef.current.oy + dy)),
              );
            }}
            onPointerUp={() => {
              dragStartRef.current = null;
            }}
          >
            <img
              ref={imgRef}
              src={rawImageSrc}
              alt="Image à recadrer"
              className="crop-image"
              style={{
                transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`,
              }}
            />
          </div>

          <div className="crop-controls">
            <label htmlFor="crop-zoom">
              Zoom ({Math.round(zoom * 100)} %)
              <input
                id="crop-zoom"
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </label>
          </div>

          <div className="card-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={applyCrop}
            >
              Valider le recadrage
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setRawImageSrc(null)}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
