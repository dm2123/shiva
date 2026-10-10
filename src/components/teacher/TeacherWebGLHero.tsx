'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

/** Teacher Productivity / Ecosystem WebGL Visualization */
function TeacherEcosystemGeometry() {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
  });

  return (
    <group ref={meshRef}>
      {/* Central Hub (Teacher focus) */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh position={[0, 0, 0]}>
          <octahedronGeometry args={[1.2, 0]} />
          <MeshDistortMaterial
            color="#0d9488" // Teacher teal
            distort={0.2}
            speed={2}
            roughness={0.1}
            metalness={0.8}
            wireframe={false}
          />
        </mesh>
      </Float>

      {/* Satellite Nodes (Courses/Lectures) */}
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <RoundedBox args={[0.4, 0.4, 0.4]} radius={0.05} position={[2, 1.5, 0]}>
          <meshStandardMaterial color="#10b981" roughness={0.3} metalness={0.5} />
        </RoundedBox>
      </Float>

      <Float speed={1.8} rotationIntensity={1} floatIntensity={1}>
        <mesh position={[-2, -1, 1]} scale={0.3}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#0ea5e9" roughness={0.3} metalness={0.5} />
        </mesh>
      </Float>
      
      <Float speed={2.5} rotationIntensity={1} floatIntensity={0.5}>
        <mesh position={[1, -1.8, -1.5]} scale={0.2}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.2} metalness={0.7} />
        </mesh>
      </Float>
    </group>
  );
}

export default function TeacherWebGLHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion && containerRef.current) {
      containerRef.current.style.display = 'none';
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full absolute inset-0 -z-10 opacity-70">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ccfbf1" />
        <pointLight position={[-10, -10, -5]} intensity={1} color="#0d9488" />

        <TeacherEcosystemGeometry />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
