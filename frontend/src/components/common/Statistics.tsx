import Container from "../ui/Container";
import AnimatedCounter from "../ui/AnimatedCounter";

const stats = [
  { value: 50, suffix: "+", label: "Conferences" },
  { value: 20, suffix: "+", label: "Cities" },
  { value: 1000, suffix: "+", label: "Attendees" },
  { value: 30, suffix: "+", label: "Organizers" },
];

const Statistics = () => {
  return (
    <section className="py-20">
      <Container>
        <div className="grid grid-cols-2 gap-y-10 rounded-3xl border border-gray-100 bg-white px-6 py-12 text-center shadow-sm lg:grid-cols-4 lg:gap-y-0">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={
                index > 0 ? "border-gray-100 lg:border-l" : ""
              }
            >
              <p className="text-4xl font-extrabold tracking-tight text-blue-600 sm:text-5xl">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-2 text-sm font-medium text-slate-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Statistics;
