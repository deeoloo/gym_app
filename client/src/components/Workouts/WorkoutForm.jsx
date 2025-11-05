// components/Workout/WorkoutForm.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext'; 

const WorkoutForm = ({ onCreated }) => {
  const { token } = useContext(AuthContext); 
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
      const res = await fetch('/api/workouts', {
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
        onCreated?.(); 
      } else {
        setMessage(data.message || 'Error creating workout');
      }
    } catch (err) {
      setMessage('Something went wrong');
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8"
    >
      <h3 className="text-xl font-bold text-green-800 mb-4">Add New Workout</h3>

      <div className="grid gap-4">
        <input
          name="name"
          placeholder="Workout Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition"
        />
        <input
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition"
        />
        <input
          name="duration"
          type="number"
          placeholder="Duration (mins)"
          value={formData.duration}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition"
        />
        <input
          name="difficulty"
          placeholder="Difficulty (e.g., Easy, Moderate, Hard)"
          value={formData.difficulty}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition"
        />
        <input
          name="exercises"
          placeholder="Exercises (comma-separated)"
          value={formData.exercises}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 inline-flex items-center justify-center rounded-lg bg-orange-500 px-5 py-2.5 font-semibold text-white shadow-md transition hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : 'Add Workout'}
      </button>

      {message && (
        <p className="mt-3 text-sm text-gray-700 bg-green-50 border border-green-100 rounded-md px-3 py-2">
          {message}
        </p>
      )}
    </form>
  );
};

export default WorkoutForm;
