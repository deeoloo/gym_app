// Signup.jsx
import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { token, login } = useContext(AuthContext);

  useEffect(() => {
    if (token) navigate('/dashboard');
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          bio: formData.bio
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');

      login(data.user, data.access_token); // ✅ set token + user in context/localStorage
      localStorage.setItem('refresh_token', data.refresh_token); // optional
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h2 className="auth-title">Create a new account</h2>
        {error && <div className="error-message">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <input name="username" type="text" placeholder="Username" required onChange={handleChange} className="form-input" />
          <input name="email" type="email" placeholder="Email" required onChange={handleChange} className="form-input" />
          <input name="password" type="password" placeholder="Password" required onChange={handleChange} className="form-input" />
          <input name="confirmPassword" type="password" placeholder="Confirm Password" required onChange={handleChange} className="form-input" />
          <textarea name="bio" placeholder="Short bio" onChange={handleChange} className="form-input" />
          <button type="submit" className="form-button">Sign Up</button>
        </form>

        <p className="text-center">Already have an account? <Link to="/auth/login" className="auth-link">Log in</Link></p>
      </div>
    </div>
  );
};

export default Signup;
