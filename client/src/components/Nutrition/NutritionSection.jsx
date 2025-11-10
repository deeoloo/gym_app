import React, { useState, useEffect, useContext } from 'react';
import Card from '../Card';
import LoadingSpinner from '../LoadingSpinner';
import NutritionForm from './NutritionForm';
import { AuthContext } from '../../contexts/AuthContext';

const NutritionSection = () => {
  const { token, user, logout } = useContext(AuthContext);
  const [nutritionData, setNutritionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [profileData, setProfileData] = useState({
    completedWorkouts: [],
    completedWorkoutDetails: [],
    communityChallenges: [],
    friends: [],
    posts: [],
    savedRecipes: [],
  });

  const fetchNutrition = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/nutrition', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      if (!res.ok) throw new Error('Failed to fetch nutrition data');
      const data = await res.json();
      setNutritionData(data.plans || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNutrition();
    }
  }, [token]);

  const handleDeleteNutrition = async (id) => {
    if (!window.confirm('Delete this nutrition plan?')) return;

    try {
      const res = await fetch(`/api/nutrition/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Delete failed:', errorData.message);
        alert('Failed to delete');
        return;
      }

      setProfileData(prev => ({
        ...prev,
        savedRecipes: prev.savedRecipes.filter(recipe => recipe.id !== id)
      }));

      fetchNutrition();
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
        console.log('Save response:', res);
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
        if (err.message.includes('token')) logout?.();
      });
  };

  const filteredPlans = nutritionData.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="mx-auto max-w-5xl my-6 rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3">
        Error: {error}
      </div>
    );

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-green-800 mb-4">
        Nutrition
      </h2>

      <h2
        className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold cursor-pointer mb-4"
        onClick={() => setShowForm(prev => !prev)}
      >
        {showForm ? 'Hide Form' : 'Add Nutrition'}
      </h2>

      {showForm && (
        <div className="mb-6">
          <NutritionForm onCreated={fetchNutrition} />
        </div>
      )}

      <input
        type="text"
        placeholder="Search recipes..."
        className="w-full mb-6 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.length > 0 ? (
          filteredPlans.map(plan => (
            <Card
              key={plan.id}
              type="nutrition"
              data={plan}
              isCompleted={profileData.savedRecipes.some(r => r.id === plan.id)}
              onAction={() => savedRecipe(plan)}
              onDelete={user?.id === plan.user?.id ? handleDeleteNutrition : undefined}
              currentUser={user}
            />
          ))
        ) : (
          <div className="col-span-full rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm p-6 text-center">
            No nutrition plans found.
          </div>
        )}
      </div>
    </section>
  );
};

export default NutritionSection;
