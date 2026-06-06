import { useState } from 'react';
import { Download, Save, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function ExportPanel({ layers, calibration, unit, onSave, onLoad }) {
  const [clientName, setClientName] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  async function exportImage() {
    const el = document.querySelector('[data-export-area]');
    if (!el) return;
    try {
      const canvas = await html2canvas(el, { useCORS: true, scale: 2, backgroundColor: '#0f0f14' });
      const link = document.createElement('a');
      link.download = `tattoo-preview-${clientName || 'client'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      alert('Export failed. Try saving the session instead.');
    }
  }

  function exportMeasurements() {
    const ppc = calibration?.pxPerCm;
    const lines = [
      `Tattoo Placement Sheet`,
      `Client: ${clientName || 'N/A'}`,
      `Date: ${new Date().toLocaleDateString()}`,
      ``,
      `Calibration: ${ppc ? `${ppc.toFixed(2)} px/cm` : 'Not calibrated'}`,
      `Unit: ${unit}`,
      ``,
      `Designs:`,
      ...layers.filter(l => l.visible !== false).map((l, i) => {
        const w = l.width ?? 100, h = l.height ?? 100;
        const sizeStr = ppc
          ? `${(w/ppc).toFixed(1)} × ${(h/ppc).toFixed(1)} ${unit}`
          : `${w} × ${h} px`;
        return `  ${i+1}. ${l.name || `Design ${i+1}`} — ${sizeStr} — opacity ${Math.round((l.opacity??1)*100)}% — ${l.stencil ? 'stencil' : 'color'}`;
      }),
      ``,
      `Notes:`,
      notes || '(none)',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `tattoo-measurements-${clientName || 'client'}.txt`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  function saveSession() {
    setSaving(true);
    const session = { version: 1, clientName, notes, calibration, unit, layers: layers.map(l => ({ ...l, url: null })) };
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `tattoo-session-${clientName || 'session'}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setSaving(false), 1000);
  }

  return (
    <div className="flex flex-col gap-4 p-4 text-sm">
      <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">Session & Export</div>

      <div>
        <label className="text-xs text-slate-400 mb-1 block">Client name</label>
        <input value={clientName} onChange={e => setClientName(e.target.value)}
          placeholder="Jane Smith"
          className="w-full bg-[#1e1e2a] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
      </div>

      <div>
        <label className="text-xs text-slate-400 mb-1 block">Session notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Placement notes, allergies, preferences..."
          rows={3}
          className="w-full bg-[#1e1e2a] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 resize-none" />
      </div>

      <button onClick={exportImage}
        className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg px-4 py-2.5 font-medium text-sm transition-colors">
        <Download size={15} /> Export Preview Image
      </button>

      <button onClick={exportMeasurements}
        className="flex items-center justify-center gap-2 bg-[#1e1e2a] hover:bg-[#2a2a38] border border-[#2a2a38] text-slate-300 rounded-lg px-4 py-2.5 font-medium text-sm transition-colors">
        <FileText size={15} /> Export Measurement Sheet
      </button>

      <button onClick={saveSession}
        className="flex items-center justify-center gap-2 bg-[#1e1e2a] hover:bg-[#2a2a38] border border-[#2a2a38] text-slate-300 rounded-lg px-4 py-2.5 font-medium text-sm transition-colors">
        <Save size={15} /> {saving ? 'Saved!' : 'Save Session (.json)'}
      </button>

      <div className="text-[10px] text-slate-600 text-center">
        Note: Image URLs aren't saved in the session file due to browser security.
        Re-upload designs after loading a session.
      </div>
    </div>
  );
}
