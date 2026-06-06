import { useState } from 'react';
import { Ruler } from 'lucide-react';

export default function CalibrationPanel({ calibration, setCalibration, unit, setUnit }) {
  const [mode, setMode] = useState('height'); // 'height' | 'object'
  const [knownCm, setKnownCm] = useState(170);
  const [pxInput, setPxInput] = useState('');

  function apply() {
    const px = parseFloat(pxInput);
    if (!px || px <= 0) return;
    const pxPerCm = px / knownCm;
    setCalibration({ pxPerCm, knownCm, knownPx: px, method: mode });
  }

  const OBJECTS = [
    { label: 'Credit card (8.56 cm)', cm: 8.56 },
    { label: 'A4 paper height (29.7 cm)', cm: 29.7 },
    { label: 'iPhone 14 (14.7 cm)', cm: 14.7 },
    { label: 'Dollar bill (15.6 cm)', cm: 15.6 },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 text-sm">
      <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">Calibration</div>

      <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-3 text-xs text-amber-300">
        Without calibration, all measurements are in pixels. Set a reference to get real cm/inch sizes.
      </div>

      <div>
        <div className="text-xs text-slate-400 mb-2">Display unit</div>
        <div className="flex gap-2">
          {['cm', 'in'].map(u => (
            <button key={u} onClick={() => setUnit(u)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${unit === u ? 'bg-violet-600 text-white' : 'bg-[#1e1e2a] text-slate-300 hover:bg-[#2a2a38]'}`}>
              {u === 'cm' ? 'Centimetres' : 'Inches'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs text-slate-400 mb-2">Reference method</div>
        <div className="flex gap-2">
          {[['height', 'Body Height'], ['object', 'Known Object']].map(([v, l]) => (
            <button key={v} onClick={() => setMode(v)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${mode === v ? 'bg-violet-600 text-white' : 'bg-[#1e1e2a] text-slate-300 hover:bg-[#2a2a38]'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {mode === 'height' ? (
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Person's height (cm)</label>
          <input type="number" value={knownCm} onChange={e => setKnownCm(+e.target.value)}
            className="w-full bg-[#1e1e2a] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
        </div>
      ) : (
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Known object</label>
          <select value={knownCm} onChange={e => setKnownCm(+e.target.value)}
            className="w-full bg-[#1e1e2a] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
            {OBJECTS.map(o => <option key={o.cm} value={o.cm}>{o.label}</option>)}
          </select>
        </div>
      )}

      <div>
        <label className="text-xs text-slate-400 mb-1 block">
          Pixel size of that reference on your screen
        </label>
        <p className="text-[10px] text-slate-500 mb-1.5">
          Measure the body/object on screen and enter the pixel width or height here
        </p>
        <input type="number" placeholder="e.g. 450" value={pxInput} onChange={e => setPxInput(e.target.value)}
          className="w-full bg-[#1e1e2a] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
      </div>

      <button onClick={apply}
        className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg px-4 py-2.5 font-medium transition-colors">
        <Ruler size={15} /> Apply Calibration
      </button>

      {calibration?.pxPerCm && (
        <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-3 text-xs text-emerald-300">
          ✓ Calibrated: {calibration.pxPerCm.toFixed(2)} px/cm
          <br />Reference: {calibration.knownCm} cm = {calibration.knownPx} px
        </div>
      )}
    </div>
  );
}
