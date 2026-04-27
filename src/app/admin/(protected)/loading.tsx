export default function AdminLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Loading admin portal
        </p>
      </div>
    </div>
  );
}
