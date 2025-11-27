import { Route } from "react-router-dom";
import Transcript from "frontend/src/pages/transcript.jsx";

const coachingRoutes = (
  <>
    <Route path="/" element={<Transcript />} />
    <Route path="/transcript" element={<Transcript />} />
    <Route path="*" element={<div>Coaching</div>} />
  </>
);

export default coachingRoutes;
