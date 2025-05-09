import AppBase from "core-frontend-web/src/app.base";
import AdminRoutes from "./routes/AdminRoutes-old";
import AdminLayout from "./components/AdminLayout";

export default function App() {
  return <AppBase layout={AdminLayout}>{AdminRoutes}</AppBase>;
}
