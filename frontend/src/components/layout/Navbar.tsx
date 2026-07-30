import { Link } from "react-router-dom";

import Button from "../ui/Button";
import Container from "../ui/Container";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">

      <Container>

        <div className="flex h-20 items-center justify-between">


          <Link
            to="/"
            className="text-2xl font-bold text-blue-600"
          >
            TechCon
          </Link>


          <nav className="hidden items-center gap-8 text-sm font-medium text-gray-600 lg:flex">

            <Link
              to="/"
              className="transition hover:text-blue-600"
            >
              Discover
            </Link>

            <Link
              to="/conferences"
              className="transition hover:text-blue-600"
            >
              Conferences
            </Link>

            <Link
              to="/"
              className="transition hover:text-blue-600"
            >
              Categories
            </Link>

            <Link
              to="/"
              className="transition hover:text-blue-600"
            >
              For Organizer
            </Link>

          </nav>


          <div className="hidden gap-3 lg:flex">

            <Button variant="secondary">
              Login
            </Button>

            <Button>
              Register
            </Button>

          </div>

        </div>

      </Container>

    </header>
  );
};

export default Navbar;