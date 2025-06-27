import { useState } from 'react';
import useApi from '../../hooks/useApi';
import { useAppContext } from '../../contexts/AppContext';
import Card from '../Card';
import LoadingSpinner from '../LoadingSpinner';

const WorkoutsSection = () => {
  const { data, loading, error } = useApi('/api/workouts');
  const { profileData, completeWorkout } = useAppContext();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">Error: {error}</div>;

   const filteredWorkouts = (Array.isArray(data) ? data : [])
  .filter(workout => 
    activeFilter === 'all' || workout.category === activeFilter
  )
  .filter(workout => 
    workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workout.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="p-6">
      <h2 className="section-title">Workouts</h2>
    

      <div className='workout-list'>
        {filteredWorkouts.map(workout => (
          <Card 
            key={workout.id}
            type="workout"
            data={workout}
            isCompleted={profileData.completedWorkouts.includes(workout.id)}
            onAction={() => completeWorkout(workout)}
          />
        ))}
      </div>
    </section>
  );
};

export default WorkoutsSection;