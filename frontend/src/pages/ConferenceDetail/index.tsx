import { useParams } from "react-router-dom";
import { MapPin, CalendarDays, Building2, Ticket } from "lucide-react";

import { useConferenceDetail } from "../../hooks/useConferenceDetail";

const ConferenceDetail = () => {
  const { id } = useParams();

  const { conference, loading, error } = useConferenceDetail(Number(id));

  if (loading) {
    return (
      <div className="py-20 text-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (!conference) {
    return (
      <div className="py-20 text-center">
        Conference not found
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <img
        src={
          conference.thumbnail ??
          "https://placehold.co/1200x600?text=No+Image"
        }
        alt={conference.title}
        className="mb-8 h-[420px] w-full rounded-2xl object-cover"
      />

      <span className="inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700">
        {conference.category.name}
      </span>

      <h1 className="mt-4 text-4xl font-bold">
        {conference.title}
      </h1>

      <p className="mt-4 leading-8 text-gray-600">
        {conference.description}
      </p>

      <div className="mt-10 grid gap-6 rounded-2xl border p-6 md:grid-cols-2">
        <div className="flex items-center gap-3">
          <MapPin className="text-blue-600" size={22} />
          <div>
            <p className="text-sm text-gray-500">City</p>
            <p className="font-semibold">{conference.city}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Building2 className="text-blue-600" size={22} />
          <div>
            <p className="text-sm text-gray-500">Venue</p>
            <p className="font-semibold">{conference.venue}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CalendarDays className="text-blue-600" size={22} />
          <div>
            <p className="text-sm text-gray-500">Event Date</p>
            <p className="font-semibold">
              {new Date(conference.startDate).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Ticket className="text-blue-600" size={22} />
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="font-semibold">
              {conference.isFree ? (
                <span className="text-green-600">FREE</span>
              ) : (
                <span className="text-orange-600">Paid Event</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <button
          className="w-full rounded-xl bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-700 md:w-auto md:px-10"
        >
          Buy Ticket
        </button>
      </div>
    </div>
  );
};

export default ConferenceDetail;