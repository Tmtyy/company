import { useState } from 'react';
import { estimateQuote, DETAIL_LEVELS, COLOR_MODES } from '../utils/measurements';
import { DollarSign } from 'lucide-react';

export default function QuotePanel({ calibration, unit }) {
  const [widthCm, setWidthCm] = useState(10);
  const [heightCm, setHeightCm] = useState(10);
  const [detail, setDetail] = useState('Medium');
  const [colorMode, setColorMode] = useState('Black & Grey');
  const [rate, setRate] = useState(80);
  const [showBreak, setShowBreak] = useState(false);

  const quote = estimateQuote({ widthCm, heightCm, detail, colorMode, rate });

  return (
    <div className="flex flex-col gap-4 p-4 text-sm">
      <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">Quote Estimator</div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Width ({unit})</label>
          <input type="number" min="1" max="100" value={widthCm} onChange={e => setWidthCm(+e.target.value)}
            className="w-full bg-[#1e1e2a] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Height ({unit})</label>
          <input type="number" min="1" max="100" value={heightCm} onChange={e => setHeightCm(+e.target.value)}
            className="w-full bg-[#1e1e2a] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-400 mb-1.5 block">Detail Level</label>
        <div className="grid grid-cols-2 gap-1.5">
          {DETAIL_LEVELS.map(d => (
            <button key={d} onClick={() => setDetail(d)}
              className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${detail === d ? 'bg-violet-600 text-white' : 'bg-[#1e1e2a] text-slate-300 hover:bg-[#2a2a38]'}`}>
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-400 mb-1.5 block">Color Mode</label>
        <div className="flex flex-col gap-1.5">
          {COLOR_MODES.map(c => (
            <button key={c} onClick={() => setColorMode(c)}
              className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${colorMode === c ? 'bg-violet-600 text-white' : 'bg-[#1e1e2a] text-slate-300 hover:bg-[#2a2a38]'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-400 mb-1 block">Your hourly rate ($/hr)</label>
        <input type="number" min="20" max="500" value={rate} onChange={e => setRate(+e.target.value)}
          className="w-full bg-[#1e1e2a] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
      </div>

      <div className="bg-violet-900/30 border border-violet-600/30 rounded-xl p-4">
        <div className="text-xs text-violet-300 mb-2">Estimate</div>
        <div className="text-2xl font-bold text-white">${quote.low} – ${quote.high}</div>
        <div className="text-xs text-slate-400 mt-1">{quote.hoursLow} – {quote.hoursHigh} hours</div>
        <div className="text-[10px] text-slate-500 mt-2">
          {widthCm} × {heightCm} {unit} · {detail} · {colorMode}
        </div>
        <div className="text-[10px] text-slate-600 mt-1">Estimate only — adjust for your pricing</div>
      </div>
    </div>
  );
}
