import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

import Button from "../ui/Button";
import Container from "../ui/Container";

const navLinks = [
  { to: "/", label: "Discover" },
  { to: "/conferences", label: "Conferences" },
  { to: "/about", label: "About" },
  { to: "/for-organizer", label: "For Organizer" },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <Container>
        <div className="flex h-20 items-center justify-between">
          <Link
            to="/"
            className="text-xl font-extrabold tracking-tight text-slate-900"
            onClick={() => setIsMenuOpen(false)}
          >
            Tech<span className="text-blue-600">Con</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="relative transition-colors duration-200 hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden gap-3 lg:flex">
            <Button variant="secondary">Login</Button>
            <Button>Register</Button>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 lg:hidden"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="animate-fade-in flex flex-col gap-1 border-t border-gray-100 pb-6 pt-2 lg:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-3 flex gap-3 px-3">
              <Button variant="secondary" className="flex-1">
                Login
              </Button>
              <Button className="flex-1">Register</Button>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
};

export default Navbar;
