import React, { useState, useEffect, useContext } from 'react';
import Card from '../Card';
import LoadingSpinner from '../LoadingSpinner';
import WorkoutForm from './WorkoutForm';
import { AuthContext } from '../../contexts/AuthContext';

const WorkoutsSection = () => {
  const { user, token } = useContext(AuthContext); // ✅ Pull user/token from AuthContext
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeFilter, setActiveFilter] = useState('all');
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

  // ✅ Fetch workouts manually
  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/workouts');
      if (!res.ok) throw new Error('Failed to fetch workouts');
      const data = await res.json();
      setWorkouts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

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

  const handleDeleteWorkout = async (id) => {
    if (!window.confirm('Delete this workout?')) return;
    try {
      const res = await fetch(`/api/workouts/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) fetchWorkouts(); // ✅ Manual refetch
      else alert('Failed to delete');
    } catch {
      alert('Error deleting workout');
    }
  };

  const filteredWorkouts = workouts
    .filter(workout =>
      activeFilter === 'all' || workout.category === activeFilter
    )
    .filter(workout =>
      workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workout.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <section className="workouts-section">
      <h2 className="section-title">Workouts</h2>

      <h3
        className="link-heading"
        onClick={() => setShowForm(prev => !prev)}
      >
        {showForm ? 'Hide Form' : 'Add Workout'}
      </h3>
      {showForm && <WorkoutForm onCreated={fetchWorkouts} />}

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search workouts..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Category Filters */}
      <div className="filters-container">
        <button
          className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        {/* Add more filters if categories exist */}
      </div>

      <div className="workout-list">
        {filteredWorkouts.map(workout => (
          <Card
            key={workout.id}
            type="workout"
            data={workout}
            isCompleted={profileData.completedWorkouts.includes(workout.id)}
            onAction={() => completeWorkout(workout)}
            onDelete={user?.id === workout.user?.id ? handleDeleteWorkout : undefined}
            currentUser={user}
          />
        ))}
      </div>
    </section>
  );
};

export default WorkoutsSection;
