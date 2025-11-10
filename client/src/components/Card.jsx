// components/Card.jsx
import { cloudinaryVideoURL, cloudinaryPosterURL, cloudinaryImageURL } from '../helpers/cloudinary';

const Card = ({ type, data, isCompleted = false, onAction = () => {}, onDelete, currentUser }) => {

// ---------- WORKOUT CARD ----------
const renderWorkoutCard = ({ data, onAction, isCompleted, onDelete }) => {
  const exercises =
    typeof data.exercises === 'string'
      ? data.exercises.split('\n')
      : Array.isArray(data.exercises)
      ? data.exercises
      : [];

  const hasVideo = !!data?.video_url;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition p-5">
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-gray-800">{data.name || 'Unnamed Workout'}</h3>

        
        {hasVideo && (
          <div className="w-full rounded-xl overflow-hidden border border-gray-200">
            <video
              className="w-full aspect-video"
              src={cloudinaryVideoURL(data.video_url)}
              poster={cloudinaryPosterURL(data.video_url)}
              controls
              playsInline
              preload="metadata"
            />
          </div>
        )}

        <p className="text-gray-700">
          <strong className="font-semibold text-gray-800">Difficulty:</strong> {data.difficulty || 'N/A'}
        </p>
        <p className="text-gray-700">
          <strong className="font-semibold text-gray-800">Duration:</strong> {data.duration || 'N/A'}
        </p>
        <p className="text-gray-600">
          <strong className="font-semibold text-gray-800">Description:</strong>{' '}
          {data.description || 'No description provided.'}
        </p>

        <div className="mb-2">
          <h4 className="text-sm font-semibold text-green-800 mb-1">Exercises:</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {exercises.map((ex, index) => (
              <li key={index}>{ex}</li>
            ))}
          </ul>
        </div>

        <div className="mt-2 flex flex-wrap gap-3">
          <button
            onClick={onAction}
            disabled={isCompleted}
            className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold shadow-md transition disabled:opacity-70 disabled:cursor-not-allowed ${
              isCompleted ? 'bg-green-600 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {isCompleted ? 'Completed ✓' : 'Mark Complete'}
          </button>

        
          {onDelete && currentUser?.id === data.user?.id && (
            <button
              onClick={() => onDelete(data.id)}
              className="inline-flex items-center justify-center rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-red-600 transition"
            >
              Delete Workout
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------- NUTRITION CARD ----------
const renderNutritionCard = ({ data, onAction, isCompleted }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition p-5">
    <div className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold text-gray-800">{data.name || 'Unnamed Plan'}</h3>

      
      {data?.image_url ? (
        <img
          src={cloudinaryImageURL(data.image_url, { w: 1200, h: 675, fit: 'fill' })}
          alt={data.name || 'Nutrition image'}
          className="w-full aspect-video object-cover rounded-xl border border-gray-200"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : null}

      <p className="text-gray-700">
        <strong className="font-semibold text-gray-800">Calories:</strong> {data.calories ?? 'N/A'}
      </p>
      <p className="text-gray-700">
        <strong className="font-semibold text-gray-800">Protein:</strong> {data.protein ?? 'N/A'}g
      </p>
      <p className="text-gray-700">
        <strong className="font-semibold text-gray-800">Carbs:</strong> {data.carbs ?? 'N/A'}g
      </p>
      <p className="text-gray-700">
        <strong className="font-semibold text-gray-800">Fats:</strong> {data.fats ?? 'N/A'}g
      </p>
      <p className="text-gray-600">
        <strong className="font-semibold text-gray-800">Description:</strong>{' '}
        {data.description || 'No description provided.'}
      </p>
      <p className="text-gray-700">
        <strong className="font-semibold text-gray-800">Added by:</strong> {data.user?.username || 'Unknown'}
      </p>

      <div className="mt-2 flex flex-wrap gap-3">
        <button
          onClick={onAction}
          disabled={isCompleted}
          className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold shadow-md transition disabled:opacity-70 disabled:cursor-not-allowed ${
            isCompleted ? 'bg-green-600 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          {isCompleted ? 'Saved ✓' : 'Save Recipe'}
        </button>
      </div>
    </div>
  </div>
);

  const renderProductCard = ({ data, onAction, isCompleted }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition overflow-hidden">
      {data.image_url ? (
        <img
          src={data.image_url}
          alt={data.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImage;
          }}
        />
      ) : (
        <div className="w-full h-48 bg-gray-100 text-gray-500 flex items-center justify-center">
          <span>No image available</span>
        </div>
      )}

      <div className="p-5 flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-gray-800">{data.name || 'Unnamed Product'}</h3>
        <p className="text-gray-700">
          <strong className="font-semibold text-gray-800">Category:</strong> {data.category || 'N/A'}
        </p>
        <p className="text-gray-700">
          <strong className="font-semibold text-gray-800">Price:</strong> ${data.price?.toFixed(2) ?? '0.00'}
        </p>

        <div className="mb-2">
          <h4 className="text-sm font-semibold text-green-800 mb-1">Features:</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {(data.features?.split('\n') || []).map((feature, index) => (
              <li key={index}>{feature.trim()}</li>
            ))}
          </ul>
        </div>

        <div className="mt-2">
          <button
            onClick={onAction}
            disabled={isCompleted}
            className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold shadow-md transition disabled:opacity-70 disabled:cursor-not-allowed ${
              isCompleted ? 'bg-green-600 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {isCompleted ? 'Added' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );

  // Main switch to choose what to render
  switch (type) {
    case 'workout':
      return renderWorkoutCard({ data, onAction, isCompleted, onDelete, currentUser });
    case 'nutrition':
      return renderNutritionCard({ data, onAction, isCompleted, onDelete, currentUser });
    case 'product':
      return renderProductCard({ data, onAction, isCompleted });
    default:
      return null;
  }
};

export default Card;
