export function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-[#E8E5E0] rounded-lg aspect-[3/4] mb-3" />
      <div className="bg-[#E8E5E0] h-4 rounded w-3/4 mb-2" />
      <div className="bg-[#E8E5E0] h-3 rounded w-1/2 mb-2" />
      <div className="bg-[#E8E5E0] h-4 rounded w-1/3" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="p-3">
        <div className="bg-[#E8E5E0] h-4 rounded w-full" />
      </td>
      <td className="p-3">
        <div className="bg-[#E8E5E0] h-4 rounded w-full" />
      </td>
      <td className="p-3">
        <div className="bg-[#E8E5E0] h-4 rounded w-full" />
      </td>
      <td className="p-3">
        <div className="bg-[#E8E5E0] h-4 rounded w-full" />
      </td>
    </tr>
  );
}
