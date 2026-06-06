import { useRef } from 'react';
import { Upload, FlipHorizontal, FlipVertical, RotateCcw, Lock, Unlock, Trash2, Eye, EyeOff } from 'lucide-react';

export default function DesignPanel({ layers, selectedId, setSelectedId, onAddDesign, onUpdateLayer, onDeleteLayer, onToggleVisible, calibration, unit }) {
  const fileRef = useRef();

  const selected = layers.find(l => l.id === selectedId);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      onAddDesign({ url, name: file.name, naturalW: img.naturalWidth, naturalH: img.naturalHeight });
    };
    img.src = url;
    e.target.value = '';
  }

  function update(key, val) {
    if (!selected) return;
    onUpdateLayer(selectedId, { [key]: val });
  }

  const ppc = calibration?.pxPerCm;

  return (
    <div className="flex flex-col gap-4 p-4 text-sm">
      <div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <button
          onClick={() => fileRef.current.click()}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg px-4 py-2.5 font-medium transition-colors"
        >
          <Upload size={16} /> Upload Design
        </button>
        <p className="text-xs text-slate-500 mt-1.5 text-center">PNG with transparency recommended</p>
      </div>

      {selected && (
        <div className="flex flex-col gap-3">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">Transform</div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => update('scaleX', (selected.scaleX || 1) * -1)}
              className="flex items-center justify-center gap-1.5 bg-[#1e1e2a] hover:bg-[#2a2a38] rounded-lg py-2 text-slate-300 text-xs transition-colors">
              <FlipHorizontal size={13} /> Flip H
            </button>
            <button onClick={() => update('scaleY', (selected.scaleY || 1) * -1)}
              className="flex items-center justify-center gap-1.5 bg-[#1e1e2a] hover:bg-[#2a2a38] rounded-lg py-2 text-slate-300 text-xs transition-colors">
              <FlipVertical size={13} /> Flip V
            </button>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Rotation</span><span>{Math.round(selected.rotation || 0)}°</span>
            </div>
            <input type="range" min="-180" max="180" value={selected.rotation || 0}
              onChange={e => update('rotation', +e.target.value)}
              className="w-full" />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Scale</span>
              <button onClick={() => update('lockAspect', !selected.lockAspect)} className="flex items-center gap-1">
                {selected.lockAspect ? <Lock size={11} className="text-violet-400" /> : <Unlock size={11} />}
                <span className="text-[10px]">{selected.lockAspect ? 'Locked' : 'Free'}</span>
              </button>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="text-[10px] text-slate-500 mb-0.5">W</div>
                <input type="range" min="20" max="500" value={selected.width || 100}
                  onChange={e => {
                    const w = +e.target.value;
                    const updates = { width: w };
                    if (selected.lockAspect && selected.naturalW && selected.naturalH) {
                      updates.height = Math.round(w * selected.naturalH / selected.naturalW);
                    }
                    onUpdateLayer(selectedId, updates);
                  }}
                  className="w-full" />
              </div>
              {!selected.lockAspect && (
                <div className="flex-1">
                  <div className="text-[10px] text-slate-500 mb-0.5">H</div>
                  <input type="range" min="20" max="500" value={selected.height || 100}
                    onChange={e => onUpdateLayer(selectedId, { height: +e.target.value })}
                    className="w-full" />
                </div>
              )}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {ppc
                ? `${(selected.width / ppc).toFixed(1)} × ${(selected.height / ppc).toFixed(1)} ${unit}`
                : `${selected.width || 100} × ${selected.height || 100} px — calibrate for real units`}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Opacity</span><span>{Math.round((selected.opacity ?? 1) * 100)}%</span>
            </div>
            <input type="range" min="10" max="100" value={Math.round((selected.opacity ?? 1) * 100)}
              onChange={e => update('opacity', e.target.value / 100)}
              className="w-full" />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input type="checkbox" checked={!!selected.stencil} onChange={e => update('stencil', e.target.checked)}
                className="accent-violet-500 w-3.5 h-3.5" />
              Stencil / Outline Mode
            </label>
          </div>

          <div className="flex gap-2">
            <button onClick={() => onToggleVisible(selectedId)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#1e1e2a] hover:bg-[#2a2a38] rounded-lg py-2 text-slate-300 text-xs transition-colors">
              {selected.visible === false ? <EyeOff size={13} /> : <Eye size={13} />}
              {selected.visible === false ? 'Show' : 'Hide'}
            </button>
            <button onClick={() => onDeleteLayer(selectedId)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-red-900/40 hover:bg-red-800/60 rounded-lg py-2 text-red-300 text-xs transition-colors">
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>
      )}

      {!selected && layers.length > 0 && (
        <p className="text-xs text-slate-500 text-center">Click a design on the canvas to select it</p>
      )}
    </div>
  );
}
