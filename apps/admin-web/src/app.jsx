import AppBase from "frontend/src/app.base";
import AdminLayout from "./components/admin-layout";
import { Route } from "react-router-dom";

import UserAppView from "./views/user-app-view";
import CoachingView from "./views/coaching-view";
import OpsView from "./views/ops-view";
import UserTrialsAdmin from "./pages/user-trials";
import AdminOverview from "./pages/admin-overview";
import ClientAcquisitionDashboard from "./pages/client-acquisition-dashboard";

const adminRoutes = (
  <>
    <Route path="/user/*" element={<UserAppView />} />
    <Route path="/coaching/*" element={<CoachingView />} />
    <Route path="/ops/*" element={<OpsView />} />
    <Route path="/user-trials" element={<UserTrialsAdmin />} />
    <Route path="/overview" element={<AdminOverview />} />
    <Route path="/acq" element={<ClientAcquisitionDashboard />} />
    <Route path="*" element={<AdminOverview />} />
  </>
);

export default function App() {
  return <AppBase layout={AdminLayout}>{adminRoutes}</AppBase>;
}
