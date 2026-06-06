// Convert an uploaded photo into a usable tattoo design (line art or solid stencil).

function loadToCanvas(img, maxDim) {
  const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);
  return { c, ctx, w, h };
}

function grayscale(px, n) {
  const g = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    g[i] = 0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2];
  }
  return g;
}

// Simple box blur to reduce photo noise before edge detection
function blur(gray, w, h, radius = 1) {
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0, cnt = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ny = y + dy, nx = x + dx;
          if (ny >= 0 && ny < h && nx >= 0 && nx < w) { sum += gray[ny * w + nx]; cnt++; }
        }
      }
      out[y * w + x] = sum / cnt;
    }
  }
  return out;
}

function dilate(alpha, w, h, passes = 1) {
  let a = alpha;
  for (let p = 0; p < passes; p++) {
    const out = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let on = a[y * w + x];
        if (!on) {
          if (x > 0 && a[y * w + x - 1]) on = 1;
          else if (x < w - 1 && a[y * w + x + 1]) on = 1;
          else if (y > 0 && a[(y - 1) * w + x]) on = 1;
          else if (y < h - 1 && a[(y + 1) * w + x]) on = 1;
        }
        out[y * w + x] = on;
      }
    }
    a = out;
  }
  return a;
}

// mode: 'line' (Sobel edges) | 'stencil' (solid filled darks)
export function imageToDesign(img, { mode = 'line', threshold = 30, thickness = 1, maxDim = 800 } = {}) {
  const { ctx, w, h } = loadToCanvas(img, maxDim);
  const px = ctx.getImageData(0, 0, w, h).data;
  const n = w * h;
  let gray = grayscale(px, n);

  const out = document.createElement('canvas');
  out.width = w; out.height = h;
  const octx = out.getContext('2d');
  const odata = octx.createImageData(w, h);
  const op = odata.data;

  if (mode === 'stencil') {
    // Solid black where the photo is dark — bold stencil look
    for (let i = 0; i < n; i++) {
      const on = gray[i] < (threshold + 90) ? 1 : 0;
      if (on) { op[i * 4] = 0; op[i * 4 + 1] = 0; op[i * 4 + 2] = 0; op[i * 4 + 3] = 255; }
      else { op[i * 4 + 3] = 0; }
    }
  } else {
    // Sobel edge detection → line art
    gray = blur(gray, w, h, 1);
    const alpha = new Uint8Array(n);
    const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        let sx = 0, sy = 0, k = 0;
        for (let j = -1; j <= 1; j++) {
          for (let i = -1; i <= 1; i++) {
            const v = gray[(y + j) * w + (x + i)];
            sx += v * gx[k]; sy += v * gy[k]; k++;
          }
        }
        const mag = Math.sqrt(sx * sx + sy * sy);
        if (mag > threshold) alpha[y * w + x] = 1;
      }
    }
    const thick = thickness > 1 ? dilate(alpha, w, h, thickness - 1) : alpha;
    for (let i = 0; i < n; i++) {
      if (thick[i]) { op[i * 4] = 0; op[i * 4 + 1] = 0; op[i * 4 + 2] = 0; op[i * 4 + 3] = 255; }
      else { op[i * 4 + 3] = 0; }
    }
  }

  octx.putImageData(odata, 0, 0);
  return { url: out.toDataURL('image/png'), width: w, height: h };
}
