export const SKIN_TONES = [
  { label: 'Fair', value: '#f5d5c8', hex: '#f5d5c8' },
  { label: 'Light', value: '#e8b89a', hex: '#e8b89a' },
  { label: 'Medium', value: '#c68642', hex: '#c68642' },
  { label: 'Olive', value: '#a0785a', hex: '#a0785a' },
  { label: 'Tan', value: '#7a5230', hex: '#7a5230' },
  { label: 'Deep', value: '#4a2c17', hex: '#4a2c17' },
];

export const DETAIL_LEVELS = ['Simple', 'Medium', 'Detailed', 'Fine-line'];
export const COLOR_MODES = ['Black & Grey', 'Color', 'Watercolor'];

export function pxToCm(px, calibration) {
  if (!calibration || !calibration.pxPerCm) return null;
  return (px / calibration.pxPerCm).toFixed(1);
}

export function pxToIn(px, calibration) {
  const cm = pxToCm(px, calibration);
  if (cm === null) return null;
  return (parseFloat(cm) / 2.54).toFixed(2);
}

export function formatSize(wPx, hPx, calibration, unit = 'cm') {
  if (!calibration?.pxPerCm) return `${Math.round(wPx)}×${Math.round(hPx)} px`;
  const convert = unit === 'cm' ? pxToCm : pxToIn;
  const suffix = unit === 'cm' ? 'cm' : '"';
  return `${convert(wPx, calibration)}×${convert(hPx, calibration)}${suffix}`;
}

export function estimateQuote({ widthCm, heightCm, detail, colorMode }) {
  const area = widthCm * heightCm;
  const baseRate = 80; // $/hr
  let complexity = 1;
  if (detail === 'Medium') complexity = 1.3;
  if (detail === 'Detailed') complexity = 1.8;
  if (detail === 'Fine-line') complexity = 2.2;
  if (colorMode === 'Color') complexity *= 1.4;
  if (colorMode === 'Watercolor') complexity *= 1.6;
  const hours = Math.max(0.5, (area / 25) * complexity);
  const low = Math.round(hours * baseRate * 0.8);
  const high = Math.round(hours * baseRate * 1.2);
  const hoursLow = Math.max(0.5, hours * 0.8).toFixed(1);
  const hoursHigh = (hours * 1.2).toFixed(1);
  return { low, high, hoursLow, hoursHigh };
}
