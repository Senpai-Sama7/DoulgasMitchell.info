'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';
import { mediaManifest } from '@/lib/media-manifest';
import { cn } from '@/lib/utils';
import { useImmersive } from '@/components/immersive/immersive-context';
import { shouldEnableWebGL } from '@/lib/motion-tier';

const Canvas = dynamic(
  () => import('@react-three/fiber').then((mod) => mod.Canvas),
  { ssr: false }
);

const SignatureSceneInner = dynamic(
  () =>
    import('@/components/immersive/signature-scene-inner').then(
      (mod) => mod.SignatureSceneInner
    ),
  { ssr: false }
);

interface SignatureSceneProps {
  className?: string;
}

export function SignatureScene({ className }: SignatureSceneProps) {
  const { motionTier } = useImmersive();
  const enableWebGL = shouldEnableWebGL(motionTier);
  const [webglReady, setWebglReady] = useState(false);

  useEffect(() => {
    if (!enableWebGL) return;
    if (typeof globalThis.requestIdleCallback === 'function') {
      const idleId = globalThis.requestIdleCallback(() => setWebglReady(true));
      return () => globalThis.cancelIdleCallback(idleId);
    }
    const timeoutId = globalThis.setTimeout(() => setWebglReady(true), 150);
    return () => globalThis.clearTimeout(timeoutId);
  }, [enableWebGL]);

  if (!enableWebGL || !webglReady) {
    return (
      <div className={cn('relative', className)} aria-hidden>
        <Image
          src={mediaManifest.webgl.poster}
          alt=""
          fill
          priority
          className="object-cover opacity-80"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background" />
      </div>
    );
  }

  return (
    <div className={cn('relative', className)} aria-hidden>
      <Suspense
        fallback={
          <Image
            src={mediaManifest.webgl.poster}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        }
      >
        <Canvas
          camera={{ position: [0, 0, 4], fov: 50 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ width: '100%', height: '100%' }}
        >
          <SignatureSceneInner />
        </Canvas>
      </Suspense>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background/90" />
    </div>
  );
}
