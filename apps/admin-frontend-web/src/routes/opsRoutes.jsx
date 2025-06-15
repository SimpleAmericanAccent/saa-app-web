import { Route } from "react-router-dom";
import Internal from "../pages/Internal.jsx";

const opsRoutes = (
  <>
    <Route path="/" element={<Internal />} />
    <Route path="*" element={<div>Ops</div>} />
  </>
);

export default opsRoutes;
