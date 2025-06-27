import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';

const ProfileSection = () => {
  const { profileData } = useAppContext();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const token = localStorage.getItem('token');

  // const handleLogout = () => {
  //   localStorage.removeItem('user');
  //   localStorage.removeItem('token');
  //   navigate('/');
  // };

  return (
    <section className="profile-section">
      <div className="profile-card">
        <div className="profile-header">
          <div className="flex items-center">
            <div className="profile-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="profile-name">{user?.name || 'User'}</h2>
              <p className="profile-email">{user?.email || ''}</p>
            </div>
          </div>
          {/* <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button> */}
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
        </div>

        <div className="activity">
          <h3 className="section-subtitle">Recent Activity</h3>
          <div className="activity-list">
            {[
              ...profileData.completedWorkoutDetails.slice(-3).map(workout => ({
                type: 'workout',
                text: `Completed ${workout.name}`,
                icon: '🏋️',
                date: workout.date
              })),
              ...profileData.communityChallenges.slice(-1).map(challenge => ({
                type: 'challenge',
                text: `Joined ${challenge}`,
                icon: '🏆',
                date: new Date().toLocaleDateString()
              })),
              ...profileData.posts.slice(-1).map(post => ({
                type: 'post',
                text: `Posted: "${post.content.substring(0, 20)}..."`,
                icon: '💬',
                date: post.time
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
              <div className="achievement-title">5 Workouts</div>
              <div className="achievement-status">
                {profileData.completedWorkouts.length >= 5 ? 'Completed!' : `${5 - profileData.completedWorkouts.length} to go`}
              </div>
            </div>
            <div className={`achievement-card ${profileData.communityChallenges.length >= 1 ? 'completed' : ''}`}>
              <div className="achievement-title">1 Challenge</div>
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
