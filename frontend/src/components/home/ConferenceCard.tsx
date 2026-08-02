import { Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

import type { Conference } from "../../types/conference";
import Button from "../ui/Button";
import ImagePlaceholder from "../ui/ImagePlaceholder";
import ConferenceStatusBadge from "../conference/ConferenceStatusBadge";

// Generic fallback shown when a conference has no uploaded thumbnail.
import conferencePlaceholderImage from "../../assets/images/conference-placeholder.webp";

interface ConferenceCardProps {
  conference: Conference;
}

const ConferenceCard = ({ conference }: ConferenceCardProps) => {
  return (
    <Link
      to={`/conferences/${conference.id}`}
      className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-gray-100 hover:shadow-2xl hover:shadow-slate-900/10"
    >
      <div className="overflow-hidden">
        <ImagePlaceholder
          src={conference.thumbnail ?? conferencePlaceholderImage}
          alt={conference.title}
          className="h-56 w-full transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />
      </div>

      <div className="space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {conference.category?.name}
          </span>

          <ConferenceStatusBadge
            startDate={conference.startDate}
            endDate={conference.endDate}
          />
        </div>

        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-slate-900 transition-colors duration-200 group-hover:text-blue-600">
          {conference.title}
        </h3>

        <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">
          {conference.description}
        </p>

        <div className="space-y-1.5 pt-1 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <MapPin size={15} className="shrink-0 text-slate-400" />
            <span>{conference.city}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={15} className="shrink-0 text-slate-400" />
            <span>
              {new Date(conference.startDate).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              conference.isFree
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {conference.isFree ? "FREE" : "PAID"}
          </span>

          <Button
            className="pointer-events-none px-4 py-2 text-xs"
          >
            View Details
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default ConferenceCard;
