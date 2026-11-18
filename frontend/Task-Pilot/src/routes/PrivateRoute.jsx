import React from "react";
import { Outlet } from "react-router-dom";

const PrivateRoute = ({ allowedRoles }) => {
    // Placeholder: When you connect authentication, you can check user login status & roles here
    return <Outlet />;
};

export default PrivateRoute;
