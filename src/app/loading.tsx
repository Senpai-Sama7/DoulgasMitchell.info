export default function Loading() {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-muted/30 p-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Loading</p>
        <h1 className="mt-4 text-2xl font-semibold">Preparing the next view</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page is rendering. This should only take a moment.
        </p>
      </div>
    </main>
  );
}
