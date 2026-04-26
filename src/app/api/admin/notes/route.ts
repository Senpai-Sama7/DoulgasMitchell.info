import { db } from '@/lib/db';
import { ApiHandler } from '@/lib/api-response';
import { logActivity } from '@/lib/activity';
import { getSession } from '@/lib/auth';
import { validateTrustedOrigin } from '@/lib/request';
import { z } from 'zod';

const noteSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string(),
  category: z.string().optional(),
  tags: z.string().optional(),
  isDraft: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const slug = searchParams.get('slug');
  const all = searchParams.get('all') === 'true';

  try {
    if (id) {
      const note = await db.note.findUnique({ where: { id } });
      if (!note) return ApiHandler.error('Note not found', 404);
      return ApiHandler.success({ note: note as any });
    }
    if (slug) {
      const note = await db.note.findUnique({ where: { slug } });
      if (!note) return ApiHandler.error('Note not found', 404);
      return ApiHandler.success({ note: note as any });
    }

    const session = await getSession();
    const where = (!session || !all) ? { isPublic: true, isDraft: false } : {};
    
    const notes = await db.note.findMany({
      where,
      orderBy: { updatedAt: 'desc' }
    });
    
    return ApiHandler.success({ notes: notes as any });
  } catch (error) {
    return ApiHandler.error('Failed to fetch notes', 500);
  }
}

export async function POST(request: Request) {
  if (!validateTrustedOrigin(request).allowed) {
    return ApiHandler.error('Untrusted origin', 403);
  }

  const session = await getSession();
  if (!session) return ApiHandler.error('Unauthorized', 401);
  if (session.role !== 'admin') return ApiHandler.error('Forbidden', 403);

  try {
    const body = await request.json();
    const validated = noteSchema.parse(body);

    const note = await db.note.create({
      data: validated
    });

    await logActivity({
      action: 'CREATE',
      resource: 'Note',
      resourceId: note.id,
      userId: session.userId,
      details: { title: note.title }
    });

    return ApiHandler.success({ note: note as any }, undefined, 201);
  } catch (error) {
    if (error instanceof z.ZodError) return ApiHandler.error((error as any).errors[0].message, 400);
    return ApiHandler.error('Failed to create note', 500);
  }
}

export async function PATCH(request: Request) {
  if (!validateTrustedOrigin(request).allowed) {
    return ApiHandler.error('Untrusted origin', 403);
  }

  const session = await getSession();
  if (!session) return ApiHandler.error('Unauthorized', 401);
  if (session.role !== 'admin') return ApiHandler.error('Forbidden', 403);

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return ApiHandler.error('Missing ID', 400);

    const body = await request.json();
    const validated = noteSchema.partial().parse(body);

    const note = await db.note.update({
      where: { id },
      data: validated
    });

    await logActivity({
      action: 'UPDATE',
      resource: 'Note',
      resourceId: note.id,
      userId: session.userId,
      details: { title: note.title }
    });

    return ApiHandler.success({ note: note as any });
  } catch (error) {
    if (error instanceof z.ZodError) return ApiHandler.error((error as any).errors[0].message, 400);
    return ApiHandler.error('Failed to update note', 500);
  }
}

export async function DELETE(request: Request) {
  if (!validateTrustedOrigin(request).allowed) {
    return ApiHandler.error('Untrusted origin', 403);
  }

  const session = await getSession();
  if (!session) return ApiHandler.error('Unauthorized', 401);
  if (session.role !== 'admin') return ApiHandler.error('Forbidden', 403);

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return ApiHandler.error('Missing ID', 400);

    await db.note.delete({ where: { id } });

    await logActivity({
      action: 'DELETE',
      resource: 'Note',
      resourceId: id,
      userId: session.userId,
    });

    return ApiHandler.success({ deleted: true });
  } catch (error) {
    return ApiHandler.error('Failed to delete note', 500);
  }
}
