import AppBase from "core-frontend-web/src/app.base";
import AdminLayout from "./components/AdminLayout";
import { Route } from "react-router-dom";

import UserAppView from "./views/UserAppView";
import CoachingView from "./views/CoachingView";
import OpsView from "./views/OpsView";

const adminRoutes = (
  <>
    <Route path="/user/*" element={<UserAppView />} />
    <Route path="/coaching/*" element={<CoachingView />} />
    <Route path="/ops/*" element={<OpsView />} />
  </>
);

export default function App() {
  return <AppBase layout={AdminLayout}>{adminRoutes}</AppBase>;
}
