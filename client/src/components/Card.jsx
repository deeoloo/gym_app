const Card = ({ type, data, isCompleted, onAction }) => {
 const renderWorkoutCard = () => {
  const exercises = typeof data.exercises === 'string'
  ? data.exercises.split('\n')
  : Array.isArray(data.exercises) ? data.exercises : [];


  return (
    <div className="section-wrapper">
      <div className="card-content">
        <h3 className="card-title">{data.name}</h3>
        {/* <p className="card-text"><strong>Category:</strong> {data.category}</p> */}
        <p className="card-text"><strong>Difficulty:</strong> {data.difficulty}</p>
        <p className="card-text"><strong>Duration:</strong> {data.duration}</p>
        <p className="card-description"><strong>Description:</strong> {data.description}</p>
        
        <div className="mb-4">
          <h4 className="card-subtitle">Exercises:</h4>
          <ul className="exercise-list">
            {exercises.map((ex, index) => (
              <li key={index}>{ex}</li>
            ))}
          </ul>
        </div>
        
        <button
          onClick={onAction}
          disabled={isCompleted}
          className={`card-button ${isCompleted ? 'completed' : ''}`}
        >
          {isCompleted ? 'Completed ✓' : 'Mark Complete'}
        </button>
      </div>
    </div>
  );
};


const renderNutritionCard = () => (
  <div className="section-wrapper">
    <div className="card-content">
      <h3 className="card-title">{data.name}</h3>
      <p className="card-text"><strong>Calories:</strong> {data.calories}</p>
      <p className="card-text"><strong>Protein:</strong> {data.protein}g</p>
      <p className="card-text"><strong>Carbs:</strong> {data.carbs}g</p>
      <p className="card-text"><strong>Fats:</strong> {data.fats}g</p>
      <p className="card-description"><strong>Description:</strong> {data.description}</p>
      <p className="card-text"><strong>Added by:</strong> {data.user?.username}</p>

      <button
        onClick={onAction}
        disabled={isCompleted}
        className={`card-button ${isCompleted ? 'completed' : ''}`}
      >
        {isCompleted ? 'Saved ✓' : 'Save Recipe'}
      </button>
    </div>
  </div>
);


const renderProductCard = () => (
  <div className="section-wrapper">
    {data.image ? (
      <img 
        src={data.image} 
        alt={data.name} 
        className="card-image"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'fallback.jpg';
        }}
      />
    ) : (
      <div className="card-image-placeholder">
        <span>No image available</span>
      </div>
    )}
    
    <div className="card-content">
      <h3 className="card-title">{data.name}</h3>
      <p className="card-text"><strong>Category:</strong> {data.category}</p>
      <p className="card-text"><strong>Price:</strong> ${data.price?.toFixed(2) || '0.00'}</p>
      
      <div className="mb-4">
        <h4 className="card-subtitle">Features:</h4>
        <ul className="feature-list">
          {(data.features?.split('\n') || []).map((feature, index) => (
            <li key={index}>{feature.trim()}</li>
          ))}
        </ul>
      </div>
      
      <p className="card-text"><strong>Colors:</strong> {data.colors?.split(',').join(', ') || 'N/A'}</p>
      
      <button
        onClick={onAction}
        className="card-button"
      >
        Add to Cart
      </button>
    </div>
  </div>
);

  switch (type) {
    case 'workout':
      return renderWorkoutCard();
    case 'nutrition':
      return renderNutritionCard();
    case 'product':
      return renderProductCard();
    default:
      return null;
  }
};

export default Card;
