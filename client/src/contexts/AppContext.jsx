// contexts/AppContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useLocalStorage('cart', []);
  const [profileData, setProfileData] = useLocalStorage('profile', {
    completedWorkouts: [],
    completedWorkoutDetails: [],
    communityChallenges: [],
    friends: [],
    posts: [],
  });

  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('http://localhost:5000/api/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
      })
      .then(data => {
        setProfileData(data);
        setLoadingProfile(false);
      })
      .catch(err => {
        console.error('Error loading profile:', err);
        setLoadingProfile(false);
      });
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = () => {
    setCart([]);
  };

  const completeWorkout = (workout) => {
    if (!profileData.completedWorkouts.includes(workout.id)) {
      const updatedProfile = {
        ...profileData,
        completedWorkouts: [...profileData.completedWorkouts, workout.id],
        completedWorkoutDetails: [
          ...profileData.completedWorkoutDetails,
          {
            id: workout.id,
            name: workout.name,
            date: new Date().toISOString(),
          }
        ]
      };
      setProfileData(updatedProfile);
    }
  };

  const joinChallenge = (challenge) => {
    if (!profileData.communityChallenges.includes(challenge)) {
      const updatedProfile = {
        ...profileData,
        communityChallenges: [...profileData.communityChallenges, challenge]
      };
      setProfileData(updatedProfile);
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
    const updatedProfile = {
      ...profileData,
      posts: [newPost, ...profileData.posts]
    };
    setProfileData(updatedProfile);
  };

  const addFriend = (friendName) => {
    if (!profileData.friends.includes(friendName)) {
      const updatedProfile = {
        ...profileData,
        friends: [...profileData.friends, friendName]
      };
      setProfileData(updatedProfile);
    }
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
        loadingProfile
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
