import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withMiddleware, successResponse, ValidationError, AuthenticationError } from '@/lib/middleware';
import { validateSession } from '@/lib/security';
import { z } from 'zod';

const layoutBlockSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['hero', 'gallery', 'journal', 'custom']),
  gridX: z.number().int().min(0).default(0),
  gridY: z.number().int().min(0).default(0),
  width: z.number().int().min(1).max(12).default(4),
  height: z.number().int().min(1).max(6).default(2),
  metadata: z.record(z.string(), z.any()).optional(),
});

const layoutSchema = z.object({
  blocks: z.array(layoutBlockSchema),
});

async function requireAdmin(request: NextRequest) {
  const cookieStore = await import('next/headers').then((m) => m.cookies());
  const token = (await cookieStore).get('admin-session')?.value;
  if (!token) {
    throw new AuthenticationError('Authentication required');
  }

  const session = await validateSession(token);
  if (!session.valid || !session.userId) {
    throw new AuthenticationError('Authentication required');
  }

  return session.userId;
}

export const GET = withMiddleware(async () => {
  const blocks = await db.layoutBlock.findMany({
    orderBy: { gridY: 'asc' },
  });

  return successResponse(blocks);
});

export const POST = withMiddleware(async (request: NextRequest) => {
  await requireAdmin(request);

  let data: z.infer<typeof layoutSchema>;
  try {
    data = layoutSchema.parse(await request.json());
  } catch (error) {
    throw new ValidationError('Invalid layout payload');
  }

  const operations = data.blocks.map((block, index) => {
    return db.layoutBlock.upsert({
      where: { key: block.key },
      update: {
        label: block.label,
        type: block.type,
        gridX: block.gridX,
        gridY: block.gridY,
        width: block.width,
        height: block.height,
        metadata: block.metadata,
      },
      create: {
        key: block.key,
        label: block.label,
        type: block.type,
        gridX: block.gridX,
        gridY: block.gridY,
        width: block.width,
        height: block.height,
        metadata: block.metadata,
      },
    });
  });

  await Promise.all(operations);

  const blocks = await db.layoutBlock.findMany({
    orderBy: { gridY: 'asc' },
  });

  return successResponse(blocks, 'Layout saved');
});
