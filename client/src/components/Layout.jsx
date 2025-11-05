import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const isActive = (path) => location.pathname === path;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-green-50 text-gray-800 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3 sm:px-6">
          {/* Left */}
          <div className="flex items-center">
            {location.pathname !== '/' && (
              <span className="text-2xl font-extrabold text-green-700">GymHum 💪</span>
            )}
          </div>

          {/* Center - Nav Links */}
          <div className="hidden sm:flex items-center space-x-6">
            {[
              { path: '/dashboard', label: 'Dashboard' },
              { path: '/workouts', label: 'Workouts' },
              { path: '/nutrition', label: 'Nutrition' },
              { path: '/products', label: 'Products' },
              { path: '/community', label: 'Community' },
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-semibold px-3 py-2 rounded-lg transition ${
                  isActive(link.path)
                    ? 'bg-green-600 text-white shadow'
                    : 'text-gray-700 hover:text-green-700 hover:bg-green-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right - Logout Button */}
          <div>
            <button
              onClick={handleLogout}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="w-full max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
