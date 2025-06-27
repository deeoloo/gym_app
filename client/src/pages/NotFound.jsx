import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found">
      <h1 className="not-found-title">404</h1>
      <p className="not-found-text">Page not found</p>
      <Link 
        to="/" 
        className="btn btn-primary"
      >
        Go back home
      </Link>
    </div>
  );
};

export default NotFound;