import { createContext, useContext, useEffect, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useLocalStorage('cart', []);
  const [profileData, setProfileData] = useState({
    completedWorkouts: [],
    completedWorkoutDetails: [],
    communityChallenges: [],
    friends: [],
    posts: [],
    savedRecipes: [],
  });

  const getValidToken = () => {
    const stored = localStorage.getItem('token');
    return stored && stored !== 'null' && stored.split('.').length === 3 ? stored : '';
  };

  const [token, setToken] = useState(getValidToken);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser && storedUser !== 'null' ? JSON.parse(storedUser) : null;
  });

  const [loadingProfile, setLoadingProfile] = useState(true);

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Fetch profile if token is valid
  useEffect(() => {
    if (!token || token.split('.').length !== 3) {
      setLoadingProfile(false);
      return;
    }

    fetch('http://localhost:5000/api/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Invalid or expired token');
        return res.json();
      })
      .then(data => {
        setProfileData(data);
        setLoadingProfile(false);
      })
      .catch(err => {
        console.error('Error loading profile:', err);
        logout();
        setLoadingProfile(false);
      });
  }, [token]);

  // Cart helpers
  const addToCart = (product) => setCart([...cart, product]);
  const removeFromCart = () => setCart([]);

  // Profile data helpers
  const completeWorkout = (workout) => {
    if (!profileData.completedWorkouts.includes(workout.id)) {
      setProfileData(prev => ({
        ...prev,
        completedWorkouts: [...prev.completedWorkouts, workout.id],
        completedWorkoutDetails: [
          ...prev.completedWorkoutDetails,
          { id: workout.id, name: workout.name, date: new Date().toISOString() }
        ]
      }));
    }
  };

  const joinChallenge = (challenge) => {
    if (!profileData.communityChallenges.some(c => c.id === challenge.id)) {
      setProfileData(prev => ({
        ...prev,
        communityChallenges: [...prev.communityChallenges, challenge]
      }));
    }
  };

  const addPost = (content) => {
    const newPost = {
      user: "You",
      avatar: "😊",
      content,
      likes: 0,
      comments: 0,
      time: new Date().toISOString(),
    };
    setProfileData(prev => ({
      ...prev,
      posts: [newPost, ...prev.posts]
    }));
  };

  const addFriend = (friendName) => {
    if (!profileData.friends.includes(friendName)) {
      setProfileData(prev => ({
        ...prev,
        friends: [...prev.friends, friendName]
      }));
    }
  };

  const saveRecipe = (recipe) => {
    fetch(`http://localhost:5000/api/nutrition/${recipe.id}/save`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Save failed");
        return res.json();
      })
      .then(() => {
        setProfileData(prev => ({
          ...prev,
          savedRecipes: [
            ...prev.savedRecipes,
            {
              id: recipe.id,
              name: recipe.name,
              date: new Date().toISOString()
            }
          ]
        }));
      })
      .catch(err => {
        console.error("Error saving recipe:", err);
        if (err.message.includes('token')) logout();
      });
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        removeFromCart,
        profileData,
        setProfileData,
        completeWorkout,
        joinChallenge,
        addPost,
        addFriend,
        loadingProfile,
        user,
        setUser,
        token,
        setToken,
        saveRecipe
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
