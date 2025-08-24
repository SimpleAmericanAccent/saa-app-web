import AppBase from "core-frontend-web/src/app.base";
import UserLayout from "core-frontend-web/src/components/UserLayout";
import coreRoutes from "core-frontend-web/src/routes/coreRoutes";

export default function App() {
  return <AppBase layout={UserLayout}>{coreRoutes}</AppBase>;
}
