import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { ApiHandler } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { logActivity } from '@/lib/activity';
import {
  isInvalidJsonBodyError,
  readJsonBody,
  validateTrustedOrigin,
} from '@/lib/request';

const reorderSchema = z.object({
  type: z.enum(['article', 'project', 'certification']),
  items: z.array(z.object({
    id: z.string().trim().min(1),
    order: z.number().int().min(0),
  })).min(1),
});

export async function PATCH(request: Request) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return ApiHandler.unauthorized();
  }

  const originCheck = validateTrustedOrigin(request);
  if (!originCheck.allowed) {
    return ApiHandler.forbidden(originCheck.reason);
  }

  try {
    const payload = reorderSchema.safeParse(await readJsonBody(request));
    if (!payload.success) {
      return ApiHandler.error('Invalid content reorder payload.', 400, payload.error.flatten());
    }

    const { type, items } = payload.data;

    // Perform atomic updates in a transaction
    await db.$transaction(
      items.map((item) => {
        if (type === 'article') {
          return db.article.update({
            where: { id: item.id },
            data: { order: item.order },
          });
        } else if (type === 'project') {
          return db.project.update({
            where: { id: item.id },
            data: { order: item.order },
          });
        } else {
          return db.certification.update({
            where: { id: item.id },
            data: { order: item.order },
          });
        }
      })
    );

    await logActivity({
      action: 'reorder',
      resource: type,
      details: { message: `Reordered ${items.length} ${type}s` },
      userId: session.userId,
    });

    return ApiHandler.success({ message: `Successfully reordered ${type}s` });
  } catch (error) {
    if (isInvalidJsonBodyError(error)) {
      return ApiHandler.error('Request body must be valid JSON.', 400);
    }

    logger.error('Reorder error:', error);
    return ApiHandler.internalServerError('Failed to update content order', error);
  }
}
