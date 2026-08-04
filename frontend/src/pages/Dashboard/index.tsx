import { useAuth } from "../../hooks/useAuth";
import AttendeeDashboard from "./AttendeeDashboard";
import OrganizerDashboard from "./OrganizerDashboard";

const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === "ATTENDEE") {
    return <AttendeeDashboard />;
  }

  return <OrganizerDashboard />;
};

export default Dashboard;
