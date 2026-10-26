import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CanvasLayer, Product } from '../../types';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Compass,
  Shirt,
  Sparkles,
  Info
} from 'lucide-react';

interface Jersey3DPreviewProps {
  product: Product;
  selectedColor: string;
  selectedSize: string;
  layers: CanvasLayer[];
  currentSide: 'front' | 'back';
  onSwitchSide?: (side: 'front' | 'back') => void;
}

export const Jersey3DPreview: React.FC<Jersey3DPreviewProps> = ({
  product,
  selectedColor,
  selectedSize,
  layers,
  currentSide,
  onSwitchSide
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [textureStatus, setTextureStatus] = useState<'generating' | 'ready'>('generating');

  // Three.js scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const jerseyGroupRef = useRef<THREE.Group | null>(null);
  const frontMeshRef = useRef<THREE.Mesh | null>(null);
  const backMeshRef = useRef<THREE.Mesh | null>(null);
  const frontTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const backTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Interaction dragging state
  const isDraggingRef = useRef(false);
  const prevMousePos = useRef({ x: 0, y: 0 });
  const rotationVelocity = useRef({ x: 0, y: 0 });

  // Generate 2D Texture Canvas for Front & Back
  const createJerseyTexture = (side: 'front' | 'back') => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // 1. Base Jersey Color
    ctx.fillStyle = selectedColor;
    ctx.fillRect(0, 0, 1024, 1024);

    // 2. Micro-Mesh Athletic Fabric Pattern
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let x = 0; x < 1024; x += 16) {
      for (let y = 0; y < 1024; y += 16) {
        ctx.fillRect(x, y, 4, 4);
      }
    }

    // 3. Subtle Athletic Contours & Shadows
    const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // 4. Aerodynamic Side Rib Panels
    const isLight = selectedColor === '#FFFFFF' || selectedColor === '#F0C760' || selectedColor === '#EAB308';
    const trimColor = isLight ? '#0F2A5F' : '#D4A029';
    ctx.fillStyle = trimColor;
    ctx.fillRect(0, 0, 90, 1024);
    ctx.fillRect(934, 0, 90, 1024);

    // 5. Collar & Neck Ribbing
    ctx.fillStyle = isLight ? '#0A1A3C' : '#D4A029';
    ctx.fillRect(362, 0, 300, 70);

    if (side === 'front') {
      // Kitnova Wordmark Brandmark on upper chest
      ctx.fillStyle = trimColor;
      ctx.font = 'bold 32px "Syne", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('KITNOVA', 680, 260);

      // Bottom hemline authentic tag
      ctx.fillStyle = '#0A1A3C';
      ctx.fillRect(200, 960, 140, 40);
      ctx.strokeStyle = '#D4A029';
      ctx.lineWidth = 3;
      ctx.strokeRect(200, 960, 140, 40);
      ctx.fillStyle = '#D4A029';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('OFFICIAL KIT', 270, 986);
    } else {
      // National pride flag on back collar
      ctx.fillStyle = '#111827';
      ctx.fillRect(487, 80, 50, 10);
      ctx.fillStyle = '#EAB308';
      ctx.fillRect(487, 90, 50, 10);
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(487, 100, 50, 10);
    }

    // 6. Draw Customer Customization Layers for this side
    const sideLayers = layers
      .filter((l) => l.side === side && l.isVisible)
      .sort((a, b) => a.zIndex - b.zIndex);

    sideLayers.forEach((layer) => {
      const cx = (layer.x / 100) * 1024;
      const cy = (layer.y / 100) * 1024;

      ctx.save();
      ctx.translate(cx, cy);
      if (layer.rotation) {
        ctx.rotate((layer.rotation * Math.PI) / 180);
      }
      const scale = layer.scale || 1;
      ctx.scale(scale, scale);

      // Render Text / Name / Number
      if (layer.text) {
        const fontSize = (layer.fontSize || 32) * 2.8;
        const fontName = layer.fontFamily || 'sans-serif';
        ctx.font = `bold ${fontSize}px ${fontName}`;
        ctx.textAlign = layer.alignment || 'center';
        ctx.textBaseline = 'middle';

        // Background box if selected
        if (layer.backgroundType && layer.backgroundType !== 'none') {
          const metrics = ctx.measureText(layer.text);
          const padX = 24;
          const padY = 16;
          ctx.fillStyle = layer.backgroundColor || '#0F2A5F';
          ctx.fillRect(
            -metrics.width / 2 - padX,
            -fontSize / 2 - padY,
            metrics.width + padX * 2,
            fontSize + padY * 2
          );
        }

        // Frame border
        if (layer.frameType && layer.frameType !== 'none') {
          const metrics = ctx.measureText(layer.text);
          const padX = 24;
          const padY = 16;
          ctx.strokeStyle = layer.frameColor || '#D4A029';
          ctx.lineWidth = 6;
          ctx.strokeRect(
            -metrics.width / 2 - padX,
            -fontSize / 2 - padY,
            metrics.width + padX * 2,
            fontSize + padY * 2
          );
        }

        // Stroke outline
        if (layer.strokeWidth && layer.strokeWidth > 0) {
          ctx.strokeStyle = layer.strokeColor || '#0A1A3C';
          ctx.lineWidth = layer.strokeWidth * 3.5;
          ctx.strokeText(layer.text, 0, 0);
        }

        // Main text fill
        ctx.fillStyle = layer.color || '#D4A029';
        ctx.fillText(layer.text, 0, 0);
      }

      // Render Graphic / Uploaded Logo
      if (layer.imageUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = layer.imageUrl;
        if (img.complete && img.naturalWidth > 0) {
          const imgSize = 220;
          ctx.drawImage(img, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
        }
      }

      ctx.restore();
    });

    return canvas;
  };

  // Build Procedural 3D Jersey Mesh Group
  const buildJerseyGroup = (): THREE.Group => {
    const group = new THREE.Group();

    // Materials with Fabric PBR Characteristics
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // Create Front and Back Textures
    const frontCanvas = createJerseyTexture('front');
    const backCanvas = createJerseyTexture('back');

    const frontTexture = new THREE.CanvasTexture(frontCanvas);
    frontTexture.colorSpace = THREE.SRGBColorSpace;
    frontTexture.anisotropy = 8;
    frontTextureRef.current = frontTexture;

    const backTexture = new THREE.CanvasTexture(backCanvas);
    backTexture.colorSpace = THREE.SRGBColorSpace;
    backTexture.anisotropy = 8;
    backTextureRef.current = backTexture;

    const frontMaterial = new THREE.MeshStandardMaterial({
      map: frontTexture,
      roughness: 0.65,
      metalness: 0.08,
      bumpScale: 0.02
    });

    const backMaterial = new THREE.MeshStandardMaterial({
      map: backTexture,
      roughness: 0.65,
      metalness: 0.08,
      bumpScale: 0.02
    });

    const collarMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(selectedColor === '#FFFFFF' ? '#0F2A5F' : '#D4A029'),
      roughness: 0.5,
      metalness: 0.15
    });

    const trimMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(selectedColor === '#FFFFFF' ? '#0F2A5F' : '#D4A029'),
      roughness: 0.45,
      metalness: 0.3
    });

    // 1. Torso Front Panel (Curved athletic mesh)
    const torsoFrontGeom = new THREE.CylinderGeometry(1.35, 1.25, 3.4, 32, 1, false, 0, Math.PI);
    torsoFrontGeom.scale(1, 1, 0.55);
    const torsoFrontMesh = new THREE.Mesh(torsoFrontGeom, frontMaterial);
    torsoFrontMesh.position.set(0, 0, 0);
    torsoFrontMesh.castShadow = !isSoftwareGl;
    torsoFrontMesh.receiveShadow = !isSoftwareGl;
    group.add(torsoFrontMesh);
    frontMeshRef.current = torsoFrontMesh;

    // 2. Torso Back Panel (Curved athletic mesh)
    const torsoBackGeom = new THREE.CylinderGeometry(1.35, 1.25, 3.4, 32, 1, false, Math.PI, Math.PI);
    torsoBackGeom.scale(1, 1, 0.55);
    const torsoBackMesh = new THREE.Mesh(torsoBackGeom, backMaterial);
    torsoBackMesh.position.set(0, 0, 0);
    torsoBackMesh.castShadow = !isSoftwareGl;
    torsoBackMesh.receiveShadow = !isSoftwareGl;
    group.add(torsoBackMesh);
    backMeshRef.current = torsoBackMesh;

    // 3. Left Sleeve (Athletic angled cylinder)
    const sleeveGeom = new THREE.CylinderGeometry(0.55, 0.48, 1.4, 24);
    const leftSleeve = new THREE.Mesh(sleeveGeom, frontMaterial);
    leftSleeve.position.set(-1.65, 0.95, 0);
    leftSleeve.rotation.set(0, 0, Math.PI / 3.4);
    group.add(leftSleeve);

    // Left Sleeve Gold Cuff Ring
    const cuffGeom = new THREE.TorusGeometry(0.5, 0.05, 16, 32);
    const leftCuff = new THREE.Mesh(cuffGeom, trimMaterial);
    leftCuff.position.set(-2.15, 0.55, 0);
    leftCuff.rotation.set(Math.PI / 2, Math.PI / 3.4, 0);
    group.add(leftCuff);

    // 4. Right Sleeve
    const rightSleeve = new THREE.Mesh(sleeveGeom, frontMaterial);
    rightSleeve.position.set(1.65, 0.95, 0);
    rightSleeve.rotation.set(0, 0, -Math.PI / 3.4);
    group.add(rightSleeve);

    // Right Sleeve Gold Cuff Ring
    const rightCuff = new THREE.Mesh(cuffGeom, trimMaterial);
    rightCuff.position.set(2.15, 0.55, 0);
    rightCuff.rotation.set(Math.PI / 2, -Math.PI / 3.4, 0);
    group.add(rightCuff);

    // 5. Collar Ribbing (Crew/V-neck ring)
    const collarGeom = new THREE.TorusGeometry(0.68, 0.08, 16, 40);
    const collarMesh = new THREE.Mesh(collarGeom, collarMaterial);
    collarMesh.position.set(0, 1.7, 0);
    collarMesh.rotation.set(Math.PI / 2.1, 0, 0);
    group.add(collarMesh);

    // 6. Ground Radial Contact Shadow Disc
    const shadowGeom = new THREE.CircleGeometry(2.4, 32);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const sGrad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
      sGrad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
      sGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
      sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = sGrad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.6,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeom, shadowMat);
    shadowMesh.position.set(0, -2.1, 0);
    shadowMesh.rotation.set(-Math.PI / 2, 0, 0);
    group.add(shadowMesh);

    return group;
  };

  // Initialize Three.js Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 560;

    // 1. Scene & Background
    const scene = new THREE.Scene();
    scene.background = null; // Transparent to blend seamlessly with Kitnova Navy background
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 6.2);
    cameraRef.current = camera;

    // 3. Renderer
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Studio 3-Point Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7e6, 2.8);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd9ebff, 1.6);
    fillLight.position.set(-4, 3, 4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xd4a029, 2.2); // Warm gold rim light
    rimLight.position.set(0, 4, -5);
    scene.add(rimLight);

    // 5. Mount Jersey Model
    const jerseyGroup = buildJerseyGroup();
    // Default rotation towards current side
    if (currentSide === 'back') {
      jerseyGroup.rotation.y = Math.PI;
    }
    scene.add(jerseyGroup);
    jerseyGroupRef.current = jerseyGroup;
    setTextureStatus('ready');

    // 6. Animation Loop
    let lastTime = performance.now();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (jerseyGroupRef.current) {
        if (isRotating && !isDraggingRef.current) {
          jerseyGroupRef.current.rotation.y += delta * 0.45;
        }

        // Apply damping to manual spin
        if (!isDraggingRef.current) {
          jerseyGroupRef.current.rotation.y += rotationVelocity.current.y;
          jerseyGroupRef.current.rotation.x += rotationVelocity.current.x;
          rotationVelocity.current.y *= 0.92;
          rotationVelocity.current.x *= 0.92;
          // Constrain vertical tilt
          jerseyGroupRef.current.rotation.x = Math.max(-0.4, Math.min(0.4, jerseyGroupRef.current.rotation.x));
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current?.domElement && container.contains(rendererRef.current.domElement)) {
        container.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
      frontTextureRef.current?.dispose();
      backTextureRef.current?.dispose();
    };
  }, []);

  // Re-generate textures when layers, color, or product change
  useEffect(() => {
    if (!frontMeshRef.current || !backMeshRef.current) return;

    const frontCanvas = createJerseyTexture('front');
    const backCanvas = createJerseyTexture('back');

    if (frontTextureRef.current) {
      frontTextureRef.current.image = frontCanvas;
      frontTextureRef.current.needsUpdate = true;
    }
    if (backTextureRef.current) {
      backTextureRef.current.image = backCanvas;
      backTextureRef.current.needsUpdate = true;
    }
  }, [layers, selectedColor, product, selectedSize]);

  // Pointer Interaction (Rotate & Tilt 3D Jersey)
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    prevMousePos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !jerseyGroupRef.current) return;
    const dx = e.clientX - prevMousePos.current.x;
    const dy = e.clientY - prevMousePos.current.y;

    rotationVelocity.current = {
      x: dy * 0.005,
      y: dx * 0.007
    };

    jerseyGroupRef.current.rotation.y += dx * 0.01;
    jerseyGroupRef.current.rotation.x += dy * 0.006;
    jerseyGroupRef.current.rotation.x = Math.max(-0.4, Math.min(0.4, jerseyGroupRef.current.rotation.x));

    prevMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Safe catch
    }
  };

  // Preset Views
  const rotateToView = (targetY: number, side: 'front' | 'back') => {
    setIsRotating(false);
    if (jerseyGroupRef.current) {
      jerseyGroupRef.current.rotation.y = targetY;
      jerseyGroupRef.current.rotation.x = 0;
    }
    if (onSwitchSide) onSwitchSide(side);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const newZ = direction === 'in' ? Math.max(3.8, cameraRef.current.position.z - 0.6) : Math.min(8.5, cameraRef.current.position.z + 0.6);
    cameraRef.current.position.z = newZ;
    setZoomLevel(Math.round((6.2 / newZ) * 100));
  };

  const handleResetCamera = () => {
    if (cameraRef.current && jerseyGroupRef.current) {
      cameraRef.current.position.set(0, 0.2, 6.2);
      jerseyGroupRef.current.rotation.set(0, currentSide === 'back' ? Math.PI : 0, 0);
      setZoomLevel(100);
      setIsRotating(true);
    }
  };

  return (
    <div className="relative w-full aspect-[4/5] max-w-[560px] mx-auto select-none rounded-3xl overflow-hidden bg-gradient-to-b from-[#0F2A5F]/30 via-[#0A1A3C]/60 to-[#071329] border border-[#D4A029]/30 shadow-2xl flex items-center justify-center backdrop-blur-md">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Top Telemetry & Status Badges */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="px-3 py-1 rounded-xl bg-[#0A1A3C]/90 border border-[#D4A029]/40 text-[11px] font-bold text-white flex items-center gap-1.5 shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-[#D4A029]" />
          <span>REAL-TIME 3D PREVIEW</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-mono">
          WebGL PBR
        </span>
      </div>

      {/* Product & Variant Tag */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1 rounded-xl bg-[#0A1A3C]/90 border border-slate-700/80 text-xs font-mono text-slate-300 shadow-lg">
        <span
          style={{ backgroundColor: selectedColor }}
          className="w-3.5 h-3.5 rounded-full border border-white/70 shadow-sm inline-block"
        />
        <span className="font-bold text-white">{product.name.split(' ')[0]}</span>
        <span className="text-[#D4A029] font-bold">[{selectedSize}]</span>
      </div>

      {/* Interactive 3D Camera & View Controls Dock */}
      <div className="absolute bottom-4 inset-x-4 z-20 flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-[#0A1A3C]/95 border border-slate-700/80 shadow-2xl backdrop-blur-md">
        {/* Preset Angle Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => rotateToView(0, 'front')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentSide === 'front' && !isRotating
                ? 'bg-[#D4A029] text-[#0A1A3C] shadow-md'
                : 'bg-[#0F2A5F]/70 text-slate-300 hover:text-white hover:bg-[#0F2A5F]'
            }`}
          >
            Front View
          </button>
          <button
            onClick={() => rotateToView(Math.PI, 'back')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentSide === 'back' && !isRotating
                ? 'bg-[#D4A029] text-[#0A1A3C] shadow-md'
                : 'bg-[#0F2A5F]/70 text-slate-300 hover:text-white hover:bg-[#0F2A5F]'
            }`}
          >
            Back View
          </button>
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-all cursor-pointer ${
              isRotating
                ? 'bg-[#0F2A5F] border-[#D4A029]/50 text-[#D4A029]'
                : 'bg-slate-800/80 border-slate-700 text-slate-400'
            }`}
            title="Toggle 360° Automatic Turntable Rotation"
          >
            <Compass className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            <span className="text-[10px] font-mono hidden sm:inline">{isRotating ? 'Spinning' : 'Static'}</span>
          </button>
        </div>

        {/* Zoom & Reset Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleZoom('in')}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom('out')}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetCamera}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Reset Camera & Angle"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Helpful gesture guide */}
      <div className="absolute top-14 left-4 z-10 pointer-events-none opacity-60 text-[10px] text-slate-400 font-mono hidden sm:flex items-center gap-1.5">
        <Info className="w-3 h-3 text-[#D4A029]" />
        <span>Drag to rotate 360° · Scroll to zoom</span>
      </div>
    </div>
  );
};
