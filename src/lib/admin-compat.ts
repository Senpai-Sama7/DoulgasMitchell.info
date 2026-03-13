import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { getTableColumns, hasColumns, hasTable, qualifiedColumn, quoteIdentifier } from '@/lib/db-introspection';

export interface AdminUserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string | null;
  role: 'admin' | 'editor';
  isActive: boolean;
  username: string | null;
}

export interface AdminSessionRecord {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date | null;
  isActive: boolean;
}

export interface AdminPasskeyRecord {
  id: string;
  userId: string;
  credentialId: string;
  publicKey: Uint8Array;
  counter: number;
  deviceName: string | null;
  transports: string[];
  createdAt: Date;
  lastUsedAt: Date | null;
}

function normalizeRole(role?: string | null): 'admin' | 'editor' {
  return role === 'editor' ? 'editor' : 'admin';
}

function normalizeDisplayName(name?: string | null, username?: string | null, email?: string | null) {
  return name?.trim() || username?.trim() || email?.trim() || 'Admin';
}

function parseBoolean(value: unknown, fallback: boolean) {
  if (typeof value === 'boolean') return value;
  if (value === null || value === undefined) return fallback;
  return Boolean(value);
}

function parseDate(value: unknown) {
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return null;
}

function decodePublicKey(value: unknown) {
  if (value instanceof Uint8Array) {
    return value;
  }

  if (Buffer.isBuffer(value)) {
    return new Uint8Array(value);
  }

  if (typeof value !== 'string') {
    return new Uint8Array();
  }

  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');

  try {
    return new Uint8Array(Buffer.from(padded, 'base64'));
  } catch {
    return new Uint8Array();
  }
}

function parseTransports(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value !== 'string' || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string');
    }
  } catch {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

async function getAdminUserColumns() {
  return getTableColumns('AdminUser');
}

async function getSessionColumns() {
  return getTableColumns('Session');
}

async function getPasskeyColumns() {
  return getTableColumns('PasskeyCredential');
}

export async function countAdminUsers() {
  if (!(await hasTable('AdminUser'))) {
    return 0;
  }

  const rows = await db.$queryRawUnsafe<Array<{ count: bigint | number | string }>>(
    'SELECT COUNT(*)::bigint AS count FROM "AdminUser"'
  );

  return Number(rows[0]?.count ?? 0);
}

import bcrypt from 'bcryptjs';
import { env } from '@/lib/env';

export async function findAdminUserByEmail(email: string) {
  if (!(await hasTable('AdminUser'))) {
    if (env.ADMIN_PASSWORD && email.toLowerCase() === (env.ADMIN_EMAIL?.toLowerCase() || 'douglasmitchell@reliantai.org').toLowerCase()) {
      return {
        id: 'fallback-admin',
        email: env.ADMIN_EMAIL || 'DouglasMitchell@ReliantAI.org',
        name: 'Douglas Mitchell (Fallback)',
        passwordHash: await bcrypt.hash(env.ADMIN_PASSWORD, 10),
        role: 'admin',
        isActive: true,
        username: null,
      } as AdminUserRecord;
    }
    return null;
  }

  const columns = await getAdminUserColumns();
  const nameSelect = columns.has('name')
    ? `${qualifiedColumn('AdminUser', 'name')} AS name`
    : columns.has('username')
      ? `${qualifiedColumn('AdminUser', 'username')} AS name`
      : `${qualifiedColumn('AdminUser', 'email')} AS name`;
  const usernameSelect = columns.has('username')
    ? `${qualifiedColumn('AdminUser', 'username')} AS username`
    : 'NULL::text AS username';
  const roleSelect = columns.has('role')
    ? `${qualifiedColumn('AdminUser', 'role')} AS role`
    : `'admin'::text AS role`;
  const isActiveSelect = columns.has('isActive')
    ? `${qualifiedColumn('AdminUser', 'isActive')} AS "isActive"`
    : 'TRUE AS "isActive"';

  const rows = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
    `SELECT ${qualifiedColumn('AdminUser', 'id')} AS id,
            ${qualifiedColumn('AdminUser', 'email')} AS email,
            ${nameSelect},
            ${qualifiedColumn('AdminUser', 'passwordHash')} AS "passwordHash",
            ${roleSelect},
            ${isActiveSelect},
            ${usernameSelect}
     FROM "AdminUser"
     WHERE LOWER(${qualifiedColumn('AdminUser', 'email')}) = LOWER($1)
     LIMIT 1`,
    email
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    email: String(row.email),
    name: normalizeDisplayName(
      typeof row.name === 'string' ? row.name : null,
      typeof row.username === 'string' ? row.username : null,
      typeof row.email === 'string' ? row.email : null
    ),
    passwordHash: typeof row.passwordHash === 'string' ? row.passwordHash : null,
    role: normalizeRole(typeof row.role === 'string' ? row.role : null),
    isActive: parseBoolean(row.isActive, true),
    username: typeof row.username === 'string' ? row.username : null,
  } satisfies AdminUserRecord;
}

export async function findAdminUserById(id: string) {
  if (!(await hasTable('AdminUser'))) {
    return null;
  }

  const columns = await getAdminUserColumns();
  const nameSelect = columns.has('name')
    ? `${qualifiedColumn('AdminUser', 'name')} AS name`
    : columns.has('username')
      ? `${qualifiedColumn('AdminUser', 'username')} AS name`
      : `${qualifiedColumn('AdminUser', 'email')} AS name`;
  const usernameSelect = columns.has('username')
    ? `${qualifiedColumn('AdminUser', 'username')} AS username`
    : 'NULL::text AS username';
  const roleSelect = columns.has('role')
    ? `${qualifiedColumn('AdminUser', 'role')} AS role`
    : `'admin'::text AS role`;
  const isActiveSelect = columns.has('isActive')
    ? `${qualifiedColumn('AdminUser', 'isActive')} AS "isActive"`
    : 'TRUE AS "isActive"';

  const rows = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
    `SELECT ${qualifiedColumn('AdminUser', 'id')} AS id,
            ${qualifiedColumn('AdminUser', 'email')} AS email,
            ${nameSelect},
            ${qualifiedColumn('AdminUser', 'passwordHash')} AS "passwordHash",
            ${roleSelect},
            ${isActiveSelect},
            ${usernameSelect}
     FROM "AdminUser"
     WHERE ${qualifiedColumn('AdminUser', 'id')} = $1
     LIMIT 1`,
    id
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    email: String(row.email),
    name: normalizeDisplayName(
      typeof row.name === 'string' ? row.name : null,
      typeof row.username === 'string' ? row.username : null,
      typeof row.email === 'string' ? row.email : null
    ),
    passwordHash: typeof row.passwordHash === 'string' ? row.passwordHash : null,
    role: normalizeRole(typeof row.role === 'string' ? row.role : null),
    isActive: parseBoolean(row.isActive, true),
    username: typeof row.username === 'string' ? row.username : null,
  } satisfies AdminUserRecord;
}

export async function createAdminUser(input: { email: string; passwordHash: string; name?: string | null }) {
  const columns = await getAdminUserColumns();
  const now = new Date();
  const insertColumns = ['id', 'email', 'passwordHash'];
  const values: unknown[] = [randomUUID(), input.email, input.passwordHash];

  if (columns.has('name')) {
    insertColumns.push('name');
    values.push(input.name?.trim() || input.email);
  }

  if (columns.has('username')) {
    insertColumns.push('username');
    values.push(input.email.split('@')[0] || 'admin');
  }

  if (columns.has('role')) {
    insertColumns.push('role');
    values.push('admin');
  }

  if (columns.has('isActive')) {
    insertColumns.push('isActive');
    values.push(true);
  }

  if (columns.has('createdAt')) {
    insertColumns.push('createdAt');
    values.push(now);
  }

  if (columns.has('updatedAt')) {
    insertColumns.push('updatedAt');
    values.push(now);
  }

  const placeholders = insertColumns.map((_, index) => `$${index + 1}`).join(', ');
  const columnList = insertColumns.map(quoteIdentifier).join(', ');

  await db.$executeRawUnsafe(
    `INSERT INTO "AdminUser" (${columnList}) VALUES (${placeholders})`,
    ...values
  );

  return findAdminUserByEmail(input.email);
}

export async function updateAdminLastLogin(userId: string) {
  const columns = await getAdminUserColumns();
  if (!columns.has('lastLoginAt')) {
    return;
  }

  await db.$executeRawUnsafe(
    `UPDATE "AdminUser"
     SET ${quoteIdentifier('lastLoginAt')} = $2
     WHERE ${quoteIdentifier('id')} = $1`,
    userId,
    new Date()
  );
}

export async function createAdminSessionRecord(input: {
  token: string;
  userId: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}) {
  const columns = await getSessionColumns();
  const now = new Date();
  const userIdColumn = columns.has('userId') ? 'userId' : 'adminUserId';
  const insertColumns = ['id', 'token', userIdColumn, 'expiresAt'];
  const values: unknown[] = [randomUUID(), input.token, input.userId, input.expiresAt];

  if (columns.has('ipAddress')) {
    insertColumns.push('ipAddress');
    values.push(input.ipAddress || null);
  }

  if (columns.has('userAgent')) {
    insertColumns.push('userAgent');
    values.push(input.userAgent || null);
  }

  if (columns.has('createdAt')) {
    insertColumns.push('createdAt');
    values.push(now);
  }

  const placeholders = insertColumns.map((_, index) => `$${index + 1}`).join(', ');
  const columnList = insertColumns.map(quoteIdentifier).join(', ');

  await db.$executeRawUnsafe(
    `INSERT INTO "Session" (${columnList}) VALUES (${placeholders})`,
    ...values
  );
}

export async function findAdminSessionByToken(token: string) {
  if (!(await hasColumns('Session', ['token', 'expiresAt'])) || !(await hasColumns('AdminUser', ['id', 'email']))) {
    return null;
  }

  const sessionColumns = await getSessionColumns();
  const adminColumns = await getAdminUserColumns();
  const sessionUserIdColumn = sessionColumns.has('userId') ? 'userId' : 'adminUserId';
  const nameSelect = adminColumns.has('name')
    ? `${qualifiedColumn('AdminUser', 'name')} AS name`
    : adminColumns.has('username')
      ? `${qualifiedColumn('AdminUser', 'username')} AS name`
      : `${qualifiedColumn('AdminUser', 'email')} AS name`;
  const roleSelect = adminColumns.has('role')
    ? `${qualifiedColumn('AdminUser', 'role')} AS role`
    : `'admin'::text AS role`;
  const isActiveSelect = adminColumns.has('isActive')
    ? `${qualifiedColumn('AdminUser', 'isActive')} AS "isActive"`
    : 'TRUE AS "isActive"';
  const userAgentSelect = sessionColumns.has('userAgent')
    ? `${qualifiedColumn('Session', 'userAgent')} AS "userAgent"`
    : 'NULL::text AS "userAgent"';
  const ipAddressSelect = sessionColumns.has('ipAddress')
    ? `${qualifiedColumn('Session', 'ipAddress')} AS "ipAddress"`
    : 'NULL::text AS "ipAddress"';
  const createdAtSelect = sessionColumns.has('createdAt')
    ? `${qualifiedColumn('Session', 'createdAt')} AS "createdAt"`
    : 'NULL::timestamp AS "createdAt"';

  const rows = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
    `SELECT ${qualifiedColumn('Session', 'id')} AS id,
            ${qualifiedColumn('Session', sessionUserIdColumn)} AS "userId",
            ${qualifiedColumn('Session', 'expiresAt')} AS "expiresAt",
            ${ipAddressSelect},
            ${userAgentSelect},
            ${createdAtSelect},
            ${qualifiedColumn('AdminUser', 'email')} AS email,
            ${nameSelect},
            ${roleSelect},
            ${isActiveSelect}
     FROM "Session"
     INNER JOIN "AdminUser"
       ON ${qualifiedColumn('Session', sessionUserIdColumn)} = ${qualifiedColumn('AdminUser', 'id')}
     WHERE ${qualifiedColumn('Session', 'token')} = $1
     LIMIT 1`,
    token
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    userId: String(row.userId),
    email: String(row.email),
    name: normalizeDisplayName(
      typeof row.name === 'string' ? row.name : null,
      null,
      typeof row.email === 'string' ? row.email : null
    ),
    role: normalizeRole(typeof row.role === 'string' ? row.role : null),
    expiresAt: parseDate(row.expiresAt) ?? new Date(0),
    ipAddress: typeof row.ipAddress === 'string' ? row.ipAddress : null,
    userAgent: typeof row.userAgent === 'string' ? row.userAgent : null,
    createdAt: parseDate(row.createdAt),
    isActive: parseBoolean(row.isActive, true),
  } satisfies AdminSessionRecord;
}

export async function deleteAdminSessionByToken(token: string) {
  if (!(await hasColumns('Session', ['token']))) {
    return;
  }

  await db.$executeRawUnsafe(
    `DELETE FROM "Session" WHERE ${quoteIdentifier('token')} = $1`,
    token
  );
}

export async function getAdminSecuritySummary() {
  if (!(await hasTable('AdminUser')) || !(await hasTable('Session')) || !(await hasTable('PasskeyCredential'))) {
    return null;
  }

  const sessionColumns = await getSessionColumns();
  const adminColumns = await getAdminUserColumns();
  const sessionUserIdColumn = sessionColumns.has('userId') ? 'userId' : 'adminUserId';
  const activeAdminsWhere = adminColumns.has('isActive') ? 'WHERE "isActive" = TRUE' : '';
  const nameSelect = adminColumns.has('name')
    ? `${qualifiedColumn('AdminUser', 'name')} AS name`
    : adminColumns.has('username')
      ? `${qualifiedColumn('AdminUser', 'username')} AS name`
      : `${qualifiedColumn('AdminUser', 'email')} AS name`;
  const createdAtSelect = sessionColumns.has('createdAt')
    ? `${qualifiedColumn('Session', 'createdAt')} AS "createdAt"`
    : `${qualifiedColumn('Session', 'expiresAt')} AS "createdAt"`;
  const ipAddressSelect = sessionColumns.has('ipAddress')
    ? `${qualifiedColumn('Session', 'ipAddress')} AS "ipAddress"`
    : 'NULL::text AS "ipAddress"';
  const userAgentSelect = sessionColumns.has('userAgent')
    ? `${qualifiedColumn('Session', 'userAgent')} AS "userAgent"`
    : 'NULL::text AS "userAgent"';

  const [activeSessionsRows, passkeysRows, adminUsersRows, recentSessionRows] = await Promise.all([
    db.$queryRawUnsafe<Array<{ count: bigint | number | string }>>(
      `SELECT COUNT(*)::bigint AS count
       FROM "Session"
       WHERE ${quoteIdentifier('expiresAt')} > NOW()`
    ),
    db.$queryRawUnsafe<Array<{ count: bigint | number | string }>>(
      `SELECT COUNT(*)::bigint AS count FROM "PasskeyCredential"`
    ),
    db.$queryRawUnsafe<Array<{ count: bigint | number | string }>>(
      `SELECT COUNT(*)::bigint AS count FROM "AdminUser" ${activeAdminsWhere}`
    ),
    db.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT ${qualifiedColumn('Session', 'id')} AS id,
              ${qualifiedColumn('AdminUser', 'email')} AS email,
              ${nameSelect},
              ${createdAtSelect},
              ${ipAddressSelect},
              ${userAgentSelect}
       FROM "Session"
       INNER JOIN "AdminUser"
         ON ${qualifiedColumn('Session', sessionUserIdColumn)} = ${qualifiedColumn('AdminUser', 'id')}
       WHERE ${qualifiedColumn('Session', 'expiresAt')} > NOW()
       ORDER BY ${createdAtSelect.split(' AS ')[0]} DESC
       LIMIT 6`
    ),
  ]);

  return {
    activeSessions: Number(activeSessionsRows[0]?.count ?? 0),
    passkeysRegistered: Number(passkeysRows[0]?.count ?? 0),
    adminUsers: Number(adminUsersRows[0]?.count ?? 0),
    recentSessions: recentSessionRows.map((row) => ({
      id: String(row.id),
      email: String(row.email),
      name: normalizeDisplayName(typeof row.name === 'string' ? row.name : null, null, String(row.email)),
      createdAt: parseDate(row.createdAt) ?? new Date(0),
      ipAddress: typeof row.ipAddress === 'string' ? row.ipAddress : 'unknown',
      userAgent: typeof row.userAgent === 'string' ? row.userAgent : 'unknown',
    })),
  };
}

export async function getAdminPasskeysForUser(userId: string) {
  if (!(await hasTable('PasskeyCredential'))) {
    return [];
  }

  const columns = await getPasskeyColumns();
  const userIdColumn = columns.has('userId') ? 'userId' : 'adminUserId';
  const credentialIdColumn = columns.has('credentialId') ? 'credentialId' : 'credentialID';
  const deviceNameSelect = columns.has('deviceName')
    ? `${qualifiedColumn('PasskeyCredential', 'deviceName')} AS "deviceName"`
    : 'NULL::text AS "deviceName"';
  const lastUsedAtSelect = columns.has('lastUsedAt')
    ? `${qualifiedColumn('PasskeyCredential', 'lastUsedAt')} AS "lastUsedAt"`
    : 'NULL::timestamp AS "lastUsedAt"';
  const transportsSelect = columns.has('transports')
    ? `${qualifiedColumn('PasskeyCredential', 'transports')} AS transports`
    : 'NULL::text AS transports';

  const rows = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
    `SELECT ${qualifiedColumn('PasskeyCredential', 'id')} AS id,
            ${qualifiedColumn('PasskeyCredential', userIdColumn)} AS "userId",
            ${qualifiedColumn('PasskeyCredential', credentialIdColumn)} AS "credentialId",
            ${qualifiedColumn('PasskeyCredential', 'publicKey')} AS "publicKey",
            ${qualifiedColumn('PasskeyCredential', 'counter')} AS counter,
            ${deviceNameSelect},
            ${transportsSelect},
            ${qualifiedColumn('PasskeyCredential', 'createdAt')} AS "createdAt",
            ${lastUsedAtSelect}
     FROM "PasskeyCredential"
     WHERE ${qualifiedColumn('PasskeyCredential', userIdColumn)} = $1
     ORDER BY ${qualifiedColumn('PasskeyCredential', 'createdAt')} DESC`,
    userId
  );

  return rows.map((row) => ({
    id: String(row.id),
    userId: String(row.userId),
    credentialId: String(row.credentialId),
    publicKey: decodePublicKey(row.publicKey),
    counter: Number(row.counter ?? 0),
    deviceName: typeof row.deviceName === 'string' ? row.deviceName : null,
    transports: parseTransports(row.transports),
    createdAt: parseDate(row.createdAt) ?? new Date(),
    lastUsedAt: parseDate(row.lastUsedAt),
  })) satisfies AdminPasskeyRecord[];
}

export async function updatePasskeyCounter(input: { id: string; counter: number }) {
  const columns = await getPasskeyColumns();
  if (!columns.has('counter')) {
    return;
  }

  const updates = [`${quoteIdentifier('counter')} = $2`];
  const values: unknown[] = [input.id, input.counter];

  if (columns.has('lastUsedAt')) {
    updates.push(`${quoteIdentifier('lastUsedAt')} = $3`);
    values.push(new Date());
  }

  await db.$executeRawUnsafe(
    `UPDATE "PasskeyCredential"
     SET ${updates.join(', ')}
     WHERE ${quoteIdentifier('id')} = $1`,
    ...values
  );
}

export async function createPasskeyRecord(input: {
  userId: string;
  credentialId: string;
  publicKey: Uint8Array;
  counter: number;
  deviceName?: string;
}) {
  const columns = await getPasskeyColumns();
  const now = new Date();
  const userIdColumn = columns.has('userId') ? 'userId' : 'adminUserId';
  const credentialIdColumn = columns.has('credentialId') ? 'credentialId' : 'credentialID';
  const insertColumns = ['id', userIdColumn, credentialIdColumn, 'publicKey', 'counter'];
  const publicKeyValue = Buffer.from(input.publicKey).toString('base64url');
  const values: unknown[] = [randomUUID(), input.userId, input.credentialId, publicKeyValue, input.counter];

  if (columns.has('deviceName')) {
    insertColumns.push('deviceName');
    values.push(input.deviceName || 'New Device');
  }

  if (columns.has('transports')) {
    insertColumns.push('transports');
    values.push('[]');
  }

  if (columns.has('deviceType')) {
    insertColumns.push('deviceType');
    values.push('platform');
  }

  if (columns.has('backedUp')) {
    insertColumns.push('backedUp');
    values.push(false);
  }

  if (columns.has('createdAt')) {
    insertColumns.push('createdAt');
    values.push(now);
  }

  if (columns.has('updatedAt')) {
    insertColumns.push('updatedAt');
    values.push(now);
  }

  const placeholders = insertColumns.map((_, index) => `$${index + 1}`).join(', ');
  const columnList = insertColumns.map(quoteIdentifier).join(', ');

  await db.$executeRawUnsafe(
    `INSERT INTO "PasskeyCredential" (${columnList}) VALUES (${placeholders})`,
    ...values
  );
}
