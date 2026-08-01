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
  return (
    <div className="mt-10 flex items-center justify-center gap-3">

      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-lg border px-4 py-2 disabled:opacity-40"
      >
        Previous
      </button>

      {Array.from({ length: totalPage }, (_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className={`rounded-lg px-4 py-2 ${
            page === i + 1
              ? "bg-blue-600 text-white"
              : "border"
          }`}
        >
          {i + 1}
        </button>
      ))}

      <button
        disabled={page === totalPage}
        onClick={() => onPageChange(page + 1)}
        className="rounded-lg border px-4 py-2 disabled:opacity-40"
      >
        Next
      </button>

    </div>
  );
};

export default ConferencePagination;