export default function ChatLoading() {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-paper" aria-busy="true">
      <aside className="hidden w-[270px] shrink-0 border-r border-line bg-panel min-[700px]:block">
        <div className="flex h-[64px] items-center px-5">
          <div className="h-7 w-28 animate-pulse rounded-full bg-panel-4" />
        </div>
        <div className="flex flex-col gap-3 px-3">
          <div className="h-11 animate-pulse rounded-[13px] bg-panel-2" />
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-8 animate-pulse rounded-[10px] bg-panel-2" />
          ))}
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <div className="h-[64px] border-b border-line" />
        <div className="flex-1" />
        <div className="mx-auto mb-6 h-[96px] w-full max-w-[760px] animate-pulse rounded-[18px] bg-panel px-5" />
      </div>
    </div>
  );
}
