'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

export interface UseFilmPlaybackOptions {
  /** Fraction of the video that must be visible before auto-playing. */
  threshold?: number;
}

export interface FilmPlayback {
  /** Attach to the <video> element. */
  videoRef: RefObject<HTMLVideoElement | null>;
  /** True while the film is actually rendering frames. */
  isPlaying: boolean;
  /**
   * User-facing play/pause toggle. Calling this from a click/tap handler is
   * itself the user gesture iOS needs, so it always succeeds where the
   * automatic attempt was refused (Low Power Mode, Data Saver, etc.).
   */
  toggle: () => void;
}

/**
 * Reliable inline-video playback for the film planes (cinema chapter, hero
 * plate, entrance gate).
 *
 * Why this exists: React does not serialize the `muted` attribute into SSR
 * markup, and iOS only allows autoplay for videos that are muted + playsinline
 * *at the moment `play()` is called*. So the hook re-asserts both as DOM
 * properties and attributes, then drives playback from an
 * IntersectionObserver — play when the film is on screen, park it when it
 * scrolls away — with retries on `canplay` and tab visibility. When every
 * automatic attempt is refused the video simply stays paused and `isPlaying`
 * stays false, which is the signal for a visible play affordance.
 */
export function useFilmPlayback({ threshold = 0.2 }: UseFilmPlaybackOptions = {}): FilmPlayback {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const userPausedRef = useRef(false);
  const inViewRef = useRef(false);

  const attemptPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || userPausedRef.current) return;
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.play().catch(() => {
      /* Autoplay refused — the play affordance stays visible instead. */
    });
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlaying = () => setIsPlaying(true);
    const onHalt = () => setIsPlaying(false);
    video.addEventListener('play', onPlaying);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('pause', onHalt);
    video.addEventListener('ended', onHalt);

    const onCanPlay = () => {
      if (inViewRef.current) attemptPlay();
    };
    video.addEventListener('loadeddata', onCanPlay);
    video.addEventListener('canplay', onCanPlay);

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && inViewRef.current) attemptPlay();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry?.isIntersecting ?? false;
        if (inViewRef.current) {
          attemptPlay();
        } else if (!video.paused) {
          video.pause();
        }
      },
      { threshold }
    );
    observer.observe(video);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      video.removeEventListener('play', onPlaying);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('pause', onHalt);
      video.removeEventListener('ended', onHalt);
      video.removeEventListener('loadeddata', onCanPlay);
      video.removeEventListener('canplay', onCanPlay);
    };
  }, [attemptPlay, threshold]);

  const toggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPausedRef.current = false;
      attemptPlay();
    } else {
      userPausedRef.current = true;
      video.pause();
    }
  }, [attemptPlay]);

  return { videoRef, isPlaying, toggle };
}
