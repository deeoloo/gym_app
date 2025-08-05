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

      fetchNutrition(); // ✅ manual refetch
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
        if (err.message.includes('token')) logout?.();
      });
  };

  const filteredPlans = nutritionData.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <section className="p-6">
      <h2 className="section-title">Nutrition</h2>

      <h2
        className="link-heading"
        onClick={() => setShowForm(prev => !prev)}
      >
        {showForm ? 'Hide Form' : 'Add Nutrition'}
      </h2>

      {showForm && <NutritionForm onCreated={fetchNutrition} />}

      <input
        type="text"
        placeholder="Search recipes..."
        className="search-input mb-6"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div>No nutrition plans found.</div>
        )}
      </div>
    </section>
  );
};

export default NutritionSection;
