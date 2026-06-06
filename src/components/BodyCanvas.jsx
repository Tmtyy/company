import { useRef, useEffect, useState, useCallback } from 'react';
import { BODY_VIEWS } from '../utils/bodyPaths';
import { SKIN_TONES } from '../utils/measurements';

const VIEWS = ['front', 'back', 'left-arm', 'right-arm', 'ribs'];

export default function BodyCanvas({
  layers, selectedId, setSelectedId, onUpdateLayer,
  calibration, unit, measureTool, setMeasureResult,
  skinTone, setSkinTone
}) {
  const svgRef = useRef();
  const overlayRef = useRef(); // canvas for designs + measurements
  const containerRef = useRef();
  const [view, setView] = useState('front');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [measurePts, setMeasurePts] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const imgCache = useRef({});
  const animRef = useRef();

  const bodyView = BODY_VIEWS[view];

  // Load images into cache
  useEffect(() => {
    layers.forEach(layer => {
      if (layer.url && !imgCache.current[layer.url]) {
        const img = new Image();
        img.onload = () => { imgCache.current[layer.url] = img; redraw(); };
        img.src = layer.url;
      }
    });
  }, [layers]);

  const getCanvas = () => overlayRef.current;
  const getCtx = () => overlayRef.current?.getContext('2d');

  function layerScreenPos(layer) {
    const svg = svgRef.current;
    if (!svg) return { x: layer.x || 200, y: layer.y || 200 };
    return { x: layer.x || 200, y: layer.y || 200 };
  }

  function redraw() {
    const canvas = getCanvas();
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw layers
    layers.forEach(layer => {
      if (layer.visible === false) return;
      const img = imgCache.current[layer.url];
      if (!img) return;

      const x = layer.x ?? 200;
      const y = layer.y ?? 200;
      const w = layer.width ?? 100;
      const h = layer.height ?? 100;
      const rot = (layer.rotation ?? 0) * Math.PI / 180;
      const sx = layer.scaleX ?? 1;
      const sy = layer.scaleY ?? 1;
      const opacity = layer.opacity ?? 1;
      const isSelected = layer.id === selectedId;

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(sx > 0 ? 1 : -1, sy > 0 ? 1 : -1);

      if (layer.stencil) {
        // Draw stencil (black outline simulation)
        const offscreen = document.createElement('canvas');
        offscreen.width = w; offscreen.height = h;
        const octx = offscreen.getContext('2d');
        octx.drawImage(img, 0, 0, w, h);
        const id = octx.getImageData(0, 0, w, h);
        for (let i = 0; i < id.data.length; i += 4) {
          const a = id.data[i + 3];
          const lum = (id.data[i] + id.data[i+1] + id.data[i+2]) / 3;
          id.data[i] = lum < 128 ? 0 : 255;
          id.data[i+1] = lum < 128 ? 0 : 255;
          id.data[i+2] = lum < 128 ? 0 : 255;
        }
        octx.putImageData(id, 0, 0);
        ctx.drawImage(offscreen, -w / 2, -h / 2, w, h);
      } else {
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      }

      ctx.restore();

      // Selection handles
      if (isSelected) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.strokeRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8);
        ctx.setLineDash([]);
        // Corner handles
        const corners = [[-w/2-4,-h/2-4],[w/2+4,-h/2-4],[w/2+4,h/2+4],[-w/2-4,h/2+4]];
        corners.forEach(([cx, cy]) => {
          ctx.fillStyle = '#7c3aed';
          ctx.beginPath();
          ctx.arc(cx, cy, 5, 0, Math.PI * 2);
          ctx.fill();
        });
        // Rotation handle
        ctx.fillStyle = '#a78bfa';
        ctx.beginPath();
        ctx.arc(0, -h/2 - 20, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -h/2 - 4);
        ctx.lineTo(0, -h/2 - 15);
        ctx.stroke();
        ctx.restore();

        // Size readout
        const ppc = calibration?.pxPerCm;
        let label;
        if (ppc) {
          const wR = (w / ppc).toFixed(1);
          const hR = (h / ppc).toFixed(1);
          const u = unit === 'cm' ? 'cm' : '"';
          const wFinal = unit === 'in' ? (w / ppc / 2.54).toFixed(2) : wR;
          const hFinal = unit === 'in' ? (h / ppc / 2.54).toFixed(2) : hR;
          label = `${wFinal} × ${hFinal} ${u}`;
        } else {
          label = `${Math.round(w)} × ${Math.round(h)} px`;
        }
        ctx.save();
        ctx.fillStyle = 'rgba(124,58,237,0.9)';
        ctx.font = 'bold 11px Inter, sans-serif';
        const tw = ctx.measureText(label).width;
        ctx.fillRect(x - tw/2 - 6, y + h/2 + 10, tw + 12, 18);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, y + h/2 + 22);
        ctx.restore();
      }
    });

    // Measure tool overlay
    if (measurePts.length === 1) {
      const p = measurePts[0];
      ctx.save();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    if (measurePts.length === 2) {
      const [a, b] = measurePts;
      ctx.save();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);
      [a, b].forEach(p => {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const ppc = calibration?.pxPerCm;
      let lbl = `${Math.round(dist)} px`;
      if (ppc) {
        const cm = dist / ppc;
        lbl = unit === 'cm' ? `${cm.toFixed(1)} cm` : `${(cm/2.54).toFixed(2)}"`;
      }
      ctx.fillStyle = 'rgba(245,158,11,0.9)';
      ctx.font = 'bold 12px Inter,sans-serif';
      const tw = ctx.measureText(lbl).width;
      ctx.fillRect(mx - tw/2 - 6, my - 20, tw + 12, 20);
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.fillText(lbl, mx, my - 5);
      ctx.restore();
    }
  }

  useEffect(() => { redraw(); }, [layers, selectedId, measurePts, calibration, unit]);

  // Sync canvas size to container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const canvas = getCanvas();
      if (!canvas) return;
      canvas.width = el.clientWidth;
      canvas.height = el.clientHeight;
      redraw();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [layers, selectedId]);

  function hitTest(mx, my) {
    for (let i = layers.length - 1; i >= 0; i--) {
      const l = layers[i];
      if (l.visible === false) continue;
      const x = l.x ?? 200, y = l.y ?? 200;
      const w = l.width ?? 100, h = l.height ?? 100;
      const rot = (l.rotation ?? 0) * Math.PI / 180;
      const dx = mx - x, dy = my - y;
      const lx = dx * Math.cos(-rot) - dy * Math.sin(-rot);
      const ly = dx * Math.sin(-rot) + dy * Math.cos(-rot);
      if (lx >= -w/2 && lx <= w/2 && ly >= -h/2 && ly <= h/2) return l;
    }
    return null;
  }

  function hitRotHandle(mx, my, layer) {
    if (!layer) return false;
    const x = layer.x ?? 200, y = layer.y ?? 200;
    const h = layer.height ?? 100;
    const rot = (layer.rotation ?? 0) * Math.PI / 180;
    const hx = x + Math.sin(rot) * (h/2 + 20) * -1;
    const hy = y - Math.cos(rot) * (h/2 + 20);
    return Math.sqrt((mx-hx)**2 + (my-hy)**2) < 10;
  }

  function getCanvasXY(e) {
    const rect = getCanvas().getBoundingClientRect();
    const scaleX = getCanvas().width / rect.width;
    const scaleY = getCanvas().height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function onMouseDown(e) {
    if (e.button !== 0) return;
    const { x, y } = getCanvasXY(e);

    if (measureTool) {
      if (measurePts.length >= 2) {
        setMeasurePts([{ x, y }]);
        setMeasureResult(null);
      } else {
        const newPts = [...measurePts, { x, y }];
        setMeasurePts(newPts);
        if (newPts.length === 2) {
          const [a, b] = newPts;
          const dx = b.x - a.x, dy = b.y - a.y;
          setMeasureResult({ distPx: Math.sqrt(dx*dx+dy*dy), dx, dy });
        }
      }
      return;
    }

    const sel = layers.find(l => l.id === selectedId);
    if (sel && hitRotHandle(x, y, sel)) {
      setResizing({ type: 'rotate', id: sel.id, startX: x, startY: y, startRot: sel.rotation ?? 0, cx: sel.x ?? 200, cy: sel.y ?? 200 });
      return;
    }
    const hit = hitTest(x, y);
    if (hit) {
      setSelectedId(hit.id);
      setDragging({ id: hit.id, offX: x - (hit.x ?? 200), offY: y - (hit.y ?? 200) });
    } else {
      setSelectedId(null);
    }
  }

  function onMouseMove(e) {
    const { x, y } = getCanvasXY(e);
    if (dragging) {
      onUpdateLayer(dragging.id, { x: x - dragging.offX, y: y - dragging.offY });
      return;
    }
    if (resizing?.type === 'rotate') {
      const dx = x - resizing.cx, dy = y - resizing.cy;
      const angle = Math.atan2(dx, -dy) * 180 / Math.PI;
      onUpdateLayer(resizing.id, { rotation: angle });
      return;
    }
    const hit = hitTest(x, y);
    setHoveredId(hit?.id ?? null);
    getCanvas().style.cursor = hit ? 'move' : measureTool ? 'crosshair' : 'default';
  }

  function onMouseUp() {
    setDragging(null);
    setResizing(null);
  }

  const wheelHandler = useCallback((e) => {
    e.preventDefault();
    setZoom(z => Math.min(3, Math.max(0.4, z - e.deltaY * 0.001)));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', wheelHandler, { passive: false });
    return () => el.removeEventListener('wheel', wheelHandler);
  }, [wheelHandler]);

  const currentSkin = SKIN_TONES.find(s => s.value === skinTone) || SKIN_TONES[1];

  return (
    <div className="flex flex-col h-full">
      {/* Top toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#16161f] border-b border-[#2a2a38] flex-wrap">
        <div className="flex gap-1">
          {VIEWS.map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${view === v ? 'bg-violet-600 text-white' : 'bg-[#1e1e2a] text-slate-400 hover:text-white hover:bg-[#2a2a38]'}`}>
              {BODY_VIEWS[v].label}
            </button>
          ))}
        </div>
        <div className="w-px h-5 bg-[#2a2a38] mx-1" />
        {/* Skin tones */}
        <div className="flex gap-1.5 items-center">
          {SKIN_TONES.map(st => (
            <button key={st.value} onClick={() => setSkinTone(st.value)} title={st.label}
              className={`w-6 h-6 rounded-full border-2 transition-all ${skinTone === st.value ? 'border-violet-400 scale-110' : 'border-transparent hover:border-slate-500'}`}
              style={{ background: st.hex }} />
          ))}
        </div>
        <div className="w-px h-5 bg-[#2a2a38] mx-1" />
        {/* Zoom */}
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))}
            className="w-6 h-6 rounded bg-[#1e1e2a] text-slate-300 hover:bg-[#2a2a38] flex items-center justify-center text-sm">−</button>
          <span className="text-xs text-slate-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(3, z + 0.1))}
            className="w-6 h-6 rounded bg-[#1e1e2a] text-slate-300 hover:bg-[#2a2a38] flex items-center justify-center text-sm">+</button>
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="px-2 py-0.5 rounded bg-[#1e1e2a] text-slate-400 hover:bg-[#2a2a38] text-xs">Reset</button>
        </div>
      </div>

      {/* Canvas area */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden bg-[#0f0f14]">
        {/* SVG body — rendered as background reference */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{ transform: `scale(${zoom}) translate(${pan.x}px,${pan.y}px)`, transformOrigin: 'center center' }}
        >
          <svg
            ref={svgRef}
            viewBox={bodyView.viewBox}
            style={{ height: '85%', maxHeight: '680px', filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.5))' }}
          >
            <defs>
              <filter id="skin-shadow">
                <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,0.4)" />
              </filter>
            </defs>
            {bodyView.paths.map(p => (
              <path
                key={p.id}
                d={p.d}
                fill={skinTone}
                stroke={`color-mix(in srgb, ${skinTone} 60%, #000 40%)`}
                strokeWidth="1.5"
                style={{ filter: 'url(#skin-shadow)' }}
              />
            ))}
          </svg>
        </div>

        {/* Interaction canvas overlay (full size) */}
        <canvas
          ref={overlayRef}
          className="absolute inset-0 w-full h-full"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        />

        {/* Empty state hint */}
        {layers.filter(l => l.visible !== false).length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-slate-600">
              <div className="text-4xl mb-2">✦</div>
              <div className="text-sm">Upload a design from the Designs panel</div>
              <div className="text-xs mt-1">then drag it onto the body</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
