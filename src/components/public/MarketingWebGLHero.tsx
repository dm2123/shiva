'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, OrbitControls, MeshDistortMaterial, Sphere, Torus, Box } from '@react-three/drei';
import * as THREE from 'three';

// ── Ecosystem Node ─────────────────────────────────────────────
function EcosystemNode({
  position,
  color,
  label,
  delay = 0,
}: {
  position: [number, number, number];
  color: string;
  label: string;
  delay?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now() + delay * 1000);

  useFrame(() => {
    if (!meshRef.current) return;
    const t = (Date.now() - startTime.current) / 1000;
    meshRef.current.rotation.y = t * 0.4;
    meshRef.current.position.y = position[1] + Math.sin(t * 0.8 + delay) * 0.12;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
      <mesh ref={meshRef} position={position}>
        <octahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={0.7}
          emissive={color}
          emissiveIntensity={0.15}
        />
      </mesh>
    </Float>
  );
}

// ── Connector Lines ───────────────────────────────────────────
function Connectors() {
  const ref = useRef<THREE.Group>(null);
  const nodes: [number, number, number][] = [
    [0, 2.2, 0],   // Courses
    [0, 1.1, 0],   // Lectures
    [0, 0, 0],     // Practice
    [0, -1.1, 0],  // Tests
    [0, -2.2, 0],  // Live
  ];

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.05;
  });

  const linePoints = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    linePoints.push(new THREE.Vector3(...nodes[i]));
    linePoints.push(new THREE.Vector3(...nodes[i + 1]));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(linePoints);

  return (
    <group ref={ref}>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color="#f5b942" transparent opacity={0.25} />
      </lineSegments>
    </group>
  );
}

// ── Central Shiva Mark ────────────────────────────────────────
function CentralMark() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock, pointer }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.15 + pointer.x * 0.3;
    groupRef.current.rotation.x = pointer.y * 0.2;
  });

  return (
    <group ref={groupRef}>
      {/* Core distort sphere */}
      <Sphere args={[0.8, 64, 64]}>
        <MeshDistortMaterial
          color="#f5b942"
          distort={0.25}
          speed={2}
          roughness={0.05}
          metalness={0.9}
          envMapIntensity={1}
        />
      </Sphere>

      {/* Orbiting torus ring */}
      <Torus args={[1.2, 0.04, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#8b5cf6" roughness={0.1} metalness={0.8} transparent opacity={0.6} />
      </Torus>

      {/* Second tilted ring */}
      <Torus args={[1.4, 0.025, 16, 100]} rotation={[Math.PI / 3, Math.PI / 6, 0]}>
        <meshStandardMaterial color="#a78bfa" roughness={0.1} metalness={0.8} transparent opacity={0.4} />
      </Torus>
    </group>
  );
}

// ── Particle Field ────────────────────────────────────────────
function ParticleField() {
  const count = 180;
  const ref = useRef<THREE.Points>(null);
  const positions = useRef(new Float32Array(count * 3));

  useEffect(() => {
    for (let i = 0; i < count; i++) {
      positions.current[i * 3]     = (Math.random() - 0.5) * 14;
      positions.current[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions.current[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.02;
    ref.current.rotation.x = clock.elapsedTime * 0.01;
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions.current, 3));

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#f5b942" size={0.04} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

// ── Full Scene ────────────────────────────────────────────────
function HeroScene() {
  const nodeData = [
    { position: [-2.8, 1.8, -1] as [number,number,number], color: '#8b5cf6', label: 'Courses', delay: 0 },
    { position: [2.8, 1.4, -1] as [number,number,number],  color: '#a78bfa', label: 'Lectures', delay: 0.2 },
    { position: [-3, -0.8, -0.5] as [number,number,number],color: '#f5b942', label: 'Practice', delay: 0.4 },
    { position: [3, -1, -0.5] as [number,number,number],   color: '#f5b942', label: 'Tests', delay: 0.6 },
    { position: [0, -2.6, -1] as [number,number,number],   color: '#6d28d9', label: 'Live', delay: 0.8 },
  ];

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#f5b942" />
      <pointLight position={[-5, -3, 3]} intensity={1} color="#8b5cf6" />
      <pointLight position={[0, -5, 2]} intensity={0.6} color="#a78bfa" />

      <CentralMark />
      <Connectors />
      <ParticleField />

      {nodeData.map((n) => (
        <EcosystemNode key={n.label} {...n} />
      ))}
    </>
  );
}

// ── Export ────────────────────────────────────────────────────
export default function MarketingWebGLHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced && containerRef.current) {
      containerRef.current.style.opacity = '0.3';
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 42 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
      >
        <HeroScene />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}
