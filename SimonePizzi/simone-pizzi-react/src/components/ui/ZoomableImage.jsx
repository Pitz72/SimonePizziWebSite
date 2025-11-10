import React, { useState } from 'react';
import { usePinchZoom } from '../../hooks';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

/**
 * Componente immagine con supporto pinch to zoom
 * @param {Object} props - Proprietà del componente
 * @param {string} props.src - URL dell'immagine
 * @param {string} props.alt - Testo alternativo
 * @param {string} props.className - Classi CSS aggiuntive
 * @param {number} props.minScale - Scala minima (default: 1)
 * @param {number} props.maxScale - Scala massima (default: 3)
 * @param {boolean} props.showControls - Mostra controlli zoom
 * @param {Function} props.onZoomChange - Callback per cambiamenti zoom
 */
const ZoomableImage = ({
  src,
  alt,
  className = '',
  minScale = 1,
  maxScale = 3,
  showControls = true,
  onZoomChange,
  ...props
}) => {
  const [showOverlay, setShowOverlay] = useState(false);

  const {
    ref,
    scale,
    isZoomed,
    transformStyles,
    resetZoom,
    zoomIn,
    zoomOut
  } = usePinchZoom({
    minScale,
    maxScale,
    onZoomChange
  });

  return (
    <div className="relative group">
      {/* Container immagine */}
      <div
        ref={ref}
        className={`
          relative overflow-hidden rounded-lg bg-bg-secondary
          ${className}
        `}
        onMouseEnter={() => setShowOverlay(true)}
        onMouseLeave={() => setShowOverlay(false)}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          style={transformStyles}
          {...props}
        />

        {/* Overlay controlli */}
        {showControls && (showOverlay || isZoomed) && (
          <div className="absolute inset-0 bg-bg-primary/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Controlli zoom */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={zoomOut}
                disabled={scale <= minScale}
                className="p-2 bg-bg-primary/80 text-text-primary rounded-full hover:bg-primary-500 hover:text-bg-primary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              
              <button
                onClick={zoomIn}
                disabled={scale >= maxScale}
                className="p-2 bg-bg-primary/80 text-text-primary rounded-full hover:bg-primary-500 hover:text-bg-primary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              
              {isZoomed && (
                <button
                  onClick={resetZoom}
                  className="p-2 bg-bg-primary/80 text-text-primary rounded-full hover:bg-primary-500 hover:text-bg-primary transition-colors duration-200"
                  title="Reset Zoom"
                >
                  <RotateCcw size={16} />
                </button>
              )}
            </div>

            {/* Indicatore zoom */}
            <div className="absolute bottom-4 left-4 bg-bg-primary/80 text-text-primary px-3 py-1 rounded-full text-sm font-medium">
              {Math.round(scale * 100)}%
            </div>
          </div>
        )}

        {/* Indicatore interattivo */}
        {!isZoomed && (
          <div className="absolute top-4 left-4 bg-primary-500/20 text-primary-500 px-2 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Pinch to zoom
          </div>
        )}
      </div>

      {/* Istruzioni per mobile */}
      <div className="mt-2 text-xs text-text-muted text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {isZoomed ? 'Drag to pan • Double tap to reset' : 'Pinch to zoom • Double tap to zoom'}
      </div>
    </div>
  );
};

export default ZoomableImage; 