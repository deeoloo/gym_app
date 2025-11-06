// components/Nutrition/NutritionForm.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const NUTRITION_FOLDER = import.meta.env.VITE_CLOUDINARY_NUTRITION_FOLDE;

const NutritionForm = ({ onCreated }) => {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    image_url: '',
  });
  const [imageFile, setImageFile] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  };

  
  const uploadImageIfNeeded = async () => {
    if (!imageFile) return null;

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const body = new FormData();
    body.append('file', imageFile);
    body.append('upload_preset', UPLOAD_PRESET);
    body.append('folder', NUTRITION_FOLDER);

    const res = await fetch(url, { method: 'POST', body });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Cloudinary upload failed: ${res.status} ${errText}`);
    }
    const json = await res.json();
    return json.public_id || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      
      let finalImageId = formData.image_url?.trim() || '';
      if (imageFile) {
        const uploadedPublicId = await uploadImageIfNeeded();
        if (uploadedPublicId) {
          finalImageId = uploadedPublicId;
        }
      }

      
      const payload = { ...formData, image_url: finalImageId };

      const res = await fetch('/api/nutrition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
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
          image_url: '',
        });
        setImageFile(null);
        onCreated?.();
      } else {
        setMessage(data.message || 'Error creating plan.');
      }
    } catch (err) {
      setMessage(err.message || 'Something went wrong.');
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8 mb-6"
    >
      <h3 className="text-xl font-bold text-green-800 mb-4">
        Add New Nutrition Plan
      </h3>

      <div className="grid gap-4">
        <input
          name="name"
          placeholder="Name"
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
          name="calories"
          type="number"
          placeholder="Calories"
          value={formData.calories}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition"
        />
        <input
          name="protein"
          type="number"
          placeholder="Protein (g)"
          value={formData.protein}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition"
        />
        <input
          name="carbs"
          type="number"
          placeholder="Carbs (g)"
          value={formData.carbs}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition"
        />
        <input
          name="fats"
          type="number"
          placeholder="Fats (g)"
          value={formData.fats}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition"
        />

        <div className="grid sm:grid-cols-2 gap-3">
          <input
            name="image_url"
            placeholder="full image URL"
            value={formData.image_url}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageFileChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 inline-flex items-center justify-center rounded-lg bg-orange-500 px-5 py-2.5 font-semibold text-white shadow-md transition hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : 'Add'}
      </button>

      {message && (
        <p className="mt-3 text-sm text-gray-700 bg-green-50 border border-green-100 rounded-md px-3 py-2">
          {message}
        </p>
      )}
    </form>
  );
};

export default NutritionForm;
