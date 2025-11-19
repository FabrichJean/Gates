import CreatorCard from './CreatorCard';

export default function CreatorList<T extends { id: number }>({
  creators,
  onEdit,
  onDelete,
  isLoading,
}: {
  creators: T[];
  onEdit: (c: T) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-3 max-h-[65vh] overflow-auto">
      {creators.map((c) => (
        <CreatorCard key={c.id} creator={c as any} onEdit={onEdit as any} onDelete={onDelete} isLoading={isLoading} />
      ))}
    </div>
  );
}
