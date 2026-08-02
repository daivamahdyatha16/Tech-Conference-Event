interface ConferencePaginationProps {
  page: number;
  totalPage: number;
  onPageChange: (page: number) => void;
}

const ConferencePagination = ({
  page,
  totalPage,
  onPageChange,
}: ConferencePaginationProps) => {
  if (totalPage <= 1) return null;

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
      >
        Previous
      </button>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPage }, (_, i) => (
          <button
            key={i}
            onClick={() => onPageChange(i + 1)}
            className={`h-9 w-9 rounded-lg text-sm font-medium transition-all duration-200 ${
              page === i + 1
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                : "text-slate-600 hover:bg-gray-100"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <button
        disabled={page === totalPage}
        onClick={() => onPageChange(page + 1)}
        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
      >
        Next
      </button>
    </div>
  );
};

export default ConferencePagination;
