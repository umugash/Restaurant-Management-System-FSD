import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

const NotFoundPage = () => {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>Oops! The page you are looking for does not exist.</p>
      <Link to="/" className="btn">
        <FaHome style={{ marginRight: '8px' }} />
        Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;