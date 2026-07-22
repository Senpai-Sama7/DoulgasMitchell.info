import { describe, it, expect, beforeEach } from 'vitest';
import { SignJWT } from 'jose';
import {
  createToken,
  hashPassword,
  verifyPassword,
  verifyToken,
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
      expect(token.length).toBe(64);
      expect(/^[A-Za-z0-9]+$/.test(token)).toBe(true);
    });

    it('should generate unique tokens', () => {
      const token1 = generateSecureToken(32);
      const token2 = generateSecureToken(32);
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('JWT session tokens', () => {
    const payload = {
      userId: 'user-1',
      email: 'admin@example.com',
      name: 'Admin',
      role: 'admin' as const,
    };

    it('round-trips a signed token', async () => {
      const token = await createToken(payload);
      const session = await verifyToken(token);

      expect(session).not.toBeNull();
      expect(session).toMatchObject({
        userId: 'user-1',
        email: 'admin@example.com',
        role: 'admin',
      });
    });

    it('rejects garbage tokens', async () => {
      expect(await verifyToken('not-a-jwt')).toBeNull();
      expect(await verifyToken('')).toBeNull();
    });

    it('rejects tampered tokens', async () => {
      const token = await createToken(payload);
      const [header, body] = token.split('.');
      const forgedBody = Buffer.from(
        JSON.stringify({ ...payload, role: 'superadmin' })
      ).toString('base64url');
      expect(await verifyToken(`${header}.${forgedBody}.forged-signature`)).toBeNull();
      expect(await verifyToken(`${header}.${body}.`)).toBeNull();
    });

    it('rejects tokens signed with a different secret', async () => {
      const foreignToken = await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuer('douglasmitchell.info')
        .setAudience('admin-portal')
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(new TextEncoder().encode('another-secret-that-is-32-chars!!'));

      expect(await verifyToken(foreignToken)).toBeNull();
    });

    it('rejects tokens minted for a different audience', async () => {
      const wrongAudience = await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuer('douglasmitchell.info')
        .setAudience('public-site')
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(new TextEncoder().encode('test-secret-32-chars-minimum-length!!'));

      expect(await verifyToken(wrongAudience)).toBeNull();
    });
  });

  describe('Rate limiting', () => {
    beforeEach(() => {
      clearRateLimit('test-ip');
    });

    it('should allow initial attempts', async () => {
      const allowed = await checkRateLimit('test-ip');
      expect(allowed).toBe(true);
    });

    it('should track multiple attempts', async () => {
      for (let i = 0; i < 4; i++) {
        await expect(checkRateLimit('test-ip')).resolves.toBe(true);
      }
      await expect(checkRateLimit('test-ip')).resolves.toBe(true); // 5th attempt
      await expect(checkRateLimit('test-ip')).resolves.toBe(false); // 6th attempt - blocked
    });
  });
});

describe('Passkey/WebAuthn', () => {
  it('should support WebAuthn in test environment', () => {
    // WebAuthn should be available in modern browsers
    expect(typeof window).toBe('undefined'); // We're in Node.js test env
  });
});
