import { ProductGridSkeleton } from '@/components/ProductCardSkeleton';

export default function HomeLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="mb-8 flex items-end justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 rounded-lg bg-zinc-200 animate-pulse" />
          <div className="h-4 w-64 rounded-lg bg-zinc-200 animate-pulse" />
        </div>
      </div>
      {/* Grid de skeletons */}
      <ProductGridSkeleton count={10} />
    </div>
  );
}
