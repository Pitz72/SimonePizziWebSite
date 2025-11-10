import React, { useState } from 'react';
import { useVirtualScroll } from '../../hooks';
import { ChevronUp, ChevronDown } from 'lucide-react';

/**
 * Componente lista virtuale con fallback sicuro
 * @param {Object} props - Proprietà del componente
 * @param {Array} props.items - Array di elementi da renderizzare
 * @param {Function} props.renderItem - Funzione per renderizzare ogni elemento
 * @param {number} props.itemHeight - Altezza fissa degli elementi (default: 60)
 * @param {number} props.containerHeight - Altezza del container (default: 400px)
 * @param {boolean} props.enabled - Abilita virtual scrolling (default: true)
 * @param {string} props.className - Classi CSS aggiuntive
 * @param {boolean} props.showScrollControls - Mostra controlli scroll (default: false)
 */
const VirtualList = ({
  items = [],
  renderItem,
  itemHeight = 60,
  containerHeight = 400,
  enabled = true,
  className = '',
  showScrollControls = false,
  ...props
}) => {
  const [showInfo, setShowInfo] = useState(false);

  const {
    ref,
    visibleItems,
    isVirtualScrolling,
    shouldUseVirtualScrolling,
    containerStyles,
    contentStyles,
    scrollToItem,
    scrollToTop,
    totalHeight,
    containerHeight: actualContainerHeight
  } = useVirtualScroll({
    items,
    itemHeight,
    enabled,
    renderItem
  });

  // Fallback per renderItem se non fornito
  const defaultRenderItem = (item, index) => (
    <div className="p-4 border-b border-border-primary">
      <div className="text-text-primary">Item {index + 1}</div>
      <div className="text-text-secondary text-sm">{JSON.stringify(item)}</div>
    </div>
  );

  const renderFunction = renderItem || defaultRenderItem;

  return (
    <div className={`relative ${className}`} {...props}>
      {/* Container principale */}
      <div
        ref={ref}
        style={{
          ...containerStyles,
          height: containerHeight
        }}
        className="border border-border-primary rounded-lg bg-bg-surface"
      >
        {/* Content wrapper */}
        <div style={contentStyles}>
          {visibleItems.map(({ item, index, style }) => (
            <div
              key={index}
              style={style}
              className="w-full"
            >
              {renderFunction(item, index)}
            </div>
          ))}
        </div>

        {/* Loading indicator per virtual scrolling */}
        {isVirtualScrolling && (
          <div className="absolute bottom-2 right-2 bg-primary-500/20 text-primary-500 px-2 py-1 rounded-full text-xs">
            Virtual
          </div>
        )}
      </div>

      {/* Controlli scroll */}
      {showScrollControls && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={scrollToTop}
            className="p-2 bg-primary-500/10 text-primary-500 rounded-full hover:bg-primary-500 hover:text-bg-primary transition-colors duration-200"
            title="Scroll to top"
          >
            <ChevronUp size={16} />
          </button>
          
          <button
            onClick={() => scrollToItem(Math.floor(items.length / 2))}
            className="px-3 py-2 bg-primary-500/10 text-primary-500 rounded-full hover:bg-primary-500 hover:text-bg-primary transition-colors duration-200 text-sm"
            title="Scroll to middle"
          >
            Middle
          </button>
          
          <button
            onClick={() => scrollToItem(items.length - 1)}
            className="p-2 bg-primary-500/10 text-primary-500 rounded-full hover:bg-primary-500 hover:text-bg-primary transition-colors duration-200"
            title="Scroll to bottom"
          >
            <ChevronDown size={16} />
          </button>
        </div>
      )}

      {/* Info panel */}
      <div className="mt-4 p-4 bg-bg-secondary rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-semibold text-text-primary">Virtual List Info</h4>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="text-primary-500 hover:text-primary-400 text-sm"
          >
            {showInfo ? 'Hide' : 'Show'} Details
          </button>
        </div>
        
        <div className="text-xs text-text-secondary space-y-1">
          <div>Total Items: {items.length}</div>
          <div>Visible Items: {visibleItems.length}</div>
          <div>Virtual Scrolling: {isVirtualScrolling ? 'Active' : 'Inactive'}</div>
          <div>Total Height: {Math.round(totalHeight)}px</div>
          <div>Container Height: {Math.round(actualContainerHeight)}px</div>
        </div>

        {showInfo && (
          <div className="mt-3 pt-3 border-t border-border-primary text-xs text-text-muted">
            <div>Item Height: {itemHeight}px</div>
            <div>Should Use Virtual: {shouldUseVirtualScrolling ? 'Yes' : 'No'}</div>
            <div>Enabled: {enabled ? 'Yes' : 'No'}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualList; 