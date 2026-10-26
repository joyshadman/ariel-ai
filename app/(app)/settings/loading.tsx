export default function SettingsLoading() {
  return (
    <div className="min-h-dvh bg-paper" aria-busy="true">
      <div className="mx-auto flex w-full max-w-[880px] flex-col gap-6 px-5 py-6 min-[700px]:px-8">
        <div className="flex items-center justify-between">
          <div className="h-7 w-28 animate-pulse rounded-full bg-panel-4" />
          <div className="h-10 w-28 animate-pulse rounded-full bg-panel-2" />
        </div>
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-[18px] bg-panel" />
        ))}
      </div>
    </div>
  );
}
