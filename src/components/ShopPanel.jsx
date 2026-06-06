import { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Check, Download } from 'lucide-react';

const PRODUCTS = [
  { id: 'full-sleeve', label: 'Full Arm Sleeve', price: 34.99, ratio: 0.42, desc: 'Shoulder to wrist' },
  { id: 'half-sleeve', label: 'Half Sleeve', price: 24.99, ratio: 0.5, desc: 'Shoulder to elbow' },
  { id: 'forearm', label: 'Forearm Band', price: 16.99, ratio: 0.55, desc: 'Elbow to wrist' },
  { id: 'calf', label: 'Calf Sleeve', price: 29.99, ratio: 0.48, desc: 'Knee to ankle' },
  { id: 'patch', label: 'Patch Sheet (x4)', price: 12.99, ratio: 1, desc: 'Four small placements' },
];
const SIZES = [
  { id: 'S', label: 'S', mult: 0.9 },
  { id: 'M', label: 'M', mult: 1.0 },
  { id: 'L', label: 'L', mult: 1.15 },
];

export default function ShopPanel({ layers, skinTone }) {
  const [product, setProduct] = useState(PRODUCTS[0]);
  const [size, setSize] = useState(SIZES[1]);
  const [qty, setQty] = useState(1);
  const [order, setOrder] = useState(null);
  const canvasRef = useRef();

  const visible = layers.filter(l => l.visible !== false && l.url);
  const unitPrice = +(product.price * size.mult).toFixed(2);
  const total = +(unitPrice * qty).toFixed(2);

  // Render a sleeve mockup with the visible designs composited on skin tone
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = 260, H = 360;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);

    const patch = product.id === 'patch';
    const sleeveW = W * product.ratio;
    const x0 = (W - sleeveW) / 2;

    // Draw sleeve / sheet shape with shaded skin tone
    const grad = ctx.createLinearGradient(x0, 0, x0 + sleeveW, 0);
    grad.addColorStop(0, shade(skinTone, -28));
    grad.addColorStop(0.4, skinTone);
    grad.addColorStop(0.6, skinTone);
    grad.addColorStop(1, shade(skinTone, -36));
    ctx.fillStyle = grad;
    if (patch) {
      roundRect(ctx, 20, 20, W - 40, H - 40, 10); ctx.fill();
    } else {
      roundRect(ctx, x0, 16, sleeveW, H - 32, sleeveW / 2); ctx.fill();
    }

    // Composite designs
    const imgs = visible.map(l => {
      const im = new Image(); im.src = l.url; return { im, l };
    });
    let pending = imgs.length;
    if (pending === 0) { drawWatermark(ctx, W, H); return; }
    const drawAll = () => {
      imgs.forEach(({ im, l }, idx) => {
        if (!im.complete || !im.naturalWidth) return;
        const targetW = (patch ? (W - 80) / 2 : sleeveW * 0.78);
        const s = targetW / (l.width || im.naturalWidth);
        const dw = (l.width || im.naturalWidth) * s;
        const dh = (l.height || im.naturalHeight) * s;
        let cx, cy;
        if (patch) {
          cx = 40 + (idx % 2) * ((W - 80) / 2) + (W - 80) / 4;
          cy = 40 + Math.floor(idx / 2) * ((H - 80) / 2) + (H - 80) / 4;
        } else {
          cx = W / 2;
          cy = 50 + (idx + 0.5) * ((H - 100) / Math.max(1, imgs.length));
        }
        ctx.save();
        ctx.globalAlpha = l.opacity ?? 1;
        ctx.translate(cx, cy);
        ctx.rotate((l.rotation || 0) * Math.PI / 180);
        if (l.stencil) ctx.filter = 'grayscale(1) contrast(8)';
        ctx.drawImage(im, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      });
    };
    imgs.forEach(({ im }) => {
      if (im.complete) { if (--pending === 0) drawAll(); }
      else im.onload = () => { if (--pending === 0) drawAll(); };
    });
  }, [product, skinTone, layers]);

  function placeOrder() {
    setOrder({
      number: 'TS-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      product: product.label, size: size.id, qty, total,
    });
  }

  function downloadMockup() {
    const link = document.createElement('a');
    link.download = `sleeve-mockup-${product.id}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 16, fontSize: 14 }}>
      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
        <ShoppingBag size={14} /> Buy as Temporary Tattoo
      </div>

      <p style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>
        Turn the designs you've placed into a wearable temporary tattoo sleeve or patch sheet.
      </p>

      <div style={{ background: '#0f0f14', borderRadius: 12, padding: 8, border: '1px solid #2a2a38' }}>
        <canvas ref={canvasRef} style={{ width: '100%', borderRadius: 8, display: 'block' }} />
        {visible.length === 0 && (
          <div style={{ fontSize: 10, color: '#fbbf24', textAlign: 'center', padding: '6px 0' }}>
            Place a design on the body first — it'll appear on the sleeve here.
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>Product</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {PRODUCTS.map(p => (
            <button key={p.id} onClick={() => { setProduct(p); setOrder(null); }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                border: product.id === p.id ? '1px solid #7c3aed' : '1px solid transparent',
                background: product.id === p.id ? 'rgba(124,58,237,0.18)' : '#1e1e2a' }}>
              <span>
                <span style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 500 }}>{p.label}</span>
                <span style={{ display: 'block', fontSize: 10, color: '#6b7280' }}>{p.desc}</span>
              </span>
              <span style={{ fontSize: 12, color: '#a78bfa', fontWeight: 600 }}>${p.price}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>Size</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {SIZES.map(s => (
              <button key={s.id} onClick={() => { setSize(s); setOrder(null); }}
                style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  background: size.id === s.id ? '#7c3aed' : '#1e1e2a', color: size.id === s.id ? '#fff' : '#cbd5e1' }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ width: 92 }}>
          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>Qty</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={() => { setQty(q => Math.max(1, q - 1)); setOrder(null); }}
              style={{ width: 26, height: 32, borderRadius: 6, border: 'none', background: '#1e1e2a', color: '#cbd5e1', cursor: 'pointer' }}>−</button>
            <span style={{ flex: 1, textAlign: 'center', fontSize: 13, color: '#fff' }}>{qty}</span>
            <button onClick={() => { setQty(q => Math.min(20, q + 1)); setOrder(null); }}
              style={{ width: 26, height: 32, borderRadius: 6, border: 'none', background: '#1e1e2a', color: '#cbd5e1', cursor: 'pointer' }}>+</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 2px' }}>
        <span style={{ fontSize: 12, color: '#9ca3af' }}>Total</span>
        <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>${total}</span>
      </div>

      <button onClick={downloadMockup} disabled={visible.length === 0}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '9px', borderRadius: 8, border: '1px solid #2a2a38', cursor: visible.length ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 500, background: '#1e1e2a', color: '#cbd5e1', opacity: visible.length ? 1 : 0.5 }}>
        <Download size={14} /> Download Sleeve Mockup
      </button>

      <button onClick={placeOrder} disabled={visible.length === 0}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', borderRadius: 8, border: 'none', cursor: visible.length ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 600, background: '#7c3aed', color: '#fff', opacity: visible.length ? 1 : 0.5 }}>
        <ShoppingBag size={15} /> Order Temporary Sleeve
      </button>

      {order && (
        <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: 12, padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#34d399', fontWeight: 600, fontSize: 13 }}>
            <Check size={15} /> Order placed
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6, lineHeight: 1.6 }}>
            Order <strong style={{ color: '#e2e8f0' }}>#{order.number}</strong><br />
            {order.qty}× {order.product} ({order.size}) — ${order.total}<br />
            Ships in 3–5 days.
          </div>
          <div style={{ fontSize: 9, color: '#6b7280', marginTop: 6 }}>Demo checkout — no payment is processed.</div>
        </div>
      )}
    </div>
  );
}

function drawWatermark(ctx, W, H) {
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('your design preview', W / 2, H / 2);
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 0xff) + amt, b = (n & 0xff) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return `rgb(${r},${g},${b})`;
}
