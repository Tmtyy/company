import { computeMorph, classifyBody } from '../utils/anatomy';
import { PersonStanding } from 'lucide-react';

const PRESETS = [
  { label: 'Slim', bt: { weight: 62, muscle: 30, leanness: 70, height: 175 } },
  { label: 'Average', bt: { weight: 78, muscle: 45, leanness: 45, height: 175 } },
  { label: 'Athletic', bt: { weight: 82, muscle: 72, leanness: 72, height: 175 } },
  { label: 'Muscular', bt: { weight: 95, muscle: 90, leanness: 60, height: 175 } },
  { label: 'Heavy-set', bt: { weight: 105, muscle: 50, leanness: 18, height: 175 } },
];

function Slider({ label, value, min, max, step = 1, onChange, suffix, hint }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{value}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)} style={{ width: '100%' }} />
      {hint && <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{hint}</div>}
    </div>
  );
}

export default function BodyTypePanel({ bodyType, setBodyType }) {
  const set = (k, v) => setBodyType(prev => ({ ...prev, [k]: v }));
  const morph = computeMorph(bodyType);
  const cls = classifyBody(morph);
  const lb = Math.round(bodyType.weight * 2.205);
  const bmi = (bodyType.weight / Math.pow(bodyType.height / 100, 2)).toFixed(1);
  const bfEst = Math.round((1 - bodyType.leanness / 100) * 32 + 6 - bodyType.muscle / 100 * 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, fontSize: 14 }}>
      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
        <PersonStanding size={14} /> Body Type
      </div>

      <p style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>
        Match the model to the client's build so placement and sizing look true to life.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => setBodyType(p.bt)}
            style={{ padding: '7px 4px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 500, background: '#1e1e2a', color: '#cbd5e1' }}>
            {p.label}
          </button>
        ))}
      </div>

      <Slider label="Height" value={bodyType.height} min={140} max={210} suffix=" cm"
        onChange={v => set('height', v)} />

      <Slider label="Weight" value={bodyType.weight} min={40} max={160} suffix=" kg"
        hint={`${lb} lb · BMI ${bmi}`} onChange={v => set('weight', v)} />

      <Slider label="Muscle Mass" value={bodyType.muscle} min={0} max={100} suffix="%"
        hint="Bulk of muscle groups" onChange={v => set('muscle', v)} />

      <Slider label="Leanness" value={bodyType.leanness} min={0} max={100} suffix="%"
        hint={`Definition / low body fat · est. ${bfEst}% BF`} onChange={v => set('leanness', v)} />

      <div style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 12, padding: 12 }}>
        <div style={{ fontSize: 11, color: '#c4b5fd', marginBottom: 4 }}>Estimated build</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{cls}</div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6, display: 'flex', gap: 12 }}>
          <span>~{bfEst}% body fat</span>
          <span>BMI {bmi}</span>
        </div>
      </div>

      <div style={{ fontSize: 10, color: '#6b7280' }}>
        The 2D and 3D models update live. Switch to <strong style={{ color: '#9ca3af' }}>3D View</strong> to see muscle &amp; fat distribution wrap around the body.
      </div>
    </div>
  );
}
