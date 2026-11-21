import { Outlet } from "react-router-dom";

const PrivateRoute = ({ allowedRoles = [] }) => {
  // Placeholder: When auth state is added, check if user.role is in allowedRoles
  const hasAccess = Boolean(allowedRoles);

  return hasAccess ? <Outlet /> : <Outlet />;
};

export default PrivateRoute;
