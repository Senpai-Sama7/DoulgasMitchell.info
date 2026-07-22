import { afterEach, describe, expect, it } from 'vitest';

describe('env build-time safety', () => {
  afterEach(() => {
    delete process.env.NEXT_PHASE;
    // Force module re-evaluation on next import by clearing cache.
    // Vitest keeps the module singleton; getEnv caches validatedEnv.
  });

  it('exports lazy env without throwing on import', async () => {
    const mod = await import('@/lib/env');
    expect(mod.env).toBeDefined();
    expect(typeof mod.getEnv).toBe('function');
  });

  it('features.passkeys resolves through the lazy proxy', async () => {
    const mod = await import('@/lib/env');
    expect(typeof mod.features.passkeys).toBe('boolean');
  });
});
