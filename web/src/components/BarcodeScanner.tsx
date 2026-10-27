import React, { useState } from 'react';

export interface BarcodeScannerProps {
  onDetected: (isbn: string) => void;
}

interface BarcodeDetectorLike {
  detect(
    source: HTMLImageElement | HTMLCanvasElement,
  ): Promise<Array<{ rawValue?: string }>>;
}

declare global {
  interface Window {
    BarcodeDetector?: {
      new (options?: { formats?: string[] }): BarcodeDetectorLike;
    };
  }
}

export function BarcodeScanner({ onDetected }: BarcodeScannerProps) {
  const [scanError, setScanError] = useState<string | null>(null);
  const [manualIsbn, setManualIsbn] = useState('');
  const [photoScanning, setPhotoScanning] = useState(false);

  const decodeBarcodeFromImage = async (
    img: HTMLImageElement,
  ): Promise<string | null> => {
    if (window.BarcodeDetector) {
      try {
        const detector = new window.BarcodeDetector({ formats: ['ean_13'] });
        const codes = await detector.detect(img);
        const found = codes.find(
          (c) => c.rawValue && /^97[89]\d{10}$/.test(c.rawValue),
        );
        if (found?.rawValue) return found.rawValue;
      } catch {
        // fallback to zxing
      }
    }

    const { BrowserMultiFormatReader } = await import('@zxing/browser');
    const reader = new BrowserMultiFormatReader();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const w = img.naturalWidth || 800;
    const h = img.naturalHeight || 600;

    // Try multiple scales and center crops for high-res smartphone photos
    const passes: Array<{
      sx: number;
      sy: number;
      sw: number;
      sh: number;
      maxDim: number;
    }> = [
      { sx: 0, sy: 0, sw: w, sh: h, maxDim: 1600 },
      { sx: 0, sy: 0, sw: w, sh: h, maxDim: 1000 },
      {
        sx: Math.round(w * 0.1),
        sy: Math.round(h * 0.2),
        sw: Math.round(w * 0.8),
        sh: Math.round(h * 0.6),
        maxDim: 1400,
      },
    ];

    for (const pass of passes) {
      try {
        const scale = Math.min(1, pass.maxDim / Math.max(pass.sw, pass.sh, 1));
        canvas.width = Math.max(1, Math.round(pass.sw * scale));
        canvas.height = Math.max(1, Math.round(pass.sh * scale));
        ctx.drawImage(
          img,
          pass.sx,
          pass.sy,
          pass.sw,
          pass.sh,
          0,
          0,
          canvas.width,
          canvas.height,
        );
        const result = reader.decodeFromCanvas(canvas);
        const text = result?.getText()?.trim();
        if (text) return text;
      } catch {
        // try next pass
      }
    }

    return null;
  };

  const handlePhotoScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanError(null);
    setPhotoScanning(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
          typeof reader.result === 'string'
            ? resolve(reader.result)
            : reject(new Error('Lecture impossible'));
        reader.onerror = () => reject(new Error('Lecture impossible'));
        reader.readAsDataURL(file);
      });

      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error('Image invalide'));
        el.src = dataUrl;
      });

      const detected = await decodeBarcodeFromImage(img);
      if (detected) {
        onDetected(detected);
      } else {
        setScanError(
          "Code-barre non détecté sur la photo. Rapprochez-vous du code-barre ou saisissez l'ISBN ci-dessous.",
        );
      }
    } catch {
      setScanError(
        "Code-barre non détecté sur la photo. Rapprochez-vous du code-barre ou saisissez l'ISBN ci-dessous.",
      );
    } finally {
      setPhotoScanning(false);
      e.target.value = '';
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setScanError(null);
    const trimmed = manualIsbn.trim();
    if (trimmed) {
      onDetected(trimmed);
      setManualIsbn('');
    }
  };

  return (
    <div className="scanner-box">
      <form onSubmit={handleManualSubmit} className="scanner-toolbar">
        <label className="btn btn-primary file-btn scanner-photo-btn">
          {photoScanning ? 'Analyse en cours…' : '📷 Scanner le code-barre'}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            aria-label="Scanner le code-barre avec l'appareil photo"
            onChange={handlePhotoScan}
            hidden
          />
        </label>

        <div className="scanner-manual-group">
          <input
            id="manual-isbn-input"
            aria-label="Saisie manuelle de l'ISBN"
            type="text"
            placeholder="Ou saisir l'ISBN (ex. 9782012101333)…"
            value={manualIsbn}
            onChange={(e) => setManualIsbn(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary">
            Rechercher l&apos;ISBN
          </button>
        </div>
      </form>

      {scanError && (
        <div role="alert" className="alert alert-warning">
          {scanError}
        </div>
      )}
    </div>
  );
}
