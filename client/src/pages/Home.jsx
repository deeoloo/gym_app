import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-green-50 text-gray-800 flex flex-col items-center px-4 py-10">
      <h1 className="text-4xl md:text-5xl font-extrabold text-green-800 mb-4 text-center">
        Welcome to GymHum 💪
      </h1>

      <p className="text-lg text-gray-700 max-w-2xl text-center mb-8">
        Your all-in-one platform for fitness, nutrition, and motivation. Whether you're a beginner or a pro, GymHum has everything you need to stay on track.
      </p>

      <button
        className="px-6 py-3 mb-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200"
        onClick={() => handleNavigation('/auth/login')}
      >
        Login to Get Started
      </button>

      <section className="max-w-3xl mb-16 text-center">
        <h2 className="text-2xl font-bold text-green-800 mb-2">About GymHum</h2>
        <p className="text-gray-700 leading-relaxed">
          GymHum is designed to help fitness enthusiasts build healthier habits by providing guided workouts, nutrition tips, fitness products, and a supportive community.
        </p>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-5xl">
        {[
          { icon: '🏋️', title: 'Workouts', desc: 'Browse curated training routines', color: 'bg-blue-100 text-blue-600', path: '/workouts' },
          { icon: '🍏', title: 'Nutrition', desc: 'Explore healthy meals and diets', color: 'bg-green-100 text-green-600', path: '/nutrition' },
          { icon: '🛒', title: 'Products', desc: 'Shop supplements & gear', color: 'bg-yellow-100 text-yellow-600', path: '/products' },
          { icon: '👥', title: 'Community', desc: 'Share your journey with others', color: 'bg-purple-100 text-purple-600', path: '/community' },
          { icon: '👤', title: 'Profile', desc: 'Track progress & goals', color: 'bg-red-100 text-red-600', path: '/profile' },
        ].map((item) => (
          <div
            key={item.title}
            onClick={() => handleNavigation(item.path)}
            className="cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 flex flex-col items-center text-center hover:-translate-y-1"
          >
            <div className={`text-5xl mb-3 rounded-full ${item.color} p-4`}>
              {item.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-1">{item.title}</h3>
            <p className="text-gray-600">{item.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;
