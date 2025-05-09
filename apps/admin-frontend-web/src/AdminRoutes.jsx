import ProtectedRoute from "core-frontend-web/src/components/ProtectedRoute.jsx";
import WLSDataExplorer from "core-frontend-web/src/pages/WLSDataExplorer.jsx";
import DictionaryAdmin from "core-frontend-web/src/pages/DictionaryAdmin.jsx";
import { Route } from "react-router-dom";

const AdminRoutes = (
  <>
    <Route
      path="/wls-data"
      element={
        <ProtectedRoute requireAdmin={true}>
          <WLSDataExplorer />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dictionary-admin"
      element={
        <ProtectedRoute requireAdmin={true}>
          <DictionaryAdmin />
        </ProtectedRoute>
      }
    />
    <Route
      path="/path"
      element={
        <ProtectedRoute requireAdmin={true}>
          {/* <SuccessPath /> */}
        </ProtectedRoute>
      }
    />
    <Route
      path="/quiz"
      element={
        <ProtectedRoute requireAdmin={true}>{/* <Quiz /> */}</ProtectedRoute>
      }
    />
  </>
);

export default AdminRoutes;
