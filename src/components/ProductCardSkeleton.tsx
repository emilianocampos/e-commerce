/**
 * ProductCardSkeleton: placeholder animado que imita la forma de una ProductCard
 * mientras los datos se están cargando desde el servidor.
 */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white animate-pulse">
      {/* Imagen placeholder */}
      <div className="aspect-square bg-zinc-200" />
      {/* Texto placeholder */}
      <div className="flex flex-col gap-2 p-4">
        <div className="h-3 w-3/4 rounded-full bg-zinc-200" />
        <div className="h-3 w-1/2 rounded-full bg-zinc-200" />
        <div className="mt-2 h-4 w-1/3 rounded-full bg-zinc-300" />
      </div>
    </div>
  );
}

/** Grid de skeletons: se usa mientras la página carga */
export function ProductGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
