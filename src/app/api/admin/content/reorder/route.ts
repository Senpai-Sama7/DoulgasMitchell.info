import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { ApiHandler } from '@/lib/api-response';
import { logActivity } from '@/lib/activity';

export async function PATCH(request: Request) {
  const session = await getSession();

  if (!session) {
    return ApiHandler.unauthorized();
  }

  try {
    const { type, items } = await request.json();

    if (!type || !Array.isArray(items)) {
      return ApiHandler.error('Missing type or items array', 400);
    }

    if (type !== 'article' && type !== 'project' && type !== 'certification') {
      return ApiHandler.error('Invalid content type', 400);
    }

    // Perform atomic updates in a transaction
    await db.$transaction(
      items.map((item: { id: string; order: number }) => {
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
    console.error('Reorder error:', error);
    return ApiHandler.internalServerError('Failed to update content order', error);
  }
}
