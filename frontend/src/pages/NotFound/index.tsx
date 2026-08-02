import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

import Button from "../../components/ui/Button";

const NotFound = () => {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
        <Compass size={28} className="text-blue-600" />
      </div>

      <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-blue-600">
        404 Error
      </p>

      <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">
        Page not found
      </h1>

      <p className="mt-3 text-slate-500">
        The page you're looking for doesn't exist or may have been moved.
      </p>

      <Link to="/" className="mt-8">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
};

export default NotFound;
