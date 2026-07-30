import { Link } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";

import type { Conference } from "../../types/conference";
import Button from "../ui/Button";

interface ConferenceCardProps {
  conference: Conference;
}

const ConferenceCard = ({ conference }: ConferenceCardProps) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

      <img
        src={conference.image}
        alt={conference.title}
        className="h-56 w-full object-cover"
      />

      <div className="space-y-4 p-5">

        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          {conference.category}
        </span>

        <h3 className="line-clamp-2 text-xl font-bold">
          {conference.title}
        </h3>

        <div className="space-y-2 text-gray-500">

          <div className="flex items-center gap-2">
            <MapPin size={18} />
            {conference.location}
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={18} />
            {conference.date}
          </div>

        </div>

        <div className="flex items-center justify-between">

          <p className="text-lg font-bold text-blue-600">
            IDR {conference.price.toLocaleString("id-ID")}
          </p>

          <Link to={`/conferences/${conference.id}`}>
            <Button>
              Details
            </Button>
          </Link>

        </div>

      </div>

    </div>
  );
};

export default ConferenceCard;