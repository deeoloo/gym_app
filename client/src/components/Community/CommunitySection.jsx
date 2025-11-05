import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const CommunitySection = () => {
  const { token, user } = useContext(AuthContext); 
  const [postContent, setPostContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [challenges, setChallenges] = useState([]);
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [friends, setFriends] = useState([]);
  const [profileData, setProfileData] = useState({
    completedWorkouts: [],
    completedWorkoutDetails: [],
    communityChallenges: [],
    friends: [],
    posts: [],
    savedRecipes: [],
  });

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
        Authorization: `Bearer ${token}`,
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
        Authorization: `Bearer ${token}`,
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
        Authorization: `Bearer ${token}`,
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
        Authorization: `Bearer ${token}`,
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

  const isTokenValid = (token) =>
    token && typeof token === 'string' && token.split('.').length === 3;

  useEffect(() => {
    if (!isTokenValid(token)) return;

    fetch('/api/challenges', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(setChallenges);
  }, [token]);

  useEffect(() => {
    if (!isTokenValid(token)) return;

    fetch('/api/posts', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => setPosts(data.posts || []))
      .catch(err => {
        console.error("Error loading posts:", err);
        setPosts([]);
      });
  }, [token]);

  useEffect(() => {
    if (!isTokenValid(token)) return;

    fetch('/api/users/suggestions', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => setSuggestions(data?.data?.users || []))
      .catch(err => {
        console.error("Failed to fetch suggestions:", err);
        setSuggestions([]);
      });
  }, [token]);

  useEffect(() => {
    if (!isTokenValid(token)) return;

    fetch('/api/friends', {
      headers: {
        Authorization: `Bearer ${token}`,
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
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      {showMessage && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-800 shadow-sm">
          {message}
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-green-800">Community</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Challenges */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <h3 className="text-xl font-semibold text-green-800 mb-4">Current Challenges</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {challenges.length === 0 ? (
                <p className="text-gray-600">No challenges available right now.</p>
                  ) : (
                    challenges.map(challenge => (
                        <div key={challenge.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                            <h4 className="text-lg font-semibold text-gray-800">{challenge.name}</h4>
                            <p className="text-gray-600 mt-1">{challenge.description}</p>

                      {challenge.target && profileData?.completedWorkouts && (
                        <div className="mt-4">
                          <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                            <div 
                              className="h-2 bg-green-500 rounded-full transition-all"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (profileData.completedWorkouts.length / challenge.target) * 100
                                )}%`
                              }}
                            ></div>
                          </div>
                          <span className="mt-2 block text-sm text-gray-700">
                            {profileData.completedWorkouts.length}/{challenge.target} days
                          </span>
                        </div>
                      )}

                      <button
                        onClick={() => handleJoinChallenge(challenge.id)}
                        className={`mt-4 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition ${
                          profileData.communityChallenges.some(c => c.id === challenge.id)
                            ? 'bg-green-600 text-white shadow'
                            : 'bg-orange-500 text-white hover:bg-orange-600 shadow'
                        }`}
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
          
          {/* Feed */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <h3 className="text-xl font-semibold text-green-800 mb-4">Community Feed</h3>
            
            <div className="space-y-4">
              {posts.map((post, index) => {
                if (!post || !post.user) return null;

                return (
                  <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl bg-green-100 text-green-600 rounded-full w-12 h-12 flex items-center justify-center">
                        {post.user.avatar || '👤'}
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{post.user.username || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="mt-3 text-gray-800">
                      <p>{post.content}</p>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <button className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-green-50 transition">
                        <span>👍</span> {post.likes}
                      </button>
                      <button className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-green-50 transition">
                        <span>💬</span> {post.comments}
                      </button>
                      <button className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-green-50 transition">
                        <span>↗️</span> Share
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Create a Post</h4>
              <textarea
                placeholder="Share your progress with the community..."
                className="w-full min-h-[120px] rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
              ></textarea>
              <button
                onClick={handlePostSubmit}
                className="mt-3 inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2.5 font-semibold text-white shadow-md hover:bg-orange-600 transition disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={!postContent.trim()}
              >
                Post
              </button>
            </div>
          </div>
        </div>
        
        {/* Right sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <h3 className="text-xl font-semibold text-green-800 mb-4">Connect With Friends</h3>
          
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Search for Friends</h4>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search for friends..."
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-white font-semibold shadow-md hover:bg-green-700 transition">
                  Search
                </button>
              </div>
            </div>
          
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">People You May Know</h4>
              <div className="space-y-3">
                {suggestions
                  .filter(friend => friend.username.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((friend, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <div>
                        <div className="font-medium text-gray-800">{friend.username}</div>
                        <div className="text-xs text-gray-500">{friend.mutualFriends || 0} mutual friends</div>
                      </div>
                      <button
                        onClick={() => handleAddFriend(friend.id, friend.username)}
                        className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-orange-600 transition"
                      >
                        Add Friend
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Your Friends</h4>
              {friends.length === 0 ? (
                <p className="text-gray-600">You have no friends yet.</p>
              ) : (
                friends.map((friend, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm mb-3">
                    <div>
                      <div className="font-medium text-gray-800">{friend.username}</div>
                      <div className="text-xs text-gray-500">Online since {new Date(friend.created_at).toLocaleDateString()}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveFriend(friend.id)}
                      className="inline-flex items-center justify-center rounded-lg bg-red-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-red-600 transition"
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
