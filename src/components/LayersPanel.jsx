import { Eye, EyeOff, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';

export default function LayersPanel({ layers, selectedId, setSelectedId, onToggleVisible, onDeleteLayer, onReorder }) {
  return (
    <div className="flex flex-col gap-2 p-4 text-sm">
      <div className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">
        Layers ({layers.length})
      </div>
      {layers.length === 0 && (
        <p className="text-xs text-slate-500 text-center py-4">No designs yet — upload one from the Designs panel</p>
      )}
      {[...layers].reverse().map((layer, revIdx) => {
        const idx = layers.length - 1 - revIdx;
        return (
          <div
            key={layer.id}
            onClick={() => setSelectedId(layer.id)}
            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
              selectedId === layer.id ? 'bg-violet-600/20 border border-violet-600/40' : 'bg-[#1e1e2a] hover:bg-[#2a2a38] border border-transparent'
            }`}
          >
            <GripVertical size={12} className="text-slate-600 shrink-0" />
            <div className="w-8 h-8 rounded bg-[#2a2a38] overflow-hidden shrink-0 flex items-center justify-center">
              {layer.url && (
                <img src={layer.url} alt="" className="w-full h-full object-contain"
                  style={{ filter: layer.stencil ? 'grayscale(1) contrast(10)' : 'none' }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-200 truncate">{layer.name || `Design ${idx + 1}`}</div>
              <div className="text-[10px] text-slate-500">{layer.stencil ? 'Stencil' : 'Color'} · {Math.round((layer.opacity ?? 1) * 100)}%</div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={e => { e.stopPropagation(); onReorder(idx, idx + 1); }} disabled={idx >= layers.length - 1}
                className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30">
                <ChevronUp size={12} />
              </button>
              <button onClick={e => { e.stopPropagation(); onReorder(idx, idx - 1); }} disabled={idx <= 0}
                className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30">
                <ChevronDown size={12} />
              </button>
              <button onClick={e => { e.stopPropagation(); onToggleVisible(layer.id); }}
                className="p-1 text-slate-500 hover:text-slate-300">
                {layer.visible === false ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button onClick={e => { e.stopPropagation(); onDeleteLayer(layer.id); }}
                className="p-1 text-red-400 hover:text-red-300">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
