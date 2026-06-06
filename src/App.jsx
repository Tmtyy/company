import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import DesignPanel from './components/DesignPanel';
import LayersPanel from './components/LayersPanel';
import CalibrationPanel from './components/CalibrationPanel';
import MeasurePanel from './components/MeasurePanel';
import QuotePanel from './components/QuotePanel';
import AIPhotoPanel from './components/AIPhotoPanel';
import BodyTypePanel from './components/BodyTypePanel';
import ShopPanel from './components/ShopPanel';
import AIDetectPanel from './components/AIDetectPanel';
import BodyCanvas from './components/BodyCanvas';
import Body3D from './components/Body3D';
import ExportPanel from './components/ExportPanel';
import { SKIN_TONES } from './utils/measurements';
import { Download, Box } from 'lucide-react';
import './index.css';

let nextId = 1;

export default function App() {
  const [activePanel, setActivePanel] = useState('designs');
  const [layers, setLayers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [calibration, setCalibration] = useState(null);
  const [unit, setUnit] = useState('cm');
  const [measureTool, setMeasureTool] = useState(false);
  const [measureResult, setMeasureResult] = useState(null);
  const [skinTone, setSkinTone] = useState(SKIN_TONES[1].value);
  const [view3D, setView3D] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [bodyType, setBodyType] = useState({ weight: 78, muscle: 45, leanness: 45, height: 175 });
  const [anatomyLayer, setAnatomyLayer] = useState('skin');

  const addDesign = useCallback(({ url, name, naturalW, naturalH }) => {
    const id = `layer-${nextId++}`;
    const w = Math.min(naturalW || 150, 200);
    const h = naturalH ? Math.round(w * naturalH / naturalW) : w;
    setLayers(prev => [...prev, {
      id, url, name, naturalW, naturalH,
      x: 200, y: 300, width: w, height: h,
      rotation: 0, scaleX: 1, scaleY: 1,
      opacity: 1, visible: true, stencil: false, lockAspect: true
    }]);
    setSelectedId(id);
    setActivePanel('designs');
  }, []);

  const updateLayer = useCallback((id, updates) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const deleteLayer = useCallback((id) => {
    setLayers(prev => prev.filter(l => l.id !== id));
    setSelectedId(null);
  }, []);

  const toggleVisible = useCallback((id) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: l.visible === false ? true : false } : l));
  }, []);

  const reorderLayer = useCallback((fromIdx, toIdx) => {
    setLayers(prev => {
      if (toIdx < 0 || toIdx >= prev.length) return prev;
      const arr = [...prev];
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return arr;
    });
  }, []);

  const selectedLayer = layers.find(l => l.id === selectedId);

  const panelContent = {
    designs: <DesignPanel
      layers={layers} selectedId={selectedId} setSelectedId={setSelectedId}
      onAddDesign={addDesign} onUpdateLayer={updateLayer}
      onDeleteLayer={deleteLayer} onToggleVisible={toggleVisible}
      calibration={calibration} unit={unit}
    />,
    layers: <LayersPanel
      layers={layers} selectedId={selectedId} setSelectedId={setSelectedId}
      onToggleVisible={toggleVisible} onDeleteLayer={deleteLayer}
      onReorder={reorderLayer}
    />,
    measure: <MeasurePanel
      measureTool={measureTool} setMeasureTool={setMeasureTool}
      measureResult={measureResult} calibration={calibration} unit={unit}
    />,
    calibrate: <CalibrationPanel
      calibration={calibration} setCalibration={setCalibration}
      unit={unit} setUnit={setUnit}
    />,
    quote: <QuotePanel calibration={calibration} unit={unit} />,
    ai: <AIPhotoPanel layers={layers} />,
    bodytype: <BodyTypePanel bodyType={bodyType} setBodyType={setBodyType} />,
    shop: <ShopPanel layers={layers} skinTone={skinTone} />,
    aidetect: <AIDetectPanel onAddDesign={addDesign} />,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f0f14', color: '#e2e8f0' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', background: '#16161f', borderBottom: '1px solid #2a2a38', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>✦</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#fff', letterSpacing: '-0.3px' }}>InkPlanner Pro</div>
            <div style={{ fontSize: 10, color: '#6b7280' }}>Tattoo Placement Studio</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setView3D(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: view3D ? '#7c3aed' : '#1e1e2a', color: view3D ? '#fff' : '#cbd5e1', transition: 'all 0.15s' }}
          >
            <Box size={13} /> {view3D ? '2D View' : '3D View'}
          </button>
          <button
            onClick={() => { setShowExport(v => !v); if (!showExport) setActivePanel(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: showExport ? '#7c3aed' : '#1e1e2a', color: showExport ? '#fff' : '#cbd5e1', transition: 'all 0.15s' }}
          >
            <Download size={13} /> Export
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#6b7280' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: calibration ? '#34d399' : '#fbbf24', display: 'inline-block' }} />
            {calibration ? 'Calibrated' : 'Uncalibrated'}
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar activePanel={activePanel} setActivePanel={(p) => { setActivePanel(p); setShowExport(false); }} />

        {(activePanel || showExport) && (
          <div style={{ width: 280, background: '#16161f', borderRight: '1px solid #2a2a38', overflowY: 'auto', flexShrink: 0 }}>
            {showExport
              ? <ExportPanel layers={layers} calibration={calibration} unit={unit} />
              : panelContent[activePanel]}
          </div>
        )}

        <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {view3D
            ? <Body3D skinTone={skinTone} layers={layers} bodyType={bodyType}
                anatomyLayer={anatomyLayer} setAnatomyLayer={setAnatomyLayer} />
            : <BodyCanvas
                layers={layers} selectedId={selectedId} setSelectedId={setSelectedId}
                onUpdateLayer={updateLayer} calibration={calibration} unit={unit}
                measureTool={measureTool} setMeasureResult={setMeasureResult}
                skinTone={skinTone} setSkinTone={setSkinTone}
                bodyType={bodyType} anatomyLayer={anatomyLayer} setAnatomyLayer={setAnatomyLayer}
              />
          }
        </main>

        {selectedLayer && !view3D && (
          <div style={{ width: 180, background: '#16161f', borderLeft: '1px solid #2a2a38', padding: 12, display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
            <div style={{ fontSize: 9, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live Readout</div>
            {[
              ['Size', calibration?.pxPerCm
                ? `${((selectedLayer.width ?? 100) / calibration.pxPerCm).toFixed(1)} × ${((selectedLayer.height ?? 100) / calibration.pxPerCm).toFixed(1)} ${unit}`
                : `${selectedLayer.width ?? 100} × ${selectedLayer.height ?? 100} px`],
              ['Opacity', `${Math.round((selectedLayer.opacity ?? 1) * 100)}%`],
              ['Rotation', `${Math.round(selectedLayer.rotation ?? 0)}°`],
              ['Mode', selectedLayer.stencil ? 'Stencil' : 'Color'],
            ].map(([label, val]) => (
              <div key={label} style={{ background: '#1e1e2a', borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>{val}</div>
              </div>
            ))}
            {!calibration && (
              <div style={{ fontSize: 10, color: '#fbbf24', background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.3)', borderRadius: 6, padding: '6px 8px' }}>
                Set calibration for real measurements
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
