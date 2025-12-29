// components/SkeletonCards.tsx
export default function SkeletonCards({ cards = 6 }: { cards?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
        />
      ))}
    </div>
  );
}