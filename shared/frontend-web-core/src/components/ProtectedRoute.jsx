import { Navigate, useLocation } from "react-router";
import useAuthStore from "shared/frontend-web-core/src/stores/authStore";
import propTypes from "prop-types";
import { useEffect, useState } from "react";

function ProtectedRoute({ children, requiredRole }) {
  const { userRole, isLoading, fetchUserRole } = useAuthStore();
  const location = useLocation();
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // Fetch user role on component mount if not already loaded
  useEffect(() => {
    if (userRole === null && !isLoading && !hasAttemptedFetch) {
      setHasAttemptedFetch(true);
      fetchUserRole();
    }
  }, [userRole, isLoading, fetchUserRole, hasAttemptedFetch]);

  // Show loading state while fetching user role
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // Only redirect if we've attempted to fetch and the user doesn't have the required role
  if (hasAttemptedFetch && !isLoading && userRole !== requiredRole) {
    // Store the current location to redirect back after login
    return <Navigate to="/Home1" state={{ from: location }} replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: propTypes.node.isRequired,
  requiredRole: propTypes.string.isRequired,
};

export default ProtectedRoute;
