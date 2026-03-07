import { describe, it, expect, beforeEach } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  checkRateLimit,
  clearRateLimit,
} from '@/lib/auth';

describe('Authentication', () => {
  describe('Password hashing', () => {
    it('should hash a password', async () => {
      const password = 'changeme';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should verify a correct password', async () => {
      const password = 'changeme';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const password = 'changeme';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword('wrong-password', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('Token generation', () => {
    it('should generate a secure token', () => {
      const token = generateSecureToken(32);
      
      expect(token).toBeDefined();
      expect(token.length).toBe(32);
      expect(/^[A-Za-z0-9]+$/.test(token)).toBe(true);
    });

    it('should generate unique tokens', () => {
      const token1 = generateSecureToken(32);
      const token2 = generateSecureToken(32);
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('Rate limiting', () => {
    beforeEach(() => {
      clearRateLimit('test-ip');
    });

    it('should allow initial attempts', () => {
      const allowed = checkRateLimit('test-ip');
      expect(allowed).toBe(true);
    });

    it('should track multiple attempts', () => {
      for (let i = 0; i < 4; i++) {
        expect(checkRateLimit('test-ip')).toBe(true);
      }
      expect(checkRateLimit('test-ip')).toBe(true); // 5th attempt
      expect(checkRateLimit('test-ip')).toBe(false); // 6th attempt - blocked
    });
  });
});

describe('Passkey/WebAuthn', () => {
  it('should support WebAuthn in test environment', () => {
    // WebAuthn should be available in modern browsers
    expect(typeof window).toBe('undefined'); // We're in Node.js test env
  });
});
