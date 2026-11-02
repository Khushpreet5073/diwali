import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { audioManager } from '../audio/AudioManager';

const CHAKRI_COLORS = [
  new THREE.Color('#FFD76A'),
  new THREE.Color('#FF9F1C'),
  new THREE.Color('#F04492'),
  new THREE.Color('#54218C'),
  new THREE.Color('#32C5C5'),
  new THREE.Color('#078C9E'),
  new THREE.Color('#FFB800'),
];

// Spark particle system for rim sparks - optimized count
function RimSparks({ count = 36, radius = 1.4, active }) {
  const sparkRef = useRef();
  const timesRef = useRef(new Float32Array(count).map(() => Math.random()));

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = 0;
      velocities[i * 3] = (Math.random() - 0.5) * 0.08;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.08;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.03;
    }
    return { positions, velocities };
  }, [count, radius]);

  const colorsArray = useMemo(() => {
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = Math.random();
      const c = t < 0.4 ? new THREE.Color('#FFD76A') :
                t < 0.7 ? new THREE.Color('#FF9F1C') :
                t < 0.85 ? new THREE.Color('#F04492') :
                new THREE.Color('#32C5C5');
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return colors;
  }, [count]);

  useFrame((state, delta) => {
    if (!sparkRef.current) return;
    const geo = sparkRef.current.geometry;
    const pos = geo.attributes.position.array;
    const speedMult = active ? 2 : 1;

    for (let i = 0; i < count; i++) {
      timesRef.current[i] += delta * speedMult;
      if (timesRef.current[i] > 1) {
        timesRef.current[i] = 0;
        const angle = (i / count) * Math.PI * 2 + state.clock.elapsedTime * 2;
        pos[i * 3] = Math.cos(angle) * radius;
        pos[i * 3 + 1] = Math.sin(angle) * radius;
        pos[i * 3 + 2] = 0;
      } else {
        const t = timesRef.current[i];
        const origAngle = (i / count) * Math.PI * 2;
        const baseX = Math.cos(origAngle + state.clock.elapsedTime * 2) * radius;
        const baseY = Math.sin(origAngle + state.clock.elapsedTime * 2) * radius;
        pos[i * 3] = baseX + velocities[i * 3] * t * 7 * speedMult;
        pos[i * 3 + 1] = baseY + velocities[i * 3 + 1] * t * 7 * speedMult;
        pos[i * 3 + 2] = velocities[i * 3 + 2] * t * 3;
      }
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={sparkRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colorsArray, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

// Explosion particles - streamlined count
function ExplosionParticles({ triggered, onDone }) {
  const ref = useRef();
  const count = 75;
  const startedRef = useRef(false);
  const timeRef = useRef(0);

  const { positions, velocities, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 0.03 + Math.random() * 0.1;
      velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      velocities[i * 3 + 2] = Math.cos(phi) * speed * 0.5;

      const c = CHAKRI_COLORS[Math.floor(Math.random() * CHAKRI_COLORS.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    return { positions, velocities, colors };
  }, [count]);

  useFrame((state, delta) => {
    if (!triggered || !ref.current) return;
    if (!startedRef.current) {
      startedRef.current = true;
      timeRef.current = 0;
    }

    timeRef.current += delta;
    if (timeRef.current > 1.8) {
      startedRef.current = false;
      onDone?.();
      return;
    }

    const geo = ref.current.geometry;
    const pos = geo.attributes.position.array;
    const t = timeRef.current;

    for (let i = 0; i < count; i++) {
      pos[i * 3] = velocities[i * 3] * t * 14;
      pos[i * 3 + 1] = velocities[i * 3 + 1] * t * 14 - 0.25 * t * t;
      pos[i * 3 + 2] = velocities[i * 3 + 2] * t * 14;
    }
    geo.attributes.position.needsUpdate = true;

    const mat = ref.current.material;
    mat.opacity = Math.max(0, 1 - t / 1.8);
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        vertexColors
        transparent
        opacity={1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function Chakri3D({ onExplode }) {
  const groupRef = useRef();
  const lightRef = useRef();
  const colorIndexRef = useRef(0);
  const colorProgressRef = useRef(0);
  const [hovered, setHovered] = useState(false);
  const [exploded, setExploded] = useState(false);

  // Color cycling
  const currentColorRef = useRef(CHAKRI_COLORS[0].clone());
  const targetColorRef = useRef(CHAKRI_COLORS[1].clone());

  const NUM_ARMS = 12;

  const armAngles = useMemo(() =>
    Array.from({ length: NUM_ARMS }, (_, i) => (i / NUM_ARMS) * Math.PI * 2),
    [NUM_ARMS]
  );

  // Procedural Chakri rings with optimized polygon counts
  const chakraRingGeo = useMemo(() => new THREE.TorusGeometry(1.4, 0.04, 10, 48), []);
  const innerRingGeo  = useMemo(() => new THREE.TorusGeometry(0.8, 0.025, 8, 36), []);
  const innerRingGeo2 = useMemo(() => new THREE.TorusGeometry(0.4, 0.02, 6, 28), []);
  const coreGeo       = useMemo(() => new THREE.SphereGeometry(0.12, 12, 12), []);

  // Spoke geometries (optimized segment count: 10 vs 20)
  const spokeGeos = useMemo(() => {
    return armAngles.map(angle => {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.7 * Math.cos(angle + 0.3), 0.7 * Math.sin(angle + 0.3), 0),
        new THREE.Vector3(1.4 * Math.cos(angle), 1.4 * Math.sin(angle), 0)
      );
      return new THREE.TubeGeometry(curve, 10, 0.012, 5, false);
    });
  }, [armAngles]);

  // Hub decorative circles
  const hubGeos = useMemo(() => [0.2, 0.25, 0.3].map(r => new THREE.TorusGeometry(r, 0.008, 6, 24)), []);

  // Notch tips on outer ring
  const notchGeos = useMemo(() => {
    return armAngles.map(angle => {
      const x = Math.cos(angle) * 1.4;
      const y = Math.sin(angle) * 1.4;
      const geo = new THREE.ConeGeometry(0.04, 0.12, 5);
      return { geo, x, y, angle };
    });
  }, [armAngles]);

  // Shared materials to avoid per-frame scene traversal
  const sharedMaterials = useMemo(() => {
    const rim = new THREE.MeshStandardMaterial({
      color: '#FFD76A',
      emissive: '#FF9F1C',
      emissiveIntensity: 2.2,
      metalness: 0.8,
      roughness: 0.2,
    });
    const spoke = new THREE.MeshStandardMaterial({
      color: '#FFD76A',
      emissive: '#FF9F1C',
      emissiveIntensity: 1.8,
      metalness: 0.8,
      roughness: 0.2,
    });
    const core = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      emissive: '#FFD76A',
      emissiveIntensity: 3.5,
      metalness: 0.9,
      roughness: 0.1,
    });
    return { rim, spoke, core };
  }, []);



  // High-performance useFrame loop - updates 3 shared materials directly without traverse()
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const speed = hovered ? 3.8 : 1.8;
    groupRef.current.rotation.z += delta * speed;

    // Color cycling calculation
    colorProgressRef.current += delta * 0.3;
    if (colorProgressRef.current >= 1) {
      colorProgressRef.current = 0;
      colorIndexRef.current = (colorIndexRef.current + 1) % CHAKRI_COLORS.length;
      targetColorRef.current = CHAKRI_COLORS[(colorIndexRef.current + 1) % CHAKRI_COLORS.length].clone();
    }

    currentColorRef.current.lerp(targetColorRef.current, delta * 0.5);
    const c = currentColorRef.current;
    const emInt = hovered ? 2.8 : 2.0;

    // Direct material property updates (O(1) instead of traversing 30+ meshes)
    sharedMaterials.rim.color.copy(c);
    sharedMaterials.rim.emissive.copy(c);
    sharedMaterials.rim.emissiveIntensity = emInt;

    sharedMaterials.spoke.color.copy(c);
    sharedMaterials.spoke.emissive.copy(c);
    sharedMaterials.spoke.emissiveIntensity = emInt * 0.85;

    // Dynamic light update
    if (lightRef.current) {
      lightRef.current.color.copy(c);
      lightRef.current.intensity = hovered ? 3.2 : 2.0;
    }

    // Subtle wobble
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.7) * 0.05;
    groupRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.5) * 0.03;
  });

  const handleClick = useCallback(() => {
    setExploded(true);
    onExplode?.();
    audioManager.play('firecracker', { minInterval: 2000 });
  }, [onExplode]);

  return (
    <group
      ref={groupRef}
      onClick={handleClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      {/* Dynamic light from Chakri */}
      <pointLight
        ref={lightRef}
        color="#FFD76A"
        intensity={2.2}
        distance={5}
        decay={2}
      />

      {/* Outer rim */}
      <mesh geometry={chakraRingGeo} material={sharedMaterials.rim} />

      {/* Inner ring 1 & 2 */}
      <mesh geometry={innerRingGeo} material={sharedMaterials.rim} />
      <mesh geometry={innerRingGeo2} material={sharedMaterials.rim} />

      {/* Hub decorative rings */}
      {hubGeos.map((geo, i) => (
        <mesh key={`hub-${i}`} geometry={geo} material={sharedMaterials.rim} />
      ))}

      {/* Core sphere */}
      <mesh geometry={coreGeo} material={sharedMaterials.core} />

      {/* Curved spokes */}
      {spokeGeos.map((geo, i) => (
        <mesh key={`spoke-${i}`} geometry={geo} material={sharedMaterials.spoke} />
      ))}

      {/* Notch tips on outer ring */}
      {notchGeos.map(({ geo, x, y, angle }, i) => (
        <mesh
          key={`notch-${i}`}
          geometry={geo}
          material={sharedMaterials.core}
          position={[x, y, 0]}
          rotation={[0, 0, angle - Math.PI / 2]}
        />
      ))}

      {/* Rim sparks */}
      <RimSparks count={36} radius={1.4} active={hovered} />

      {/* Explosion */}
      {exploded && (
        <ExplosionParticles
          triggered={exploded}
          onDone={() => setExploded(false)}
        />
      )}
    </group>
  );
}
