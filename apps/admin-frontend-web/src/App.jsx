import AppBase from "core-frontend-web/src/app.base";
import AdminRoutes from "./AdminRoutes";
import AdminLayout from "./components/AdminLayout";

export default function App() {
  return <AppBase layout={AdminLayout}>{AdminRoutes}</AppBase>;
}
