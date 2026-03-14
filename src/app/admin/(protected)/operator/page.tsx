import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { AdminOperatorConsole } from '@/components/admin/operator-console';

export const dynamic = 'force-dynamic';

export default function AdminOperatorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[55vh] items-center justify-center">
          <div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading operator control plane...
          </div>
        </div>
      }
    >
      <AdminOperatorConsole />
    </Suspense>
  );
}
