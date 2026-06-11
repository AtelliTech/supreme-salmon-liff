export function OrderDetailSkeleton() {
  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white p-5 text-center shadow-sm">
        <div className="mx-auto mb-3 h-14 w-14 animate-pulse rounded-full bg-gray-100" />
        <div className="mx-auto mb-1 h-6 w-32 animate-pulse rounded bg-gray-100" />
        <div className="mx-auto h-4 w-48 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="h-10 animate-pulse bg-gray-50" />
        <div className="space-y-3 p-4">
          {Array.from({ length: 2 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            <div key={i} className="flex gap-3">
              <div className="h-20 w-20 animate-pulse rounded-lg bg-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
