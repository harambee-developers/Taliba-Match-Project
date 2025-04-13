import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ user }) => {
  return user ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;
