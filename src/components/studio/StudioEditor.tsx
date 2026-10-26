import React, { useState, useEffect, useRef } from 'react';
import { JerseyCanvas } from './JerseyCanvas';
import { Jersey3DPreview } from './Jersey3DPreview';
import { CanvasLayer, StudioDesign, Product } from '../../types';
import { store } from '../../services/store';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { listSharedStudioAssets } from '../../services/studioAssetLibrary';
import {
  RotateCcw,
  RotateCw,
  Layers,
  Type,
  Palette,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Save,
  ShoppingBag,
  Check,
  Sparkles,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Target,
  Plus,
  Minus,
  Maximize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Shirt,
  Shield,
  Tag,
  AlertCircle,
  Copy,
  Sliders,
  Move,
  LayoutTemplate,
  Compass,
  Box,
  ChevronRight,
  X,
  FileCheck,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Hash,
  User,
  HelpCircle,
  RefreshCw
} from 'lucide-react';

interface StudioEditorProps {
  initialProduct?: Product;
  initialSize?: string;
  initialColor?: string;
  initialDesign?: StudioDesign;
  editingCartItemId?: string;
  cartCount?: number;
  onAddToCart?: (
    design: StudioDesign,
    product: Product,
    size: string,
    color: string,
    editingCartItemId?: string
  ) => void;
  onBack?: () => void;
  onNavigateToCart?: () => void;
}

export type StudioToolId =
  | 'select'
  | 'text'
  | 'player_name'
  | 'player_number'
  | 'upload_logo'
  | 'artwork'
  | 'jersey_colors'
  | 'fonts'
  | 'position'
  | 'layers'
  | 'templates';

export const StudioEditor: React.FC<StudioEditorProps> = ({
  initialProduct,
  initialSize,
  initialColor,
  initialDesign,
  editingCartItemId,
  cartCount = 0,
  onAddToCart,
  onBack,
  onNavigateToCart
}) => {
  // Store subscription
  const [, setTick] = useState(0);
  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  useEffect(() => {
    let active = true;
    listSharedStudioAssets().then(({ fonts, artworks }) => {
      if (!active) return;
      fonts.forEach(font => {
        const existing = store.fonts.find(item => item.id === font.id);
        if (existing) store.updateFont(font.id, font); else store.addFont(font);
      });
      artworks.forEach(item => {
        const existing = store.studioArtworks.find(current => current.id === item.id);
        if (existing) store.updateStudioArtwork(item.id, item); else store.addStudioArtwork(item);
      });
    }).catch(error => console.warn('Could not refresh shared studio assets; using cached assets.', error));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const id = 'kitnova-uploaded-font-faces';
    let style = document.getElementById(id) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = id;
      document.head.appendChild(style);
    }
    style.textContent = store.fonts.filter(f => f.fontDataUrl).map(f => {
      const safeFamily = f.family.replace(/[\'"]|,.*$/g, '');
      const fontPath = f.fontDataUrl!.split('?')[0].toLowerCase();
      const format = fontPath.endsWith('.woff2') ? 'woff2' : fontPath.endsWith('.woff') ? 'woff' : fontPath.endsWith('.otf') ? 'opentype' : 'truetype';
      return `@font-face{font-family:'${safeFamily}';src:url(\"${f.fontDataUrl}\") format(\"${format}\");font-display:swap;}`;
    }).join('\n');
  }, [store.fonts.map(f => `${f.id}:${f.fontDataUrl || ''}`).join('|')]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Exact product loaded from Shop
  const product = initialProduct || store.products[0];

  // Error state if no product could be loaded
  if (!product) {
    return (
      <div className="w-full min-h-[500px] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <h2 className="text-xl font-bold text-white">Unable to Load This Jersey</h2>
        <p className="text-xs text-slate-400 max-w-md">
          The requested product could not be found in the active catalog. Please return to Shop to select a jersey.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-bold text-xs"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const pricing = store.pricing;
  const enabledFonts = store.fonts
    .filter(f => f.isEnabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const defaultFont = enabledFonts.find(f => f.isDefault) || enabledFonts[0] || {
    id: 'font-bebas',
    name: 'Tournament Pro',
    family: "'Bebas Neue', sans-serif"
  };

  // State: Size and Color
  const [selectedSize, setSelectedSize] = useState<string>(
    initialSize || product.sizes[0] || 'L'
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    initialColor || initialDesign?.baseJerseyColor || product.colors[0] || '#0F2A5F'
  );

  // Region A View Modes
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>('back');
  const [editorMode, setEditorMode] = useState<'2d' | '3d'>('2d');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  // Region B Active Tool (Exactly 11 vertical tools in order)
  const [activeTool, setActiveTool] = useState<StudioToolId>('player_name');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Layers Initial State
  const [layers, setLayers] = useState<CanvasLayer[]>(
    initialDesign?.layers || [
      {
        id: 'layer-name-1',
        type: 'name',
        category: 'plain_text',
        text: 'MUKISA',
        fontFamily: defaultFont.family,
        fontSize: 34,
        color: '#D4A029',
        strokeColor: '#0A1A3C',
        strokeWidth: 0,
        letterSpacing: 2,
        alignment: 'center',
        backgroundType: 'none',
        frameType: 'none',
        x: 50,
        y: 28,
        side: 'back',
        isVisible: true,
        zIndex: 2,
        zone: 'back_name'
      },
      {
        id: 'layer-num-1',
        type: 'number',
        category: 'plain_text',
        text: '10',
        fontFamily: defaultFont.family,
        fontSize: 86,
        color: '#D4A029',
        strokeColor: '#0A1A3C',
        strokeWidth: 2,
        alignment: 'center',
        backgroundType: 'none',
        frameType: 'none',
        x: 50,
        y: 56,
        side: 'back',
        isVisible: true,
        zIndex: 1,
        zone: 'back_number'
      },
      {
        id: 'layer-crest-front',
        type: 'badge',
        category: 'graphic_artwork',
        graphicName: 'Kitnova Crest',
        x: 28,
        y: 32,
        side: 'front',
        isVisible: true,
        zIndex: 2,
        zone: 'front_chest'
      }
    ]
  );

  const [selectedLayerId, setSelectedLayerId] = useState<string | null>('layer-name-1');

  // History stack for Undo/Redo
  const [history, setHistory] = useState<CanvasLayer[][]>([layers]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Upload state
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Active layer reference
  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  // Push history on changes
  const pushHistory = (newLayers: CanvasLayer[]) => {
    const updated = history.slice(0, historyIndex + 1);
    updated.push(newLayers);
    setHistory(updated);
    setHistoryIndex(updated.length - 1);
    setLayers(newLayers);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const targetIdx = historyIndex - 1;
      setHistoryIndex(targetIdx);
      setLayers(history[targetIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const targetIdx = historyIndex + 1;
      setHistoryIndex(targetIdx);
      setLayers(history[targetIdx]);
    }
  };

  const updateSelectedLayer = (updates: Partial<CanvasLayer>) => {
    if (!selectedLayerId) return;
    const newLayers = layers.map(l => (l.id === selectedLayerId ? { ...l, ...updates } : l));
    pushHistory(newLayers);
  };

  const handleUpdatePosition = (layerId: string, x: number, y: number) => {
    const newLayers = layers.map(l => (l.id === layerId ? { ...l, x, y } : l));
    setLayers(newLayers);
  };

  const handleUpdateTransform = (layerId: string, updates: { scale?: number; rotation?: number }) => {
    const newLayers = layers.map(l => (l.id === layerId ? { ...l, ...updates } : l));
    pushHistory(newLayers);
  };

  const handleDeleteLayer = (id: string) => {
    const newLayers = layers.filter(l => l.id !== id);
    pushHistory(newLayers);
    if (selectedLayerId === id) {
      setSelectedLayerId(null);
    }
  };

  const handleDuplicateLayer = (id: string) => {
    const source = layers.find(l => l.id === id);
    if (!source) return;
    const dupId = `layer-${Date.now()}`;
    const duplicate: CanvasLayer = {
      ...source,
      id: dupId,
      x: Math.min(80, source.x + 5),
      y: Math.min(80, source.y + 5),
      zIndex: layers.length + 1
    };
    pushHistory([...layers, duplicate]);
    setSelectedLayerId(dupId);
  };

  const toggleLayerVisibility = (id: string) => {
    const newLayers = layers.map(l => (l.id === id ? { ...l, isVisible: !l.isVisible } : l));
    pushHistory(newLayers);
  };

  const toggleLayerLock = (id: string) => {
    const newLayers = layers.map(l => (l.id === id ? { ...l, isLocked: !l.isLocked } : l));
    pushHistory(newLayers);
  };

  const moveLayerZIndex = (id: string, direction: 'up' | 'down') => {
    const target = layers.find(l => l.id === id);
    if (!target) return;
    const newZ = direction === 'up' ? target.zIndex + 1 : Math.max(1, target.zIndex - 1);
    const newLayers = layers.map(l => (l.id === id ? { ...l, zIndex: newZ } : l));
    pushHistory(newLayers);
  };

  const handleSelectLayer = (id: string | null) => {
    setSelectedLayerId(id);
    if (id) {
      const target = layers.find(l => l.id === id);
      if (target && target.side !== currentSide) {
        setCurrentSide(target.side);
      }
    }
  };

  // Add Plain Text
  const handleAddTextElement = (initialText: string = 'KAMPALA') => {
    const newId = `layer-text-${Date.now()}`;
    const newLayer: CanvasLayer = {
      id: newId,
      type: 'text',
      category: 'plain_text',
      text: initialText,
      fontFamily: defaultFont.family,
      fontSize: 24,
      color: '#FFFFFF',
      strokeColor: '#0A1A3C',
      strokeWidth: 0,
      letterSpacing: 1.5,
      alignment: 'center',
      backgroundType: 'none',
      frameType: 'none',
      x: 50,
      y: currentSide === 'front' ? 52 : 76,
      side: currentSide,
      isVisible: true,
      zIndex: layers.length + 1,
      zone: currentSide === 'front' ? 'front_center' : 'back_sponsor'
    };

    pushHistory([...layers, newLayer]);
    setSelectedLayerId(newId);
  };

  // Set / Add Player Name
  const handleSetPlayerName = (name: string) => {
    const existingName = layers.find(l => l.type === 'name' && l.side === 'back');
    if (existingName) {
      updateSelectedLayer({ text: name.toUpperCase() });
      setSelectedLayerId(existingName.id);
    } else {
      const newId = `layer-name-${Date.now()}`;
      const newLayer: CanvasLayer = {
        id: newId,
        type: 'name',
        category: 'plain_text',
        text: name.toUpperCase(),
        fontFamily: defaultFont.family,
        fontSize: 34,
        color: '#D4A029',
        strokeColor: '#0A1A3C',
        strokeWidth: 0,
        letterSpacing: 2,
        alignment: 'center',
        backgroundType: 'none',
        frameType: 'none',
        x: 50,
        y: 28,
        side: 'back',
        isVisible: true,
        zIndex: layers.length + 1,
        zone: 'back_name'
      };
      pushHistory([...layers, newLayer]);
      setSelectedLayerId(newId);
    }
    setCurrentSide('back');
  };

  // Set / Add Player Number
  const handleSetPlayerNumber = (num: string) => {
    const existingNum = layers.find(l => l.type === 'number' && l.side === 'back');
    if (existingNum) {
      updateSelectedLayer({ text: num });
      setSelectedLayerId(existingNum.id);
    } else {
      const newId = `layer-num-${Date.now()}`;
      const newLayer: CanvasLayer = {
        id: newId,
        type: 'number',
        category: 'plain_text',
        text: num,
        fontFamily: defaultFont.family,
        fontSize: 86,
        color: '#D4A029',
        strokeColor: '#0A1A3C',
        strokeWidth: 2,
        alignment: 'center',
        backgroundType: 'none',
        frameType: 'none',
        x: 50,
        y: 56,
        side: 'back',
        isVisible: true,
        zIndex: layers.length + 1,
        zone: 'back_number'
      };
      pushHistory([...layers, newLayer]);
      setSelectedLayerId(newId);
    }
    setCurrentSide('back');
  };

  // Add Graphic / Artwork
  const handleAddGraphic = (graphic: {
    name: string;
    type: 'badge' | 'logo' | 'graphic' | 'emoji';
    imageUrl?: string;
    text?: string;
  }) => {
    const newId = `layer-graphic-${Date.now()}`;
    const newLayer: CanvasLayer = {
      id: newId,
      type: graphic.type,
      category: 'graphic_artwork',
      graphicName: graphic.name,
      imageUrl: graphic.imageUrl,
      text: graphic.text,
      scale: 1,
      rotation: 0,
      opacity: 1,
      x: 50,
      y: currentSide === 'front' ? 44 : 58,
      side: currentSide,
      isVisible: true,
      zIndex: layers.length + 1,
      zone: currentSide === 'front' ? 'front_center' : 'back_sponsor'
    };

    pushHistory([...layers, newLayer]);
    setSelectedLayerId(newId);
  };

  // Upload Logo via Cloudinary
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Choose an image file such as PNG, JPG, or WebP.');
      e.target.value = '';
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Images must be 8 MB or smaller.');
      e.target.value = '';
      return;
    }

    setUploadProgress(10);
    setUploadError(null);

    try {
      const result = await uploadToCloudinary(file, percent => {
        setUploadProgress(percent);
      });

      if (result.success && result.secureUrl) {
        const newId = `layer-upload-${Date.now()}`;
        const newLayer: CanvasLayer = {
          id: newId,
          type: 'upload',
          category: 'graphic_artwork',
          graphicName: file.name.split('.')[0] || 'Uploaded Sponsor Logo',
          imageUrl: result.secureUrl,
          scale: 1,
          rotation: 0,
          opacity: 1,
          x: 50,
          y: currentSide === 'front' ? 46 : 60,
          side: currentSide,
          isVisible: true,
          zIndex: layers.length + 1,
          zone: currentSide === 'front' ? 'front_center' : 'back_sponsor'
        };

        pushHistory([...layers, newLayer]);
        setSelectedLayerId(newId);
        setUploadProgress(null);
      } else {
        setUploadError(result.error || 'Failed to upload image');
        setUploadProgress(null);
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Error communicating with upload service');
      setUploadProgress(null);
    }

    e.target.value = '';
  };

  // Position Nudge Helper
  const handleNudge = (dx: number, dy: number) => {
    if (!selectedLayer) return;
    const newX = Math.max(15, Math.min(85, selectedLayer.x + dx));
    const newY = Math.max(18, Math.min(82, selectedLayer.y + dy));
    updateSelectedLayer({ x: newX, y: newY });
  };

  // Templates
  const applyTemplate = (templateId: string) => {
    if (templateId === 'tournament') {
      const templateLayers: CanvasLayer[] = [
        {
          id: 'layer-name-tpl',
          type: 'name',
          category: 'plain_text',
          text: 'CHAMPION',
          fontFamily: defaultFont.family,
          fontSize: 34,
          color: '#D4A029',
          strokeColor: '#0A1A3C',
          strokeWidth: 0,
          letterSpacing: 2,
          alignment: 'center',
          x: 50,
          y: 28,
          side: 'back',
          isVisible: true,
          zIndex: 2,
          zone: 'back_name'
        },
        {
          id: 'layer-num-tpl',
          type: 'number',
          category: 'plain_text',
          text: '10',
          fontFamily: defaultFont.family,
          fontSize: 88,
          color: '#D4A029',
          strokeColor: '#0A1A3C',
          strokeWidth: 2,
          alignment: 'center',
          x: 50,
          y: 56,
          side: 'back',
          isVisible: true,
          zIndex: 1,
          zone: 'back_number'
        },
        {
          id: 'layer-badge-tpl',
          type: 'badge',
          category: 'graphic_artwork',
          graphicName: 'Gold Star Shield',
          x: 28,
          y: 32,
          side: 'front',
          isVisible: true,
          zIndex: 2,
          zone: 'front_chest'
        }
      ];
      pushHistory(templateLayers);
      setSelectedLayerId('layer-name-tpl');
    } else if (templateId === 'minimal') {
      const templateLayers: CanvasLayer[] = [
        {
          id: 'layer-name-tpl',
          type: 'name',
          category: 'plain_text',
          text: 'CAPTAIN',
          fontFamily: defaultFont.family,
          fontSize: 32,
          color: '#FFFFFF',
          letterSpacing: 1.5,
          alignment: 'center',
          x: 50,
          y: 30,
          side: 'back',
          isVisible: true,
          zIndex: 2,
          zone: 'back_name'
        },
        {
          id: 'layer-num-tpl',
          type: 'number',
          category: 'plain_text',
          text: '7',
          fontFamily: defaultFont.family,
          fontSize: 86,
          color: '#FFFFFF',
          alignment: 'center',
          x: 50,
          y: 58,
          side: 'back',
          isVisible: true,
          zIndex: 1,
          zone: 'back_number'
        }
      ];
      pushHistory(templateLayers);
      setSelectedLayerId('layer-name-tpl');
    } else if (templateId === 'corporate') {
      const templateLayers: CanvasLayer[] = [
        {
          id: 'layer-sponsor-front',
          type: 'text',
          category: 'plain_text',
          text: 'VISHCOM HOLDINGS',
          fontFamily: "'Syne', sans-serif",
          fontSize: 26,
          color: '#D4A029',
          frameType: 'solid',
          frameColor: '#D4A029',
          alignment: 'center',
          x: 50,
          y: 45,
          side: 'front',
          isVisible: true,
          zIndex: 2,
          zone: 'front_center'
        },
        {
          id: 'layer-num-front',
          type: 'number',
          category: 'plain_text',
          text: '9',
          fontFamily: defaultFont.family,
          fontSize: 32,
          color: '#FFFFFF',
          x: 72,
          y: 32,
          side: 'front',
          isVisible: true,
          zIndex: 1,
          zone: 'front_number'
        }
      ];
      pushHistory(templateLayers);
      setSelectedLayerId('layer-sponsor-front');
    }
  };

  // Pricing calculation
  const hasName = layers.some(l => l.type === 'name' && l.isVisible && (l.text || '').trim().length > 0);
  const hasNumber = layers.some(l => l.type === 'number' && l.isVisible && (l.text || '').trim().length > 0);
  const hasFrame = layers.some(l => l.frameType && l.frameType !== 'none' && l.isVisible);
  const hasBackground = layers.some(l => l.backgroundType && l.backgroundType !== 'none' && l.isVisible);
  const graphicsCount = layers.filter(l => (l.type === 'graphic' || l.type === 'upload') && l.isVisible).length;
  const logosCount = layers.filter(l => (l.type === 'logo' || l.type === 'badge') && l.isVisible).length;
  const emojisCount = layers.filter(l => l.type === 'emoji' && l.isVisible).length;

  const customizationTotal =
    (hasName ? pricing.namePrice : 0) +
    (hasNumber ? pricing.numberPrice : 0) +
    (hasFrame ? pricing.framePrice || 3000 : 0) +
    (hasBackground ? pricing.backgroundPrice || 3000 : 0) +
    graphicsCount * (pricing.graphicPrice || 5000) +
    logosCount * pricing.logoPrice +
    emojisCount * (pricing.emojiPrice || 1000);

  const totalJerseyPrice = product.basePrice + customizationTotal;

  // Persist design
  const handleSaveDesign = () => {
    const design: Omit<StudioDesign, 'id' | 'createdAt' | 'updatedAt'> = {
      title: `${product.name} Custom Edition`,
      productId: product.id,
      productName: product.name,
      baseJerseyColor: selectedColor,
      collarColor: '#D4A029',
      trimColor: '#D4A029',
      layers,
      totalCustomizationPrice: customizationTotal,
      status: 'draft'
    };
    store.saveDesign(design);
    setSaveSuccessNotice('Design saved to your Kitnova profile!');
    setTimeout(() => setSaveSuccessNotice(null), 3500);
  };

  // Add customized item to Cart
  const handleAddToCartClick = () => {
    const design: StudioDesign = {
      id: initialDesign?.id || `des-${Date.now()}`,
      title: `${product.name} Custom Edition`,
      productId: product.id,
      productName: product.name,
      baseJerseyColor: selectedColor,
      collarColor: '#D4A029',
      trimColor: '#D4A029',
      layers,
      totalCustomizationPrice: customizationTotal,
      status: 'approved',
      createdAt: initialDesign?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (onAddToCart) {
      onAddToCart(design, product, selectedSize, selectedColor, editingCartItemId);
    }
  };

  // Back confirmation handler
  const handleBackClick = () => {
    if (historyIndex > 0) {
      setShowUnsavedModal(true);
    } else if (onBack) {
      onBack();
    }
  };

  // TOOLBAR ITEMS IN EXACT VERTICAL ORDER (Spec Section 3 Region B)
  const TOOLBAR_ITEMS: Array<{
    id: StudioToolId;
    label: string;
    icon: React.ReactNode;
    description: string;
  }> = [
    { id: 'select', label: 'Select', icon: <Target className="w-5 h-5" />, description: 'Select & Move' },
    { id: 'text', label: 'Text', icon: <Type className="w-5 h-5" />, description: 'Custom Text' },
    { id: 'player_name', label: 'Player Name', icon: <User className="w-5 h-5" />, description: 'Squad Name' },
    { id: 'player_number', label: 'Player Number', icon: <Hash className="w-5 h-5" />, description: 'Squad Number' },
    { id: 'upload_logo', label: 'Upload Logo', icon: <Upload className="w-5 h-5" />, description: 'Cloudinary CDN' },
    { id: 'artwork', label: 'Artwork', icon: <Shield className="w-5 h-5" />, description: 'Badges & Crests' },
    { id: 'jersey_colors', label: 'Jersey Colors', icon: <Palette className="w-5 h-5" />, description: 'Kit Palette' },
    { id: 'fonts', label: 'Fonts', icon: <Sliders className="w-5 h-5" />, description: 'Typography' },
    { id: 'position', label: 'Position', icon: <Move className="w-5 h-5" />, description: 'Nudge & Align' },
    { id: 'layers', label: 'Layers', icon: <Layers className="w-5 h-5" />, description: 'Stack Order' },
    { id: 'templates', label: 'Templates', icon: <LayoutTemplate className="w-5 h-5" />, description: 'Design Presets' }
  ];

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col bg-[#0A1A3C] text-slate-100 font-sans">
      {/* Hidden File Input for Cloudinary Uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* ========================================================================= */}
      {/* REGION A: TOP NAVIGATION BAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 h-16 bg-[#071329]/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between shadow-lg">
        {/* Left Side: Back button, KITNOVA Logo, Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackClick}
            className="p-2 rounded-xl bg-[#0F2A5F]/50 border border-slate-700/80 hover:border-[#D4A029] text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Return to Shop"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#0F2A5F] to-[#D4A029] flex items-center justify-center font-black text-xs text-[#0A1A3C] shadow-md border border-[#D4A029]/40">
              K
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-white">KITNOVA</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#D4A029]/20 text-[#D4A029] border border-[#D4A029]/30 font-bold uppercase">
                  STUDIO
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Product Name, Front/Back Selector, 2D/3D Mode Switch */}
        <div className="hidden md:flex items-center gap-4">
          <div className="text-xs font-semibold text-slate-300 max-w-[220px] truncate" title={product.name}>
            {product.name}
          </div>

          {/* Front / Back Selector */}
          <div className="flex items-center bg-[#0A1A3C] p-1 rounded-xl border border-slate-700/80 shadow-inner">
            <button
              onClick={() => setCurrentSide('front')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentSide === 'front'
                  ? 'bg-[#D4A029] text-[#0A1A3C] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Front View
            </button>
            <button
              onClick={() => setCurrentSide('back')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentSide === 'back'
                  ? 'bg-[#D4A029] text-[#0A1A3C] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Back View
            </button>
          </div>

          {/* 2D Editor / 3D Preview Switch */}
          <div className="flex items-center bg-[#0A1A3C] p-1 rounded-xl border border-slate-700/80 shadow-inner">
            <button
              onClick={() => setEditorMode('2d')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                editorMode === '2d'
                  ? 'bg-[#0F2A5F] text-[#D4A029] border border-[#D4A029]/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shirt className="w-3.5 h-3.5" />
              <span>2D Editor</span>
            </button>
            <button
              onClick={() => setEditorMode('3d')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                editorMode === '3d'
                  ? 'bg-[#0F2A5F] text-[#D4A029] border border-[#D4A029]/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-[#D4A029]" />
              <span>3D Preview</span>
            </button>
          </div>
        </div>

        {/* Right Side: Undo, Redo, Save Design, Preview, Cart Badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
            title="Undo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
            title="Redo"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleSaveDesign}
            className="px-3 py-1.5 rounded-xl bg-[#0F2A5F] border border-[#D4A029]/40 text-[#D4A029] hover:bg-[#0F2A5F]/80 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            title="Save Design to Profile"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={() => setShowPreviewModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold hidden sm:flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Preview Design"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>

          {/* Cart Icon with real quantity badge */}
          <button
            onClick={onNavigateToCart}
            className="relative p-2 rounded-xl bg-[#0F2A5F]/50 border border-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
            title="Go to Cart"
          >
            <ShoppingBag className="w-4 h-4 text-[#D4A029]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#D4A029] text-[#0A1A3C] font-mono text-[10px] font-black flex items-center justify-center shadow-md">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Cloudinary Upload Feedback Progress Bar */}
      {uploadProgress !== null && (
        <div className="bg-[#0F2A5F] px-4 py-2 border-b border-[#D4A029]/30 flex items-center justify-between text-xs font-medium text-slate-200 animate-pulse">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 text-[#D4A029] animate-spin" />
            <span>Uploading custom logo to Cloudinary CDN ({uploadProgress}%)...</span>
          </div>
          <div className="w-32 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div
              className="bg-[#D4A029] h-full transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="bg-amber-950/90 text-amber-200 px-4 py-2 border-b border-amber-500/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>{uploadError}</span>
          </div>
          <button onClick={() => setUploadError(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Save Success Notice Banner */}
      {saveSuccessNotice && (
        <div className="bg-emerald-950/90 text-emerald-200 px-4 py-2 border-b border-emerald-500/50 flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{saveSuccessNotice}</span>
          </div>
          <button onClick={() => setSaveSuccessNotice(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN WORKSPACE BODY (REGION B + REGION C + REGION D) */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* ======================================================================= */}
        {/* REGION B: LEFT VERTICAL SIDE TOOLBAR (Width ~76-88px, exact vertical order) */}
        {/* ======================================================================= */}
        <aside className="hidden lg:flex w-20 flex-col items-center bg-[#071329] border-r border-slate-800 py-3 space-y-1.5 z-20 shrink-0 select-none overflow-y-auto">
          {TOOLBAR_ITEMS.map(item => {
            const isActive = activeTool === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTool(item.id);
                  if (item.id === 'upload_logo') {
                    fileInputRef.current?.click();
                  } else if (item.id === 'text' && !selectedLayer) {
                    handleAddTextElement('SPONSOR');
                  } else if (item.id === 'player_name') {
                    handleSetPlayerName('MUKASA');
                  } else if (item.id === 'player_number') {
                    handleSetPlayerNumber('10');
                  }
                }}
                className={`w-16 py-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer relative group ${
                  isActive
                    ? 'bg-[#0F2A5F] text-[#D4A029] shadow-md border border-[#D4A029]/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
                title={item.description}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#D4A029] rounded-r" />
                )}
                {item.icon}
                <span className="text-[9px] font-bold tracking-tight text-center leading-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </aside>

        {/* Mobile View Toggle Bar (Front/Back & 2D/3D for small screens) */}
        <div className="md:hidden flex items-center justify-between p-2.5 bg-[#071329] border-b border-slate-800 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentSide('front')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                currentSide === 'front' ? 'bg-[#D4A029] text-[#0A1A3C]' : 'text-slate-400'
              }`}
            >
              Front
            </button>
            <button
              onClick={() => setCurrentSide('back')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                currentSide === 'back' ? 'bg-[#D4A029] text-[#0A1A3C]' : 'text-slate-400'
              }`}
            >
              Back
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditorMode('2d')}
              className={`px-2 py-1 rounded-lg font-bold text-[11px] ${
                editorMode === '2d' ? 'bg-[#0F2A5F] text-[#D4A029]' : 'text-slate-400'
              }`}
            >
              2D Canvas
            </button>
            <button
              onClick={() => setEditorMode('3d')}
              className={`px-2 py-1 rounded-lg font-bold text-[11px] ${
                editorMode === '3d' ? 'bg-[#0F2A5F] text-[#D4A029]' : 'text-slate-400'
              }`}
            >
              3D View
            </button>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* REGION C: CENTRAL JERSEY CANVAS WORKSPACE */}
        {/* ======================================================================= */}
        <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto bg-gradient-to-b from-[#0A1A3C] via-[#081733] to-[#050e1f] relative">
          {editorMode === '2d' ? (
            <div className="w-full max-w-xl">
              <JerseyCanvas
                product={product}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
                currentSide={currentSide}
                layers={layers}
                selectedLayerId={selectedLayerId}
                onSelectLayer={handleSelectLayer}
                onUpdateLayerPosition={handleUpdatePosition}
                onUpdateLayerTransform={handleUpdateTransform}
                onDeleteLayer={handleDeleteLayer}
                showGuides={true}
              />
            </div>
          ) : (
            <div className="w-full max-w-xl">
              <Jersey3DPreview
                product={product}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
                layers={layers}
                currentSide={currentSide}
                onSwitchSide={setCurrentSide}
              />
            </div>
          )}

          {/* Quick Side Toggle Bar at Bottom Center */}
          <div className="mt-4 flex items-center gap-3 bg-[#071329]/90 border border-slate-700/80 px-4 py-2 rounded-2xl shadow-xl backdrop-blur-md">
            <span className="text-xs text-slate-400">Currently Editing:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentSide('front')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentSide === 'front'
                    ? 'bg-[#D4A029] text-[#0A1A3C] shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Front View
              </button>
              <button
                onClick={() => setCurrentSide('back')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentSide === 'back'
                    ? 'bg-[#D4A029] text-[#0A1A3C] shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Back View
              </button>
            </div>
          </div>
        </main>

        {/* ======================================================================= */}
        {/* REGION D: RIGHT CONTEXTUAL PROPERTIES PANEL (~280-320px) */}
        {/* ======================================================================= */}
        <aside className="w-full lg:w-80 bg-[#071329] border-t lg:border-t-0 lg:border-l border-slate-800 p-4 space-y-4 overflow-y-auto shrink-0 select-none">
          {/* Header of Properties Panel */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#D4A029]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-white">
                {selectedLayer ? `Edit: ${selectedLayer.type.toUpperCase()}` : `Tool: ${activeTool.replace('_', ' ').toUpperCase()}`}
              </h2>
            </div>
            {selectedLayer && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDuplicateLayer(selectedLayer.id)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                  title="Duplicate Layer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteLayer(selectedLayer.id)}
                  className="p-1 rounded text-red-400 hover:text-red-300"
                  title="Delete Layer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* D.1 CONTEXTUAL: WHEN AN ELEMENT IS SELECTED */}
          {selectedLayer ? (
            <div className="space-y-4 text-xs">
              {/* Text content input (for name, number, text) */}
              {(selectedLayer.type === 'name' || selectedLayer.type === 'number' || selectedLayer.type === 'text') && (
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    {selectedLayer.type === 'name' ? 'Player Name' : selectedLayer.type === 'number' ? 'Squad Number' : 'Text Content'}
                  </label>
                  <input
                    type="text"
                    value={selectedLayer.text || ''}
                    maxLength={selectedLayer.type === 'number' ? 3 : 16}
                    onChange={e => updateSelectedLayer({ text: selectedLayer.type === 'name' ? e.target.value.toUpperCase() : e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0A1A3C] border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-[#D4A029]"
                  />
                </div>
              )}

              {/* Font Family Chooser */}
              {(selectedLayer.type === 'name' || selectedLayer.type === 'number' || selectedLayer.type === 'text') && (
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Font Family</label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {enabledFonts.map(f => (
                      <button
                        key={f.id}
                        onClick={() => updateSelectedLayer({ fontFamily: f.family })}
                        style={{ fontFamily: f.family }}
                        className={`p-2 rounded-lg border text-xs text-left truncate transition-colors ${
                          selectedLayer.fontFamily === f.family
                            ? 'bg-[#0F2A5F] border-[#D4A029] text-[#D4A029] font-bold'
                            : 'bg-[#0A1A3C] border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Font Size & Scale Slider */}
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span className="font-semibold">Size Scale</span>
                  <span className="font-mono text-[#D4A029]">{selectedLayer.scale || 1}x</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="2.0"
                  step="0.05"
                  value={selectedLayer.scale || 1}
                  onChange={e => updateSelectedLayer({ scale: parseFloat(e.target.value) })}
                  className="w-full accent-[#D4A029] cursor-pointer"
                />
              </div>

              {/* Rotation Slider */}
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span className="font-semibold">Rotation Angle</span>
                  <span className="font-mono text-[#D4A029]">{selectedLayer.rotation || 0}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="5"
                  value={selectedLayer.rotation || 0}
                  onChange={e => updateSelectedLayer({ rotation: parseInt(e.target.value) })}
                  className="w-full accent-[#D4A029] cursor-pointer"
                />
              </div>

              {/* Text Color Swatches */}
              {(selectedLayer.type === 'name' || selectedLayer.type === 'number' || selectedLayer.type === 'text') && (
                <div>
                  <label className="block text-slate-400 mb-1.5 font-semibold">Element Color</label>
                  <div className="flex flex-wrap gap-2">
                    {['#D4A029', '#FFFFFF', '#0A1A3C', '#0F2A5F', '#EF4444', '#10B981', '#3B82F6', '#111827'].map(c => (
                      <button
                        key={c}
                        onClick={() => updateSelectedLayer({ color: c })}
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                          selectedLayer.color === c ? 'border-[#D4A029] scale-110 shadow-md ring-2 ring-white/50' : 'border-white/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Precise Position Nudge Buttons */}
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Precise Position Nudge</label>
                <div className="grid grid-cols-3 gap-1 w-32 mx-auto">
                  <div />
                  <button
                    onClick={() => handleNudge(0, -3)}
                    className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                  >
                    ▲
                  </button>
                  <div />
                  <button
                    onClick={() => handleNudge(-3, 0)}
                    className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                  >
                    ◀
                  </button>
                  <button
                    onClick={() => updateSelectedLayer({ x: 50 })}
                    className="p-2 rounded bg-[#0F2A5F] text-[#D4A029] text-[10px] font-bold"
                    title="Center Horizontally"
                  >
                    CTR
                  </button>
                  <button
                    onClick={() => handleNudge(3, 0)}
                    className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                  >
                    ▶
                  </button>
                  <div />
                  <button
                    onClick={() => handleNudge(0, 3)}
                    className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                  >
                    ▼
                  </button>
                  <div />
                </div>
              </div>

              {/* Layer Actions: Lock & Visibility */}
              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => toggleLayerLock(selectedLayer.id)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                    selectedLayer.isLocked
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {selectedLayer.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{selectedLayer.isLocked ? 'Locked' : 'Unlock'}</span>
                </button>
                <button
                  onClick={() => toggleLayerVisibility(selectedLayer.id)}
                  className="flex-1 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  {selectedLayer.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{selectedLayer.isVisible ? 'Visible' : 'Hidden'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* D.2 CONTEXTUAL: WHEN NO ELEMENT IS SELECTED (ACTIVE TOOL CONTROLS) */
            <div className="space-y-4 text-xs">
              {activeTool === 'select' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#0A1A3C] border border-slate-800 space-y-2">
                    <p className="font-bold text-white text-sm">{product.name}</p>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Tap any element on the jersey to select and adjust it, or pick a creation tool from the left toolbar.
                    </p>
                  </div>

                  {/* Size Selector */}
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Selected Jersey Size</label>
                    <div className="flex flex-wrap gap-1.5">
                      {product.sizes.map(s => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`px-3 py-1.5 rounded-lg font-mono font-bold text-xs transition-colors ${
                            selectedSize === s
                              ? 'bg-[#D4A029] text-[#0A1A3C] shadow-md'
                              : 'bg-[#0A1A3C] text-slate-300 border border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Customization Fee Breakdown */}
                  <div className="p-3 rounded-xl bg-[#0F2A5F]/40 border border-slate-800 space-y-1.5 text-[11px]">
                    <span className="font-bold text-white block pb-1 border-b border-slate-800">
                      Customization Price Breakdown
                    </span>
                    <div className="flex justify-between text-slate-300">
                      <span>Base Jersey:</span>
                      <span className="font-mono">UGX {product.basePrice.toLocaleString()}</span>
                    </div>
                    {hasName && (
                      <div className="flex justify-between text-[#D4A029]">
                        <span>Player Name:</span>
                        <span className="font-mono">+UGX {pricing.namePrice.toLocaleString()}</span>
                      </div>
                    )}
                    {hasNumber && (
                      <div className="flex justify-between text-[#D4A029]">
                        <span>Squad Number:</span>
                        <span className="font-mono">+UGX {pricing.numberPrice.toLocaleString()}</span>
                      </div>
                    )}
                    {logosCount > 0 && (
                      <div className="flex justify-between text-[#D4A029]">
                        <span>Logos / Badges ({logosCount}):</span>
                        <span className="font-mono">+UGX {(logosCount * pricing.logoPrice).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-white font-bold pt-1 border-t border-slate-800">
                      <span>Total Price:</span>
                      <span className="font-mono text-[#D4A029]">UGX {totalJerseyPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTool === 'text' && (
                <div className="space-y-3">
                  <p className="text-slate-400">Add a custom slogan, club motto, or sponsor text to the jersey.</p>
                  <button
                    onClick={() => handleAddTextElement('KAMPALA')}
                    className="w-full py-2.5 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Custom Text Element</span>
                  </button>
                </div>
              )}

              {activeTool === 'player_name' && (
                <div className="space-y-3">
                  <label className="block text-slate-400 font-semibold">Squad Player Name</label>
                  <input
                    type="text"
                    placeholder="e.g. MUKASA"
                    onChange={e => handleSetPlayerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0A1A3C] border border-slate-700 text-white font-bold text-sm uppercase focus:outline-none focus:border-[#D4A029]"
                  />
                  <p className="text-slate-500 text-[11px]">
                    Player names are placed on the upper back according to Kitnova tournament regulations.
                  </p>
                </div>
              )}

              {activeTool === 'player_number' && (
                <div className="space-y-3">
                  <label className="block text-slate-400 font-semibold">Squad Number (1 - 99)</label>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="10"
                    onChange={e => handleSetPlayerNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0A1A3C] border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-[#D4A029]"
                  />
                  <div className="grid grid-cols-4 gap-1.5 pt-2">
                    {['7', '9', '10', '11', '14', '17', '21', '99'].map(n => (
                      <button
                        key={n}
                        onClick={() => handleSetPlayerNumber(n)}
                        className="p-2 rounded-lg bg-[#0A1A3C] border border-slate-800 hover:border-[#D4A029] font-mono font-bold text-white text-xs"
                      >
                        #{n}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTool === 'upload_logo' && (
                <div className="space-y-3">
                  <p className="text-slate-400">
                    Upload your own club crest, sponsor logo, player image, badge, or tournament artwork. The image is added as a movable layer on the selected jersey side.
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 rounded-xl bg-[#0F2A5F] border border-[#D4A029]/50 text-[#D4A029] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#0F2A5F]/80 transition-colors shadow-md"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Choose Image from Device</span>
                  </button>
                  <p className="text-[10px] text-slate-500 font-mono">
                    PNG, JPG, WebP. Maximum 8 MB. Uploaded images can be resized, rotated, and repositioned on the jersey.
                  </p>
                </div>
              )}

              {activeTool === 'artwork' && (
                <div className="space-y-3">
                  {store.studioArtworks.some(item => item.isEnabled) && (
                    <div className="space-y-2">
                      <label className="block text-slate-400 font-semibold">Admin Artwork Library</label>
                      <div className="grid grid-cols-2 gap-2">
                        {store.studioArtworks.filter(item => item.isEnabled).map(item => (
                          <button key={item.id} onClick={() => handleAddGraphic({ name: item.name, type: 'graphic', imageUrl: item.imageUrl })} className="p-2 rounded-xl bg-[#0A1A3C] border border-slate-800 hover:border-[#D4A029] text-left space-y-1">
                            <img src={item.imageUrl} alt={item.name} loading="lazy" className="w-full h-16 object-contain rounded bg-slate-900" />
                            <span className="block text-[10px] text-white font-bold truncate">{item.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <label className="block text-slate-400 font-semibold">Kitnova Official Badges & Emojis</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Kitnova Crest', type: 'badge' as const },
                      { name: 'Champions Star', type: 'badge' as const },
                      { name: 'National Eagle', type: 'badge' as const },
                      { name: 'Gold Trophy', type: 'badge' as const }
                    ].map(a => (
                      <button
                        key={a.name}
                        onClick={() => handleAddGraphic(a)}
                        className="p-2.5 rounded-xl bg-[#0A1A3C] border border-slate-800 hover:border-[#D4A029] text-left space-y-1 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-[#D4A029]" />
                        <span className="font-bold text-white text-[11px] block">{a.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Sports Emojis */}
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Sports Emojis</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['⚽', '🏆', '🔥', '⚡', '🦁', '👑', '⭐', '🦅'].map(e => (
                        <button
                          key={e}
                          onClick={() => handleAddGraphic({ name: 'Emoji', type: 'emoji', text: e })}
                          className="w-8 h-8 rounded-lg bg-[#0A1A3C] border border-slate-800 hover:scale-110 text-lg flex items-center justify-center transition-transform"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTool === 'jersey_colors' && (
                <div className="space-y-3">
                  <label className="block text-slate-400 font-semibold">Available Product Colorways</label>
                  <div className="space-y-2">
                    {product.colors.map(colorHex => (
                      <button
                        key={colorHex}
                        onClick={() => setSelectedColor(colorHex)}
                        className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                          selectedColor === colorHex
                            ? 'bg-[#0F2A5F] border-[#D4A029] text-white'
                            : 'bg-[#0A1A3C] border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            style={{ backgroundColor: colorHex }}
                            className="w-5 h-5 rounded-full border border-white/60 shadow-sm"
                          />
                          <span className="font-mono text-xs">{colorHex}</span>
                        </div>
                        {selectedColor === colorHex && <Check className="w-4 h-4 text-[#D4A029]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTool === 'fonts' && (
                <div className="space-y-2">
                  <label className="block text-slate-400 font-semibold">Tournament Approved Fonts</label>
                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {enabledFonts.map(f => (
                      <div
                        key={f.id}
                        onClick={() => {
                          if (selectedLayer) {
                            updateSelectedLayer({ fontFamily: f.family });
                          }
                        }}
                        style={{ fontFamily: f.family }}
                        className="p-3 rounded-xl bg-[#0A1A3C] border border-slate-800 hover:border-[#D4A029] cursor-pointer transition-colors"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white">{f.name}</span>
                          <span className="text-[10px] text-[#D4A029]">KITNOVA 10</span>
                        </div>
                        <p className="text-lg text-slate-200 mt-1">{f.previewText || 'ABCDEFGHIJK 0123456789'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTool === 'position' && (
                <div className="space-y-3">
                  <label className="block text-slate-400 font-semibold">Standard Print Zones</label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {currentSide === 'back' ? (
                      <>
                        <button
                          onClick={() => handleNudge(0, -10)}
                          className="p-2 rounded-lg bg-[#0A1A3C] border border-slate-800 hover:border-[#D4A029] text-left text-xs font-semibold text-slate-300"
                        >
                          Upper Back Zone (Player Name)
                        </button>
                        <button
                          onClick={() => handleNudge(0, 0)}
                          className="p-2 rounded-lg bg-[#0A1A3C] border border-slate-800 hover:border-[#D4A029] text-left text-xs font-semibold text-slate-300"
                        >
                          Center Torso Zone (Squad Number)
                        </button>
                        <button
                          onClick={() => handleNudge(0, 15)}
                          className="p-2 rounded-lg bg-[#0A1A3C] border border-slate-800 hover:border-[#D4A029] text-left text-xs font-semibold text-slate-300"
                        >
                          Lower Back Zone (Sponsor / Club)
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleNudge(-15, -10)}
                          className="p-2 rounded-lg bg-[#0A1A3C] border border-slate-800 hover:border-[#D4A029] text-left text-xs font-semibold text-slate-300"
                        >
                          Left Chest (Club Crest)
                        </button>
                        <button
                          onClick={() => handleNudge(0, 0)}
                          className="p-2 rounded-lg bg-[#0A1A3C] border border-slate-800 hover:border-[#D4A029] text-left text-xs font-semibold text-slate-300"
                        >
                          Center Chest (Main Sponsor)
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeTool === 'layers' && (
                <div className="space-y-2">
                  <label className="block text-slate-400 font-semibold">
                    Current Side Layers ({layers.filter(l => l.side === currentSide).length})
                  </label>
                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {layers
                      .filter(l => l.side === currentSide)
                      .sort((a, b) => b.zIndex - a.zIndex)
                      .map(layer => (
                        <div
                          key={layer.id}
                          onClick={() => setSelectedLayerId(layer.id)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors cursor-pointer ${
                            selectedLayerId === layer.id
                              ? 'bg-[#0F2A5F] border-[#D4A029] text-white'
                              : 'bg-[#0A1A3C] border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-[10px] uppercase font-mono px-1 rounded bg-black/40 text-[#D4A029]">
                              {layer.type}
                            </span>
                            <span className="text-xs truncate font-semibold">
                              {layer.text || layer.graphicName || 'Layer'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                moveLayerZIndex(layer.id, 'up');
                              }}
                              className="p-1 hover:text-[#D4A029]"
                              title="Bring Forward"
                            >
                              ▲
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                moveLayerZIndex(layer.id, 'down');
                              }}
                              className="p-1 hover:text-[#D4A029]"
                              title="Send Backward"
                            >
                              ▼
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                toggleLayerVisibility(layer.id);
                              }}
                              className="p-1 text-slate-400 hover:text-white"
                            >
                              {layer.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {activeTool === 'templates' && (
                <div className="space-y-2.5">
                  <p className="text-slate-400">
                    Apply proven layout presets directly to this {product.name}.
                  </p>
                  <button
                    onClick={() => applyTemplate('tournament')}
                    className="w-full p-3 rounded-xl bg-[#0A1A3C] border border-slate-800 hover:border-[#D4A029] text-left space-y-1 transition-colors"
                  >
                    <span className="font-bold text-white block">Tournament Champion</span>
                    <span className="text-[11px] text-slate-400 block">
                      Player Name + Squad #10 + Gold star crest
                    </span>
                  </button>
                  <button
                    onClick={() => applyTemplate('minimal')}
                    className="w-full p-3 rounded-xl bg-[#0A1A3C] border border-slate-800 hover:border-[#D4A029] text-left space-y-1 transition-colors"
                  >
                    <span className="font-bold text-white block">Minimal Squad Edition</span>
                    <span className="text-[11px] text-slate-400 block">Clean captain name + bold squad #7</span>
                  </button>
                  <button
                    onClick={() => applyTemplate('corporate')}
                    className="w-full p-3 rounded-xl bg-[#0A1A3C] border border-slate-800 hover:border-[#D4A029] text-left space-y-1 transition-colors"
                  >
                    <span className="font-bold text-white block">Corporate Derby Kit</span>
                    <span className="text-[11px] text-slate-400 block">
                      Framed front sponsor + front mini squad number
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* BOTTOM SECTION: PRICING & ADD TO CART ACTION */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Total Unit Price</span>
                <span className="text-lg font-black text-[#D4A029] font-mono">
                  UGX {totalJerseyPrice.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Variant:</span>
                <span className="text-xs text-white font-bold">{selectedSize} · {product.name.split(' ')[0]}</span>
              </div>
            </div>

            <button
              onClick={handleAddToCartClick}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4A029] to-[#B3831B] text-[#0A1A3C] font-black text-xs hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add Customized Jersey to Cart</span>
            </button>
          </div>
        </aside>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE RESPONSIVE BOTTOM TOOLBAR (Phones & Small Devices) */}
      {/* ========================================================================= */}
      <nav className="lg:hidden sticky bottom-0 z-40 bg-[#071329]/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around py-2 px-1 text-[9px] font-bold text-slate-400">
        <button
          onClick={() => {
            setActiveTool('select');
            setSelectedLayerId(null);
          }}
          className={`flex flex-col items-center gap-1 ${activeTool === 'select' ? 'text-[#D4A029]' : ''}`}
        >
          <Target className="w-4 h-4" />
          <span>Select</span>
        </button>
        <button
          onClick={() => {
            setActiveTool('text');
            handleAddTextElement('SPONSOR');
          }}
          className={`flex flex-col items-center gap-1 ${activeTool === 'text' ? 'text-[#D4A029]' : ''}`}
        >
          <Type className="w-4 h-4" />
          <span>Text</span>
        </button>
        <button
          onClick={() => {
            setActiveTool('player_name');
            handleSetPlayerName('MUKASA');
          }}
          className={`flex flex-col items-center gap-1 ${activeTool === 'player_name' ? 'text-[#D4A029]' : ''}`}
        >
          <User className="w-4 h-4" />
          <span>Name</span>
        </button>
        <button
          onClick={() => {
            setActiveTool('player_number');
            handleSetPlayerNumber('10');
          }}
          className={`flex flex-col items-center gap-1 ${activeTool === 'player_number' ? 'text-[#D4A029]' : ''}`}
        >
          <Hash className="w-4 h-4" />
          <span>Number</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-white"
        >
          <Upload className="w-4 h-4" />
          <span>Logo</span>
        </button>
        <button
          onClick={() => setActiveTool('jersey_colors')}
          className={`flex flex-col items-center gap-1 ${activeTool === 'jersey_colors' ? 'text-[#D4A029]' : ''}`}
        >
          <Palette className="w-4 h-4" />
          <span>Colors</span>
        </button>
        <button
          onClick={() => setActiveTool('layers')}
          className={`flex flex-col items-center gap-1 ${activeTool === 'layers' ? 'text-[#D4A029]' : ''}`}
        >
          <Layers className="w-4 h-4" />
          <span>Layers</span>
        </button>
      </nav>

      {/* ========================================================================= */}
      {/* UNSAVED CHANGES GUARD MODAL (When Back is pressed with edits) */}
      {/* ========================================================================= */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A1A3C] border border-slate-700 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-500/50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Unsaved Jersey Design</h3>
                <p className="text-xs text-slate-400">You have made edits to this custom jersey.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Would you like to save your custom design before leaving the studio, or discard recent changes?
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  handleSaveDesign();
                  setShowUnsavedModal(false);
                  if (onBack) onBack();
                }}
                className="w-full py-2.5 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-bold text-xs hover:bg-[#F0C760] transition-colors"
              >
                Save & Exit to Shop
              </button>
              <button
                onClick={() => {
                  setShowUnsavedModal(false);
                  if (onBack) onBack();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:text-white"
              >
                Discard Changes
              </button>
              <button
                onClick={() => setShowUnsavedModal(false)}
                className="w-full py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
              >
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULL DESIGN PREVIEW MODAL */}
      {/* ========================================================================= */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0A1A3C] border border-slate-700 rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-[#D4A029] uppercase font-bold">KITNOVA STUDIO SPECIFICATION</span>
                <h2 className="text-lg font-black text-white">{product.name}</h2>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Side-by-Side Dual View: Front & Back */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block text-center">FRONT VIEW</span>
                <JerseyCanvas
                  product={product}
                  selectedColor={selectedColor}
                  selectedSize={selectedSize}
                  currentSide="front"
                  layers={layers}
                  selectedLayerId={null}
                  onSelectLayer={() => {}}
                  showGuides={false}
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block text-center">BACK VIEW</span>
                <JerseyCanvas
                  product={product}
                  selectedColor={selectedColor}
                  selectedSize={selectedSize}
                  currentSide="back"
                  layers={layers}
                  selectedLayerId={null}
                  onSelectLayer={() => {}}
                  showGuides={false}
                />
              </div>
            </div>

            {/* Spec Footer & Add to Cart */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <div>
                <span className="text-xs text-slate-400 block">Unit Price (Includes Full Customization)</span>
                <span className="text-xl font-black text-[#D4A029] font-mono">
                  UGX {totalJerseyPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleSaveDesign();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#0F2A5F] text-[#D4A029] border border-[#D4A029]/50 font-bold text-xs hover:bg-[#0F2A5F]/80"
                >
                  Save Design
                </button>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    handleAddToCartClick();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-black text-xs hover:bg-[#F0C760]"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
