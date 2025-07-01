// components/Card.jsx


const Card = ({ type, data, isCompleted = false, onAction = () => {}, onDelete, currentUser }) => {
  const renderWorkoutCard = ({ data, onAction, isCompleted, onDelete }) => {
    const exercises =
      typeof data.exercises === 'string'
        ? data.exercises.split('\n')
        : Array.isArray(data.exercises)
        ? data.exercises
        : [];

    return (
      <div className="section-wrapper">
        <div className="card-content">
          <h3 className="card-title">{data.name || 'Unnamed Workout'}</h3>
          <p className="card-text"><strong>Difficulty:</strong> {data.difficulty || 'N/A'}</p>
          <p className="card-text"><strong>Duration:</strong> {data.duration || 'N/A'}</p>
          <p className="card-description"><strong>Description:</strong> {data.description || 'No description provided.'}</p>

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

          {onDelete && currentUser?.id === data.user?.id && (
            <button
              onClick={() => onDelete(data.id)}
              className="delete-button"
            >
              Delete Workout
            </button>
          )}

        </div>
      </div>
    );
  };

  const renderNutritionCard = ({ data, onAction, isCompleted }) => (
    <div className="section-wrapper">
      <div className="card-content">
        <h3 className="card-title">{data.name || 'Unnamed Plan'}</h3>
        <p className="card-text"><strong>Calories:</strong> {data.calories ?? 'N/A'}</p>
        <p className="card-text"><strong>Protein:</strong> {data.protein ?? 'N/A'}g</p>
        <p className="card-text"><strong>Carbs:</strong> {data.carbs ?? 'N/A'}g</p>
        <p className="card-text"><strong>Fats:</strong> {data.fats ?? 'N/A'}g</p>
        <p className="card-description"><strong>Description:</strong> {data.description || 'No description provided.'}</p>
        <p className="card-text"><strong>Added by:</strong> {data.user?.username || 'Unknown'}</p>

        <button
          onClick={onAction}
          disabled={isCompleted}
          className={`card-button ${isCompleted ? 'completed' : ''}`}
        >
          {isCompleted ? 'Saved ✓' : 'Save Recipe'}
        </button>
          {onDelete && currentUser?.id === data.user?.id && (
          <button
            onClick={() => onDelete(data.id)}
            className="delete-button"
          >
            Delete Nutrition
          </button>
          )}
      </div>
    </div>
  );

  const renderProductCard = ({ data, onAction, isCompleted }) => (
    <div className="section-wrapper">
      {data.image_url ? (
        <img
          src={data.image_url}
          alt={data.name}
          className="card-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImage;
          }}
        />
      ) : (
        <div className="card-image-placeholder">
          <span>No image available</span>
        </div>
      )}

      <div className="card-content">
        <h3 className="card-title">{data.name || 'Unnamed Product'}</h3>
        <p className="card-text"><strong>Category:</strong> {data.category || 'N/A'}</p>
        <p className="card-text"><strong>Price:</strong> ${data.price?.toFixed(2) ?? '0.00'}</p>

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
          disabled={isCompleted}
          className={`card-button ${isCompleted ? 'completed' : ''}`}
        >
          {isCompleted ? 'In Cart ✓' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );

  // Main switch to choose what to render
  switch (type) {
    case 'workout':
      return renderWorkoutCard({ data, onAction, isCompleted, onDelete });
    case 'nutrition':
      return renderNutritionCard({ data, onAction, isCompleted, onDelete });
    case 'product':
      return renderProductCard({ data, onAction, isCompleted });
    default:
      return null;
  }
};

export default Card;
