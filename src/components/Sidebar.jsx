import { useState } from 'react';
import { Upload, Layers, Ruler, Settings, Zap, Camera } from 'lucide-react';

const NAV = [
  { id: 'designs', icon: Upload, label: 'Designs' },
  { id: 'layers', icon: Layers, label: 'Layers' },
  { id: 'measure', icon: Ruler, label: 'Measure' },
  { id: 'calibrate', icon: Settings, label: 'Calibrate' },
  { id: 'quote', icon: Zap, label: 'Quote' },
  { id: 'ai', icon: Camera, label: 'AI Photo' },
];

export default function Sidebar({ activePanel, setActivePanel }) {
  return (
    <div className="flex flex-col items-center gap-1 py-4 px-2 bg-[#16161f] border-r border-[#2a2a38] w-16">
      {NAV.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setActivePanel(activePanel === id ? null : id)}
          title={label}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg w-12 transition-all ${
            activePanel === id
              ? 'bg-violet-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-[#2a2a38]'
          }`}
        >
          <Icon size={18} />
          <span className="text-[9px] leading-none">{label}</span>
        </button>
      ))}
    </div>
  );
}
