import React, { useRef, useState } from 'react';
import { CanvasLayer, Product } from '../../types';
import { RotateCw, Trash2, Maximize2, Move, AlertCircle } from 'lucide-react';
import { CachedImage } from '../common/CachedImage';

interface JerseyCanvasProps {
  product: Product;
  selectedColor: string;
  selectedSize: string;
  currentSide: 'front' | 'back';
  layers: CanvasLayer[];
  selectedLayerId: string | null;
  onSelectLayer: (layerId: string | null) => void;
  onUpdateLayerPosition?: (layerId: string, x: number, y: number) => void;
  onUpdateLayerTransform?: (layerId: string, updates: { scale?: number; rotation?: number }) => void;
  onDeleteLayer?: (layerId: string) => void;
  showGuides?: boolean;
}

export const JerseyCanvas: React.FC<JerseyCanvasProps> = ({
  product,
  selectedColor,
  selectedSize,
  currentSide,
  layers,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayerPosition,
  onUpdateLayerTransform,
  onDeleteLayer,
  showGuides = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Collar & trim accents complementary to selected color
  const isLightBase = selectedColor === '#FFFFFF' || selectedColor === '#F0C760' || selectedColor === '#EAB308';
  const trimColor = isLightBase ? '#0F2A5F' : '#D4A029';
  const collarColor = isLightBase ? '#0A1A3C' : '#D4A029';

  const visibleLayers = layers
    .filter(l => l.side === currentSide && l.isVisible)
    .sort((a, b) => a.zIndex - b.zIndex);

  const selectedLayer = layers.find(l => l.id === selectedLayerId && l.side === currentSide);

  const handlePointerDown = (layerId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    onSelectLayer(layerId);
    const layer = layers.find(l => l.id === layerId);
    if (layer?.isLocked) return;
    setIsDragging(true);
    setActiveDragId(layerId);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !activeDragId || !containerRef.current || !onUpdateLayerPosition) return;
    const rect = containerRef.current.getBoundingClientRect();
    // Constrain position to printable zone (12% to 88% horizontally, 16% to 84% vertically)
    const x = Math.max(15, Math.min(85, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(18, Math.min(82, ((e.clientY - rect.top) / rect.height) * 100));
    onUpdateLayerPosition(activeDragId, Math.round(x), Math.round(y));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      setActiveDragId(null);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe catch
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={() => onSelectLayer(null)}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative w-full aspect-[4/5] max-w-[500px] mx-auto select-none rounded-3xl overflow-hidden bg-gradient-to-b from-[#0F2A5F]/25 via-[#0A1A3C]/50 to-[#071329] border border-[#D4A029]/25 shadow-2xl flex items-center justify-center p-3 sm:p-5 backdrop-blur-md"
    >
      {/* Mesh Texture Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#D4A029_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Top Product & Side Indicator Tag */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#0A1A3C]/90 border border-slate-700/70 text-[10px] font-semibold text-slate-300 uppercase tracking-widest shadow-md">
        <span className="w-2 h-2 rounded-full bg-[#D4A029] animate-pulse" />
        <span>{currentSide} View</span>
        <span className="text-[#D4A029] font-mono">[{selectedSize}]</span>
      </div>

      {/* Authentic Product Colorway Tag */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0A1A3C]/90 border border-slate-700/70 text-[10px] font-mono text-slate-300 shadow-md">
        <span
          style={{ backgroundColor: selectedColor }}
          className="w-3 h-3 rounded-full border border-white/60 inline-block"
        />
        <span className="font-bold text-white">{product.name.split(' ')[0]}</span>
      </div>

      {/* Print Safe Area Guides (Front vs Back) */}
      {showGuides && (
        <div className="absolute inset-x-12 inset-y-16 border border-dashed border-[#D4A029]/30 rounded-2xl pointer-events-none z-10 flex flex-col justify-between p-2">
          <div className="flex justify-between items-center text-[9px] uppercase tracking-wider text-[#D4A029]/60 font-mono">
            <span>{currentSide === 'front' ? 'Chest Print Zone' : 'Name Print Zone'}</span>
            <span>Print Safe Area</span>
          </div>
          <div className="text-center text-[9px] uppercase tracking-wider text-[#D4A029]/40 font-mono">
            {currentSide === 'front' ? 'Center Sponsor / Graphic Zone' : 'Squad Number Zone'}
          </div>
          <div className="text-right text-[9px] uppercase tracking-wider text-[#D4A029]/50 font-mono">
            Permitted Customization Bounds
          </div>
        </div>
      )}

      {/* High-Fidelity Vector Jersey Silhouette (Tinted to Real Selected Color) */}
      <svg
        viewBox="0 0 400 480"
        className="w-full h-full drop-shadow-[0_25px_35px_rgba(0,0,0,0.7)] select-none pointer-events-none"
      >
        <defs>
          <linearGradient id="jerseyShading" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
            <stop offset="45%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
          </linearGradient>

          <linearGradient id="sleeveTrimGold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B3831B" />
            <stop offset="50%" stopColor="#F0C760" />
            <stop offset="100%" stopColor="#D4A029" />
          </linearGradient>

          <pattern id="jerseyMicroMesh" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.75" fill="#000000" fillOpacity="0.12" />
            <circle cx="6" cy="6" r="0.75" fill="#000000" fillOpacity="0.12" />
          </pattern>
        </defs>

        {/* Sleeves (Left & Right) */}
        {/* Left Sleeve */}
        <path
          d="M 120 70 L 25 155 L 60 215 L 125 160 Z"
          fill={selectedColor}
          stroke={trimColor}
          strokeWidth="1.5"
        />
        <polygon
          points="25,155 35,170 70,230 60,215"
          fill={trimColor}
        />

        {/* Right Sleeve */}
        <path
          d="M 280 70 L 375 155 L 340 215 L 275 160 Z"
          fill={selectedColor}
          stroke={trimColor}
          strokeWidth="1.5"
        />
        <polygon
          points="375,155 365,170 330,230 340,215"
          fill={trimColor}
        />

        {/* Main Torso */}
        <path
          d="M 120 70 C 145 90 255 90 280 70 L 295 165 C 290 270 295 380 290 440 C 240 450 160 450 110 440 C 105 380 110 270 105 165 Z"
          fill={selectedColor}
          stroke="#000000"
          strokeOpacity="0.3"
          strokeWidth="2"
        />

        {/* Aerodynamic Side Rib Panels */}
        <path
          d="M 105 165 C 108 260 106 360 110 440 L 124 440 C 120 360 120 260 118 165 Z"
          fill={trimColor}
          opacity="0.9"
        />
        <path
          d="M 295 165 C 292 260 294 360 290 440 L 276 440 C 280 360 280 260 282 165 Z"
          fill={trimColor}
          opacity="0.9"
        />

        {/* Mesh Texture Overlay */}
        <path
          d="M 120 70 C 145 90 255 90 280 70 L 295 165 C 290 270 295 380 290 440 C 240 450 160 450 110 440 C 105 380 110 270 105 165 Z"
          fill="url(#jerseyMicroMesh)"
        />

        {/* Fabric Shading Overlay */}
        <path
          d="M 120 70 C 145 90 255 90 280 70 L 295 165 C 290 270 295 380 290 440 C 240 450 160 450 110 440 C 105 380 110 270 105 165 Z"
          fill="url(#jerseyShading)"
        />

        {/* Collar Design (Front vs Back) */}
        {currentSide === 'front' ? (
          <g>
            <path
              d="M 150 70 C 170 125 230 125 250 70 C 220 95 180 95 150 70 Z"
              fill={collarColor}
            />
            <path
              d="M 175 92 L 200 130 L 225 92 Z"
              fill={trimColor}
            />
          </g>
        ) : (
          <g>
            <path
              d="M 145 70 C 170 58 230 58 255 70 C 235 85 165 85 145 70 Z"
              fill={collarColor}
            />
            {/* National Pride Flag Accent */}
            <rect x="194" y="72" width="12" height="6" fill="#111827" />
            <rect x="194" y="74" width="12" height="2" fill="#EAB308" />
            <rect x="194" y="76" width="12" height="2" fill="#DC2626" />
          </g>
        )}

        {/* Fixed Kitnova Crest Brandmark on Front Right */}
        {currentSide === 'front' && (
          <g transform="translate(248, 140)">
            <text
              fill={trimColor}
              fontSize="11"
              fontFamily="'Syne', sans-serif"
              fontWeight="bold"
              letterSpacing="1.5"
              textAnchor="middle"
            >
              KITNOVA
            </text>
          </g>
        )}

        {/* Bottom Hemline Authentic Seal Tag */}
        <g transform="translate(132, 422)">
          <rect width="36" height="12" rx="2" fill="#0A1A3C" stroke="#D4A029" strokeWidth="0.8" />
          <text x="18" y="9" fill="#D4A029" fontSize="6" fontFamily="monospace" textAnchor="middle">
            OFFICIAL KIT
          </text>
        </g>
      </svg>

      {/* DYNAMIC CUSTOMIZATION LAYERS (Type A Plain/Typography & Type B Graphic/Artwork) */}
      <div className="absolute inset-0 pointer-events-none">
        {visibleLayers.map(layer => {
          const isSelected = selectedLayerId === layer.id;

          // Background styles for text
          const bgStyle: React.CSSProperties = {};
          if (layer.backgroundType === 'rectangle') {
            bgStyle.backgroundColor = layer.backgroundColor || '#0F2A5F';
            bgStyle.padding = '4px 12px';
            bgStyle.borderRadius = '2px';
          } else if (layer.backgroundType === 'rounded') {
            bgStyle.backgroundColor = layer.backgroundColor || '#0F2A5F';
            bgStyle.padding = '4px 16px';
            bgStyle.borderRadius = '9999px';
          } else if (layer.backgroundType === 'badge') {
            bgStyle.backgroundColor = layer.backgroundColor || '#0F2A5F';
            bgStyle.padding = '6px 18px';
            bgStyle.borderRadius = '8px';
            bgStyle.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
          }

          // Frame styles for text (moves/resizes with text group)
          const frameStyle: React.CSSProperties = {};
          if (layer.frameType === 'solid') {
            frameStyle.border = `2px solid ${layer.frameColor || '#D4A029'}`;
            frameStyle.padding = '4px 10px';
          } else if (layer.frameType === 'gold_border') {
            frameStyle.border = `2.5px solid #D4A029`;
            frameStyle.boxShadow = `0 0 0 2px #0A1A3C, 0 0 0 3.5px #D4A029`;
            frameStyle.padding = '6px 14px';
          } else if (layer.frameType === 'double') {
            frameStyle.border = `3px double ${layer.frameColor || '#D4A029'}`;
            frameStyle.padding = '6px 12px';
          }

          return (
            <div
              key={layer.id}
              onClick={e => {
                e.stopPropagation();
                onSelectLayer(layer.id);
              }}
              onPointerDown={e => handlePointerDown(layer.id, e)}
              style={{
                left: `${layer.x}%`,
                top: `${layer.y}%`,
                transform: `translate(-50%, -50%) rotate(${layer.rotation || 0}deg) scale(${layer.scale || 1})`,
                zIndex: layer.zIndex + 10,
                opacity: layer.opacity !== undefined ? layer.opacity : 1
              }}
              className={`absolute pointer-events-auto transition-transform duration-75 cursor-move ${
                isSelected
                  ? 'ring-2 ring-[#D4A029] ring-offset-2 ring-offset-[#0A1A3C] rounded-lg p-1.5 shadow-2xl'
                  : 'hover:outline hover:outline-1 hover:outline-[#D4A029]/60'
              }`}
            >
              {/* Container wrapping Text + Background + Frame so they move/scale/rotate together! */}
              <div
                style={{
                  ...bgStyle,
                  ...frameStyle
                }}
                className="flex items-center justify-center"
              >
                {/* 1. TYPE A: NAME */}
                {layer.type === 'name' && (
                  <div
                    style={{
                      fontFamily: layer.fontFamily || "'Bebas Neue', sans-serif",
                      fontSize: `${layer.fontSize || 34}px`,
                      color: layer.color || '#D4A029',
                      WebkitTextStroke: layer.strokeWidth
                        ? `${layer.strokeWidth}px ${layer.strokeColor || '#000000'}`
                        : undefined,
                      letterSpacing: layer.letterSpacing !== undefined ? `${layer.letterSpacing}px` : '0.12em',
                      textAlign: layer.alignment || 'center'
                    }}
                    className="font-bold uppercase tracking-wider select-none drop-shadow-md whitespace-nowrap leading-none"
                  >
                    {layer.text || 'PLAYER NAME'}
                  </div>
                )}

                {/* 2. TYPE A: NUMBER */}
                {layer.type === 'number' && (
                  <div
                    style={{
                      fontFamily: layer.fontFamily || "'Bebas Neue', sans-serif",
                      fontSize: `${layer.fontSize || 86}px`,
                      color: layer.color || '#D4A029',
                      WebkitTextStroke: layer.strokeWidth
                        ? `${layer.strokeWidth}px ${layer.strokeColor || '#0A1A3C'}`
                        : undefined,
                      lineHeight: 0.88,
                      textAlign: 'center'
                    }}
                    className="font-black select-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] whitespace-nowrap"
                  >
                    {layer.text || '10'}
                  </div>
                )}

                {/* 3. TYPE A: GENERAL TEXT OR SPONSOR */}
                {(layer.type === 'text' || layer.type === 'sponsor') && (
                  <div
                    style={{
                      fontFamily: layer.fontFamily || "'Syne', sans-serif",
                      fontSize: `${layer.fontSize || 22}px`,
                      color: layer.color || '#FFFFFF',
                      WebkitTextStroke: layer.strokeWidth
                        ? `${layer.strokeWidth}px ${layer.strokeColor || '#000000'}`
                        : undefined,
                      letterSpacing: layer.letterSpacing !== undefined ? `${layer.letterSpacing}px` : '0.08em',
                      textAlign: layer.alignment || 'center'
                    }}
                    className="font-bold uppercase tracking-wider select-none drop-shadow-md whitespace-nowrap leading-none"
                  >
                    {layer.text || 'TEXT ELEMENT'}
                  </div>
                )}

                {/* 4. TYPE B: GRAPHIC / ARTWORK / LOGO / CREST / EMOJI / UPLOAD */}
                {(layer.type === 'graphic' ||
                  layer.type === 'logo' ||
                  layer.type === 'badge' ||
                  layer.type === 'emoji' ||
                  layer.type === 'upload') && (
                  <div className="flex items-center justify-center select-none">
                    {layer.type === 'emoji' ? (
                      <span className="text-4xl drop-shadow-md leading-none">{layer.text || '⚽'}</span>
                    ) : layer.imageUrl ? (
                      <CachedImage
                        src={layer.imageUrl}
                        alt={layer.graphicName || 'Jersey Graphic'}
                        referrerPolicy="no-referrer"
                        className="max-w-[80px] max-h-[80px] object-contain drop-shadow-lg pointer-events-none"
                      />
                    ) : (
                      // Default Gold Shield Crest
                      <div className="w-12 h-14 bg-gradient-to-b from-[#D4A029] to-[#B3831B] rounded-b-2xl border-2 border-white/70 flex items-center justify-center shadow-xl">
                        <span className="text-[10px] font-black tracking-tighter text-[#0A1A3C]">
                          KTN
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* BOUNDING BOX CONTROLS WHEN SELECTED */}
              {isSelected && (
                <>
                  {/* Rotate Control Handle (Top) */}
                  <div
                    onClick={e => {
                      e.stopPropagation();
                      if (onUpdateLayerTransform) {
                        const newRot = ((layer.rotation || 0) + 45) % 360;
                        onUpdateLayerTransform(layer.id, { rotation: newRot });
                      }
                    }}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#D4A029] text-[#0A1A3C] flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-transform"
                    title="Rotate 45°"
                  >
                    <RotateCw className="w-3 h-3" />
                  </div>

                  {/* Scale Control Handle (Bottom-Right) */}
                  <div
                    onClick={e => {
                      e.stopPropagation();
                      if (onUpdateLayerTransform) {
                        const currentScale = layer.scale || 1;
                        const newScale = currentScale >= 1.6 ? 0.8 : currentScale + 0.2;
                        onUpdateLayerTransform(layer.id, { scale: Number(newScale.toFixed(1)) });
                      }
                    }}
                    className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full bg-[#0F2A5F] border border-[#D4A029] text-[#D4A029] flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-transform"
                    title="Resize Scale"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </div>

                  {/* Delete Quick Button (Top-Right) */}
                  {onDeleteLayer && (
                    <div
                      onClick={e => {
                        e.stopPropagation();
                        onDeleteLayer(layer.id);
                      }}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-red-500 active:scale-95 transition-colors"
                      title="Delete Element"
                    >
                      <Trash2 className="w-3 h-3" />
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
