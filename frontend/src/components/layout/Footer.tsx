import Container from "../ui/Container";

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">

      <Container>

        <div className="flex h-24 items-center justify-between">

          <h2 className="text-xl font-bold text-blue-600">
            TechCon
          </h2>

          <p className="text-sm text-gray-500">
            © 2026 TechCon. All rights reserved.
          </p>

        </div>

      </Container>

    </footer>
  );
};

export default Footer;