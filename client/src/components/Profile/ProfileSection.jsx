import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';

const ProfileSection = () => {
  const { profileData } = useAppContext();
  const user = {
    username: profileData.username,
    email: profileData.email,
    avatar: profileData.avatar || '👤',
  };


  return (
    <section className="profile-section">
      <div className="profile-card">
        <div className="profile-header">
          <div className="flex items-center">
            <div className="profile-avatar">
              {user.avatar}
            </div>
            <div>
              <h2 className="profile-name">{user?.username || 'User'}</h2>
              <p className="profile-email">{user?.email || ''}</p>
            </div>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-value">{profileData.completedWorkouts.length}</div>
            <div className="stat-label">Workouts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{profileData.communityChallenges.length}</div>
            <div className="stat-label">Challenges</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{profileData.friends.length}</div>
            <div className="stat-label">Friends</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{profileData.savedRecipes.length}</div>
            <div className="stat-label">Nutrition</div>
          </div>
        </div>

        <div className="activity">
          <h3 className="section-subtitle">Recent Activity</h3>
          <div className="activity-list">
            {[
              ...profileData.completedWorkoutDetails.slice(-1).map(workout => ({
                type: 'workout',
                text: `Completed ${workout.name}`,
                icon: '🏋️',
                date: workout.date
              })),
              ...profileData.communityChallenges.slice(-1).map(challenge => ({
                type: 'challenge',
                text: `Joined ${challenge.name}`,
                icon: '🏆',
                date: challenge.joined_at || new Date().toISOString()
              })),

              ...profileData.savedRecipes.slice(-1).map(nutrition => ({
              type: 'nutrition',
              text: `Saved ${nutrition.name}`,
              icon: '🥗',
              date: nutrition.date
              })),


              ...profileData.posts.slice(-1).map(post => ({
                type: 'post',
                text: `Posted: "${post.content.substring(0, 20)}..."`,
                icon: '💬',
                date: post.time
              })),

              ...profileData.friends.slice(-1).map(friend => ({
                type: 'friends',
                text: `Became friends with ${friend.username}`,
                icon: '🧑‍🤝‍🧑',
                date: friend.created_at || new Date().toISOString()
              }))

            ]
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((activity, index) => (
                <div key={index} className="activity-item">
                  <span className="activity-icon">{activity.icon}</span>
                  <div>
                    <p>{activity.text}</p>
                    <p className="activity-date">{activity.date}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div>
          <h3 className="section-subtitle">Achievements</h3>
          <div className="achievements-grid">
            <div className={`achievement-card ${profileData.completedWorkouts.length >= 5 ? 'completed' : ''}`}>
              <div className="achievement-title">Workouts</div>
              <div className="achievement-status">
                {profileData.completedWorkouts.length >= 5 ? 'Completed!' : `${5 - profileData.completedWorkouts.length} to go`}
              </div>
            </div>
            <div className={`achievement-card ${profileData.communityChallenges.length >= 1 ? 'completed' : ''}`}>
              <div className="achievement-title"> Challenge</div>
              <div className="achievement-status">
                {profileData.communityChallenges.length >= 1 ? 'Completed!' : 'Not started'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileSection;
