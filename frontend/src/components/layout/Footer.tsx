import Container from "../ui/Container";

const Footer = () => {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <Container>
        <div className="flex flex-col items-center justify-between gap-3 py-8 text-center sm:flex-row sm:text-left">
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
            Tech<span className="text-blue-600">Con</span>
          </h2>

          <p className="text-sm text-slate-500">
            Built for Indonesia's Tech Community.
          </p>

          <p className="text-sm text-slate-400">
            © 2026 TechCon. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
