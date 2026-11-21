import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ allowedRoles = [] }) => {
  const { currentUser } = useSelector((state) => state.user);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess =
    allowedRoles.length === 0 || allowedRoles.includes(currentUser.role);

  return hasAccess ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
