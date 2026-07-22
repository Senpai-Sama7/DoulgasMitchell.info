/**
 * Hero → SignatureScene scroll bridge.
 *
 * The Arrival pin publishes its scrub progress as a window event so the WebGL
 * scene (dynamically imported, lives in its own bundle) can respond without
 * coupling the chunks or threading React context through the r3f tree. When
 * pinning is disabled (reduced motion, touch, low tier) no events fire and the
 * scene simply rests at progress 0.
 */
export const HERO_SCENE_PROGRESS_EVENT = 'immersive:hero-scene-progress';

export interface HeroSceneProgressDetail {
  /** Pin scrub progress, 0 (resting composition) → 1 (handoff to Identity). */
  progress: number;
}

export function emitHeroSceneProgress(progress: number): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<HeroSceneProgressDetail>(HERO_SCENE_PROGRESS_EVENT, {
      detail: { progress },
    })
  );
}
