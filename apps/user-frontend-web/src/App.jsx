import AppBase from "core-frontend-web/src/app.base";
import UserLayout from "./components/user-layout";
import coreRoutes from "core-frontend-web/src/routes/core-routes";

export default function App() {
  return <AppBase layout={UserLayout}>{coreRoutes}</AppBase>;
}
