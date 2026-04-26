import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { ApiHandler } from '@/lib/api-response';
import { logActivity } from '@/lib/activity';
import { getAdminContentSnapshot } from '@/lib/content-service';
import {
  isInvalidJsonBodyError,
  readJsonBody,
  validateTrustedOrigin,
} from '@/lib/request';
import {
  contentTypeSchema,
  createContentEditorItem,
  deleteContentEditorItem,
  ensureEditableContentStorage,
  getContentEditorItem,
  updateContentEditorItem,
} from '@/lib/admin-content';

const patchSchema = z.object({
  type: contentTypeSchema,
  id: z.string().trim().min(1),
  fields: z.record(z.string(), z.union([z.string(), z.boolean()])),
});

const postSchema = z.object({
  type: contentTypeSchema,
  fields: z.record(z.string(), z.union([z.string(), z.boolean()])),
});

export async function GET(request: Request) {
  const session = await getSession();

  if (!session) {
    return ApiHandler.unauthorized();
  }

  try {
    const url = new URL(request.url);
    const typeParam = url.searchParams.get('type');
    const id = url.searchParams.get('id');

    if (!typeParam && !id) {
      const snapshot = await getAdminContentSnapshot();
      return ApiHandler.success({ ...snapshot });
    }

    const parsedType = contentTypeSchema.safeParse(typeParam);
    if (!parsedType.success || !id) {
      return ApiHandler.error('A valid content type and id are required.', 400);
    }

    if (!(await ensureEditableContentStorage(parsedType.data))) {
      return ApiHandler.error('Content storage is unavailable for editing.', 503);
    }

    const item = await getContentEditorItem(parsedType.data, id);
    if (!item) {
      return ApiHandler.notFound('Content item not found.');
    }

    return ApiHandler.success({ item });
  } catch (error) {
    return ApiHandler.internalServerError('Failed to fetch content data', error);
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();

  if (!session) {
    return ApiHandler.unauthorized();
  }

  const originCheck = validateTrustedOrigin(request);
  if (!originCheck.allowed) {
    return ApiHandler.forbidden(originCheck.reason);
  }

  try {
    const body = await readJsonBody(request);
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return ApiHandler.error('Invalid content update payload.', 400, parsed.error.flatten());
    }

    const item = await updateContentEditorItem({
      type: parsed.data.type,
      id: parsed.data.id,
      fields: parsed.data.fields,
    });

    await logActivity({
      action: 'update',
      resource: parsed.data.type,
      resourceId: parsed.data.id,
      userId: session.userId,
      details: {
        fields: Object.keys(parsed.data.fields),
      },
    });

    return ApiHandler.success({ item }, 'Content updated successfully.');
  } catch (error) {
    if (isInvalidJsonBodyError(error)) {
      return ApiHandler.error('Request body must be valid JSON.', 400);
    }

    return ApiHandler.internalServerError('Failed to update content item', error);
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return ApiHandler.unauthorized();

  const originCheck = validateTrustedOrigin(request);
  if (!originCheck.allowed) return ApiHandler.forbidden(originCheck.reason);

  try {
    const body = await readJsonBody(request);
    const parsed = postSchema.safeParse(body);

    if (!parsed.success) {
      return ApiHandler.error('Invalid content creation payload.', 400, parsed.error.flatten());
    }

    const item = await createContentEditorItem(parsed.data.type, parsed.data.fields);

    await logActivity({
      action: 'create',
      resource: parsed.data.type,
      resourceId: item?.id,
      userId: session.userId,
      details: { type: parsed.data.type },
    });

    return ApiHandler.success({ item }, 'Content created successfully.');
  } catch (error) {
    return ApiHandler.internalServerError('Failed to create content item', error);
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return ApiHandler.unauthorized();

  const originCheck = validateTrustedOrigin(request);
  if (!originCheck.allowed) return ApiHandler.forbidden(originCheck.reason);

  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get('type');
    const id = searchParams.get('id');

    if (!typeParam || !id) return ApiHandler.error('Type and ID are required.', 400);

    const parsedType = contentTypeSchema.safeParse(typeParam);
    if (!parsedType.success) return ApiHandler.error('Invalid content type.', 400);

    const success = await deleteContentEditorItem(parsedType.data, id);

    if (success) {
      await logActivity({
        action: 'delete',
        resource: parsedType.data,
        resourceId: id,
        userId: session.userId,
      });
      return ApiHandler.success(undefined, 'Content deleted successfully.');
    }

    return ApiHandler.error('Failed to delete content item.');
  } catch (error) {
    return ApiHandler.internalServerError('Failed to delete content item', error);
  }
}
