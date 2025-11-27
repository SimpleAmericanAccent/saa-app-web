import AppBase from "frontend/src/app.base";
import UserLayout from "./components/user-layout";
import coreRoutes from "frontend/src/routes/core-routes";

export default function App() {
  return <AppBase layout={UserLayout}>{coreRoutes}</AppBase>;
}
