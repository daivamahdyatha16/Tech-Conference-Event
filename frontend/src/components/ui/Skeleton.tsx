const Skeleton = ({ className = "" }: { className?: string }) => {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200/70 ${className}`}
    />
  );
};

export default Skeleton;
