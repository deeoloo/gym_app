// components/Workout/WorkoutForm.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const WORKOUTS_FOLDER = import.meta.env.VITE_CLOUDINARY_WORKOUTS_FOLDER;

const WorkoutForm = ({ onCreated }) => {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    difficulty: '',
    exercises: '',
    // 👇 new: allow manual public_id/url
    video_url: '',
  });
  const [videoFile, setVideoFile] = useState(null); // 👈 new: optional file
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setVideoFile(file);
  };

  // Upload to Cloudinary if a file is selected; return public_id
  const uploadVideoIfNeeded = async () => {
    if (!videoFile) return null;

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`;
    const body = new FormData();
    body.append('file', videoFile);
    body.append('upload_preset', UPLOAD_PRESET);
    body.append('folder', WORKOUTS_FOLDER); // keep all workout videos under /workouts

    const res = await fetch(url, { method: 'POST', body });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Cloudinary upload failed: ${res.status} ${errText}`);
    }
    const json = await res.json();
    // Prefer public_id (e.g., "workouts/squats-level1"); secure_url also available if needed
    return json.public_id || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // 1) Upload video file (if provided) to get public_id
      let finalVideoId = formData.video_url?.trim() || '';
      if (videoFile) {
        const uploadedPublicId = await uploadVideoIfNeeded();
        if (uploadedPublicId) {
          finalVideoId = uploadedPublicId; // e.g., "workouts/hiit"
        }
      }

      // 2) Prepare payload to API
      const payload = {
        ...formData,
        video_url: finalVideoId, // can be manual input or uploaded public_id
      };

      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
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
          video_url: '',
        });
        setVideoFile(null);
        onCreated?.();
      } else {
        setMessage(data.message || 'Error creating workout');
      }
    } catch (err) {
      setMessage(err.message || 'Something went wrong');
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8"
    >
      <h3 className="text-xl font-bold text-green-800 mb-4">Add Workout</h3>

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

        {/* NEW: Either paste a public_id/URL OR upload a video file */}
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            name="video_url"
            placeholder="Video public_id or full URL (optional)"
            value={formData.video_url}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition"
          />
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoFileChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition"
          />
        </div>
        <p className="text-xs text-gray-500 -mt-2">
          Tip: leave the text field empty and upload a video file, or paste your Cloudinary public_id (e.g. <code>{WORKOUTS_FOLDER}/squats-level1</code>) or full URL.
        </p>
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
