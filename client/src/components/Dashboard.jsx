// pages/Dashboard.jsx
import { useNavigate } from 'react-router-dom';
import ProfileSection from '../components/Profile/ProfileSection';
import { useAppContext } from '../contexts/AppContext';
// Import your custom CSS

const Dashboard = () => {
  const navigate = useNavigate();
  const { loadingProfile } = useAppContext();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>👋 Welcome Back!</h1>
      </div>

      <section className="dashboard-section">
        <h2 className="dashboard-title">🎯 My Profile</h2>
        {loadingProfile ? (
          <p className="loading-text">Loading profile...</p>
        ) : (
          <ProfileSection />
        )}
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-title">🏁 Quick Access</h2>
        <div className="dashboard-grid">
          <div className="dashboard-card" onClick={() => navigate('/workouts')}>
            <h3>🏋️ Workouts</h3>
            <p>Explore your personalized training routines</p>
          </div>
          <div className="dashboard-card" onClick={() => navigate('/nutrition')}>
            <h3>🥗 Nutrition</h3>
            <p>View suggested meal plans and diets</p>
          </div>
          <div className="dashboard-card" onClick={() => navigate('/products')}>
            <h3>🛍️ Products</h3>
            <p>Buy equipment and supplements</p>
          </div>
          <div className="dashboard-card" onClick={() => navigate('/community')}>
            <h3>💬 Community</h3>
            <p>Connect and share your journey</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
