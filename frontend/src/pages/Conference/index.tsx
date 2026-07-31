import { useConference } from "../../hooks/useConference";
import ConferenceCard from "../../components/home/ConferenceCard";

const Conference = () => {
  const { conferences, loading, error } = useConference();

  if (loading) return <p>Loading...</p>;

  if (error) return <p>{error}</p>;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-8 text-4xl font-bold">
        Conferences
      </h1>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {conferences.map((conference) => (
          <ConferenceCard
            key={conference.id}
            conference={conference}
          />
        ))}
      </div>
    </div>
  );
};

export default Conference;