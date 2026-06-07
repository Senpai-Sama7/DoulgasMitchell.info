'use client';

import { createContext, useContext } from 'react';
import type { MotionTier } from '@/lib/motion-tier';

interface ImmersiveContextValue {
  motionTier: MotionTier;
  lenisEnabled: boolean;
}

const ImmersiveContext = createContext<ImmersiveContextValue>({
  motionTier: 'low',
  lenisEnabled: false,
});

export function ImmersiveProvider({
  children,
  motionTier,
  lenisEnabled,
}: {
  children: React.ReactNode;
  motionTier: MotionTier;
  lenisEnabled: boolean;
}) {
  return (
    <ImmersiveContext.Provider value={{ motionTier, lenisEnabled }}>
      {children}
    </ImmersiveContext.Provider>
  );
}

export function useImmersive() {
  return useContext(ImmersiveContext);
}
