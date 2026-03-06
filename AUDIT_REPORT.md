# Code Audit Report - Douglas Mitchell Website

**Date:** March 6, 2026  
**Auditor:** Blackbox Code  
**Project:** douglasmitchell.info - Personal Portfolio Website

---

## Executive Summary

This audit covers the entire codebase for the Douglas Mitchell personal website. The site is a Next.js 16 application with React 19, TypeScript, PostgreSQL (Prisma ORM), and a comprehensive admin portal. Overall, the codebase is well-structured with good security practices, but there are several areas that need attention.

### Key Findings Summary

| Category | Status | Issues Found |
|----------|--------|--------------|
| Security | ✅ Good | Minor improvements needed |
| Public Submissions | ✅ Correct | Only intended features exist |
| Performance | ⚠️ Needs Attention | Several optimizations possible |
| Code Quality | ✅ Good | Some unused code found |
| Accessibility | ⚠️ Needs Attention | Minor improvements needed |

---

## 1. Public Submission Features Analysis

### ✅ Confirmed: Only Intended Submission Features Exist

The following public-facing submission features were found and are **intentional**:

#### 1.1 Contact Form (`/contact`)
- **Status:** ✅ Intentional - Professional contact feature
- **Location:** `src/app/contact/page.tsx` → `POST /api/contact`
- **Security:** Rate limiting, input validation (Zod), CSRF protection
- **Data Storage:** `ContactMessage` model in database

#### 1.2 Newsletter Signup
- **Status:** ✅ Intentional - Professional newsletter feature
- **Location:** `src/components/newsletter-signup.tsx` → `POST /api/newsletter`
- **Security:** Rate limiting, email validation, duplicate prevention
- **Data Storage:** `Newsletter` model in database

#### 1.3 Reactions (Journal/Gallery)
- **Status:** ✅ Intentional - Engagement feature
- **Location:** `src/components/reactions.tsx`
- **Storage:** Client-side only (Zustand with localStorage persistence)
- **Note:** Reactions are randomly initialized and stored locally - no server persistence

### ❌ No Unintended Submission Features Found

The following were checked and confirmed **not present**:
- No public blog post creation
- No public gallery uploads
- No public journal entries
- No public comment system
- No public user registration
- No public profile editing

---

## 2. Security Audit

### 2.1 Authentication System ✅ Well Implemented

**File:** `src/lib/security.ts`, `src/app/api/admin/auth/route.ts`

| Feature | Status | Notes |
|---------|--------|-------|
| Password Hashing | ✅ | bcrypt with 12 rounds |
| JWT Tokens | ✅ | HS256 with configurable expiration |
| Session Management | ✅ | Database-backed sessions with expiration |
| Rate Limiting | ✅ | 5 requests per 60 seconds per IP |
| Login Attempt Tracking | ✅ | Failed attempts logged in database |
| CSRF Protection | ✅ | Origin/Referer validation for mutations |
| httpOnly Cookies | ✅ | Secure, SameSite=strict |

**Potential Improvements:**
1. **Rate Limiting Storage:** Currently in-memory Map - should use Redis for production
2. **Session Cleanup:** No automatic cleanup of expired sessions (only manual via `cleanupExpiredSessions()`)

### 2.2 API Security ✅ Good

**File:** `src/lib/middleware.ts`

| Feature | Status | Notes |
|---------|--------|-------|
| CORS Headers | ✅ | Configured for allowed origins |
| Request Logging | ✅ | All requests logged to database |
| Input Validation | ✅ | Zod schemas for all inputs |
| Error Handling | ✅ | Custom error classes with proper status codes |
| Admin Routes | ✅ | All mutation routes require authentication |

### 2.3 File Upload Security ✅ Good

**File:** `src/app/api/upload/route.ts`

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication Required | ✅ | Admin-only |
| File Type Validation | ✅ | Only image types allowed |
| File Size Limit | ✅ | 10MB max |
| Path Traversal Protection | ✅ | Validates upload path |
| Filename Sanitization | ✅ | Removes special characters |

### 2.4 Security Recommendations

1. **Add Content Security Policy (CSP) headers** - Currently missing
2. **Add X-Frame-Options header** - Prevents clickjacking
3. **Add X-Content-Type-Options: nosniff** - Prevents MIME sniffing
4. **Consider adding HSTS header** - Enforce HTTPS in production
5. **Implement Redis for rate limiting** - In-memory doesn't scale horizontally

---

## 3. Code Quality Issues

### 3.1 Unused Code / Dead Code

#### Contact Store (Never Used)
**File:** `src/lib/store.ts` (lines 120-140)

```typescript
// Contact Form Store - This store is defined but never used anywhere
interface ContactDraft {
  id: string;
  name: string;
  email: string;
  notes: string;
  createdAt: string;
}
```

**Recommendation:** Remove unused `useContactStore` or implement if planned.

#### Admin Content Store (Never Used)
**File:** `src/lib/store.ts` (lines 143-180)

```typescript
// Admin Store - Defined but never used
interface ContentItem {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'pdf' | 'zip' | 'code';
  // ...
}
```

**Recommendation:** Remove unused `useAdminStore` or implement if planned.

### 3.2 Reactions Implementation Issue

**File:** `src/lib/store.ts` (lines 70-115)

The reactions feature uses **fake random data** instead of real user engagement:

```typescript
initializeReactions: (itemId) => {
  const state = get();
  if (!state.reactions[itemId]) {
    set((state) => ({
      reactions: {
        ...state.reactions,
        [itemId]: {
          like: Math.floor(Math.random() * 20) + 5,  // Random!
          love: Math.floor(Math.random() * 15) + 3,  // Random!
          // ...
        },
      },
    }));
  }
}
```

**Issue:** Every page load generates different random reaction counts. This is misleading to users.

**Recommendation:** Either:
1. Remove the fake counts entirely (show 0 initially)
2. Implement server-side storage for real reaction counts
3. Use consistent seeded random values based on item ID

### 3.3 Static Data Fallback Pattern

**Files:** `src/lib/data.ts`, `src/app/page.tsx`, `src/app/galleries/page.tsx`, `src/app/journal/page.tsx`

The application has extensive static fallback data in `src/lib/data.ts` that's used when the database is empty. This is good for development but could cause confusion in production.

**Recommendation:** Add environment variable to disable static fallbacks in production.

---

## 4. Performance Issues

### 4.1 Database Query Optimization

**File:** `src/lib/data.ts`

The `getGalleryImages()` and `getJournalEntries()` functions catch errors and return static data:

```typescript
export async function getGalleryImages(filters?: {...}): Promise<...> {
  try {
    // ... database query
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    // Returns static data on error - could hide production issues
    return { items: galleryImages, total: galleryImages.length };
  }
}
```

**Issue:** Database errors are silently swallowed, returning static data. This could mask serious production issues.

**Recommendation:** 
- Log errors to external monitoring service
- Consider throwing in production to surface issues
- Add health check endpoint

### 4.2 Missing Database Indexes

**File:** `prisma/schema.prisma`

Some indexes are defined but consider adding:

```prisma
// Current indexes are good, but consider adding:
model GalleryImage {
  // Add composite index for common queries
  @@index([series, date])  // For series + date filtering
  @@index([order])        // For ordering
}

model JournalEntry {
  // Add composite index
  @@index([date, order])  // For date ordering
}
```

### 4.3 Client-Side Data Fetching

**Files:** `src/app/page.tsx`, `src/app/galleries/page.tsx`, `src/app/journal/page.tsx`

All pages fetch data client-side with `useEffect`:

```typescript
useEffect(() => {
  const loadGallery = async () => {
    const response = await fetch("/api/gallery?limit=200&sortBy=date&sortOrder=desc", {
      cache: "no-store",
    });
    // ...
  };
  loadGallery();
}, []);
```

**Issues:**
1. `cache: "no-store"` disables all caching - inefficient
2. No loading skeleton during initial render
3. Waterfall requests (page loads, then data fetches)

**Recommendation:** Use Next.js Server Components or `generateMetadata`/`generateStaticParams` for SSR.

### 4.4 Large Admin Page Component

**File:** `src/app/admin/page.tsx`

The admin page is **2,984 lines** in a single file. This is difficult to maintain.

**Recommendation:** Split into separate components:
- `AdminGallery.tsx`
- `AdminJournal.tsx`
- `AdminSettings.tsx`
- `AdminActivity.tsx`
- `AdminAuth.tsx`

---

## 5. Accessibility Issues

### 5.1 Missing ARIA Labels

**File:** `src/app/page.tsx`

Some interactive elements lack proper ARIA labels:

```typescript
// Missing aria-label
<div
  className="absolute inset-0..."
  onClick={onToggle}
  onKeyDown={handleToggleKeyDown}
  role="button"
  tabIndex={0}
  // Missing: aria-expanded={isExpanded}
  // Missing: aria-controls={expandedContentId}
>
```

### 5.2 Color Contrast

The design uses cream/white on dark backgrounds which may have contrast issues. Consider testing with WCAG 2.1 AA standards.

### 5.3 Focus Indicators

Focus styles are defined in `globals.css` but some custom components may override them.

---

## 6. Data Flow Analysis

### 6.1 Public Data Flow (Correct)

```
User Request → API Route → Database → Response
                    ↓
              (If DB empty/error)
                    ↓
              Static Fallback Data
```

### 6.2 Admin Data Flow (Correct)

```
Admin Request → Auth Check → API Route → Database → Response
                    ↓
              (If unauthorized)
                    ↓
              401 Authentication Error
```

### 6.3 Contact Form Flow (Correct)

```
User Submission → Rate Limit Check → Validation → Database → Success
                        ↓
                  (If rate limited)
                        ↓
                  429 Error
```

---

## 7. Environment Variables Required

```bash
# Required
DATABASE_URL="postgresql://..."
ADMIN_PASSWORD="your-secure-password"
JWT_SECRET="your-jwt-secret-min-32-chars"

# Optional but Recommended
ALLOWED_ORIGIN="https://your-domain.com"
RATE_LIMIT_MAX="5"
RATE_LIMIT_WINDOW_MS="60000"
SESSION_MAX_AGE="86400000"
TRUST_PROXY_HEADERS="true"

# Passkeys (Optional)
PASSKEY_RP_ID="your-domain.com"
PASSKEY_EXPECTED_ORIGINS="https://your-domain.com"
```

---

## 8. Recommendations Summary

### High Priority

1. **Remove or implement unused stores** (`useContactStore`, `useAdminStore`)
2. **Fix fake reaction counts** - Use real data or remove randomness
3. **Add security headers** (CSP, X-Frame-Options, HSTS)
4. **Implement Redis for rate limiting** in production
5. **Split admin page** into smaller components

### Medium Priority

6. **Add database indexes** for common query patterns
7. **Improve error handling** - Don't silently return static data on DB errors
8. **Add loading skeletons** for better UX during data fetching
9. **Consider SSR** for gallery/journal pages
10. **Add health check endpoint** for monitoring

### Low Priority

11. **Add ARIA labels** where missing
12. **Test color contrast** for accessibility
13. **Add environment variable** to disable static fallbacks in production
14. **Consider implementing** real reaction counts with server storage

---

## 9. Files Reviewed

| File | Purpose | Status |
|------|---------|--------|
| `src/app/page.tsx` | Landing page | ✅ |
| `src/app/about/page.tsx` | About page | ✅ |
| `src/app/contact/page.tsx` | Contact form | ✅ |
| `src/app/galleries/page.tsx` | Gallery display | ✅ |
| `src/app/journal/page.tsx` | Journal entries | ✅ |
| `src/app/admin/page.tsx` | Admin portal | ✅ |
| `src/lib/security.ts` | Auth utilities | ✅ |
| `src/lib/middleware.ts` | API middleware | ✅ |
| `src/lib/validations.ts` | Zod schemas | ✅ |
| `src/lib/data.ts` | Data functions | ✅ |
| `src/lib/store.ts` | Zustand stores | ⚠️ Unused code |
| `src/app/api/contact/route.ts` | Contact API | ✅ |
| `src/app/api/newsletter/route.ts` | Newsletter API | ✅ |
| `src/app/api/gallery/route.ts` | Gallery API | ✅ |
| `src/app/api/journal/route.ts` | Journal API | ✅ |
| `src/app/api/admin/auth/route.ts` | Auth API | ✅ |
| `src/app/api/upload/route.ts` | Upload API | ✅ |
| `src/app/api/settings/route.ts` | Settings API | ✅ |
| `prisma/schema.prisma` | Database schema | ✅ |

---

## 10. Conclusion

The Douglas Mitchell website is well-architected with proper security measures for a personal portfolio. The main concerns are:

1. **No unintended submission features** - Only contact form and newsletter are public-facing submissions, which are intentional for professional use
2. **Security is solid** - Good authentication, rate limiting, CSRF protection
3. **Code quality needs attention** - Unused stores, fake reaction data, large component files
4. **Performance can be improved** - Client-side fetching, missing indexes, no caching

The codebase follows good practices overall and the admin portal is properly secured with authentication required for all mutation operations.

---

*End of Audit Report*