import AppBase from "core-frontend-web/src/app.base";
import AdminLayout from "./components/AdminLayout";
import { Route } from "react-router-dom";

import UserAppView from "./views/UserAppView";
import CoachingView from "./views/CoachingView";
import OpsView from "./views/OpsView";
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
    <Route
      path="/acquisition-dashboard"
      element={<ClientAcquisitionDashboard />}
    />
    <Route path="*" element={<AdminOverview />} />
  </>
);

export default function App() {
  return <AppBase layout={AdminLayout}>{adminRoutes}</AppBase>;
}
