import { useEffect } from 'react';
import './Lightbox.css';

interface LightboxProps {
  images: string[];
  index: number;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  alt?: string;
}

export default function Lightbox({ images, index, onClose, onPrev, onNext, alt }: LightboxProps) {
  const showNav = images.length > 1;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (showNav && e.key === 'ArrowLeft' && onPrev) onPrev();
      if (showNav && e.key === 'ArrowRight' && onNext) onNext();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onPrev, onNext, showNav]);

  return (
    <div className="lightbox" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close">&times;</button>
      {showNav && onPrev && (
        <button className="lightbox-prev" onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label="Previous">&#8249;</button>
      )}
      <img className="lightbox-img" src={images[index]} alt={alt ?? `Photo ${index + 1}`} />
      {showNav && onNext && (
        <button className="lightbox-next" onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="Next">&#8250;</button>
      )}
    </div>
  );
}
