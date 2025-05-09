import { Route } from "react-router-dom";

const opsRoutes = (
  <>
    <Route path="/" element={<div>Ops</div>} />
    <Route path="*" element={<div>Ops</div>} />
  </>
);

export default opsRoutes;
