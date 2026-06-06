// SVG body outline paths for front/back/side views
// Viewbox: 0 0 300 600

export const BODY_VIEWS = {
  front: {
    label: 'Front',
    viewBox: '0 0 300 700',
    paths: [
      // Head
      { d: 'M150,20 C125,20 108,40 108,62 C108,84 125,102 150,104 C175,102 192,84 192,62 C192,40 175,20 150,20 Z', id: 'head', label: 'Head' },
      // Neck
      { d: 'M135,102 L135,125 L165,125 L165,102 Z', id: 'neck', label: 'Neck' },
      // Torso
      { d: 'M100,125 L90,280 L110,295 L190,295 L210,280 L200,125 Z', id: 'torso', label: 'Chest/Ribs' },
      // Left shoulder
      { d: 'M100,125 L65,140 L55,185 L85,195 L90,155 Z', id: 'l-shoulder', label: 'Left Shoulder' },
      // Right shoulder
      { d: 'M200,125 L235,140 L245,185 L215,195 L210,155 Z', id: 'r-shoulder', label: 'Right Shoulder' },
      // Left upper arm
      { d: 'M55,185 L48,240 L78,248 L85,195 Z', id: 'l-upper-arm', label: 'Left Upper Arm' },
      // Right upper arm
      { d: 'M245,185 L252,240 L222,248 L215,195 Z', id: 'r-upper-arm', label: 'Right Upper Arm' },
      // Left forearm
      { d: 'M48,240 L40,310 L68,316 L78,248 Z', id: 'l-forearm', label: 'Left Forearm' },
      // Right forearm
      { d: 'M252,240 L260,310 L232,316 L222,248 Z', id: 'r-forearm', label: 'Right Forearm' },
      // Left hand
      { d: 'M40,310 L32,345 L55,350 L68,316 Z', id: 'l-hand', label: 'Left Hand' },
      // Right hand
      { d: 'M260,310 L268,345 L245,350 L232,316 Z', id: 'r-hand', label: 'Right Hand' },
      // Hips
      { d: 'M110,295 L100,340 L200,340 L190,295 Z', id: 'hips', label: 'Hips/Waist' },
      // Left thigh
      { d: 'M100,340 L88,460 L120,465 L130,345 Z', id: 'l-thigh', label: 'Left Thigh' },
      // Right thigh
      { d: 'M200,340 L212,460 L180,465 L170,345 Z', id: 'r-thigh', label: 'Right Thigh' },
      // Left knee
      { d: 'M88,460 L84,495 L118,498 L120,465 Z', id: 'l-knee', label: 'Left Knee' },
      // Right knee
      { d: 'M212,460 L216,495 L182,498 L180,465 Z', id: 'r-knee', label: 'Right Knee' },
      // Left calf
      { d: 'M84,495 L80,610 L115,612 L118,498 Z', id: 'l-calf', label: 'Left Calf' },
      // Right calf
      { d: 'M216,495 L220,610 L185,612 L182,498 Z', id: 'r-calf', label: 'Right Calf' },
      // Left foot
      { d: 'M80,610 L70,645 L115,648 L115,612 Z', id: 'l-foot', label: 'Left Foot' },
      // Right foot
      { d: 'M220,610 L230,645 L185,648 L185,612 Z', id: 'r-foot', label: 'Right Foot' },
    ]
  },
  back: {
    label: 'Back',
    viewBox: '0 0 300 700',
    paths: [
      { d: 'M150,20 C125,20 108,40 108,62 C108,84 125,102 150,104 C175,102 192,84 192,62 C192,40 175,20 150,20 Z', id: 'head-b', label: 'Head' },
      { d: 'M135,102 L135,125 L165,125 L165,102 Z', id: 'neck-b', label: 'Neck' },
      { d: 'M100,125 L85,290 L110,300 L190,300 L215,290 L200,125 Z', id: 'back', label: 'Back/Spine' },
      { d: 'M100,125 L65,140 L55,185 L85,195 L90,155 Z', id: 'l-shoulder-b', label: 'Left Shoulder' },
      { d: 'M200,125 L235,140 L245,185 L215,195 L210,155 Z', id: 'r-shoulder-b', label: 'Right Shoulder' },
      { d: 'M55,185 L48,240 L78,248 L85,195 Z', id: 'l-upper-arm-b', label: 'Left Upper Arm' },
      { d: 'M245,185 L252,240 L222,248 L215,195 Z', id: 'r-upper-arm-b', label: 'Right Upper Arm' },
      { d: 'M48,240 L40,310 L68,316 L78,248 Z', id: 'l-forearm-b', label: 'Left Forearm' },
      { d: 'M252,240 L260,310 L232,316 L222,248 Z', id: 'r-forearm-b', label: 'Right Forearm' },
      { d: 'M40,310 L32,345 L55,350 L68,316 Z', id: 'l-hand-b', label: 'Left Hand' },
      { d: 'M260,310 L268,345 L245,350 L232,316 Z', id: 'r-hand-b', label: 'Right Hand' },
      { d: 'M110,300 L100,345 L200,345 L190,300 Z', id: 'lower-back', label: 'Lower Back/Glutes' },
      { d: 'M100,345 L88,465 L120,470 L130,350 Z', id: 'l-thigh-b', label: 'Left Thigh' },
      { d: 'M200,345 L212,465 L180,470 L170,350 Z', id: 'r-thigh-b', label: 'Right Thigh' },
      { d: 'M88,465 L84,500 L118,503 L120,470 Z', id: 'l-knee-b', label: 'Left Knee' },
      { d: 'M212,465 L216,500 L182,503 L180,470 Z', id: 'r-knee-b', label: 'Right Knee' },
      { d: 'M84,500 L80,615 L115,617 L118,503 Z', id: 'l-calf-b', label: 'Left Calf' },
      { d: 'M216,500 L220,615 L185,617 L182,503 Z', id: 'r-calf-b', label: 'Right Calf' },
      { d: 'M80,615 L72,648 L115,650 L115,617 Z', id: 'l-foot-b', label: 'Left Foot' },
      { d: 'M220,615 L228,648 L185,650 L185,617 Z', id: 'r-foot-b', label: 'Right Foot' },
    ]
  },
  'left-arm': {
    label: 'Left Arm',
    viewBox: '0 0 200 600',
    paths: [
      { d: 'M60,20 L60,120 L80,130 L120,130 L140,120 L140,20 Z', id: 'la-shoulder', label: 'Shoulder' },
      { d: 'M65,130 L55,280 L80,290 L120,290 L145,280 L135,130 Z', id: 'la-upper', label: 'Upper Arm' },
      { d: 'M58,280 L48,420 L78,430 L122,430 L152,420 L142,280 Z', id: 'la-forearm', label: 'Forearm' },
      { d: 'M50,420 L40,500 L80,510 L120,510 L160,500 L150,420 Z', id: 'la-hand', label: 'Hand/Wrist' },
    ]
  },
  'right-arm': {
    label: 'Right Arm',
    viewBox: '0 0 200 600',
    paths: [
      { d: 'M60,20 L60,120 L80,130 L120,130 L140,120 L140,20 Z', id: 'ra-shoulder', label: 'Shoulder' },
      { d: 'M65,130 L55,280 L80,290 L120,290 L145,280 L135,130 Z', id: 'ra-upper', label: 'Upper Arm' },
      { d: 'M58,280 L48,420 L78,430 L122,430 L152,420 L142,280 Z', id: 'ra-forearm', label: 'Forearm' },
      { d: 'M50,420 L40,500 L80,510 L120,510 L160,500 L150,420 Z', id: 'ra-hand', label: 'Hand/Wrist' },
    ]
  },
  ribs: {
    label: 'Ribs',
    viewBox: '0 0 300 500',
    paths: [
      { d: 'M80,20 L60,400 L100,420 L140,400 L140,20 Z', id: 'left-ribs', label: 'Left Ribs' },
      { d: 'M220,20 L240,400 L200,420 L160,400 L160,20 Z', id: 'right-ribs', label: 'Right Ribs' },
    ]
  },
};
