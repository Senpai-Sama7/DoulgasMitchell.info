import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { ApiHandler } from '@/lib/api-response';
import { logActivity } from '@/lib/activity';
import { validateTrustedOrigin } from '@/lib/request';
import {
  deletePasskeyRecordById,
  findPasskeyRecordById,
  getAdminPasskeysForUser,
} from '@/lib/admin-compat';

// GET /api/admin/passkeys - List the current user's registered passkeys
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return ApiHandler.unauthorized();
    }

    const passkeys = await getAdminPasskeysForUser(session.userId);

    return ApiHandler.success({
      passkeys: passkeys.map((passkey) => ({
        id: passkey.id,
        credentialId: passkey.credentialId,
        deviceName: passkey.deviceName,
        createdAt: passkey.createdAt.toISOString(),
        lastUsedAt: passkey.lastUsedAt ? passkey.lastUsedAt.toISOString() : null,
      })),
    });
  } catch (error) {
    return ApiHandler.internalServerError('Failed to list passkeys', error);
  }
}

// DELETE /api/admin/passkeys?id=... - Remove one of the current user's passkeys
export async function DELETE(request: NextRequest) {
  try {
    const originCheck = validateTrustedOrigin(request);
    if (!originCheck.allowed) {
      return ApiHandler.forbidden(originCheck.reason);
    }

    const session = await getSession();
    if (!session) {
      return ApiHandler.unauthorized();
    }

    const id = new URL(request.url).searchParams.get('id');
    if (!id) {
      return ApiHandler.error('A passkey id is required.', 400);
    }

    const passkey = await findPasskeyRecordById(id);

    // Ownership check — an admin can only remove their own credentials.
    if (!passkey || passkey.userId !== session.userId) {
      return ApiHandler.notFound('Passkey not found.');
    }

    const deleted = await deletePasskeyRecordById(id);
    if (!deleted) {
      return ApiHandler.error('Failed to remove the passkey.', 500);
    }

    await logActivity({
      action: 'delete',
      resource: 'passkey',
      resourceId: passkey.credentialId,
      userId: session.userId,
      request,
      details: {
        deviceName: passkey.deviceName,
      },
    });

    return ApiHandler.success(undefined, 'Passkey removed.');
  } catch (error) {
    return ApiHandler.internalServerError('Failed to delete passkey', error);
  }
}
