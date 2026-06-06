// Heuristic body-part estimator. This is NOT a trained neural net — it reads
// image shape + skin coverage to make a best guess, which the user can override.

export const BODY_PARTS = [
  'Forearm', 'Upper Arm', 'Full Sleeve (arm)', 'Calf', 'Thigh',
  'Shoulder', 'Chest', 'Back', 'Ribs', 'Hand', 'Neck', 'Ankle / Foot',
];

export function detectBodyPart(img) {
  const maxDim = 220;
  const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);
  const px = ctx.getImageData(0, 0, w, h).data;
  const total = w * h;

  let skin = 0;
  // Track vertical extent of skin pixels to gauge limb-iness
  let colSkin = new Array(w).fill(0);
  let rowSkin = new Array(h).fill(0);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = px[i], g = px[i + 1], b = px[i + 2];
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      const isSkin = r > 95 && g > 40 && b > 20 && (mx - mn) > 15 &&
        Math.abs(r - g) > 15 && r > g && r > b;
      if (isSkin) { skin++; colSkin[x]++; rowSkin[y]++; }
    }
  }
  const skinRatio = skin / total;
  const aspect = img.naturalWidth / img.naturalHeight;

  // Width of the skin "blob" relative to frame (limbs are narrow)
  const filledCols = colSkin.filter(v => v > h * 0.15).length;
  const widthFrac = filledCols / w;

  const scores = {};
  const add = (part, pts) => { scores[part] = (scores[part] || 0) + pts; };

  // Aspect-driven
  if (aspect < 0.55) { add('Forearm', 3); add('Calf', 2.5); add('Full Sleeve (arm)', 2); }
  else if (aspect < 0.8) { add('Upper Arm', 2.5); add('Thigh', 2.5); add('Forearm', 1.5); }
  else if (aspect < 1.25) { add('Shoulder', 2.5); add('Chest', 2); add('Ribs', 1.5); }
  else if (aspect < 1.8) { add('Chest', 2.5); add('Back', 2.5); add('Ribs', 1.5); }
  else { add('Back', 3); add('Chest', 2); }

  // Skin coverage
  if (skinRatio > 0.5) { add('Forearm', 1.5); add('Thigh', 1.5); add('Back', 1); add('Chest', 1); }
  else if (skinRatio > 0.25) { add('Upper Arm', 1); add('Shoulder', 1); add('Calf', 1); }
  else { add('Hand', 1.5); add('Ankle / Foot', 1.2); add('Neck', 1); }

  // Narrow blob → limb
  if (widthFrac < 0.45) { add('Forearm', 1.5); add('Calf', 1.2); add('Upper Arm', 1); }
  if (widthFrac > 0.75) { add('Back', 1.2); add('Chest', 1); }

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top = ranked[0] || ['Forearm', 1];
  const maxPts = top[1];
  const confidence = Math.min(0.95, 0.45 + maxPts / 14);

  return {
    part: top[0],
    confidence,
    skinRatio,
    aspect,
    alternatives: ranked.slice(1, 4).map(r => r[0]),
  };
}
