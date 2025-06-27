import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to GymHum 💪</h1>
      <p className="home-subtitle">
        Your all-in-one platform for fitness, nutrition, and motivation. Whether you're a beginner or a pro, GymHum has everything you need to stay on track.
      </p>
      <button className="login-button" onClick={() => handleNavigation('/auth/login')}>
        Login to Get Started
      </button>

      <section className="about-section">
        <h2>About GymHum</h2>
        <p>
          GymHum is designed to help fitness enthusiasts build healthier habits by providing guided workouts, nutrition tips, fitness products, and a supportive community.
        </p>
      </section>

      <section className="home-grid">
        <div className="home-card" onClick={() => handleNavigation('/workouts')}>
          <div className="home-card-icon bg-blue">🏋️</div>
          <div className="home-card-content">
            <h3>Workouts</h3>
            <p>Browse curated training routines</p>
          </div>
        </div>

        <div className="home-card" onClick={() => handleNavigation('/nutrition')}>
          <div className="home-card-icon bg-green">🍏</div>
          <div className="home-card-content">
            <h3>Nutrition</h3>
            <p>Explore healthy meals and diets</p>
          </div>
        </div>

        <div className="home-card" onClick={() => handleNavigation('/products')}>
          <div className="home-card-icon bg-yellow">🛒</div>
          <div className="home-card-content">
            <h3>Products</h3>
            <p>Shop supplements & gear</p>
          </div>
        </div>

        <div className="home-card" onClick={() => handleNavigation('/community')}>
          <div className="home-card-icon bg-purple">👥</div>
          <div className="home-card-content">
            <h3>Community</h3>
            <p>Share your journey with others</p>
          </div>
        </div>

        <div className="home-card" onClick={() => handleNavigation('/profile')}>
          <div className="home-card-icon bg-red">👤</div>
          <div className="home-card-content">
            <h3>Profile</h3>
            <p>Track progress & goals</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
