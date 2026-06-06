import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

function BodyMesh({ skinTone, layers }) {
  const groupRef = useRef();
  const meshRefs = useRef([]);

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
  }
  const [sr, sg, sb] = hexToRgb(skinTone);
  const skinColor = new THREE.Color(sr, sg, sb);

  const parts = [
    // [geometry args, position, type]
    { geo: [0.23, 28, 22], pos: [0, 2.02, 0], type: 'sphere', label: 'head' },
    { geo: [0.1, 0.1, 0.2, 12], pos: [0, 1.78, 0], type: 'cyl', label: 'neck' },
    { geo: [0.42, 0.35, 0.7, 16], pos: [0, 1.25, 0], type: 'cyl', label: 'chest' },
    { geo: [0.32, 0.3, 0.45, 16], pos: [0, 0.7, 0], type: 'cyl', label: 'abdomen' },
    { geo: [0.3, 0.34, 0.35, 16], pos: [0, 0.28, 0], type: 'cyl', label: 'hips' },
    // arms
    { geo: [0.1, 0.09, 0.45, 12], pos: [-0.56, 1.4, 0], type: 'cyl', label: 'l-upper-arm', rot: [0, 0, Math.PI/8] },
    { geo: [0.1, 0.09, 0.45, 12], pos: [0.56, 1.4, 0], type: 'cyl', label: 'r-upper-arm', rot: [0, 0, -Math.PI/8] },
    { geo: [0.08, 0.07, 0.42, 12], pos: [-0.7, 0.98, 0], type: 'cyl', label: 'l-forearm', rot: [0, 0, Math.PI/12] },
    { geo: [0.08, 0.07, 0.42, 12], pos: [0.7, 0.98, 0], type: 'cyl', label: 'r-forearm', rot: [0, 0, -Math.PI/12] },
    { geo: [0.07, 0.05, 0.18, 10], pos: [-0.76, 0.66, 0], type: 'cyl', label: 'l-hand' },
    { geo: [0.07, 0.05, 0.18, 10], pos: [0.76, 0.66, 0], type: 'cyl', label: 'r-hand' },
    // legs
    { geo: [0.15, 0.13, 0.55, 14], pos: [-0.2, -0.12, 0], type: 'cyl', label: 'l-thigh' },
    { geo: [0.15, 0.13, 0.55, 14], pos: [0.2, -0.12, 0], type: 'cyl', label: 'r-thigh' },
    { geo: [0.1, 0.09, 0.52, 12], pos: [-0.2, -0.77, 0], type: 'cyl', label: 'l-calf' },
    { geo: [0.1, 0.09, 0.52, 12], pos: [0.2, -0.77, 0], type: 'cyl', label: 'r-calf' },
    { geo: [0.08, 0.07, 0.28, 10], pos: [-0.2, -1.18, 0.1], type: 'cyl', label: 'l-foot', rot: [Math.PI/2, 0, 0] },
    { geo: [0.08, 0.07, 0.28, 10], pos: [0.2, -1.18, 0.1], type: 'cyl', label: 'r-foot', rot: [Math.PI/2, 0, 0] },
  ];

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {parts.map((p, i) => {
        const rot = p.rot || [0, 0, 0];
        const geo = p.type === 'sphere'
          ? <sphereGeometry args={p.geo} />
          : <cylinderGeometry args={p.geo} />;
        return (
          <mesh key={p.label} position={p.pos} rotation={rot} castShadow receiveShadow>
            {geo}
            <meshStandardMaterial
              color={skinColor}
              roughness={0.85}
              metalness={0.02}
              envMapIntensity={0.4}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function Scene({ skinTone, layers }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 3]} intensity={1.2} castShadow />
      <directionalLight position={[-2, 3, -2]} intensity={0.4} />
      <pointLight position={[0, 3, 2]} intensity={0.5} />
      <BodyMesh skinTone={skinTone} layers={layers} />
      <OrbitControls
        enablePan={true}
        minDistance={1.5}
        maxDistance={7}
        target={[0, 0.35, 0]}
      />
      <gridHelper args={[4, 20, '#1a1a2e', '#1a1a2e']} position={[0, -1.35, 0]} />
    </>
  );
}

export default function Body3D({ skinTone, layers }) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 bg-[#16161f] border-b border-[#2a2a38]">
        <span className="text-xs text-slate-400">3D Body — drag to rotate · scroll to zoom · right-click to pan</span>
      </div>
      <div className="flex-1">
        <Canvas
          camera={{ position: [0, 0.5, 4.6], fov: 50 }}
          shadows
          gl={{ antialias: true }}
          style={{ background: 'linear-gradient(to bottom, #0f0f18, #1a1a28)' }}
        >
          <Suspense fallback={null}>
            <Scene skinTone={skinTone} layers={layers} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
