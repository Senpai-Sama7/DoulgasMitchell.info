# Enum Migration Plan: GalleryImage.series

## Overview
Migrate `GalleryImage.series` from `String` to Prisma Enum for type safety and data integrity.

## Current State
```prisma
model GalleryImage {
  // ...
  series String // 'recent-post' | 'tech-deck' | 'project'
  // ...
}
```

## Target State
```prisma
enum GallerySeries {
  RECENT_POST
  TECH_DECK
  PROJECT
}

model GalleryImage {
  // ...
  series GallerySeries
  // ...
}
```

## Migration Steps

### 1. Schema Update (prisma/schema.prisma)
```prisma
enum GallerySeries {
  RECENT_POST @map("recent-post")
  TECH_DECK   @map("tech-deck")
  PROJECT     @map("project")
}
```

### 2. Map Enum to String Values
The `@map` attribute ensures backward compatibility with existing database values:
- `RECENT_POST` ↔ "recent-post"
- `TECH_DECK` ↔ "tech-deck"  
- `PROJECT` ↔ "project"

### 3. Update Validation Schema (src/lib/validations.ts)
```typescript
// Current
export const gallerySeriesSchema = z.enum(['recent-post', 'tech-deck', 'project']);

// After migration - use Prisma enum
import { GallerySeries } from '@prisma/client';
export const gallerySeriesSchema = z.nativeEnum(GallerySeries);
```

### 4. Update Admin Components
Files needing updates:
- `src/app/admin/page.tsx` - Series filter buttons, form selects
- Any hardcoded series strings need conversion

### 5. Migration Command
```bash
# Generate migration
bun run db:generate

# Deploy (production)
bun run db:migrate

# Or for development
bun run db:push
```

## Breaking Changes
| Area | Impact | Mitigation |
|------|--------|------------|
| API requests | Low | Zod validation handles string→enum conversion |
| Admin UI | Low | Update form values to use enum keys |
| Database | None | @map preserves existing string values |
| TypeScript | Medium | Update types in components |

## Rollback Plan
If issues occur:
1. Revert schema changes
2. Run `bun run db:push` to restore String type
3. Data remains intact (strings never changed)

## Event.type Enum (Future)
```prisma
enum EventType {
  SIGNING
  READING
  CONFERENCE
  VIRTUAL
}
```
