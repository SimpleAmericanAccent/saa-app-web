import { Route } from "react-router-dom";
import Dashboard from "../pages/internal.jsx";

const opsRoutes = (
  <>
    <Route path="/" element={<Dashboard />} />
    <Route path="*" element={<div>Ops</div>} />
  </>
);

export default opsRoutes;
