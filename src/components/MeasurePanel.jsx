import { Crosshair, Ruler } from 'lucide-react';

export default function MeasurePanel({ measureTool, setMeasureTool, measureResult, calibration, unit }) {
  const ppc = calibration?.pxPerCm;

  function fmtDist(px) {
    if (!ppc) return `${Math.round(px)} px`;
    const cm = px / ppc;
    return unit === 'cm' ? `${cm.toFixed(1)} cm` : `${(cm / 2.54).toFixed(2)}"`;
  }

  return (
    <div className="flex flex-col gap-4 p-4 text-sm">
      <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">Measurement Tool</div>

      <button
        onClick={() => setMeasureTool(!measureTool)}
        className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-colors ${
          measureTool ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-[#1e1e2a] hover:bg-[#2a2a38] text-slate-300'
        }`}
      >
        <Ruler size={15} />
        {measureTool ? 'Click canvas to measure (active)' : 'Activate Measure Tool'}
      </button>

      {measureTool && (
        <div className="text-xs text-slate-500 text-center">
          Click two points on the canvas to measure distance
        </div>
      )}

      {measureResult && (
        <div className="bg-[#1e1e2a] border border-[#2a2a38] rounded-lg p-3 flex flex-col gap-2">
          <div className="text-xs text-slate-400 font-medium">Last Measurement</div>
          <div className="text-lg font-bold text-white">{fmtDist(measureResult.distPx)}</div>
          <div className="text-[10px] text-slate-500">
            ΔX: {fmtDist(Math.abs(measureResult.dx))} · ΔY: {fmtDist(Math.abs(measureResult.dy))}
          </div>
          {!ppc && (
            <div className="text-[10px] text-amber-400">Calibrate to get real units</div>
          )}
        </div>
      )}

      <div className="text-xs text-slate-400 font-medium uppercase tracking-wide mt-2">Live Readout</div>
      <p className="text-xs text-slate-500">Select a design on the canvas to see its real-world size and distance to body landmarks.</p>
    </div>
  );
}
