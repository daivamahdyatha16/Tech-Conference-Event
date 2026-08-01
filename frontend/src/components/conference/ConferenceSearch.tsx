interface ConferenceSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const ConferenceSearch = ({
  value,
  onChange,
}: ConferenceSearchProps) => {
  return (
    <div className="mb-8">
      <input
        type="text"
        placeholder="Search conference..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
      />
    </div>
  );
};

export default ConferenceSearch;