import { Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

import type { Conference } from "../../types/conference";
import Button from "../ui/Button";

interface ConferenceCardProps {
  conference: Conference;
}

const ConferenceCard = ({ conference }: ConferenceCardProps) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
      <div className="overflow-hidden">
        <img
          src={
            conference.thumbnail ?? "https://placehold.co/600x400?text=No+Image"
          }
          alt={conference.title}
          className="h-56 w-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>

      <div className="space-y-4 p-5">
        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          {conference.category?.name}
        </span>

        <h3 className="line-clamp-2 text-xl font-bold text-gray-900">
          {conference.title}
        </h3>

        <p className="line-clamp-2 text-sm text-gray-500">
          {conference.description}
        </p>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span>{conference.city}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>
              {new Date(conference.startDate).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              conference.isFree
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            {conference.isFree ? "FREE" : "PAID"}
          </span>

          <Link to={`/conferences/${conference.id}`}>
            <Button>Details</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConferenceCard;
