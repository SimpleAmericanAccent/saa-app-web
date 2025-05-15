import { Route } from "react-router-dom";
import Transcript from "core-frontend-web/src/pages/transcript.jsx";
import DictionaryAdmin from "core-frontend-web/src/pages/DictionaryAdmin.jsx";

const coachingRoutes = (
  <>
    <Route path="/" element={<Transcript />} />
    <Route path="/transcript" element={<Transcript />} />
    <Route path="/dictionary" element={<DictionaryAdmin />} />
    <Route path="*" element={<div>Coaching</div>} />
  </>
);

export default coachingRoutes;
