// components/Workout/WorkoutForm.jsx
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';

const WorkoutForm = ({ onCreated }) => {
  const { token } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    difficulty: '',
    exercises: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/workouts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Workout created successfully!');
        setFormData({
          name: '',
          description: '',
          duration: '',
          difficulty: '',
          exercises: '',
        });
        onCreated?.(); // Optional callback to refresh workout list
      } else {
        setMessage(data.message || 'Error creating workout');
      }
    } catch (err) {
      setMessage('Something went wrong');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="workout-form mb-6">
      <h3 className="text-lg font-semibold mb-2">Add New Workout</h3>

      <input name="name" placeholder="Workout Name" value={formData.name} onChange={handleChange} required />
      <input name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
      <input name="duration" type="number" placeholder="Duration (mins)" value={formData.duration} onChange={handleChange} required />
      <input name="difficulty" placeholder="Difficulty (e.g., Easy, Moderate, Hard)" value={formData.difficulty} onChange={handleChange} />
      <input name="exercises" placeholder="Exercises (comma-separated)" value={formData.exercises} onChange={handleChange} />

      <button type="submit" disabled={loading} className="form-button mt-2">
        {loading ? 'Submitting...' : 'Add Workout'}
      </button>

      {message && <p className="form-message mt-2">{message}</p>}
    </form>
  );
};

export default WorkoutForm;
