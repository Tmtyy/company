import { useRef, useState, useEffect } from 'react';
import { Camera, Upload, Wand2 } from 'lucide-react';

export default function AIPhotoPanel({ layers }) {
  const fileRef = useRef();
  const canvasRef = useRef();
  const [photo, setPhoto] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [placements, setPlacements] = useState([]);
  const [activeDesign, setActiveDesign] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef();

  const visibleLayers = layers.filter(l => l.visible !== false && l.url);

  useEffect(() => {
    if (!photo || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      placements.forEach(p => {
        const di = new Image();
        di.onload = () => {
          ctx.save();
          ctx.globalAlpha = p.opacity ?? 0.75;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation || 0) * Math.PI / 180);
          if (p.stencil) {
            ctx.filter = 'grayscale(1) contrast(10)';
          }
          ctx.drawImage(di, -p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        };
        di.src = p.url;
      });
    };
    img.src = photo;
  }, [photo, placements]);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      alert('Camera access denied or not available');
    }
  }

  function capturePhoto() {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    setPhoto(c.toDataURL('image/jpeg', 0.9));
    cameraStream?.getTracks().forEach(t => t.stop());
    setCameraStream(null);
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function handleCanvasClick(e) {
    if (!placing || !activeDesign) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const layer = layers.find(l => l.id === activeDesign);
    if (!layer) return;
    setPlacements(prev => [...prev, {
      id: Date.now(),
      url: layer.url,
      x, y,
      w: (layer.width || 100) * scaleX,
      h: (layer.height || 100) * scaleY,
      rotation: layer.rotation || 0,
      opacity: layer.opacity ?? 0.75,
      stencil: layer.stencil,
    }]);
    setPlacing(false);
  }

  return (
    <div className="flex flex-col gap-4 p-4 text-sm">
      <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">AI Photo Preview</div>

      {!photo ? (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-slate-500">Take or upload a photo of the client's skin, then place designs directly on the photo for a realistic preview.</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <button onClick={() => fileRef.current.click()}
            className="flex items-center justify-center gap-2 bg-[#1e1e2a] hover:bg-[#2a2a38] border border-[#2a2a38] text-slate-300 rounded-lg px-4 py-2.5 text-xs font-medium transition-colors">
            <Upload size={14} /> Upload Photo
          </button>
          <button onClick={startCamera}
            className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg px-4 py-2.5 text-xs font-medium transition-colors">
            <Camera size={14} /> Use Camera
          </button>
          {cameraStream && (
            <div className="flex flex-col gap-2">
              <video ref={videoRef} autoPlay playsInline className="rounded-lg w-full" />
              <button onClick={capturePhoto}
                className="bg-amber-600 hover:bg-amber-500 text-white rounded-lg px-4 py-2 text-xs font-medium">
                Capture Photo
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <button onClick={() => { setPhoto(null); setPlacements([]); }}
            className="text-xs text-slate-400 hover:text-slate-200 underline text-left">
            ← Use different photo
          </button>

          <div className="text-xs text-slate-400">Select design to place:</div>
          <div className="flex flex-col gap-1.5">
            {visibleLayers.map(l => (
              <button key={l.id} onClick={() => { setActiveDesign(l.id); setPlacing(true); }}
                className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-colors ${activeDesign === l.id && placing ? 'bg-amber-600/30 border border-amber-500/50 text-amber-300' : 'bg-[#1e1e2a] hover:bg-[#2a2a38] border border-transparent text-slate-300'}`}>
                <img src={l.url} alt="" className="w-6 h-6 object-contain rounded" />
                {l.name || 'Design'}
                {activeDesign === l.id && placing && <span className="ml-auto text-amber-400">click to place →</span>}
              </button>
            ))}
          </div>

          {placements.length > 0 && (
            <button onClick={() => setPlacements([])}
              className="text-xs text-red-400 hover:text-red-300 underline">
              Clear all placements
            </button>
          )}
        </div>
      )}

      {photo && (
        <div className="relative mt-2 rounded-lg overflow-hidden border border-[#2a2a38]">
          <canvas ref={canvasRef} onClick={handleCanvasClick}
            className="w-full rounded-lg"
            style={{ cursor: placing ? 'crosshair' : 'default' }} />
          {placing && (
            <div className="absolute top-2 left-2 bg-amber-600 text-white text-[10px] px-2 py-1 rounded font-medium">
              Click to place design
            </div>
          )}
        </div>
      )}
    </div>
  );
}
