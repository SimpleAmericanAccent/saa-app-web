import NavBar from "core-frontend-web/src/components/NavBar";
import { Routes } from "react-router-dom";
import coreRoutes from "core-frontend-web/src/routes/coreRoutes.jsx";

export default function UserAppView() {
  return (
    <>
      <NavBar />
      <Routes>{coreRoutes}</Routes>
    </>
  );
}
