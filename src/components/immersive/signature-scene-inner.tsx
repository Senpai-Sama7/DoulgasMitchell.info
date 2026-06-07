'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  sphereFragmentShader,
  sphereVertexShader,
} from '@/components/immersive/signature-scene-shaders';

function createParticlePositions(count: number) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 2.2 + Math.random() * 3;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  return positions;
}

const PARTICLE_POSITIONS = createParticlePositions(800);

function makeGlowTexture(color: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, color.replace('rgb', 'rgba').replace(')', ', 0.55)'));
  grad.addColorStop(0.35, color.replace('rgb', 'rgba').replace(')', ', 0.12)'));
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

function GlowSprite({ color, size }: { color: string; size: number }) {
  const map = useMemo(() => makeGlowTexture(color), [color]);

  useEffect(() => {
    return () => {
      map?.dispose();
    };
  }, [map]);

  if (!map) return null;
  return (
    <sprite position={[0, 0, -0.5]} scale={[size, size, 1]}>
      <spriteMaterial
        map={map}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </sprite>
  );
}

export function SignatureSceneInner() {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mouse = useRef(new THREE.Vector2(0, 0));
  const targetRotation = useRef(new THREE.Vector2(0, 0));
  const currentRotation = useRef(new THREE.Vector2(0, 0));
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColor1: { value: new THREE.Color('#7b2ff7') },
      uColor2: { value: new THREE.Color('#00d4ff') },
      uColor3: { value: new THREE.Color('#ff3cac') },
    }),
    []
  );

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = elapsed;
      materialRef.current.uniforms.uMouse.value.set(mouse.current.x, mouse.current.y);
    }

    targetRotation.current.x = mouse.current.y * 0.8;
    targetRotation.current.y = mouse.current.x * 0.8;
    currentRotation.current.x +=
      (targetRotation.current.x - currentRotation.current.x) * 0.05;
    currentRotation.current.y +=
      (targetRotation.current.y - currentRotation.current.y) * 0.05;

    if (groupRef.current) {
      groupRef.current.rotation.x = currentRotation.current.x;
      groupRef.current.rotation.y = elapsed * 0.3 + currentRotation.current.y;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.3} />
      <pointLight position={[2, 2, 2]} intensity={3} color="#9b59f7" />

      <group ref={groupRef}>
        <mesh>
          <sphereGeometry args={[1, 96, 96]} />
          <shaderMaterial
            ref={materialRef}
            uniforms={uniforms}
            vertexShader={sphereVertexShader}
            fragmentShader={sphereFragmentShader}
            transparent
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.02, 32, 32]} />
          <meshBasicMaterial
            color="#a78bfa"
            wireframe
            transparent
            opacity={0.04}
          />
        </mesh>
      </group>

      <GlowSprite color="rgb(123, 47, 247)" size={5} />
      <GlowSprite color="rgb(0, 212, 255)" size={4.5} />
      <GlowSprite color="rgb(255, 60, 172)" size={4} />

      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[PARTICLE_POSITIONS, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#c4b5fd"
          size={0.012}
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      <mesh
        onPointerMove={(event) => {
          mouse.current.x = (event.pointer.x * viewport.width) / viewport.width;
          mouse.current.y = event.pointer.y;
        }}
        visible={false}
      >
        <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}
