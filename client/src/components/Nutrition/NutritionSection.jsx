import useApi from '../../hooks/useApi';
import React, { useState } from 'react';
import Card from '../Card';
import LoadingSpinner from '../LoadingSpinner';
import { useAppContext} from '../../contexts/AppContext';
import NutritionForm from './NutritionForm';


const NutritionSection = () => {
  const { data, loading, error, refetch } = useApi('/api/nutrition');
  const { profileData, savedRecipe, handleDeleteNutrition, user } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);


  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">Error: {error}</div>;

  const plans = data?.plans || []; // <-- extract the actual array

  const filteredPlans = plans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="p-6">
      <h2 className="section-title">Nutrition</h2>

      <h2
        className="link-heading"
        onClick={() => setShowForm(prev => !prev)}
      >
        {showForm ? 'Hide Form' : 'Add Nutrition'}
      </h2>

      {showForm && <NutritionForm onCreated={refetch} />}

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
