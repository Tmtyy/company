// Body-type morphing + 2D anatomical overlays (muscle / bone)

// Derive shape factors from the body-type sliders.
// weight (kg), muscle (0-100), leanness (0-100), height (cm)
export function computeMorph({ weight = 75, muscle = 50, leanness = 50, height = 175 } = {}) {
  const m = muscle / 100;                 // muscularity 0..1
  const lean = leanness / 100;            // 1 = shredded, 0 = soft
  const ideal = height - 100;             // rough lean bodyweight for height
  const over = Math.max(0, weight - ideal);
  const fat = Math.min(1, (over / 38) * (1 - lean * 0.55)); // body fatness 0..1
  return {
    m, lean, fat,
    limbRadius: 1 + 0.34 * m + 0.42 * fat,
    torsoWidth: 1 + 0.30 * m + 0.70 * fat,
    bellySize: Math.max(0, fat - 0.12),
    definition: Math.max(0, m * lean - 0.08),  // ab/muscle striation visibility
    waist: 1 + 0.85 * fat - 0.12 * m,
    vascular: Math.max(0, m * lean - 0.35),
  };
}

export function classifyBody(morph) {
  const { m, lean, fat } = morph;
  if (fat > 0.55) return 'Heavy-set';
  if (m > 0.62 && lean > 0.6) return 'Athletic / Muscular';
  if (m > 0.62 && fat > 0.3) return 'Powerlifter';
  if (lean > 0.7 && m < 0.4) return 'Lean / Slim';
  if (fat > 0.35) return 'Average / Soft';
  return 'Average';
}

// ── 2D anatomical overlays ──────────────────────────────────────────────
// Shapes are drawn inside the existing silhouette (front/back viewBox 0 0 300 700).
// el: 'ellipse' | 'path' | 'line' | 'circle' | 'rect'
const MUSCLE_FILL = '#b13a3a';
const MUSCLE_DARK = '#7e2727';
const MUSCLE_LIGHT = '#c85a52';

export const MUSCLES = {
  front: [
    // Neck (sternocleidomastoid)
    { el: 'path', d: 'M140,108 L137,124 L145,126 L147,110 Z', fill: MUSCLE_DARK },
    { el: 'path', d: 'M160,108 L163,124 L155,126 L153,110 Z', fill: MUSCLE_DARK },
    // Trapezius (top)
    { el: 'path', d: 'M135,125 L108,128 L150,140 L192,128 L165,125 Z', fill: MUSCLE_LIGHT },
    // Pectorals
    { el: 'path', d: 'M150,142 C128,140 110,150 112,178 C130,192 148,186 150,170 Z', fill: MUSCLE_FILL },
    { el: 'path', d: 'M150,142 C172,140 190,150 188,178 C170,192 152,186 150,170 Z', fill: MUSCLE_FILL },
    // Deltoids
    { el: 'ellipse', cx: 78, cy: 158, rx: 22, ry: 28, fill: MUSCLE_LIGHT },
    { el: 'ellipse', cx: 222, cy: 158, rx: 22, ry: 28, fill: MUSCLE_LIGHT },
    // Biceps
    { el: 'ellipse', cx: 66, cy: 212, rx: 15, ry: 30, fill: MUSCLE_FILL },
    { el: 'ellipse', cx: 234, cy: 212, rx: 15, ry: 30, fill: MUSCLE_FILL },
    // Forearm flexors
    { el: 'ellipse', cx: 56, cy: 280, rx: 13, ry: 34, fill: MUSCLE_DARK },
    { el: 'ellipse', cx: 244, cy: 280, rx: 13, ry: 34, fill: MUSCLE_DARK },
    // Rectus abdominis — six pack grid
    { el: 'rect', x: 132, y: 200, w: 16, h: 24, rx: 5, fill: MUSCLE_FILL },
    { el: 'rect', x: 152, y: 200, w: 16, h: 24, rx: 5, fill: MUSCLE_FILL },
    { el: 'rect', x: 132, y: 228, w: 16, h: 24, rx: 5, fill: MUSCLE_FILL },
    { el: 'rect', x: 152, y: 228, w: 16, h: 24, rx: 5, fill: MUSCLE_FILL },
    { el: 'rect', x: 132, y: 256, w: 16, h: 26, rx: 5, fill: MUSCLE_FILL },
    { el: 'rect', x: 152, y: 256, w: 16, h: 26, rx: 5, fill: MUSCLE_FILL },
    // Obliques
    { el: 'path', d: 'M128,205 C118,230 120,265 130,288 L132,260 L130,210 Z', fill: MUSCLE_DARK },
    { el: 'path', d: 'M172,205 C182,230 180,265 170,288 L168,260 L170,210 Z', fill: MUSCLE_DARK },
    // Quadriceps
    { el: 'ellipse', cx: 116, cy: 400, rx: 22, ry: 58, fill: MUSCLE_FILL },
    { el: 'ellipse', cx: 184, cy: 400, rx: 22, ry: 58, fill: MUSCLE_FILL },
    // Tibialis (shin)
    { el: 'ellipse', cx: 100, cy: 550, rx: 15, ry: 50, fill: MUSCLE_DARK },
    { el: 'ellipse', cx: 200, cy: 550, rx: 15, ry: 50, fill: MUSCLE_DARK },
  ],
  back: [
    // Trapezius
    { el: 'path', d: 'M150,128 L110,130 L130,210 L150,225 L170,210 L190,130 Z', fill: MUSCLE_LIGHT },
    // Deltoids
    { el: 'ellipse', cx: 78, cy: 158, rx: 22, ry: 28, fill: MUSCLE_FILL },
    { el: 'ellipse', cx: 222, cy: 158, rx: 22, ry: 28, fill: MUSCLE_FILL },
    // Latissimus dorsi
    { el: 'path', d: 'M128,200 C108,225 105,265 122,290 L135,250 L132,205 Z', fill: MUSCLE_FILL },
    { el: 'path', d: 'M172,200 C192,225 195,265 178,290 L165,250 L168,205 Z', fill: MUSCLE_FILL },
    // Spinal erectors
    { el: 'rect', x: 143, y: 200, w: 14, h: 95, rx: 6, fill: MUSCLE_DARK },
    // Triceps
    { el: 'ellipse', cx: 66, cy: 212, rx: 15, ry: 30, fill: MUSCLE_FILL },
    { el: 'ellipse', cx: 234, cy: 212, rx: 15, ry: 30, fill: MUSCLE_FILL },
    // Forearm extensors
    { el: 'ellipse', cx: 56, cy: 280, rx: 13, ry: 34, fill: MUSCLE_DARK },
    { el: 'ellipse', cx: 244, cy: 280, rx: 13, ry: 34, fill: MUSCLE_DARK },
    // Glutes
    { el: 'ellipse', cx: 130, cy: 320, rx: 26, ry: 24, fill: MUSCLE_FILL },
    { el: 'ellipse', cx: 170, cy: 320, rx: 26, ry: 24, fill: MUSCLE_FILL },
    // Hamstrings
    { el: 'ellipse', cx: 116, cy: 405, rx: 22, ry: 58, fill: MUSCLE_FILL },
    { el: 'ellipse', cx: 184, cy: 405, rx: 22, ry: 58, fill: MUSCLE_FILL },
    // Calves (gastrocnemius)
    { el: 'ellipse', cx: 100, cy: 545, rx: 18, ry: 48, fill: MUSCLE_LIGHT },
    { el: 'ellipse', cx: 200, cy: 545, rx: 18, ry: 48, fill: MUSCLE_LIGHT },
  ],
};

const BONE_FILL = '#e8e3d3';
const BONE_LINE = '#b8b09a';

export const BONES = {
  front: [
    // Skull
    { el: 'ellipse', cx: 150, cy: 58, rx: 36, ry: 40, fill: BONE_FILL, stroke: BONE_LINE },
    { el: 'path', d: 'M150,78 L150,98 M138,98 Q150,104 162,98', stroke: BONE_LINE, sw: 1.5, fill: 'none' }, // jaw
    { el: 'ellipse', cx: 137, cy: 60, rx: 6, ry: 7, fill: '#3a3632' }, // eye socket
    { el: 'ellipse', cx: 163, cy: 60, rx: 6, ry: 7, fill: '#3a3632' },
    { el: 'path', d: 'M150,68 L146,80 L154,80 Z', fill: '#3a3632' }, // nasal cavity
    { el: 'line', x1: 138, y1: 88, x2: 162, y2: 88, stroke: BONE_LINE, sw: 3 }, // teeth row
    // Cervical spine
    { el: 'rect', x: 146, y: 104, w: 8, h: 22, rx: 3, fill: BONE_FILL, stroke: BONE_LINE },
    // Clavicles
    { el: 'line', x1: 150, y1: 130, x2: 105, y2: 138, stroke: BONE_FILL, sw: 6 },
    { el: 'line', x1: 150, y1: 130, x2: 195, y2: 138, stroke: BONE_FILL, sw: 6 },
    // Sternum
    { el: 'rect', x: 146, y: 138, w: 8, h: 60, rx: 3, fill: BONE_FILL, stroke: BONE_LINE },
    // Ribcage
    ...[0, 1, 2, 3, 4].map(i => ({
      el: 'path',
      d: `M146,${146 + i * 12} C120,${150 + i * 12} ${108 - i},${168 + i * 11} 118,${186 + i * 10}`,
      stroke: BONE_FILL, sw: 4, fill: 'none',
    })),
    ...[0, 1, 2, 3, 4].map(i => ({
      el: 'path',
      d: `M154,${146 + i * 12} C180,${150 + i * 12} ${192 + i},${168 + i * 11} 182,${186 + i * 10}`,
      stroke: BONE_FILL, sw: 4, fill: 'none',
    })),
    // Humerus
    { el: 'line', x1: 76, y1: 150, x2: 60, y2: 240, stroke: BONE_FILL, sw: 8 },
    { el: 'line', x1: 224, y1: 150, x2: 240, y2: 240, stroke: BONE_FILL, sw: 8 },
    // Radius + Ulna
    { el: 'line', x1: 60, y1: 244, x2: 48, y2: 312, stroke: BONE_FILL, sw: 5 },
    { el: 'line', x1: 66, y1: 244, x2: 60, y2: 314, stroke: BONE_FILL, sw: 5 },
    { el: 'line', x1: 240, y1: 244, x2: 252, y2: 312, stroke: BONE_FILL, sw: 5 },
    { el: 'line', x1: 234, y1: 244, x2: 240, y2: 314, stroke: BONE_FILL, sw: 5 },
    // Pelvis
    { el: 'path', d: 'M115,298 C105,330 130,348 150,340 C170,348 195,330 185,298 C170,318 130,318 115,298 Z', fill: BONE_FILL, stroke: BONE_LINE },
    // Femurs
    { el: 'line', x1: 122, y1: 340, x2: 116, y2: 458, stroke: BONE_FILL, sw: 9 },
    { el: 'line', x1: 178, y1: 340, x2: 184, y2: 458, stroke: BONE_FILL, sw: 9 },
    // Patellas
    { el: 'circle', cx: 116, cy: 478, r: 9, fill: BONE_FILL, stroke: BONE_LINE },
    { el: 'circle', cx: 184, cy: 478, r: 9, fill: BONE_FILL, stroke: BONE_LINE },
    // Tibia + Fibula
    { el: 'line', x1: 112, y1: 496, x2: 100, y2: 608, stroke: BONE_FILL, sw: 7 },
    { el: 'line', x1: 120, y1: 496, x2: 114, y2: 606, stroke: BONE_FILL, sw: 4 },
    { el: 'line', x1: 188, y1: 496, x2: 200, y2: 608, stroke: BONE_FILL, sw: 7 },
    { el: 'line', x1: 180, y1: 496, x2: 186, y2: 606, stroke: BONE_FILL, sw: 4 },
  ],
  back: [
    { el: 'ellipse', cx: 150, cy: 62, rx: 38, ry: 44, fill: BONE_FILL, stroke: BONE_LINE },
    // Scapulae
    { el: 'path', d: 'M120,140 L142,150 L138,190 L116,175 Z', fill: BONE_FILL, stroke: BONE_LINE },
    { el: 'path', d: 'M180,140 L158,150 L162,190 L184,175 Z', fill: BONE_FILL, stroke: BONE_LINE },
    // Spine (vertebrae)
    ...Array.from({ length: 16 }, (_, i) => ({
      el: 'rect', x: 146, y: 128 + i * 11, w: 9, h: 8, rx: 2, fill: BONE_FILL, stroke: BONE_LINE,
    })),
    // Clavicles (visible top)
    { el: 'line', x1: 150, y1: 130, x2: 110, y2: 138, stroke: BONE_FILL, sw: 5 },
    { el: 'line', x1: 150, y1: 130, x2: 190, y2: 138, stroke: BONE_FILL, sw: 5 },
    // Ribcage hint
    ...[0, 1, 2, 3].map(i => ({
      el: 'path', d: `M146,${150 + i * 13} C120,${156 + i * 13} 110,${176 + i * 12} 120,${192 + i * 11}`,
      stroke: BONE_FILL, sw: 3, fill: 'none',
    })),
    ...[0, 1, 2, 3].map(i => ({
      el: 'path', d: `M154,${150 + i * 13} C180,${156 + i * 13} 190,${176 + i * 12} 180,${192 + i * 11}`,
      stroke: BONE_FILL, sw: 3, fill: 'none',
    })),
    // Humerus
    { el: 'line', x1: 76, y1: 150, x2: 60, y2: 240, stroke: BONE_FILL, sw: 8 },
    { el: 'line', x1: 224, y1: 150, x2: 240, y2: 240, stroke: BONE_FILL, sw: 8 },
    // Forearm bones
    { el: 'line', x1: 60, y1: 244, x2: 50, y2: 312, stroke: BONE_FILL, sw: 5 },
    { el: 'line', x1: 240, y1: 244, x2: 250, y2: 312, stroke: BONE_FILL, sw: 5 },
    // Pelvis
    { el: 'path', d: 'M115,303 C105,335 130,353 150,345 C170,353 195,335 185,303 C170,323 130,323 115,303 Z', fill: BONE_FILL, stroke: BONE_LINE },
    // Femurs
    { el: 'line', x1: 122, y1: 345, x2: 116, y2: 463, stroke: BONE_FILL, sw: 9 },
    { el: 'line', x1: 178, y1: 345, x2: 184, y2: 463, stroke: BONE_FILL, sw: 9 },
    // Lower leg
    { el: 'line', x1: 116, y1: 500, x2: 100, y2: 612, stroke: BONE_FILL, sw: 7 },
    { el: 'line', x1: 184, y1: 500, x2: 200, y2: 612, stroke: BONE_FILL, sw: 7 },
  ],
};
