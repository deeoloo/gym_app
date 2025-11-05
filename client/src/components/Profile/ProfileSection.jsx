import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const ProfileSection = ({ externalProfileData }) => {
  const { user } = useContext(AuthContext);

  const [profileData, setProfileData] = useState(
    externalProfileData || {
      completedWorkouts: [],
      completedWorkoutDetails: [],
      communityChallenges: [],
      friends: [],
      posts: [],
      savedRecipes: [],
      username: user?.username || '',
      email: user?.email || '',
      avatar: user?.avatar || '👤',
    }
  );

  // Apply server data when it arrives (Dashboard fetch)
  useEffect(() => {
    if (externalProfileData) {
      setProfileData(externalProfileData);
    }
  }, [externalProfileData]);

  // 🔹 Hydrate once from localStorage for the latest local snapshot
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('profile') || '{}');
      if (stored && Object.keys(stored).length) {
        setProfileData(prev => ({ ...prev, ...stored }));
      }
    } catch {}
  }, []);

  // 🔹 Listen for cross-route updates (workout complete, add friend, save recipe, join challenge)
  useEffect(() => {
    const onProfileUpdate = (e) => {
      if (e?.detail) {
        setProfileData(prev => ({ ...prev, ...e.detail }));
      }
    };
    window.addEventListener('profile:update', onProfileUpdate);
    return () => window.removeEventListener('profile:update', onProfileUpdate);
  }, []);

  const displayUser = {
    username: profileData?.username || '',
    email: profileData?.email || '',
    avatar: profileData?.avatar || '👤',
  };

  const recentActivities = [
    ...(profileData?.completedWorkoutDetails || []).slice(-1).map((workout) => ({
      type: 'workout',
      text: `Completed ${workout.name}`,
      icon: '🏋️',
      date: workout.date,
    })),
    ...(profileData?.communityChallenges || []).slice(-1).map((challenge) => ({
      type: 'challenge',
      text: `Joined ${challenge.name}`,
      icon: '🏆',
      date: challenge.joined_at || new Date().toISOString(),
    })),
    ...(profileData?.savedRecipes || []).slice(-1).map((nutrition) => ({
      type: 'nutrition',
      text: `Saved ${nutrition.name}`,
      icon: '🥗',
      date: nutrition.date,
    })),
    ...(profileData?.posts || []).slice(-1).map((post) => ({
      type: 'post',
      text: `Posted: "${(post.content || '').substring(0, 20)}..."`,
      icon: '💬',
      date: post.time,
    })),
    ...(profileData?.friends || []).slice(-1).map((friend) => ({
      type: 'friends',
      text: `Became friends with ${friend.username}`,
      icon: '🧑‍🤝‍🧑',
      date: friend.created_at || new Date().toISOString(),
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <section className="min-h-screen bg-green-50 text-gray-800 flex justify-center items-start py-4 px-8">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-md p-8">
        {/* Header */}
        <div className="flex items-center border-b border-gray-200 pb-6 mb-6">
          <div className="text-6xl mr-4 bg-green-100 text-green-600 rounded-full p-4">
            {displayUser.avatar}
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-green-800 break-words">
              {displayUser.username || 'User'}
            </h2>
            <p className="text-gray-600 break-words">{displayUser.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
          <div className="bg-green-50 rounded-xl py-4 px-2 text-center shadow-sm hover:shadow-md transition">
            <div className="text-2xl font-bold text-green-700">
              {profileData?.completedWorkouts?.length || 0}
            </div>
            <div className="text-gray-700">Workouts</div>
          </div>
          <div className="bg-blue-50 rounded-xl py-4 px-2 text-center shadow-sm hover:shadow-md transition">
            <div className="text-2xl font-bold text-blue-700">
              {profileData?.communityChallenges?.length || 0}
            </div>
            <div className="text-gray-700">Challenges</div>
          </div>
          <div className="bg-purple-50 rounded-xl py-4 px-2 text-center shadow-sm hover:shadow-md transition">
            <div className="text-2xl font-bold text-purple-700">
              {profileData?.friends?.length || 0}
            </div>
            <div className="text-gray-700">Friends</div>
          </div>
          <div className="bg-yellow-50 rounded-xl py-4 px-2 text-center shadow-sm hover:shadow-md transition">
            <div className="text-2xl font-bold text-yellow-700">
              {profileData?.savedRecipes?.length || 0}
            </div>
            <div className="text-gray-700">Nutrition</div>
          </div>
        </div>

        {/* Activity */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold text-green-800 mb-4 border-b border-gray-200 pb-2">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start bg-gray-50 hover:bg-green-50 rounded-lg p-4 shadow-sm transition"
                >
                  <span className="text-3xl mr-3">{activity.icon}</span>
                  <div className="min-w-0">
                    <p className="text-gray-800 break-words">{activity.text}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(activity.date).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No recent activity yet.</p>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h3 className="text-xl font-semibold text-green-800 mb-4 border-b border-gray-200 pb-2">
            Achievements
          </h3>
          <div className="grid sm:grid-cols-2 gap-6">
            <div
              className={`rounded-xl p-6 text-center border-2 transition ${
                (profileData?.completedWorkouts?.length || 0) >= 5
                  ? 'border-green-600 bg-green-100 text-green-700'
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              <div className="text-lg font-semibold mb-1">Workouts</div>
              <div>
                {(profileData?.completedWorkouts?.length || 0) >= 5
                  ? 'Completed!'
                  : `${Math.max(0, 5 - (profileData?.completedWorkouts?.length || 0))} to go`}
              </div>
            </div>

            <div
              className={`rounded-xl p-6 text-center border-2 transition ${
                (profileData?.communityChallenges?.length || 0) >= 1
                  ? 'border-orange-500 bg-orange-100 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              <div className="text-lg font-semibold mb-1">Challenge</div>
              <div>
                {(profileData?.communityChallenges?.length || 0) >= 1
                  ? 'Completed!'
                  : 'Not started'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileSection;
