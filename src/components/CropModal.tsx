import { useState, useRef, useEffect, useCallback } from 'react';
import './CropModal.css';

interface CropModalProps {
  src: string;
  onApply: (dataUrl: string) => void;
  onCancel: () => void;
}

const CROP_SIZE = 280;
const GUIDE_SIZE = 240;
const OUTPUT_SIZE = 400;

export default function CropModal({ src, onApply, onCancel }: CropModalProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [baseScale, setBaseScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const clampOffset = useCallback((ox: number, oy: number, s: number, img: HTMLImageElement) => {
    const sw = img.naturalWidth * s;
    const sh = img.naturalHeight * s;
    const gl = (CROP_SIZE - GUIDE_SIZE) / 2;
    const gt = (CROP_SIZE - GUIDE_SIZE) / 2;
    return {
      x: Math.min(gl, Math.max(gl + GUIDE_SIZE - sw, ox)),
      y: Math.min(gt, Math.max(gt + GUIDE_SIZE - sh, oy)),
    };
  }, []);

  const onImgLoad = useCallback(() => {
    const img = imgRef.current!;
    const bs = GUIDE_SIZE / Math.min(img.naturalWidth, img.naturalHeight);
    setBaseScale(bs);
    setScale(bs);
    setZoom(1);
    const sw = img.naturalWidth * bs;
    const sh = img.naturalHeight * bs;
    setOffset({ x: (CROP_SIZE - sw) / 2, y: (CROP_SIZE - sh) / 2 });
  }, []);

  const onZoomChange = useCallback((val: number) => {
    const img = imgRef.current!;
    const newScale = baseScale * val;
    const cx = CROP_SIZE / 2;
    const cy = CROP_SIZE / 2;
    setOffset(prev => {
      const newOx = cx - (cx - prev.x) * (newScale / scale);
      const newOy = cy - (cy - prev.y) * (newScale / scale);
      return clampOffset(newOx, newOy, newScale, img);
    });
    setScale(newScale);
    setZoom(val);
  }, [baseScale, scale, clampOffset]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  }, [offset]);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragStart.current || !imgRef.current) return;
      const newOx = e.clientX - dragStart.current.x;
      const newOy = e.clientY - dragStart.current.y;
      setOffset(clampOffset(newOx, newOy, scale, imgRef.current));
    }
    function onMouseUp() { dragStart.current = null; }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [scale, clampOffset]);

  const handleApply = useCallback(() => {
    const img = imgRef.current!;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = OUTPUT_SIZE;
    const gl = (CROP_SIZE - GUIDE_SIZE) / 2;
    const gt = (CROP_SIZE - GUIDE_SIZE) / 2;
    const srcX = (gl - offset.x) / scale;
    const srcY = (gt - offset.y) / scale;
    const srcSize = GUIDE_SIZE / scale;
    canvas.getContext('2d')!.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    onApply(canvas.toDataURL('image/jpeg', 0.85));
  }, [offset, scale, onApply]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="crop-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="crop-dialog">
        <div className="modal-header">
          <span className="modal-title">Crop Photo</span>
          <button className="modal-close" onClick={onCancel}>&times;</button>
        </div>
        <div
          className="crop-container"
          style={{ width: CROP_SIZE, height: CROP_SIZE }}
          onMouseDown={onMouseDown}
        >
          <img
            ref={imgRef}
            src={src}
            alt="Crop preview"
            className="crop-img"
            onLoad={onImgLoad}
            style={{
              width: imgRef.current ? Math.round(imgRef.current.naturalWidth * scale) : 'auto',
              height: imgRef.current ? Math.round(imgRef.current.naturalHeight * scale) : 'auto',
              left: Math.round(offset.x),
              top: Math.round(offset.y),
            }}
            draggable={false}
          />
          <div className="crop-guide" style={{ width: GUIDE_SIZE, height: GUIDE_SIZE }} />
        </div>
        <div className="crop-zoom-row">
          <label className="form-label" style={{ fontSize: '0.8rem' }}>Zoom</label>
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={e => onZoomChange(parseFloat(e.target.value))}
            className="crop-zoom-slider"
          />
        </div>
        <div className="crop-actions">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" onClick={handleApply}>Apply Crop</button>
        </div>
      </div>
    </div>
  );
}
