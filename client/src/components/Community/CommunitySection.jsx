import { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';



const CommunitySection = () => {
  const { profileData, setProfileData, token, user} = useAppContext();
  const [postContent, setPostContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [challenges, setChallenges] = useState([]);
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [friends, setFriends] = useState([]);

  

  const showCommunityMessage = (msg) => {
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
  };

  const handlePostSubmit = () => {
    if (!postContent.trim()) return;

    fetch('/api/posts', {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      body: JSON.stringify({ content: postContent })
    })
      .then(res => res.json())
      .then(data => {
        showCommunityMessage("Your post has been shared!");
        setPostContent('');
        setPosts(prev => [data.post, ...prev]);
      })
      .catch(err => console.error("Post failed:", err));
  };

  const handleJoinChallenge = (challengeId) => {
    fetch(`/api/challenges/${challengeId}/join`, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
    })
      .then(res => res.json())
      .then(data => {
        showCommunityMessage(`Joined ${data.challenge.name}`);
        setProfileData(prev => ({
          ...prev,
            communityChallenges: [...prev.communityChallenges, data.challenge]
        }));

      });
  };


  const handleAddFriend = (friendId, friendName) => {
    fetch(`/api/friends/${friendId}`, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
    })
      .then(res => res.json())
      .then(data => {
        showCommunityMessage(data.message || `Friend request sent to ${friendName}`);
        setProfileData(prev => ({
          ...prev,
          friends: data.friends || []
        }));
        setSuggestions(prev => prev.filter(f => f.id !== friendId));
      })
      .catch(err => console.error("Failed to send friend request:", err));
  };

  const handleRemoveFriend = (friendId) => {
    fetch(`/api/friends/${friendId}`, {
      method: 'DELETE',
      headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
    })
      .then(res => res.json())
      .then(data => {
        showCommunityMessage(data.message || "Friend removed");
        setFriends(prev => prev.filter(f => f.id !== friendId));
      })
      .catch(err => console.error("Failed to remove friend:", err));
  };
 
  useEffect(() => {
    if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
      console.warn('🚫 Skipping fetch: invalid or missing token:', token);
      return;
    }


    fetch('/api/challenges', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(setChallenges);
  }, [token]);  // ✅ stable dependency array


  useEffect(() => {
    if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
      console.warn('🚫 Skipping fetch: invalid or missing token:', token);
      return;
    }

    fetch('/api/posts', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => setPosts(data.posts || []))
      .catch(err => {
        console.error("Error loading posts:", err);
        setPosts([]);
    });
  }, [token]);  // ✅ stable dependency array



  useEffect(() => {
    if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
      console.warn('🚫 Skipping fetch: invalid or missing token:', token);
      return;
    }
 

    fetch('/api/users/suggestions', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      console.log("Suggestions response:", data);
      setSuggestions(data?.data?.users || []);
    })
    .catch(err => {
      console.error("Failed to fetch suggestions:", err);
      setSuggestions([]);
    });
  }, [token]);  


  useEffect(() => {
    if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
      console.warn('🚫 Skipping fetch: invalid or missing token:', token);
      return;
    }

    fetch('/api/friends', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        setFriends(data.friends || []);
        setProfileData(prev => ({
          ...prev,
          friends: data.friends || []
      }));
      })
      .catch(err => {
        console.error("Failed to fetch friends:", err);
        setFriends([]);
      });
  }, [token]);
  
   return (
    <section className="community-section">
      {showMessage && (
        <div className="notification">
          {message}
        </div>
      )}
      
      <div className="community-header">
        <h2 className="section-title">Community</h2>
      </div>
      
      <div className="community-grid">
        <div className="community-main">
          <div className="community-challenges">
            <h3 className="section-subtitle">Current Challenges</h3>
            <div className="challenges-grid">
              {challenges.length === 0 ? (
                <p>No challenges available right now.</p>
                  ) : (
                    challenges.map(challenge => (
                        <div key={challenge.id} className="challenge-card">
                            <h4 className="challenge-title">{challenge.name}</h4>
                            <p className="challenge-description">{challenge.description}</p>

                      {challenge.target && profileData?.completedWorkouts && (
                  <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{
                  width: `${Math.min(
                    100,
                    (profileData.completedWorkouts.length / challenge.target) * 100
                  )}%`
                }}
              ></div>
            </div>
            <span className="progress-text">
              {profileData.completedWorkouts.length}/{challenge.target} days
            </span>
          </div>
        )}

                      <button
                        onClick={() => handleJoinChallenge(challenge.id)}
                          className={`challenge-button ${profileData.communityChallenges.some(c => c.id === challenge.id) ? 'joined' : ''}`}
                      >
                        {profileData.communityChallenges.some(c => c.id === challenge.id)
                          ? "Joined ✓"
                          : "Join Challenge"}
                      </button>

                  </div>
                ))
              )}
            </div>

          </div>
          
          <div className="community-feed">
            <h3 className="section-subtitle">Community Feed</h3>
            
            <div className="posts-list">
              {posts.map((post, index) => {
                if (!post || !post.user) return null; // 🛡️ Skip undefined or malformed posts

                return (
                  <div key={index} className="post-card">
                    <div className="post-header">
                      <span className="post-avatar">{post.user.avatar || '👤'}</span>
                      <span className="post-user">{post.user.username || 'Unknown'}</span>
                      <span className="post-time">{new Date(post.created_at).toLocaleString()}</span>
                    </div>
                    <div className="post-content">
                      <p>{post.content}</p>
                    </div>
                    <div className="post-actions">
                      <button className="post-action">
                        <span>👍</span> {post.likes}
                      </button>
                      <button className="post-action">
                        <span>💬</span> {post.comments}
                      </button>
                      <button className="post-action">
                        <span>↗️</span> Share
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="create-post">
              <h4 className="create-post-title">Create a Post</h4>
              <textarea
                placeholder="Share your progress with the community..."
                className="post-input"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
              ></textarea>
              <button
                onClick={handlePostSubmit}
                className="post-button"
                disabled={!postContent.trim()}
              >
                Post
              </button>
            </div>
          </div>
        </div>
        
        <div className="friends-section">
          <h3 className="section-subtitle">Connect With Friends</h3>
          
          <div className="friend-search">
            <h4 className="search-title">Search for Friends</h4>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search for friends..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-button">
                Search
              </button>
            </div>
          </div>
          
          <div className="friend-suggestions">
            <h4 className="suggestions-title">People You May Know</h4>
            
          <div className="suggestions-list">
            {suggestions
              .filter(friend => friend.username.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((friend, index) => (
                <div key={index} className="suggestion-item">
                  <div>
                    <div className="friend-name">{friend.username}</div>
                    <div className="mutual-friends">{friend.mutualFriends || 0} mutual friends</div>
                  </div>
                  <button
                    onClick={() => handleAddFriend(friend.id, friend.username)}
                      className="add-friend-button"
                  >
                    Add Friend
                  </button>
                </div>
              ))}
          </div>

          <div className="friends-list">
            <h4 className="suggestions-title">Your Friends</h4>
              {friends.length === 0 ? (
                <p>You have no friends yet.</p>
              ) : (
                friends.map((friend, index) => (
              <div key={index} className="suggestion-item">
              <div>
                <div className="friend-name">{friend.username}</div>
                  <div className="mutual-friends">Online since {new Date(friend.created_at).toLocaleDateString()}</div>
                  </div>
                  <button
                    onClick={() => handleRemoveFriend(friend.id)}
                      className="add-friend-button danger"
                  >
                    Remove
                  </button>
                </div>
                ))
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
