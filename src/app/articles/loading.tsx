export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-10 sm:px-6 sm:py-14">
      <div className="w-full animate-pulse font-mono">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-6 border-b border-transparent py-4"
          >
            <div className="bg-bloggin-border/30 h-4 w-3/4 rounded sm:h-5" />
            <div className="bg-bloggin-border/30 h-3 w-24 rounded sm:h-4" />
          </div>
        ))}
      </div>
    </main>
  );
}
