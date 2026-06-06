import { useState, useRef } from 'react';
import { ScanLine, Upload, Wand2, Check, Camera } from 'lucide-react';
import { detectBodyPart, BODY_PARTS } from '../utils/bodyDetect';
import { imageToDesign } from '../utils/imageProcessing';

export default function AIDetectPanel({ onAddDesign }) {
  const fileRef = useRef();
  const imgRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [detection, setDetection] = useState(null);
  const [part, setPart] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState('line');
  const [threshold, setThreshold] = useState(30);
  const [thickness, setThickness] = useState(2);
  const [design, setDesign] = useState(null);
  const [added, setAdded] = useState(false);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => loadPhoto(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function loadPhoto(dataUrl) {
    setPhoto(dataUrl);
    setDesign(null); setAdded(false);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const det = detectBodyPart(img);
      setDetection(det);
      setPart(det.part);
    };
    img.src = dataUrl;
  }

  function recreate() {
    if (!imgRef.current) return;
    setBusy(true);
    setTimeout(() => {
      const result = imageToDesign(imgRef.current, { mode, threshold, thickness });
      setDesign(result);
      setBusy(false);
      setAdded(false);
    }, 30);
  }

  function addToDesigns() {
    if (!design) return;
    onAddDesign({ url: design.url, name: `${part || 'AI'} design`, naturalW: design.width, naturalH: design.height });
    setAdded(true);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 16, fontSize: 14 }}>
      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
        <ScanLine size={14} /> AI Detect &amp; Recreate
      </div>

      <p style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>
        Upload a photo. We estimate the body part and turn the image into a clean digital design you can place &amp; sell.
      </p>

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      <button onClick={() => fileRef.current.click()}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: '#7c3aed', color: '#fff' }}>
        <Upload size={15} /> Upload Photo
      </button>

      {photo && (
        <img src={photo} alt="source" style={{ width: '100%', borderRadius: 8, maxHeight: 180, objectFit: 'contain', background: '#0f0f14' }} />
      )}

      {detection && (
        <div style={{ background: '#1e1e2a', borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>Detected body part</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 2 }}>{detection.part}</div>
          <div style={{ marginTop: 8 }}>
            <div style={{ height: 6, background: '#2a2a38', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${Math.round(detection.confidence * 100)}%`, height: '100%', background: '#7c3aed' }} />
            </div>
            <div style={{ fontSize: 10, color: '#6b7280', marginTop: 3 }}>{Math.round(detection.confidence * 100)}% confidence (heuristic estimate)</div>
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>Correct it if needed:</div>
            <select value={part} onChange={e => setPart(e.target.value)}
              style={{ width: '100%', background: '#0f0f14', border: '1px solid #2a2a38', borderRadius: 8, padding: '7px 8px', fontSize: 12, color: '#fff' }}>
              {BODY_PARTS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      )}

      {photo && (
        <>
          <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>Recreate as design</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['line', 'Line art'], ['stencil', 'Solid stencil']].map(([v, l]) => (
              <button key={v} onClick={() => setMode(v)}
                style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  background: mode === v ? '#7c3aed' : '#1e1e2a', color: mode === v ? '#fff' : '#cbd5e1' }}>
                {l}
              </button>
            ))}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginBottom: 3 }}>
              <span>Detail threshold</span><span>{threshold}</span>
            </div>
            <input type="range" min={8} max={80} value={threshold} onChange={e => setThreshold(+e.target.value)} style={{ width: '100%' }} />
          </div>

          {mode === 'line' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginBottom: 3 }}>
                <span>Line thickness</span><span>{thickness}px</span>
              </div>
              <input type="range" min={1} max={5} value={thickness} onChange={e => setThickness(+e.target.value)} style={{ width: '100%' }} />
            </div>
          )}

          <button onClick={recreate} disabled={busy}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: '#1e1e2a', color: '#fff' }}>
            <Wand2 size={15} /> {busy ? 'Processing…' : 'Generate Design'}
          </button>
        </>
      )}

      {design && (
        <div style={{ background: '#0f0f14', border: '1px solid #2a2a38', borderRadius: 12, padding: 10 }}>
          <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 6 }}>Generated design (transparent PNG)</div>
          <div style={{ background: 'repeating-conic-gradient(#1a1a24 0% 25%, #14141c 0% 50%) 50% / 16px 16px', borderRadius: 8, padding: 8, display: 'flex', justifyContent: 'center' }}>
            <img src={design.url} alt="design" style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'contain' }} />
          </div>
          <button onClick={addToDesigns}
            style={{ width: '100%', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: added ? '#10b981' : '#7c3aed', color: '#fff' }}>
            {added ? <><Check size={15} /> Added to Designs</> : <>Add to My Designs</>}
          </button>
        </div>
      )}

      <div style={{ fontSize: 9, color: '#6b7280', lineHeight: 1.5 }}>
        Body-part estimate uses image shape &amp; skin coverage (on-device, no upload). Recreation runs locally in your browser.
      </div>
    </div>
  );
}
