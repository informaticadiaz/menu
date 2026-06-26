'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface Props {
  slug: string;
}

export default function MenuQrCode({ slug }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [pngDataUrl, setPngDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    const menuUrl = `${window.location.origin}/menu/${slug}`;
    QRCode.toDataURL(menuUrl, { width: 512, margin: 2 })
      .then((dataUrl) => {
        if (!active) return;
        setUrl(menuUrl);
        setPngDataUrl(dataUrl);
      })
      .catch(() => {
        if (active) setError('No se pudo generar el QR');
      });
    return () => {
      active = false;
    };
  }, [slug]);

  async function handleDownloadSvg() {
    if (!url) return;
    try {
      const svg = await QRCode.toString(url, { type: 'svg', width: 512, margin: 2 });
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `menu-${slug}.svg`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      setError('No se pudo generar el QR');
    }
  }

  async function handleCopy() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="brand-panel space-y-5 p-5 sm:p-6">
      <div className="space-y-2">
        <p className="brand-eyebrow">Tu menú</p>
        <h2 className="brand-title text-xl">QR de tu menú</h2>
        <p className="brand-copy">Descargalo e imprimilo en tus mesas para que los clientes accedan al menú escaneándolo.</p>
      </div>
      {error && <p className="notice notice-error">{error}</p>}
      {pngDataUrl ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <img src={pngDataUrl} alt="QR del menú" className="h-40 w-40 rounded-xl border border-stone-200" />
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap gap-2">
              <a href={pngDataUrl} download={`menu-${slug}.png`} className="btn btn-primary px-4 py-2 text-sm">
                Descargar PNG
              </a>
              <button onClick={handleDownloadSvg} className="btn btn-secondary px-4 py-2 text-sm">
                Descargar SVG
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <code className="break-all rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-700">{url}</code>
              <button onClick={handleCopy} className="btn btn-secondary px-3 py-2 text-sm">
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        !error && <p className="brand-copy">Generando QR…</p>
      )}
    </div>
  );
}
