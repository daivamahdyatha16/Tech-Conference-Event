import Skeleton from "../ui/Skeleton";

const ConferenceCardSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <Skeleton className="h-56 w-full rounded-none" />

      <div className="space-y-4 p-5">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />

        <div className="flex items-center justify-between pt-3">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export default ConferenceCardSkeleton;
