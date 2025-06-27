import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));

  const isActive = (path) => location.pathname === path;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="navbar">
        <div className="container nav-inner">
          <div className="nav-left">
            {location.pathname !== '/' && (
              <span className="text-xl font-bold text-blue-600">GymHum</span>
            )}
          </div>
          <div className="nav-center">
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</Link>
            <Link to="/workouts" className={`nav-link ${isActive('/workouts') ? 'active' : ''}`}>Workouts</Link>
            <Link to="/nutrition" className={`nav-link ${isActive('/nutrition') ? 'active' : ''}`}>Nutrition</Link>
            <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>Products</Link>
            <Link to="/community" className={`nav-link ${isActive('/community') ? 'active' : ''}`}>Community</Link>
          </div>
          <div className="nav-right">
            <button onClick={handleLogout} className="btn btn-danger">Logout</button>
          </div>
        </div>
      </nav>

      <main className="py-6 px-4">
        <div className="w-full max-w-screen-xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
