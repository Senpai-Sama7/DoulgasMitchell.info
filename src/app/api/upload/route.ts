import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
import {
  getClientIp,
  isInvalidJsonBodyError,
  readJsonBody,
  validateTrustedOrigin,
} from '@/lib/request';
import { rateLimit } from '@/lib/rate-limit';
import { formatFileSize, getFileCategory } from '@/lib/upload';
import { deleteStoredAsset, processFileUpload } from '@/lib/upload-server';
import { hasTable } from '@/lib/db-introspection';
import { logger } from '@/lib/logger';

// POST /api/upload - Upload files
export async function POST(request: NextRequest) {
  try {
    const originCheck = validateTrustedOrigin(request);
    if (!originCheck.allowed) {
      return NextResponse.json({ error: originCheck.reason }, { status: 403 });
    }

    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!(await hasTable('Media'))) {
      return NextResponse.json(
        { error: 'Media library is unavailable until the Media table is provisioned.' },
        { status: 503 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadLimit = await rateLimit(`${session.userId}:${await getClientIp(request)}`, {
      limit: 20,
      windowMs: 15 * 60 * 1000,
      prefix: 'upload',
    });

    if (!uploadLimit.allowed) {
      return NextResponse.json(
        { error: 'Upload rate limit exceeded. Please wait before trying again.' },
        { status: 429 }
      );
    }

    // Process each file
    const folder = formData.get('folder') as string | null;

    const results = await Promise.all(
      files.map(async (file) => {
        const uploadResult = await processFileUpload(file);

        if (!uploadResult.success) {
          return {
            success: false,
            originalName: file.name,
            error: uploadResult.error,
          };
        }

        // Save to database
        const media = await db.media.create({
          data: {
            id: uploadResult.id,
            filename: uploadResult.filename ?? 'untitled',
            originalName: uploadResult.originalName,
            mimeType: uploadResult.mimeType,
            category: getFileCategory(uploadResult.mimeType),
            size: uploadResult.size,
            width: uploadResult.width,
            height: uploadResult.height,
            duration: uploadResult.duration,
            url: uploadResult.url ?? '',
            thumbnailUrl: uploadResult.thumbnailUrl,
            colorPalette: uploadResult.colorPalette ? JSON.stringify(uploadResult.colorPalette) : undefined,
            folder: folder || undefined,
            uploadedById: session.userId,
          },
        });

        return {
          success: true,
          media: {
            id: media.id,
            filename: media.filename,
            originalName: media.originalName,
            url: media.url,
            thumbnailUrl: media.thumbnailUrl,
            category: media.category,
            size: formatFileSize(media.size),
            width: media.width,
            height: media.height,
          },
        };
      })
    );

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    if (successful.length > 0) {
      await logActivity({
        action: 'upload',
        resource: 'media',
        userId: session.userId,
        request,
        details: {
          uploaded: successful.length,
          failed: failed.length,
        },
      });
    }

    return NextResponse.json({
      success: true,
      uploaded: successful.length,
      failed: failed.length,
      results,
    });
  } catch (error) {
    logger.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}

// GET /api/upload - List media files
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!(await hasTable('Media'))) {
      return NextResponse.json({
        success: true,
        media: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
        featureAvailable: false,
      });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const folder = searchParams.get('folder');
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 100);
    const search = searchParams.get('search');
    const getFolders = searchParams.get('folders') === 'true';

    if (getFolders) {
      const folders = await db.media.findMany({
        select: { folder: true },
        distinct: ['folder'],
      });
      return NextResponse.json({
        success: true,
        folders: folders.map(f => f.folder).filter(Boolean),
      });
    }

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any  --  Prisma dynamic where clause
    const where: any = {};
    if (category) where.category = category;
    if (folder) where.folder = folder;
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await db.media.count({ where });

    // Get media files
    const includeUsageCounts = (await hasTable('ArticleMedia')) && (await hasTable('ProjectMedia'));
    const media = await db.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      ...(includeUsageCounts
        ? {
            include: {
              _count: {
                select: {
                  articleUsages: true,
                  projectUsages: true,
                },
              },
            },
          }
        : {}),
    });

    return NextResponse.json({
      success: true,
      media,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Media list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}

// DELETE /api/upload - Delete or Move media files
export async function DELETE(request: NextRequest) {
  try {
    const originCheck = validateTrustedOrigin(request);
    if (!originCheck.allowed) {
      return NextResponse.json({ error: originCheck.reason }, { status: 403 });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!(await hasTable('Media'))) {
      return NextResponse.json(
        { error: 'Media library is unavailable until the Media table is provisioned.' },
        { status: 503 }
      );
    }

    const body = await readJsonBody<{ ids?: string[]; action?: 'delete' | 'move'; folder?: string }>(request);
    const { ids, action = 'delete', folder } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'No media IDs provided' },
        { status: 400 }
      );
    }

    if (action === 'move') {
      const result = await db.media.updateMany({
        where: { id: { in: ids } },
        data: { folder: folder || undefined },
      });

      await logActivity({
        action: 'move',
        resource: 'media',
        userId: session.userId,
        request,
        details: {
          moved: result.count,
          folder: folder || 'root',
        },
      });

      return NextResponse.json({
        success: true,
        moved: result.count,
      });
    }

    const mediaItems = await db.media.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        url: true,
        thumbnailUrl: true,
      },
    });

    const result = await db.media.deleteMany({
      where: { id: { in: ids } },
    });

    await Promise.all(
      mediaItems.flatMap((item) => [
        deleteStoredAsset(item.url),
        deleteStoredAsset(item.thumbnailUrl),
      ])
    );

    await logActivity({
      action: 'delete',
      resource: 'media',
      userId: session.userId,
      request,
      details: {
        deleted: result.count,
      },
    });

    return NextResponse.json({
      success: true,
      deleted: result.count,
    });
  } catch (error) {
    if (isInvalidJsonBodyError(error)) {
      return NextResponse.json(
        { error: 'Request body must be valid JSON.' },
        { status: 400 }
      );
    }

    logger.error('Media delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}
