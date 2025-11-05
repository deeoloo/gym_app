import React, { useState, useEffect, useContext } from 'react';
import Card from '../Card';
import LoadingSpinner from '../LoadingSpinner';
import WorkoutForm from './WorkoutForm';
import { AuthContext } from '../../contexts/AuthContext';

const WorkoutsSection = () => {
  const { user, token } = useContext(AuthContext);
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

  // Hydrate profile snapshot from localStorage (so completed flags persist)
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('profile') || '{}');
      if (stored && Object.keys(stored).length) {
        setProfileData(prev => ({ ...prev, ...stored }));
      }
    } catch { /* noop */ }
  }, []);

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
      setProfileData((prev) => {
        const updated = {
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
        };

        // Persist a compact profile snapshot and broadcast to listeners (e.g., ProfileSection)
        try {
          const stored = JSON.parse(localStorage.getItem('profile') || '{}');
          const merged = { ...stored, ...updated };
          localStorage.setItem('profile', JSON.stringify(merged));
          window.dispatchEvent(new CustomEvent('profile:update', { detail: merged }));
        } catch { /* noop */ }

        return updated;
      });
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
      if (res.ok) fetchWorkouts();
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
      (workout.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (workout.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="mx-auto max-w-5xl my-6 rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3">Error: {error}</div>;

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-green-800 mb-4">Workouts</h2>

      <h3
        className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold cursor-pointer mb-4"
        onClick={() => setShowForm(prev => !prev)}
      >
        {showForm ? 'Hide Form' : 'Add Workout'}
      </h3>

      {showForm && (
        <div className="mb-6">
          <WorkoutForm onCreated={fetchWorkouts} />
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search workouts..."
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-3 mb-6">
        <button
          className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition border ${
            activeFilter === 'all'
              ? 'bg-green-600 text-white border-green-600 shadow'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50'
          }`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        {/* Add more filters here later, reusing the same style */}
      </div>

      {/* Workouts List */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
