// components/Nutrition/NutritionForm.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext'; // ✅ Corrected import

const NutritionForm = ({ onCreated }) => {
  const { token } = useContext(AuthContext); // ✅ Using AuthContext
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/nutrition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Nutrition plan added successfully!');
        setFormData({
          name: '',
          description: '',
          calories: '',
          protein: '',
          carbs: '',
          fats: '',
        });
        onCreated?.(); // Optional callback
      } else {
        setMessage(data.message || 'Error creating plan.');
      }
    } catch (err) {
      setMessage('Something went wrong.');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="nutrition-form">
      <h3 className="text-lg font-semibold mb-2">Add New Nutrition Plan</h3>
      <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
      <input name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
      <input name="calories" type="number" placeholder="Calories" value={formData.calories} onChange={handleChange} required />
      <input name="protein" type="number" placeholder="Protein (g)" value={formData.protein} onChange={handleChange} required />
      <input name="carbs" type="number" placeholder="Carbs (g)" value={formData.carbs} onChange={handleChange} required />
      <input name="fats" type="number" placeholder="Fats (g)" value={formData.fats} onChange={handleChange} required />

      <button type="submit" disabled={loading} className="form-button mt-2">
        {loading ? 'Submitting...' : 'Add Nutrition Plan'}
      </button>
      {message && <p className="form-message mt-2">{message}</p>}
    </form>
  );
};

export default NutritionForm;