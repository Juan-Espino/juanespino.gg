export default function LoadingSkeleton() {
  return (
    <main className="flex w-full flex-1 flex-col items-center">
      <div className="w-full animate-pulse py-6">
        <article className="lg:hidden">
          <div className="bg-bloggin-border/30 mb-6 aspect-3/2 w-full rounded-xl" />
          <div className="space-y-4">
            {[1, 2].map((_, index) => (
              <div key={index} className="space-y-4 px-4">
                <div className="bg-bloggin-border/30 h-5 w-full rounded" />
                <div className="bg-bloggin-border/30 h-5 w-11/12 rounded" />
                <div className="bg-bloggin-border/30 h-5 w-10/12 rounded" />
                <div className="bg-bloggin-border/30 h-5 w-11/12 rounded" />
                <div className="bg-bloggin-border/30 h-5 w-full rounded" />
              </div>
            ))}
          </div>
        </article>

        <article className="hidden w-full lg:block">
          <header className="border-bloggin-border/40 mb-4 border-b pb-4">
            <div className="bg-bloggin-border/40 h-10 w-2/3 max-w-xl rounded" />
            <div className="bg-bloggin-border/30 mt-3 h-4 w-32 rounded" />
          </header>

          <div className="bg-bloggin-border/30 float-right mb-8 ml-8 aspect-3/2 w-[48%] max-w-xl rounded-xl" />

          <div className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="space-y-4">
                <div className="bg-bloggin-border/30 h-5 w-[45%] rounded" />
                <div className="bg-bloggin-border/30 h-5 w-2/5 rounded" />
                <div className="bg-bloggin-border/30 h-5 w-[35%] rounded" />
              </div>
            ))}
            <div className="flex gap-4">
              <div className="bg-bloggin-border/30 h-5 w-10" />
              <div className="bg-bloggin-border/30 h-5 w-10" />
              <div className="bg-bloggin-border/30 h-5 w-10" />
            </div>
          </div>
        </article>

        <section className="bg-bloggin-border/10 mt-6 w-full rounded-xl p-4 sm:p-5">
          <div className="bg-bloggin-border/30 h-6 w-40 rounded" />

          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="min-w-0">
                <div className="bg-bloggin-border/30 aspect-3/2 rounded-xl" />
                <div className="bg-bloggin-border/30 mx-auto mt-2 h-4 w-3/4 rounded" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
