import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { computeMorph } from '../utils/anatomy';

function torsoPoints(morph) {
  const tw = morph.torsoWidth, wf = morph.waist;
  const pts = [
    [0.02, -0.02],
    [0.30 * tw, 0.00],
    [0.31 * tw, 0.12],
    [0.255 * wf, 0.30],
    [0.275 * tw, 0.52],
    [0.31 * tw, 0.72],
    [0.355 * tw, 0.92],
    [0.33 * tw, 1.05],
    [0.255 * tw, 1.13],
    [0.13, 1.19],
    [0.10, 1.26],
    [0.02, 1.30],
  ];
  return pts.map(([x, y]) => new THREE.Vector2(Math.max(0.02, x), y));
}

function Limb({ radius, length, position, rotation, color, mat }) {
  return (
    <mesh position={position} rotation={rotation || [0, 0, 0]} castShadow receiveShadow>
      <capsuleGeometry args={[radius, length, 8, 18]} />
      <meshStandardMaterial color={color} {...mat} />
    </mesh>
  );
}

function Bulge({ position, radius, scale, color, mat }) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <sphereGeometry args={[radius, 20, 16]} />
      <meshStandardMaterial color={color} {...mat} />
    </mesh>
  );
}

function Body({ skinTone, bodyType, anatomyLayer }) {
  const morph = useMemo(() => computeMorph(bodyType), [bodyType]);
  const lr = morph.limbRadius;
  const tw = morph.torsoWidth;
  const isMuscle = anatomyLayer === 'muscle';
  const color = isMuscle ? '#aa3b35' : skinTone;
  const mat = isMuscle
    ? { roughness: 0.5, metalness: 0.05 }
    : { roughness: 0.72, metalness: 0.02 };

  const xs = 0.30 * tw + 0.05;          // shoulder x
  const m = morph.m;
  const showDelt = 0.7 + 0.6 * m;

  const pts = useMemo(() => torsoPoints(morph), [morph]);

  const absRows = [0.66, 0.80, 0.94];
  const absCols = [-0.05, 0.05];

  return (
    <group>
      {/* Torso (lathe, flattened in depth) */}
      <group position={[0, 0.45, 0]} scale={[1, 1, 0.66]}>
        <mesh castShadow receiveShadow>
          <latheGeometry args={[pts, 28]} />
          <meshStandardMaterial color={color} {...mat} />
        </mesh>
      </group>

      {/* Neck + head */}
      <Limb radius={0.10 * (1 + 0.1 * m)} length={0.13} position={[0, 1.66, 0]} color={color} mat={mat} />
      <mesh position={[0, 1.92, 0]} scale={[0.92, 1.05, 0.95]} castShadow receiveShadow>
        <sphereGeometry args={[0.205, 28, 22]} />
        <meshStandardMaterial color={color} {...mat} />
      </mesh>

      {/* Deltoids */}
      <Bulge position={[-(xs - 0.01), 1.45, 0]} radius={0.12 * showDelt} scale={[1, 1, 0.9]} color={color} mat={mat} />
      <Bulge position={[(xs - 0.01), 1.45, 0]} radius={0.12 * showDelt} scale={[1, 1, 0.9]} color={color} mat={mat} />

      {/* Arms */}
      <Limb radius={0.088 * lr} length={0.40} position={[-(xs + 0.02), 1.16, 0]} rotation={[0, 0, 0.10]} color={color} mat={mat} />
      <Limb radius={0.088 * lr} length={0.40} position={[(xs + 0.02), 1.16, 0]} rotation={[0, 0, -0.10]} color={color} mat={mat} />
      <Limb radius={0.072 * lr} length={0.40} position={[-(xs + 0.07), 0.70, 0]} rotation={[0, 0, 0.06]} color={color} mat={mat} />
      <Limb radius={0.072 * lr} length={0.40} position={[(xs + 0.07), 0.70, 0]} rotation={[0, 0, -0.06]} color={color} mat={mat} />
      {/* Hands */}
      <Bulge position={[-(xs + 0.10), 0.44, 0]} radius={0.07} scale={[0.8, 1.2, 0.5]} color={color} mat={mat} />
      <Bulge position={[(xs + 0.10), 0.44, 0]} radius={0.07} scale={[0.8, 1.2, 0.5]} color={color} mat={mat} />

      {/* Pectorals */}
      {morph.fat < 0.55 && (
        <>
          <Bulge position={[-0.13, 1.30, 0.15]} radius={0.12 * (0.7 + 0.7 * m)} scale={[1, 0.7, 0.55]} color={color} mat={mat} />
          <Bulge position={[0.13, 1.30, 0.15]} radius={0.12 * (0.7 + 0.7 * m)} scale={[1, 0.7, 0.55]} color={color} mat={mat} />
        </>
      )}

      {/* Abs (six-pack) — visible with definition */}
      {(morph.definition > 0.04 || isMuscle) &&
        absRows.map((y, ri) =>
          absCols.map((x, ci) => (
            <Bulge key={`${ri}-${ci}`} position={[x, y, 0.165]}
              radius={0.045 * (0.8 + (isMuscle ? 0.6 : morph.definition))}
              scale={[1, 0.85, 0.5]} color={color} mat={mat} />
          ))
        )}

      {/* Belly when higher body fat */}
      {morph.bellySize > 0.05 && (
        <Bulge position={[0, 0.82, 0.12]} radius={0.22 + 0.28 * morph.bellySize}
          scale={[1.15, 0.95, 0.85]} color={color} mat={mat} />
      )}

      {/* Glutes */}
      <Bulge position={[-0.12, 0.46, -0.15]} radius={0.12 * (0.8 + 0.4 * m)} scale={[1, 1, 0.9]} color={color} mat={mat} />
      <Bulge position={[0.12, 0.46, -0.15]} radius={0.12 * (0.8 + 0.4 * m)} scale={[1, 1, 0.9]} color={color} mat={mat} />

      {/* Legs */}
      <Limb radius={0.135 * lr} length={0.50} position={[-0.16, 0.06, 0]} color={color} mat={mat} />
      <Limb radius={0.135 * lr} length={0.50} position={[0.16, 0.06, 0]} color={color} mat={mat} />
      {/* Calves with a bulge */}
      <Limb radius={0.095 * lr} length={0.46} position={[-0.18, -0.55, 0]} color={color} mat={mat} />
      <Limb radius={0.095 * lr} length={0.46} position={[0.18, -0.55, 0]} color={color} mat={mat} />
      <Bulge position={[-0.185, -0.42, -0.04]} radius={0.085 * (0.8 + 0.5 * m)} scale={[1, 1.3, 0.9]} color={color} mat={mat} />
      <Bulge position={[0.185, -0.42, -0.04]} radius={0.085 * (0.8 + 0.5 * m)} scale={[1, 1.3, 0.9]} color={color} mat={mat} />
      {/* Feet */}
      <mesh position={[-0.18, -1.15, 0.06]} castShadow receiveShadow>
        <boxGeometry args={[0.13, 0.1, 0.28]} />
        <meshStandardMaterial color={color} {...mat} />
      </mesh>
      <mesh position={[0.18, -1.15, 0.06]} castShadow receiveShadow>
        <boxGeometry args={[0.13, 0.1, 0.28]} />
        <meshStandardMaterial color={color} {...mat} />
      </mesh>
    </group>
  );
}

function Bone({ children, position, rotation, scale }) {
  return (
    <mesh position={position} rotation={rotation} scale={scale} castShadow>
      {children}
      <meshStandardMaterial color="#ece6d6" roughness={0.55} metalness={0.04} />
    </mesh>
  );
}

function Skeleton() {
  const verts = Array.from({ length: 13 }, (_, i) => 0.55 + i * 0.085);
  const ribs = [
    { y: 1.42, r: 0.16 }, { y: 1.30, r: 0.20 }, { y: 1.16, r: 0.225 },
    { y: 1.02, r: 0.215 }, { y: 0.90, r: 0.185 },
  ];
  return (
    <group>
      {/* Skull + jaw */}
      <Bone position={[0, 1.92, 0]} scale={[0.9, 1.05, 0.92]}>
        <sphereGeometry args={[0.17, 24, 20]} />
      </Bone>
      <Bone position={[0, 1.80, 0.03]} scale={[0.8, 0.5, 0.8]}>
        <sphereGeometry args={[0.13, 16, 12]} />
      </Bone>
      {/* Spine */}
      {verts.map((y, i) => (
        <Bone key={i} position={[0, y, -0.04]}>
          <sphereGeometry args={[0.035, 12, 10]} />
        </Bone>
      ))}
      {/* Ribcage */}
      {ribs.map((rib, i) => (
        <Bone key={i} position={[0, rib.y, 0]} scale={[1, 1, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[rib.r, 0.016, 10, 32]} />
        </Bone>
      ))}
      {/* Sternum */}
      <Bone position={[0, 1.18, 0.13]}>
        <boxGeometry args={[0.04, 0.26, 0.02]} />
      </Bone>
      {/* Clavicles */}
      <Bone position={[-0.14, 1.5, 0.08]} rotation={[0, 0, 1.35]}>
        <capsuleGeometry args={[0.018, 0.22, 6, 10]} />
      </Bone>
      <Bone position={[0.14, 1.5, 0.08]} rotation={[0, 0, -1.35]}>
        <capsuleGeometry args={[0.018, 0.22, 6, 10]} />
      </Bone>
      {/* Pelvis */}
      <Bone position={[0, 0.5, 0]} scale={[1.2, 0.7, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.045, 12, 28]} />
      </Bone>
      {/* Humerus */}
      <Bone position={[-0.4, 1.16, 0]} rotation={[0, 0, 0.10]}><capsuleGeometry args={[0.026, 0.4, 6, 10]} /></Bone>
      <Bone position={[0.4, 1.16, 0]} rotation={[0, 0, -0.10]}><capsuleGeometry args={[0.026, 0.4, 6, 10]} /></Bone>
      {/* Forearm */}
      <Bone position={[-0.46, 0.7, 0]}><capsuleGeometry args={[0.021, 0.38, 6, 10]} /></Bone>
      <Bone position={[0.46, 0.7, 0]}><capsuleGeometry args={[0.021, 0.38, 6, 10]} /></Bone>
      {/* Hands */}
      <Bone position={[-0.49, 0.44, 0]}><sphereGeometry args={[0.05, 12, 10]} /></Bone>
      <Bone position={[0.49, 0.44, 0]}><sphereGeometry args={[0.05, 12, 10]} /></Bone>
      {/* Femur */}
      <Bone position={[-0.16, 0.06, 0]}><capsuleGeometry args={[0.032, 0.5, 6, 10]} /></Bone>
      <Bone position={[0.16, 0.06, 0]}><capsuleGeometry args={[0.032, 0.5, 6, 10]} /></Bone>
      {/* Tibia */}
      <Bone position={[-0.18, -0.55, 0]}><capsuleGeometry args={[0.026, 0.46, 6, 10]} /></Bone>
      <Bone position={[0.18, -0.55, 0]}><capsuleGeometry args={[0.026, 0.46, 6, 10]} /></Bone>
      {/* Feet */}
      <Bone position={[-0.18, -1.15, 0.06]}><boxGeometry args={[0.1, 0.06, 0.24]} /></Bone>
      <Bone position={[0.18, -1.15, 0.06]}><boxGeometry args={[0.1, 0.06, 0.24]} /></Bone>
    </group>
  );
}

function Scene({ skinTone, bodyType, anatomyLayer }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 4]} intensity={1.25} castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#aab4ff" />
      <pointLight position={[0, 2, 3]} intensity={0.4} />
      {anatomyLayer === 'bone'
        ? <Skeleton />
        : <Body skinTone={skinTone} bodyType={bodyType} anatomyLayer={anatomyLayer} />}
      <ContactShadows position={[0, -1.28, 0]} opacity={0.5} scale={4} blur={2.4} far={3} />
      <OrbitControls enablePan minDistance={1.6} maxDistance={7} target={[0, 0.45, 0]} />
    </>
  );
}

export default function Body3D({ skinTone, bodyType, anatomyLayer, setAnatomyLayer }) {
  const LAYERS = [['skin', 'Skin'], ['muscle', 'Muscle'], ['bone', 'Skeleton']];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: '#16161f', borderBottom: '1px solid #2a2a38', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: 12, color: '#9ca3af' }}>3D Body — drag to rotate · scroll to zoom · right-click to pan</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {LAYERS.map(([v, l]) => (
            <button key={v} onClick={() => setAnatomyLayer(v)}
              style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                background: anatomyLayer === v ? '#7c3aed' : '#1e1e2a', color: anatomyLayer === v ? '#fff' : '#9ca3af' }}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <Canvas camera={{ position: [0, 0.5, 4.6], fov: 50 }} shadows
          gl={{ antialias: true }}
          style={{ background: 'linear-gradient(to bottom, #0f0f18, #1a1a28)' }}>
          <Suspense fallback={null}>
            <Scene skinTone={skinTone} bodyType={bodyType} anatomyLayer={anatomyLayer} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
