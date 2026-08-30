export function ProgressBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-2 w-full overflow-hidden rounded-full bg-muted"
    >
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${v}%` }} />
    </div>
  );
}
