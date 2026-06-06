import { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';
import { computeMorph } from '../utils/anatomy';

const texCache = {};
function getTexture(url) {
  if (!url) return null;
  if (texCache[url]) return texCache[url];
  const t = new THREE.TextureLoader().load(url);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  texCache[url] = t;
  return t;
}

function torsoPoints(morph) {
  const tw = morph.torsoWidth, wf = morph.waist;
  const pts = [
    [0.02, -0.02], [0.30 * tw, 0.00], [0.31 * tw, 0.12], [0.255 * wf, 0.30],
    [0.275 * tw, 0.52], [0.31 * tw, 0.72], [0.355 * tw, 0.92], [0.33 * tw, 1.05],
    [0.255 * tw, 1.13], [0.13, 1.19], [0.10, 1.26], [0.02, 1.30],
  ];
  return pts.map(([x, y]) => new THREE.Vector2(Math.max(0.02, x), y));
}

function Limb({ radius, length, position, rotation, color, mat }) {
  return (
    <mesh position={position} rotation={rotation || [0, 0, 0]} castShadow receiveShadow>
      <capsuleGeometry args={[radius, length, 10, 22]} />
      <meshStandardMaterial color={color} {...mat} />
    </mesh>
  );
}
function Bulge({ position, radius, scale, color, mat }) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <sphereGeometry args={[radius, 22, 18]} />
      <meshStandardMaterial color={color} {...mat} />
    </mesh>
  );
}

function Body({ skinTone, bodyType, anatomyLayer, onPlace }) {
  const morph = useMemo(() => computeMorph(bodyType), [bodyType]);
  const lr = morph.limbRadius, tw = morph.torsoWidth, m = morph.m;
  const isMuscle = anatomyLayer === 'muscle';
  const color = isMuscle ? '#aa3b35' : skinTone;
  const mat = isMuscle ? { roughness: 0.5, metalness: 0.05 } : { roughness: 0.7, metalness: 0.02 };
  const xs = 0.30 * tw + 0.05;
  const showDelt = 0.7 + 0.6 * m;
  const pts = useMemo(() => torsoPoints(morph), [morph]);

  return (
    <group onClick={onPlace}>
      <group position={[0, 0.45, 0]} scale={[1, 1, 0.66]}>
        <mesh castShadow receiveShadow>
          <latheGeometry args={[pts, 40]} />
          <meshStandardMaterial color={color} {...mat} />
        </mesh>
      </group>

      <Limb radius={0.10 * (1 + 0.1 * m)} length={0.15} position={[0, 1.66, 0]} color={color} mat={mat} />
      <mesh position={[0, 1.92, 0]} scale={[0.92, 1.05, 0.95]} castShadow receiveShadow>
        <sphereGeometry args={[0.205, 32, 24]} />
        <meshStandardMaterial color={color} {...mat} />
      </mesh>

      <Bulge position={[-(xs - 0.01), 1.45, 0]} radius={0.12 * showDelt} scale={[1, 1, 0.9]} color={color} mat={mat} />
      <Bulge position={[(xs - 0.01), 1.45, 0]} radius={0.12 * showDelt} scale={[1, 1, 0.9]} color={color} mat={mat} />

      <Limb radius={0.088 * lr} length={0.42} position={[-(xs + 0.02), 1.15, 0]} rotation={[0, 0, 0.10]} color={color} mat={mat} />
      <Limb radius={0.088 * lr} length={0.42} position={[(xs + 0.02), 1.15, 0]} rotation={[0, 0, -0.10]} color={color} mat={mat} />
      <Limb radius={0.072 * lr} length={0.42} position={[-(xs + 0.07), 0.68, 0]} rotation={[0, 0, 0.06]} color={color} mat={mat} />
      <Limb radius={0.072 * lr} length={0.42} position={[(xs + 0.07), 0.68, 0]} rotation={[0, 0, -0.06]} color={color} mat={mat} />
      <Bulge position={[-(xs + 0.10), 0.44, 0]} radius={0.07} scale={[0.8, 1.2, 0.5]} color={color} mat={mat} />
      <Bulge position={[(xs + 0.10), 0.44, 0]} radius={0.07} scale={[0.8, 1.2, 0.5]} color={color} mat={mat} />

      {morph.fat < 0.55 && (
        <>
          <Bulge position={[-0.13, 1.30, 0.15]} radius={0.12 * (0.7 + 0.7 * m)} scale={[1, 0.7, 0.55]} color={color} mat={mat} />
          <Bulge position={[0.13, 1.30, 0.15]} radius={0.12 * (0.7 + 0.7 * m)} scale={[1, 0.7, 0.55]} color={color} mat={mat} />
        </>
      )}

      {/* Ab definition only in muscle layer for a cleaner skin avatar */}
      {isMuscle && [0.66, 0.80, 0.94].map((y, ri) =>
        [-0.05, 0.05].map((x, ci) => (
          <Bulge key={`${ri}-${ci}`} position={[x, y, 0.165]} radius={0.045 * 1.4} scale={[1, 0.85, 0.5]} color={color} mat={mat} />
        ))
      )}

      {morph.bellySize > 0.05 && (
        <Bulge position={[0, 0.82, 0.12]} radius={0.22 + 0.28 * morph.bellySize} scale={[1.15, 0.95, 0.85]} color={color} mat={mat} />
      )}

      <Bulge position={[-0.12, 0.46, -0.15]} radius={0.12 * (0.8 + 0.4 * m)} scale={[1, 1, 0.9]} color={color} mat={mat} />
      <Bulge position={[0.12, 0.46, -0.15]} radius={0.12 * (0.8 + 0.4 * m)} scale={[1, 1, 0.9]} color={color} mat={mat} />

      <Limb radius={0.135 * lr} length={0.52} position={[-0.16, 0.05, 0]} color={color} mat={mat} />
      <Limb radius={0.135 * lr} length={0.52} position={[0.16, 0.05, 0]} color={color} mat={mat} />
      <Limb radius={0.095 * lr} length={0.48} position={[-0.18, -0.54, 0]} color={color} mat={mat} />
      <Limb radius={0.095 * lr} length={0.48} position={[0.18, -0.54, 0]} color={color} mat={mat} />
      <Bulge position={[-0.185, -0.42, -0.04]} radius={0.085 * (0.8 + 0.5 * m)} scale={[1, 1.3, 0.9]} color={color} mat={mat} />
      <Bulge position={[0.185, -0.42, -0.04]} radius={0.085 * (0.8 + 0.5 * m)} scale={[1, 1.3, 0.9]} color={color} mat={mat} />
      <mesh position={[-0.18, -1.15, 0.06]} castShadow receiveShadow><boxGeometry args={[0.13, 0.1, 0.28]} /><meshStandardMaterial color={color} {...mat} /></mesh>
      <mesh position={[0.18, -1.15, 0.06]} castShadow receiveShadow><boxGeometry args={[0.13, 0.1, 0.28]} /><meshStandardMaterial color={color} {...mat} /></mesh>
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
  const ribs = [{ y: 1.42, r: 0.16 }, { y: 1.30, r: 0.20 }, { y: 1.16, r: 0.225 }, { y: 1.02, r: 0.215 }, { y: 0.90, r: 0.185 }];
  return (
    <group>
      <Bone position={[0, 1.92, 0]} scale={[0.9, 1.05, 0.92]}><sphereGeometry args={[0.17, 24, 20]} /></Bone>
      <Bone position={[0, 1.80, 0.03]} scale={[0.8, 0.5, 0.8]}><sphereGeometry args={[0.13, 16, 12]} /></Bone>
      {verts.map((y, i) => <Bone key={i} position={[0, y, -0.04]}><sphereGeometry args={[0.035, 12, 10]} /></Bone>)}
      {ribs.map((rib, i) => <Bone key={i} position={[0, rib.y, 0]} scale={[1, 1, 0.6]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[rib.r, 0.016, 10, 32]} /></Bone>)}
      <Bone position={[0, 1.18, 0.13]}><boxGeometry args={[0.04, 0.26, 0.02]} /></Bone>
      <Bone position={[-0.14, 1.5, 0.08]} rotation={[0, 0, 1.35]}><capsuleGeometry args={[0.018, 0.22, 6, 10]} /></Bone>
      <Bone position={[0.14, 1.5, 0.08]} rotation={[0, 0, -1.35]}><capsuleGeometry args={[0.018, 0.22, 6, 10]} /></Bone>
      <Bone position={[0, 0.5, 0]} scale={[1.2, 0.7, 0.7]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.2, 0.045, 12, 28]} /></Bone>
      <Bone position={[-0.4, 1.16, 0]} rotation={[0, 0, 0.10]}><capsuleGeometry args={[0.026, 0.4, 6, 10]} /></Bone>
      <Bone position={[0.4, 1.16, 0]} rotation={[0, 0, -0.10]}><capsuleGeometry args={[0.026, 0.4, 6, 10]} /></Bone>
      <Bone position={[-0.46, 0.7, 0]}><capsuleGeometry args={[0.021, 0.38, 6, 10]} /></Bone>
      <Bone position={[0.46, 0.7, 0]}><capsuleGeometry args={[0.021, 0.38, 6, 10]} /></Bone>
      <Bone position={[-0.49, 0.44, 0]}><sphereGeometry args={[0.05, 12, 10]} /></Bone>
      <Bone position={[0.49, 0.44, 0]}><sphereGeometry args={[0.05, 12, 10]} /></Bone>
      <Bone position={[-0.16, 0.06, 0]}><capsuleGeometry args={[0.032, 0.5, 6, 10]} /></Bone>
      <Bone position={[0.16, 0.06, 0]}><capsuleGeometry args={[0.032, 0.5, 6, 10]} /></Bone>
      <Bone position={[-0.18, -0.55, 0]}><capsuleGeometry args={[0.026, 0.46, 6, 10]} /></Bone>
      <Bone position={[0.18, -0.55, 0]}><capsuleGeometry args={[0.026, 0.46, 6, 10]} /></Bone>
      <Bone position={[-0.18, -1.15, 0.06]}><boxGeometry args={[0.1, 0.06, 0.24]} /></Bone>
      <Bone position={[0.18, -1.15, 0.06]}><boxGeometry args={[0.1, 0.06, 0.24]} /></Bone>
    </group>
  );
}

function Decals({ decals }) {
  return decals.map(d => (
    <mesh key={d.id} geometry={d.geo} renderOrder={3}>
      <meshStandardMaterial map={getTexture(d.url)} transparent depthTest depthWrite={false}
        polygonOffset polygonOffsetFactor={-6} roughness={0.6} alphaTest={0.05} />
    </mesh>
  ));
}

function Scene({ skinTone, bodyType, anatomyLayer, decals, placingLayer, decalScale, onAddDecal, autoRotate }) {
  function handlePlace(e) {
    if (!placingLayer || anatomyLayer !== 'skin') return;
    e.stopPropagation();
    const mesh = e.object;
    if (!mesh.isMesh || !e.face) return;
    const point = e.point.clone();
    const nm = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
    const normal = e.face.normal.clone().applyMatrix3(nm).normalize();
    const dummy = new THREE.Object3D();
    dummy.position.copy(point);
    dummy.lookAt(point.clone().add(normal));
    const orientation = dummy.rotation.clone();
    const aspect = (placingLayer.naturalW && placingLayer.naturalH) ? placingLayer.naturalH / placingLayer.naturalW : 1;
    const size = new THREE.Vector3(decalScale, decalScale * aspect, 0.22);
    const geo = new DecalGeometry(mesh, point, orientation, size);
    onAddDecal({ id: Date.now(), geo, url: placingLayer.url });
  }

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3.5, 5, 4]} intensity={1.3} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <directionalLight position={[-3, 2.5, -1]} intensity={0.45} color="#aab8ff" />
      <directionalLight position={[0, 2, -4]} intensity={0.6} color="#ffffff" />
      <pointLight position={[0, 2.4, 3]} intensity={0.35} />

      {anatomyLayer === 'bone'
        ? <Skeleton />
        : <Body skinTone={skinTone} bodyType={bodyType} anatomyLayer={anatomyLayer} onPlace={handlePlace} />}
      {anatomyLayer === 'skin' && <Decals decals={decals} />}

      {/* studio floor + grounding shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.3, 0]} receiveShadow>
        <circleGeometry args={[3.2, 56]} />
        <meshStandardMaterial color="#14151d" roughness={1} />
      </mesh>
      <ContactShadows position={[0, -1.29, 0]} opacity={0.55} scale={4.5} blur={2.6} far={3} />

      <OrbitControls enablePan minDistance={1.5} maxDistance={7} target={[0, 0.45, 0]}
        autoRotate={autoRotate} autoRotateSpeed={1.4} />
    </>
  );
}

export default function Body3D({ skinTone, layers, bodyType, anatomyLayer, setAnatomyLayer }) {
  const [decals, setDecals] = useState([]);
  const [placingId, setPlacingId] = useState(null);
  const [decalScale, setDecalScale] = useState(0.34);
  const [autoRotate, setAutoRotate] = useState(false);

  const visible = layers.filter(l => l.visible !== false && l.url);
  const placingLayer = visible.find(l => l.id === placingId) || null;

  // Clear decals if the body shape changes (they'd no longer line up)
  useEffect(() => { setDecals([]); }, [bodyType]);
  // Drop placement arming if the design is gone
  useEffect(() => { if (placingId && !visible.some(l => l.id === placingId)) setPlacingId(null); }, [layers]);

  const LAYERS = [['skin', 'Skin'], ['muscle', 'Muscle'], ['bone', 'Skeleton']];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: '#16161f', borderBottom: '1px solid #2a2a38', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: 12, color: '#9ca3af' }}>3D Body — drag to rotate · scroll to zoom · click body to place design</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setAutoRotate(a => !a)}
            style={{ padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: autoRotate ? '#7c3aed' : '#1e1e2a', color: autoRotate ? '#fff' : '#9ca3af' }}>
            ⟳ Rotate
          </button>
          <div style={{ display: 'flex', gap: 4 }}>
            {LAYERS.map(([v, l]) => (
              <button key={v} onClick={() => setAnatomyLayer(v)}
                style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: anatomyLayer === v ? '#7c3aed' : '#1e1e2a', color: anatomyLayer === v ? '#fff' : '#9ca3af' }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Design placement strip (skin layer only) */}
      {anatomyLayer === 'skin' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 16px', background: '#13131a', borderBottom: '1px solid #2a2a38', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>Place on body:</span>
          {visible.length === 0 && <span style={{ fontSize: 11, color: '#6b7280' }}>Upload a design first (Designs / AI Scan panel)</span>}
          {visible.map(l => (
            <button key={l.id} title={l.name} onClick={() => setPlacingId(placingId === l.id ? null : l.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 6, cursor: 'pointer',
                border: placingId === l.id ? '1px solid #7c3aed' : '1px solid #2a2a38',
                background: placingId === l.id ? 'rgba(124,58,237,0.2)' : '#1e1e2a', color: '#cbd5e1', fontSize: 11 }}>
              <img src={l.url} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
              {placingId === l.id ? 'click body →' : (l.name || 'design').slice(0, 14)}
            </button>
          ))}
          {visible.length > 0 && (
            <>
              <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 'auto' }}>Size</span>
              <input type="range" min={0.12} max={0.8} step={0.02} value={decalScale}
                onChange={e => setDecalScale(+e.target.value)} style={{ width: 90 }} />
              {decals.length > 0 && (
                <>
                  <button onClick={() => setDecals(d => d.slice(0, -1))}
                    style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #2a2a38', background: '#1e1e2a', color: '#cbd5e1', fontSize: 11, cursor: 'pointer' }}>Undo</button>
                  <button onClick={() => setDecals([])}
                    style={{ padding: '4px 8px', borderRadius: 6, border: 'none', background: 'rgba(220,38,38,0.25)', color: '#fca5a5', fontSize: 11, cursor: 'pointer' }}>Clear</button>
                </>
              )}
            </>
          )}
        </div>
      )}

      <div style={{ flex: 1 }}>
        <Canvas camera={{ position: [0, 0.5, 4.6], fov: 50 }} shadows gl={{ antialias: true }}
          style={{ background: 'radial-gradient(ellipse at 50% 35%, #262a3a 0%, #14151d 60%, #0d0e13 100%)' }}>
          <Suspense fallback={null}>
            <Scene skinTone={skinTone} bodyType={bodyType} anatomyLayer={anatomyLayer}
              decals={decals} placingLayer={placingLayer} decalScale={decalScale}
              onAddDecal={(d) => setDecals(prev => [...prev, d])} autoRotate={autoRotate} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
