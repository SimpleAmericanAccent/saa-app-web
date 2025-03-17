import { Navigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import propTypes from "prop-types";

function ProtectedRoute({ children, requiredRole }) {
  const { userRole, isLoading } = useAuthStore();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (userRole !== requiredRole) {
    return <Navigate to="/Home1" />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: propTypes.node.isRequired,
  requiredRole: propTypes.string.isRequired,
};

export default ProtectedRoute;
