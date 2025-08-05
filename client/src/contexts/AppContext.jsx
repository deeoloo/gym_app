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
    localStorage.removeItem('refresh_token');
  }; 
  
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
        logout();
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [token]);

  // Cart helpers
  const addToCart = (product) => setCart([...cart, product]);
  const removeFromCart = () => setCart([]);

  // Profile data helpers
  const completeWorkout = (workout) => {
    if (!profileData.completedWorkouts.includes(workout.id)) {
      setProfileData((prev) => ({
        ...prev,
        completedWorkouts: [...prev.completedWorkouts, workout.id],
        completedWorkoutDetails: [
          ...prev.completedWorkoutDetails,
          {
            id: workout.id,
            name: workout.name,
            date: new Date().toISOString(),
          },
        ],
      }));
    }
  };

  const joinChallenge = (challenge) => {
    if (!profileData.communityChallenges.some((c) => c.id === challenge.id)) {
      setProfileData((prev) => ({
        ...prev,
        communityChallenges: [...prev.communityChallenges, challenge],
      }));
    }
  };

  const addPost = (content) => {
    const newPost = {
      user: 'You',
      avatar: '😊',
      content,
      likes: 0,
      comments: 0,
      time: new Date().toISOString(),
    };
    setProfileData((prev) => ({
      ...prev,
      posts: [newPost, ...prev.posts],
    }));
  };

  const addFriend = (friendName) => {
    if (!profileData.friends.includes(friendName)) {
      setProfileData((prev) => ({
        ...prev,
        friends: [...prev.friends, friendName],
      }));
    }
  };

  const handleDeleteWorkout = async (id) => {
  if (!window.confirm('Delete this workout?')) return;
  try {
    const res = await fetch(`/api/workouts/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (res.ok) refetch();
    else alert('Failed to delete');
  } catch {
    alert('Error deleting workout');
  }
};

const handleDeleteNutrition = async (id) => {
  if (!window.confirm('Delete this nutrition plan?')) return;

  try {
    const res = await fetch(`/api/nutrition/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Delete failed:', errorData.message);
      alert('Failed to delete');
      return;
    }


const updateNutrition = async (planId, updates) => {
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`/api/nutrition/${planId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!res.ok) throw new Error('Update failed');
      const updatedPlan = await res.json();

    // ✅ Optionally update UI state
      setProfileData(prev => ({
        ...prev,
        savedRecipes: prev.savedRecipes.map(p =>
          p.id === updatedPlan.id ? updatedPlan : p
        )
      }));

      alert("Nutrition plan updated!");
    } catch (err) {
      console.error("Error updating nutrition plan:", err);
      alert("Failed to update plan.");
    }
  };


    // ✅ Directly update UI without full refresh
    setProfileData(prev => ({
      ...prev,
      savedRecipes: prev.savedRecipes.filter(recipe => recipe.id !== id)
    }));
  } catch (err) {
    console.error('Delete error:', err);
    alert('Error deleting nutrition');
  }
};



  const savedRecipe = (recipe) => {
    fetch(`/api/nutrition/${recipe.id}/save`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Save failed');
        return res.json();
      })
      .then(() => {
        setProfileData((prev) => ({
          ...prev,
          savedRecipes: [
            ...prev.savedRecipes,
            {
              id: recipe.id,
              name: recipe.name,
              date: new Date().toISOString(),
            },
          ],
        }));
      })
      .catch((err) => {
        console.error('Error saving recipe:', err);
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
        savedRecipe,
        handleDeleteWorkout,
        handleDeleteNutrition,
        updateNutrition,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
