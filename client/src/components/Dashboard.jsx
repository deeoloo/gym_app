// pages/Dashboard.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileSection from '../components/Profile/ProfileSection';
import { AuthContext } from '../contexts/AuthContext'; 

const Dashboard = () => {
  const navigate = useNavigate();
  const { token, logout } = useContext(AuthContext);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      let currentToken = token;

      if (!currentToken || currentToken.split('.').length !== 3) {
        currentToken = localStorage.getItem('token');
      }

      try {
        const res = await fetch('/api/profile', {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error('Invalid or expired token');
        const data = await res.json();
        setProfileData(data);
      } catch (err) {
        console.error('Error loading profile:', err);
        logout?.(); 
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [token, logout]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome!</h1>
      </div>

      <section className="dashboard-section">
        <h2 className="dashboard-title">Profile</h2>
        {loadingProfile ? (
          <p className="loading-text">Loading profile...</p>
        ) : (
          <ProfileSection externalProfileData={profileData} />
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
