import { Navigate, Outlet, useLocation } from 'react-router-dom';

const PrivateRoute = () => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  return token
    ? <Outlet />
    : <Navigate to="/auth/login" state={{ from: location }} replace />;
};

export default PrivateRoute;
