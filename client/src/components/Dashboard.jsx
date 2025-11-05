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
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-green-800 tracking-tight">
            Welcome to GymHum Dashboard 💪
          </h1>
          <p className="mt-3 text-green-700 max-w-2xl mx-auto">
            Manage your fitness journey, track progress, and stay motivated every day.
          </p>
        </div>

        {/* Profile Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
          {loadingProfile ? (
            <p className="text-center text-gray-600 italic">Loading profile...</p>
          ) : (
            <ProfileSection externalProfileData={profileData} />
          )}
        </div>

        {/* Quick Access */}
        <section className="mt-10">
          <h2 className="text-xl sm:text-2xl font-bold text-green-800 mb-4">
            🏁 Quick Access
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              className="cursor-pointer bg-white rounded-xl shadow-md border border-gray-100 p-6 transition hover:-translate-y-0.5 hover:shadow-lg hover:bg-orange-50/60 border-l-4 border-orange-400"
              onClick={() => navigate('/workouts')}
            >
              <h3 className="text-lg font-bold text-green-800">🏋️ Workouts</h3>
              <p className="text-gray-700 text-sm mt-2">
                Explore your personalized training routines
              </p>
            </div>

            <div
              className="cursor-pointer bg-white rounded-xl shadow-md border border-gray-100 p-6 transition hover:-translate-y-0.5 hover:shadow-lg hover:bg-orange-50/60 border-l-4 border-orange-400"
              onClick={() => navigate('/nutrition')}
            >
              <h3 className="text-lg font-bold text-green-800">🥗 Nutrition</h3>
              <p className="text-gray-700 text-sm mt-2">
                View suggested meal plans and diets
              </p>
            </div>

            <div
              className="cursor-pointer bg-white rounded-xl shadow-md border border-gray-100 p-6 transition hover:-translate-y-0.5 hover:shadow-lg hover:bg-orange-50/60 border-l-4 border-orange-400"
              onClick={() => navigate('/products')}
            >
              <h3 className="text-lg font-bold text-green-800">🛍️ Products</h3>
              <p className="text-gray-700 text-sm mt-2">
                Buy equipment and supplements
              </p>
            </div>

            <div
              className="cursor-pointer bg-white rounded-xl shadow-md border border-gray-100 p-6 transition hover:-translate-y-0.5 hover:shadow-lg hover:bg-orange-50/60 border-l-4 border-orange-400"
              onClick={() => navigate('/community')}
            >
              <h3 className="text-lg font-bold text-green-800">💬 Community</h3>
              <p className="text-gray-700 text-sm mt-2">
                Connect and share your journey
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
